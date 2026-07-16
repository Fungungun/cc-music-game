import { getSessionUser, json } from '../_shared/util.js';

export async function onRequestGet({ request, env }) {
  const user = await getSessionUser(request, env);
  const ownerEmail = String(env.OWNER_EMAIL || '').trim().toLowerCase();
  if (!user || !ownerEmail || user.email.toLowerCase() !== ownerEmail) return json({ error: 'Not found.' }, 404);

  const [events, sales, recent] = await Promise.all([
    env.DB.prepare(`SELECT event_name, COUNT(*) count, COUNT(DISTINCT COALESCE(user_id,visitor_id)) people
      FROM funnel_events WHERE created_at >= datetime('now','-30 days') GROUP BY event_name`).all(),
    env.DB.prepare(`SELECT
      COUNT(DISTINCT CASE WHEN livemode=1 AND payment_status='paid' AND refunded_amount=0 THEN user_id END) verified_sales,
      COALESCE(SUM(CASE WHEN livemode=1 AND payment_status='paid' THEN amount_total-refunded_amount ELSE 0 END),0) net_revenue_minor,
      COUNT(DISTINCT CASE WHEN livemode=0 THEN checkout_session_id END) test_payments,
      COUNT(DISTINCT CASE WHEN refunded_amount>0 THEN checkout_session_id END) refunded_payments
      FROM stripe_payments`).first(),
    env.DB.prepare(`SELECT checkout_session_id,amount_total,currency,payment_status,refunded_amount,livemode,completed_at
      FROM stripe_payments ORDER BY completed_at DESC LIMIT 20`).all()
  ]);
  const funnel = {};
  for (const row of events.results || []) funnel[row.event_name] = { events: row.count, people: row.people };
  return json({ generated_at: new Date().toISOString(), period_days: 30, funnel, revenue: sales, recent_payments: recent.results || [] });
}
