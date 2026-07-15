import {
  json, verifyPassword, createSession, sessionCookieHeader,
  normalizeEmail, publicUser,
} from '../../_shared/util.js';

export async function onRequestPost(context) {
  const { request, env } = context;
  let body;
  try { body = await request.json(); } catch { return json({ error: 'Invalid request' }, 400); }

  const email = normalizeEmail(body.email);
  const password = String(body.password || '');
  if (!email || !password) return json({ error: 'Please enter your email and password.' }, 400);

  const row = await env.DB.prepare(
    'SELECT id, email, password_hash, salt, name, grade, is_unlocked FROM users WHERE email = ?'
  ).bind(email).first();

  if (!row || !(await verifyPassword(password, row.salt, row.password_hash))) {
    return json({ error: 'Incorrect email or password.' }, 401);
  }

  const token = await createSession(env, row.id);
  return json(publicUser(row), 200, { 'Set-Cookie': sessionCookieHeader(token) });
}
