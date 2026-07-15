import { json, getCookie, clearSessionCookieHeader } from '../../_shared/util.js';

export async function onRequestPost(context) {
  const { request, env } = context;
  const token = getCookie(request, 'mm_session');
  if (token && /^[0-9a-f]{64}$/.test(token)) {
    await env.DB.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run();
  }
  return json({ ok: true }, 200, { 'Set-Cookie': clearSessionCookieHeader() });
}
