/* Stripe webhook — the ONLY code path that grants paid access.
   Configure in Stripe: endpoint https://music.vensoai.com/api/stripe-webhook,
   event checkout.session.completed. Set STRIPE_WEBHOOK_SECRET in Pages env vars. */

const TOLERANCE_SECONDS = 300;

async function verifyStripeSignature(payload, header, secret) {
  if (!header) return false;
  const parts = {};
  for (const kv of header.split(',')) {
    const [k, v] = kv.split('=');
    if (k === 'v1') (parts.v1 = parts.v1 || []).push(v);
    else parts[k] = v;
  }
  if (!parts.t || !parts.v1) return false;
  if (Math.abs(Date.now() / 1000 - Number(parts.t)) > TOLERANCE_SECONDS) return false;

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(`${parts.t}.${payload}`));
  const expected = [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');

  for (const candidate of parts.v1) {
    if (candidate.length !== expected.length) continue;
    let diff = 0;
    for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ candidate.charCodeAt(i);
    if (diff === 0) return true;
  }
  return false;
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.STRIPE_WEBHOOK_SECRET) {
    console.log('stripe-webhook: STRIPE_WEBHOOK_SECRET not configured');
    return new Response('Webhook not configured', { status: 503 });
  }

  const payload = await request.text();
  const ok = await verifyStripeSignature(payload, request.headers.get('Stripe-Signature'), env.STRIPE_WEBHOOK_SECRET);
  if (!ok) return new Response('Invalid signature', { status: 400 });

  let event;
  try { event = JSON.parse(payload); } catch { return new Response('Bad payload', { status: 400 }); }

  if (event.type !== 'checkout.session.completed' && event.type !== 'charge.refunded') {
    return new Response('Ignored', { status: 200 });
  }

  const eventId = String(event.id || '');
  if (!eventId) return new Response('Missing event id', { status: 400 });

  if (event.type === 'charge.refunded') {
    const charge = event.data && event.data.object;
    const paymentIntentId = charge && (typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent && charge.payment_intent.id);
    if (!charge || !paymentIntentId) return new Response('Missing charge data', { status: 400 });
    await env.DB.batch([
      env.DB.prepare('INSERT OR IGNORE INTO stripe_events (event_id,event_type,livemode) VALUES (?,?,?)')
        .bind(eventId, event.type, event.livemode ? 1 : 0),
      env.DB.prepare(`UPDATE stripe_payments SET refunded_amount=?, payment_status=?, updated_at=datetime('now')
        WHERE payment_intent_id=?`)
        .bind(Number(charge.amount_refunded || 0), Number(charge.amount_refunded || 0) >= Number(charge.amount || 0) ? 'refunded' : 'paid', paymentIntentId),
      env.DB.prepare(`UPDATE users SET is_unlocked=CASE WHEN EXISTS (
        SELECT 1 FROM stripe_payments p WHERE p.user_id=users.id AND p.livemode=1
        AND p.payment_status='paid' AND p.refunded_amount=0
      ) THEN 1 ELSE 0 END WHERE id=(SELECT user_id FROM stripe_payments WHERE payment_intent_id=?)`)
        .bind(paymentIntentId),
      env.DB.prepare(`INSERT OR IGNORE INTO funnel_events (id,event_name,page,channel) VALUES (?,?,?,?)`)
        .bind('stripe-' + eventId, 'refund', '/checkout', 'stripe')
    ]);
    return new Response('OK', { status: 200 });
  }

  const session = event.data && event.data.object;
  if (!session || session.payment_status !== 'paid') {
    console.log('stripe-webhook: session not paid', session && session.id);
    return new Response('Not paid', { status: 200 });
  }

  const customerId = typeof session.customer === 'string' ? session.customer : '';
  const paymentIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : '';
  const userId = session.client_reference_id || '';
  const email = (session.customer_details && session.customer_details.email || '').trim().toLowerCase();

  let matched = null;
  if (userId) matched = await env.DB.prepare('SELECT id FROM users WHERE id=?').bind(userId).first();
  if (!matched && email) matched = await env.DB.prepare('SELECT id FROM users WHERE email=?').bind(email).first();

  const paymentStatements = [
    env.DB.prepare('INSERT OR IGNORE INTO stripe_events (event_id,event_type,livemode) VALUES (?,?,?)')
      .bind(eventId, event.type, event.livemode ? 1 : 0),
    env.DB.prepare(`INSERT INTO stripe_payments
      (checkout_session_id,payment_intent_id,user_id,customer_id,customer_email,amount_total,currency,livemode,payment_status,completed_at)
      VALUES (?,?,?,?,?,?,?,?,?,datetime('now'))
      ON CONFLICT(checkout_session_id) DO UPDATE SET
        payment_intent_id=excluded.payment_intent_id,user_id=excluded.user_id,customer_id=excluded.customer_id,
        customer_email=excluded.customer_email,amount_total=excluded.amount_total,currency=excluded.currency,
        livemode=excluded.livemode,payment_status=excluded.payment_status,updated_at=datetime('now')`)
      .bind(session.id, paymentIntentId || null, matched && matched.id || null, customerId, email, Number(session.amount_total || 0), String(session.currency || 'aud'), event.livemode ? 1 : 0, 'paid'),
    env.DB.prepare(`INSERT OR IGNORE INTO funnel_events (id,event_name,user_id,page,channel) VALUES (?,?,?,?,?)`)
      .bind('stripe-' + eventId, 'successful_payment', matched && matched.id || null, '/checkout', 'stripe')
  ];

  if (!matched) {
    /* Preserve the payment as financial truth even when account matching fails.
       The owner report surfaces it for manual reconciliation. */
    await env.DB.batch(paymentStatements);
    console.log('stripe-webhook: payment recorded without matching user', session.id, 'ref=', userId, 'email=', email);
    return new Response('Payment recorded — account reconciliation needed', { status: 200 });
  }

  paymentStatements.push(
    env.DB.prepare('UPDATE users SET is_unlocked=1,stripe_customer_id=? WHERE id=?').bind(customerId, matched.id)
  );
  await env.DB.batch(paymentStatements);
  console.log('stripe-webhook: unlocked', userId || email, 'session', session.id);
  return new Response('OK', { status: 200 });
}
