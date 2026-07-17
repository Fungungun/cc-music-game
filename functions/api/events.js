import { getSessionUser, json, randomHex } from '../_shared/util.js';

const ALLOWED = new Set(['landing_visit', 'resource_click', 'resource_print', 'resource_download', 'resource_share', 'practice_start', 'practice_complete', 'signup_complete', 'upgrade_view', 'checkout_start']);
const clean = (value, max) => String(value || '').replace(/[^a-zA-Z0-9._:\/-]/g, '').slice(0, max);

export async function onRequestPost({ request, env }) {
  let body;
  try { body = await request.json(); } catch { return json({ error: 'Invalid JSON.' }, 400); }
  const eventName = clean(body.event, 40);
  if (!ALLOWED.has(eventName)) return json({ error: 'Unknown event.' }, 400);

  const user = await getSessionUser(request, env);
  const visitorId = clean(body.visitor_id, 64);
  if (!user && !/^[0-9a-f]{32}$/.test(visitorId)) return json({ error: 'Invalid visitor.' }, 400);

  await env.DB.prepare(
    `INSERT INTO funnel_events (id,event_name,user_id,visitor_id,page,channel,experiment)
     VALUES (?,?,?,?,?,?,?)`
  ).bind(randomHex(16), eventName, user && user.id || null, visitorId || null,
    clean(body.page, 100), clean(body.channel, 60), clean(body.experiment, 60)).run();
  return json({ ok: true });
}
