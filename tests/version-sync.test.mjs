/* Guards against exactly the bug this test was written to catch: game.js's
   cache-busting query string is hand-edited into every HTML <script> tag
   (no build step to inject it), so it can silently drift out of sync across
   files. This asserts every occurrence matches the single source of truth
   in engine/version.js, and that every HTML file which loads game.js
   carries a cache-busting query string at all (not a bare src="game.js"). */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CACHE_BUST_TOKEN } from '../engine/version.js';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

function htmlFiles() {
  return fs.readdirSync(root)
    .filter((f) => f.endsWith('.html'))
    .filter((f) => fs.statSync(path.join(root, f)).isFile());
}

test('every HTML file that loads game.js uses the current cache-bust token', () => {
  const stale = [];
  const missing = [];
  for (const file of htmlFiles()) {
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    if (!/src="game\.js/.test(html)) continue;
    const match = html.match(/src="game\.js(\?v=[^"]*)?"/);
    if (!match || !match[1]) {
      missing.push(file);
      continue;
    }
    const token = match[1].slice('?v='.length);
    if (token !== CACHE_BUST_TOKEN) stale.push(`${file} (has "${token}")`);
  }
  assert.deepEqual(missing, [], `these files load game.js with no ?v= cache-bust token: ${missing.join(', ')}`);
  assert.deepEqual(stale, [], `these files are out of sync with engine/version.js CACHE_BUST_TOKEN ("${CACHE_BUST_TOKEN}"): ${stale.join(', ')}`);
});

test('CACHE_BUST_TOKEN is a URL-safe, sortable slug', () => {
  assert.match(CACHE_BUST_TOKEN, /^\d{8}-[a-z0-9-]+$/, 'expected YYYYMMDD-short-label format');
});
