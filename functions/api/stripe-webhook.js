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

  if (event.type !== 'checkout.session.completed') {
    return new Response('Ignored', { status: 200 });
  }

  const session = event.data && event.data.object;
  if (!session || session.payment_status !== 'paid') {
    console.log('stripe-webhook: session not paid', session && session.id);
    return new Response('Not paid', { status: 200 });
  }

  const customerId = typeof session.customer === 'string' ? session.customer : '';
  const userId = session.client_reference_id || '';
  const email = (session.customer_details && session.customer_details.email || '').trim().toLowerCase();

  let result = { meta: { changes: 0 } };
  if (userId) {
    result = await env.DB.prepare(
      'UPDATE users SET is_unlocked = 1, stripe_customer_id = ? WHERE id = ?'
    ).bind(customerId, userId).run();
  }
  if (!result.meta.changes && email) {
    /* Fallback: match by the email used at checkout */
    result = await env.DB.prepare(
      'UPDATE users SET is_unlocked = 1, stripe_customer_id = ? WHERE email = ?'
    ).bind(customerId, email).run();
  }

  if (!result.meta.changes) {
    /* Return 200 so Stripe doesn't retry forever; reconcile manually from the receipt */
    console.log('stripe-webhook: no matching user', session.id, 'ref=', userId, 'email=', email);
    return new Response('No matching user — manual reconciliation needed', { status: 200 });
  }

  console.log('stripe-webhook: unlocked', userId || email, 'session', session.id);
  return new Response('OK', { status: 200 });
}
