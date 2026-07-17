import { getSessionUser, json } from '../_shared/util.js';

export async function onRequestGet({ request, env }) {
  const user = await getSessionUser(request, env);
  const ownerEmail = String(env.OWNER_EMAIL || '').trim().toLowerCase();
  if (!user || !ownerEmail || user.email.toLowerCase() !== ownerEmail) return json({ error: 'Not found.' }, 404);

  const [events, channels, experiments, sales, recent] = await Promise.all([
    env.DB.prepare(`SELECT event_name, COUNT(*) count, COUNT(DISTINCT COALESCE(user_id,visitor_id)) people
      FROM funnel_events WHERE created_at >= datetime('now','-30 days') GROUP BY event_name`).all(),
    env.DB.prepare(`SELECT channel,event_name,COUNT(*) count,COUNT(DISTINCT COALESCE(user_id,visitor_id)) people
      FROM funnel_events WHERE created_at >= datetime('now','-30 days')
      GROUP BY channel,event_name ORDER BY channel,event_name`).all(),
    env.DB.prepare(`SELECT channel,experiment,event_name,COUNT(*) count,
      COUNT(DISTINCT COALESCE(user_id,visitor_id)) people
      FROM funnel_events WHERE created_at >= datetime('now','-30 days') AND experiment<>''
      GROUP BY channel,experiment,event_name ORDER BY channel,experiment,event_name`).all(),
    env.DB.prepare(`SELECT
      COUNT(DISTINCT CASE WHEN livemode=1 AND payment_status='paid' AND refunded_amount=0
        THEN COALESCE(user_id,NULLIF(customer_id,''),NULLIF(customer_email,'')) END) verified_sales,
      COALESCE(SUM(CASE WHEN livemode=1 AND payment_status='paid' THEN amount_total-refunded_amount ELSE 0 END),0) net_revenue_minor,
      COUNT(DISTINCT CASE WHEN livemode=0 THEN checkout_session_id END) test_payments,
      COUNT(DISTINCT CASE WHEN refunded_amount>0 THEN checkout_session_id END) refunded_payments,
      COUNT(DISTINCT CASE WHEN livemode=1 AND payment_status='paid' AND user_id IS NULL THEN checkout_session_id END) unmatched_live_payments
      FROM stripe_payments`).first(),
    env.DB.prepare(`SELECT checkout_session_id,amount_total,currency,payment_status,refunded_amount,livemode,completed_at
      FROM stripe_payments ORDER BY completed_at DESC LIMIT 20`).all()
  ]);
  const funnel = {};
  for (const row of events.results || []) funnel[row.event_name] = { events: row.count, people: row.people };
  const visits = funnel.landing_visit && funnel.landing_visit.people || 0;
  const resourceClicks = funnel.resource_click && funnel.resource_click.people || 0;
  const practiceStarts = funnel.practice_start && funnel.practice_start.people || 0;
  const practiceCompletes = funnel.practice_complete && funnel.practice_complete.people || 0;
  const signups = funnel.signup_complete && funnel.signup_complete.people || 0;
  const checkouts = funnel.checkout_start && funnel.checkout_start.people || 0;
  const purchases = funnel.successful_payment && funnel.successful_payment.people || 0;
  return json({
    generated_at: new Date().toISOString(), period_days: 30, funnel,
    conversion: {
      visit_to_resource_click: visits ? resourceClicks / visits : null,
      resource_click_to_practice: resourceClicks ? practiceStarts / resourceClicks : null,
      visit_to_practice: visits ? practiceStarts / visits : null,
      practice_to_complete: practiceStarts ? practiceCompletes / practiceStarts : null,
      visit_to_signup: visits ? signups / visits : null,
      signup_to_checkout: signups ? checkouts / signups : null,
      checkout_to_purchase: checkouts ? purchases / checkouts : null
    },
    channels: channels.results || [], experiments: experiments.results || [],
    revenue: sales, recent_payments: recent.results || []
  });
}
