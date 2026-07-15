import { json, randomHex, normalizeEmail, EMAIL_RE } from '../../_shared/util.js';

const RESET_TTL_MIN = 60;

export async function onRequestPost(context) {
  const { request, env } = context;
  let body;
  try { body = await request.json(); } catch { return json({ error: 'Invalid request' }, 400); }

  const email = normalizeEmail(body.email);
  if (!EMAIL_RE.test(email)) return json({ error: 'Please enter a valid email address.' }, 400);

  if (!env.RESEND_API_KEY) {
    return json({ error: 'Password reset email is temporarily unavailable. Please contact chenghuan.irving.liu@gmail.com and we will reset it for you.' }, 503);
  }

  const user = await env.DB.prepare('SELECT id, name FROM users WHERE email = ?').bind(email).first();

  /* Always report success so the endpoint can't be used to probe which emails exist */
  if (!user) return json({ ok: true });

  const token = randomHex(32);
  const expires = new Date(Date.now() + RESET_TTL_MIN * 60 * 1000).toISOString();
  await env.DB.prepare('DELETE FROM password_resets WHERE user_id = ?').bind(user.id).run();
  await env.DB.prepare('INSERT INTO password_resets (token, user_id, expires_at) VALUES (?, ?, ?)')
    .bind(token, user.id, expires).run();

  const origin = new URL(request.url).origin;
  const link = `${origin}/reset-password.html?token=${token}`;

  const mail = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Music Maestro <noreply@vensoai.com>',
      to: [email],
      subject: 'Reset your Music Maestro password',
      html:
        `<p>Hi ${user.name || 'there'},</p>` +
        `<p>Someone (hopefully you) asked to reset the password for your Music Maestro account.</p>` +
        `<p><a href="${link}" style="display:inline-block;background:#FF8FAB;color:#fff;padding:12px 24px;border-radius:12px;text-decoration:none;font-weight:bold;">Set a new password</a></p>` +
        `<p>This link expires in ${RESET_TTL_MIN} minutes. If you didn't ask for this, you can safely ignore this email.</p>` +
        `<p>— Music Maestro · music.vensoai.com</p>`,
    }),
  });

  if (!mail.ok) {
    console.log('Resend error', mail.status, await mail.text());
    return json({ error: 'Could not send the reset email right now. Please try again shortly.' }, 502);
  }
  return json({ ok: true });
}
