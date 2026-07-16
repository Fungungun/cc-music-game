import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../functions/_middleware.js', import.meta.url), 'utf8');
const moduleUrl = `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
const { onRequest } = await import(moduleUrl);

async function status(pathname) {
  const response = await onRequest({
    request: new Request(`https://music.vensoai.com${pathname}`),
    next: () => new Response('next', { status: 200 })
  });
  return response.status;
}

for (const path of [
  '/README.md', '/tests/growth-attribution.test.js', '/.ops/report.md',
  '/wrangler.toml', '/CLAUDE.md', '/migrations/0001_init.sql', '/functions/api/events.js'
]) {
  assert.equal(await status(path), 404, `${path} must not be served`);
}

for (const path of ['/', '/note-namer', '/.well-known/example']) {
  assert.equal(await status(path), 200, `${path} must continue`);
}

console.log('middleware privacy tests passed');
