import { json, getSessionUser } from '../_shared/util.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  const user = await getSessionUser(request, env);
  if (!user) return json({ error: 'Not signed in' }, 401);
  const rows = await env.DB.prepare(
    'SELECT module, concept, correct, wrong, last_seen FROM progress WHERE user_id = ?'
  ).bind(user.id).all();
  return json({ progress: rows.results || [] });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const user = await getSessionUser(request, env);
  if (!user) return json({ error: 'Not signed in' }, 401);

  let body;
  try { body = await request.json(); } catch { return json({ error: 'Invalid request' }, 400); }

  const module = String(body.module || '').slice(0, 40);
  const concept = String(body.concept || '').slice(0, 80);
  const isCorrect = !!body.correct;
  if (!module || !concept) return json({ error: 'module and concept required' }, 400);

  await env.DB.prepare(
    `INSERT INTO progress (user_id, module, concept, correct, wrong, last_seen)
     VALUES (?, ?, ?, ?, ?, datetime('now'))
     ON CONFLICT (user_id, module, concept) DO UPDATE SET
       correct   = correct + excluded.correct,
       wrong     = wrong + excluded.wrong,
       last_seen = datetime('now')`
  ).bind(user.id, module, concept, isCorrect ? 1 : 0, isCorrect ? 0 : 1).run();

  return json({ ok: true });
}
