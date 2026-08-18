/* Phase 3.3 — real end-to-end verification of lesson.html against a real
   headless Chrome (same CDP-over-WebSocket approach as
   browser-smoke.mjs, not a new pattern). Not named *.test.mjs on
   purpose, matching browser-smoke.mjs's own convention — this spawns a
   real browser and takes a few seconds, so it's kept out of the fast
   `npm test` unit suite and run via `npm run e2e`.

   This is the actual proof that the engine works end-to-end through a
   real page: navigates to lesson.html?skill=g1-treble-notes, starts
   practice, answers all 8 questions (a scripted MIX of correct and
   wrong, using a page-exposed test hook to know the right answer
   deterministically rather than guessing), and asserts the finish
   screen shows the exact score that sequence should produce. */
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, stat, mkdtemp, rm } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { extname, join, normalize } from 'node:path';
import { tmpdir } from 'node:os';

if (typeof WebSocket === 'undefined' && !process.execArgv.includes('--experimental-websocket')) {
  const child = spawn(process.execPath, ['--experimental-websocket', ...process.execArgv, ...process.argv.slice(1)], { stdio: 'inherit' });
  const code = await new Promise((resolve) => child.once('exit', resolve));
  process.exit(code || 0);
}

const root = new URL('../', import.meta.url).pathname;
const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.mp3': 'audio/mpeg', '.woff2': 'font/woff2', '.md': 'text/markdown' };

const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://local').pathname);
    if (pathname === '/favicon.ico') { response.writeHead(302, { Location: '/icon.svg' }); response.end(); return; }
    if (pathname.startsWith('/api/')) { response.writeHead(204); response.end(); return; }
    const relative = normalize(pathname).replace(/^[/\\]+/, '') || 'index.html';
    const file = join(root, relative);
    assert.ok(file.startsWith(root), 'request escaped fixture root');
    const info = await stat(file);
    if (!info.isFile()) throw new Error('not a file');
    response.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    response.end(await readFile(file));
  } catch (_) { response.writeHead(404); response.end('Not found'); }
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const profile = await mkdtemp(join(tmpdir(), 'mm-e2e-'));
const chromePath = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const chrome = spawn(chromePath, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] });

let stderr = '';
const browserWs = await new Promise((resolve, reject) => {
  const timeout = setTimeout(() => reject(new Error(`Chrome did not expose DevTools: ${stderr}`)), 10000);
  chrome.stderr.on('data', (chunk) => {
    stderr += chunk;
    const match = stderr.match(/DevTools listening on (ws:\/\/[^\s]+)/);
    if (match) { clearTimeout(timeout); resolve(match[1]); }
  });
  chrome.once('exit', (code) => reject(new Error(`Chrome exited before DevTools was ready (${code})`)));
});

const ws = new WebSocket(browserWs);
await new Promise((resolve, reject) => { ws.addEventListener('open', resolve, { once: true }); ws.addEventListener('error', reject, { once: true }); });
let nextId = 0;
const pending = new Map();
const listeners = new Set();
ws.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) {
    const { resolve, reject } = pending.get(message.id); pending.delete(message.id);
    if (message.error) reject(new Error(message.error.message)); else resolve(message.result);
  } else listeners.forEach((listener) => listener(message));
});
function send(method, params = {}, sessionId) {
  const id = ++nextId;
  return new Promise((resolve, reject) => { pending.set(id, { resolve, reject }); ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) })); });
}
function waitFor(method, sessionId, timeoutMs = 12000) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => { listeners.delete(onMessage); reject(new Error(`Timed out waiting for ${method}`)); }, timeoutMs);
    function onMessage(message) {
      if (message.method === method && (!sessionId || message.sessionId === sessionId)) { clearTimeout(timeout); listeners.delete(onMessage); resolve(message.params); }
    }
    listeners.add(onMessage);
  });
}
async function evaluate(expression, sessionId) {
  const { result, exceptionDetails } = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }, sessionId);
  if (exceptionDetails) throw new Error(`page threw: ${exceptionDetails.exception?.description || exceptionDetails.text}`);
  return result.value;
}
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const failures = [];
try {
  const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
  await Promise.all(['Page.enable', 'Runtime.enable', 'Log.enable'].map((method) => send(method, {}, sessionId)));
  listeners.add((message) => {
    if (message.sessionId !== sessionId) return;
    if (message.method === 'Runtime.exceptionThrown') {
      const details = message.params.exceptionDetails;
      failures.push(`runtime: ${details.exception?.description || details.text}`);
    }
    if (message.method === 'Log.entryAdded' && message.params.entry.level === 'error') failures.push(`console: ${message.params.entry.text} | url=${message.params.entry.url || 'n/a'}`);
  });
  await send('Network.enable', {}, sessionId);
  listeners.add((message) => {
    if (message.sessionId !== sessionId) return;
    if (message.method === 'Network.responseReceived' && message.params.response.status >= 400) {
      failures.push(`HTTP ${message.params.response.status}: ${message.params.response.url}`);
    }
  });

  await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false }, sessionId);
  const loaded = waitFor('Page.loadEventFired', sessionId);
  await send('Page.navigate', { url: `${origin}/lesson.html?skill=g1-treble-notes` }, sessionId);
  await loaded;
  await sleep(600);

  // 1. The skill title and teach content actually loaded (real fetch of
  // course/grade1/02-note-names-treble.md, real marked.js rendering).
  const initial = await evaluate(`({
    title: document.getElementById('skill-title').textContent,
    teachTextLength: document.getElementById('teach-content').innerText.trim().length,
    startBtnVisible: getComputedStyle(document.getElementById('start-practice-btn')).display !== 'none',
  })`, sessionId);
  assert.equal(initial.title, 'Notes on the treble clef');
  assert.ok(initial.teachTextLength > 200, `teach content too short (${initial.teachTextLength} chars) — lesson markdown probably didn't load`);
  assert.equal(initial.startBtnVisible, true);

  // 2. Start practice — the practice section should appear with a real
  // rendered choice4 item (4 distinct buttons, a staff, aria-live region).
  await evaluate(`document.getElementById('start-practice-btn').click()`, sessionId);
  await sleep(400);
  const firstItem = await evaluate(`({
    practiceVisible: getComputedStyle(document.getElementById('practice-section')).display !== 'none',
    choiceCount: document.querySelectorAll('.mm-choice4-btn').length,
    hasStaff: !!document.querySelector('.mm-choice4-staff svg'),
    ariaLive: document.querySelector('.mm-choice4-feedback')?.getAttribute('aria-live'),
    progressText: document.getElementById('lesson-progress-text').textContent,
  })`, sessionId);
  assert.equal(firstItem.practiceVisible, true);
  assert.equal(firstItem.choiceCount, 4, 'expected exactly 4 rendered choice buttons');
  assert.ok(firstItem.hasStaff, 'expected a real rendered abcjs SVG staff for a note-name item');
  assert.equal(firstItem.ariaLive, 'polite');
  assert.equal(firstItem.progressText, 'Question 1 of 8');

  // 3. Answer all 8 questions with a scripted, known-correct/wrong mix
  // (indices 1,3,5 wrong; the rest correct — i.e. 5 correct, 3 wrong,
  // never triggering the 5-heart depletion) and verify the finish screen
  // shows exactly that score. This is the real proof: the engine's
  // scoring, the renderer's click handling, and the session state
  // machine all agree with each other through actual DOM interaction.
  const WRONG_INDICES = new Set([1, 3, 5]);
  for (let i = 0; i < 8; i++) {
    const answer = await evaluate(`window.__mmTestHooks.getCurrentAnswer()`, sessionId);
    assert.ok(answer, `question ${i + 1}: no current answer available from the test hook`);
    const wantWrong = WRONG_INDICES.has(i);
    const clickResult = await evaluate(`(function(){
      var answer = ${JSON.stringify(answer)};
      var buttons = Array.from(document.querySelectorAll('.mm-choice4-btn'));
      var target = ${wantWrong}
        ? buttons.find(function(b){ return b.dataset.value !== answer; })
        : buttons.find(function(b){ return b.dataset.value === answer; });
      if (!target) return null;
      target.click();
      return target.dataset.value;
    })()`, sessionId);
    assert.ok(clickResult, `question ${i + 1}: could not find a button to click`);
    await sleep(1500); // matches lesson.html's own 1400ms feedback delay
  }

  const final = await evaluate(`({
    finishVisible: getComputedStyle(document.getElementById('finish-section')).display !== 'none',
    score: document.getElementById('finish-score').textContent,
    detail: document.getElementById('finish-detail').textContent,
  })`, sessionId);
  assert.equal(final.finishVisible, true, 'finish screen should be visible after 8 answered questions');
  assert.equal(final.score, '5/8', `expected 5 correct out of 8 (3 deliberately wrong), got "${final.score}"`);
  assert.match(final.detail, /63% correct/, `expected 63% (5/8 rounded), got "${final.detail}"`);
  assert.match(final.detail, /\+\d+ XP/, 'finish detail should show XP earned');

  // 4. Progress actually persisted to engine/state.js's localStorage key.
  const persisted = await evaluate(`JSON.parse(localStorage.getItem('mm-state-v1'))`, sessionId);
  assert.ok(persisted, 'expected engine/state.js to have written mm-state-v1 to localStorage');
  const conceptKeys = Object.keys(persisted.concepts || {});
  assert.ok(conceptKeys.length > 0, 'expected at least one concept to have been recorded');
  assert.ok(conceptKeys.every((k) => k.startsWith('note-name:')), `expected only note-name concepts, got: ${conceptKeys.join(', ')}`);
  assert.equal(persisted.streak.days, 1, 'a completed session should have earned one day of streak credit');

  // Mobile viewport check — the specific overflow class of bug the
  // original pre-rebuild audit found repeatedly across the old app.
  await send('Emulation.setDeviceMetricsOverride', { width: 375, height: 812, deviceScaleFactor: 2, mobile: true }, sessionId);
  const loadedMobile = waitFor('Page.loadEventFired', sessionId);
  await send('Page.navigate', { url: `${origin}/lesson.html?skill=g1-treble-notes` }, sessionId);
  await loadedMobile;
  await sleep(600);
  await evaluate(`document.getElementById('start-practice-btn').click()`, sessionId);
  await sleep(400);
  const mobileCheck = await evaluate(`({
    width: document.documentElement.scrollWidth,
    viewport: document.documentElement.clientWidth,
    choiceCount: document.querySelectorAll('.mm-choice4-btn').length,
    minTargetHeight: Math.min(...Array.from(document.querySelectorAll('.mm-choice4-btn')).map((b) => b.getBoundingClientRect().height)),
  })`, sessionId);
  assert.ok(mobileCheck.width <= mobileCheck.viewport + 1, `mobile lesson.html overflows horizontally (${mobileCheck.width}px > ${mobileCheck.viewport}px)`);
  assert.equal(mobileCheck.choiceCount, 4);
  assert.ok(mobileCheck.minTargetHeight >= 44, `choice buttons must be >=44px tall on mobile, got ${mobileCheck.minTargetHeight}px`);

  assert.deepEqual(failures, []);
  console.log(`lesson e2e passed: full 8-question session (5 correct, 3 wrong) through a real headless browser, finish screen scored correctly, progress persisted to localStorage, mobile viewport has no horizontal overflow and 44px+ touch targets`);
} finally {
  ws.close();
  const exited = new Promise((resolve) => chrome.once('exit', resolve));
  chrome.kill('SIGTERM');
  const stopped = await Promise.race([exited.then(() => true), new Promise((resolve) => setTimeout(() => resolve(false), 3000))]);
  if (!stopped) { chrome.kill('SIGKILL'); await exited; }
  server.closeAllConnections();
  await new Promise((resolve) => server.close(resolve));
  for (let attempt = 0; attempt < 3; attempt++) {
    try { await rm(profile, { recursive: true, force: true }); break; }
    catch (error) { if (attempt === 2) throw error; await sleep(150); }
  }
}
