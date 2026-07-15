import {
  json, randomHex, hashPassword, createSession, sessionCookieHeader,
  normalizeEmail, EMAIL_RE, publicUser,
} from '../../_shared/util.js';

export async function onRequestPost(context) {
  const { request, env } = context;
  let body;
  try { body = await request.json(); } catch { return json({ error: 'Invalid request' }, 400); }

  const email = normalizeEmail(body.email);
  const password = String(body.password || '');
  const name = String(body.name || '').trim().slice(0, 20);

  if (!EMAIL_RE.test(email)) return json({ error: 'Please enter a valid email address.' }, 400);
  if (password.length < 6) return json({ error: 'Password must be at least 6 characters.' }, 400);

  const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
  if (existing) return json({ error: 'An account with this email already exists. Try signing in.' }, 409);

  const id = crypto.randomUUID();
  const salt = randomHex(16);
  const hash = await hashPassword(password, salt);

  await env.DB.prepare(
    'INSERT INTO users (id, email, password_hash, salt, name) VALUES (?, ?, ?, ?, ?)'
  ).bind(id, email, hash, salt, name).run();

  const token = await createSession(env, id);
  const row = { id, email, name, grade: 1, is_unlocked: 0 };
  return json(publicUser(row), 200, { 'Set-Cookie': sessionCookieHeader(token) });
}
