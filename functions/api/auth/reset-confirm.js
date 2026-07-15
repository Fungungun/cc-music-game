import {
  json, randomHex, hashPassword, createSession, sessionCookieHeader, publicUser,
} from '../../_shared/util.js';

export async function onRequestPost(context) {
  const { request, env } = context;
  let body;
  try { body = await request.json(); } catch { return json({ error: 'Invalid request' }, 400); }

  const token = String(body.token || '');
  const password = String(body.password || '');
  if (!/^[0-9a-f]{64}$/.test(token)) return json({ error: 'This reset link is invalid.' }, 400);
  if (password.length < 6) return json({ error: 'Password must be at least 6 characters.' }, 400);

  const reset = await env.DB.prepare(
    'SELECT user_id, expires_at FROM password_resets WHERE token = ?'
  ).bind(token).first();
  if (!reset || new Date(reset.expires_at) < new Date()) {
    return json({ error: 'This reset link has expired. Please request a new one.' }, 400);
  }

  const salt = randomHex(16);
  const hash = await hashPassword(password, salt);
  await env.DB.prepare('UPDATE users SET password_hash = ?, salt = ? WHERE id = ?')
    .bind(hash, salt, reset.user_id).run();
  await env.DB.prepare('DELETE FROM password_resets WHERE user_id = ?').bind(reset.user_id).run();
  /* Invalidate all existing sessions for safety, then sign the user in fresh */
  await env.DB.prepare('DELETE FROM sessions WHERE user_id = ?').bind(reset.user_id).run();

  const row = await env.DB.prepare(
    'SELECT id, email, name, grade, is_unlocked FROM users WHERE id = ?'
  ).bind(reset.user_id).first();
  const session = await createSession(env, reset.user_id);
  return json(publicUser(row), 200, { 'Set-Cookie': sessionCookieHeader(session) });
}
