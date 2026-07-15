import { json, getSessionUser, publicUser } from '../../_shared/util.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  const row = await getSessionUser(request, env);
  if (!row) return json({ user: null, profile: null });
  return json(publicUser(row));
}
