import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { mkdtemp, rm } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { extname, join, normalize } from 'node:path';
import { tmpdir } from 'node:os';

if (typeof WebSocket === 'undefined' && !process.execArgv.includes('--experimental-websocket')) {
  const child = spawn(process.execPath, ['--experimental-websocket', ...process.execArgv, ...process.argv.slice(1)], { stdio:'inherit' });
  const code = await new Promise(resolve => child.once('exit', resolve));
  process.exit(code || 0);
}

const root = new URL('../', import.meta.url).pathname;
const routes = [
  'index.html', 'note-namer.html', 'scale-builder.html', 'key-signatures.html',
  'note-values.html', 'interval-quiz.html', 'chord-game.html', 'rhythm-trainer.html',
  'terms-flashcards.html', 'aural-training.html', 'form-detective.html',
  'daily-challenge.html', 'learn.html', 'mock-exam.html', 'progress.html',
  'parents.html',
  'ameb-grade-1-note-values-practice.html',
  'ameb-grade-1-aural-test-practice.html',
  'ameb-grade-2-dotted-notes-practice.html'
];
const interactions = {
  'note-namer.html':'.note-btn', 'scale-builder.html':'button[onclick="showMeScale()"]',
  'key-signatures.html':'.answer-btn', 'note-values.html':'.beat-btn',
  'interval-quiz.html':'.answer-btn', 'chord-game.html':'.answer-btn',
  'rhythm-trainer.html':'#start-btn', 'terms-flashcards.html':'#flashcard',
  'aural-training.html':'#btn-mode-intervals', 'form-detective.html':'.answer-opt',
  'daily-challenge.html':'#start-btn', 'mock-exam.html':'#start-btn'
};
const types = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.svg':'image/svg+xml', '.png':'image/png', '.mp3':'audio/mpeg', '.woff2':'font/woff2' };

const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://local').pathname);
    if (pathname.startsWith('/api/')) { response.writeHead(204); response.end(); return; }
    if (pathname === '/favicon.ico') { response.writeHead(302, {Location:'/icon.svg'}); response.end(); return; }
    const relative = normalize(pathname).replace(/^[/\\]+/, '') || 'index.html';
    const file = join(root, relative);
    assert.ok(file.startsWith(root), 'request escaped fixture root');
    const info = await stat(file);
    if (!info.isFile()) throw new Error('not a file');
    response.writeHead(200, { 'Content-Type':types[extname(file)] || 'application/octet-stream', 'Cache-Control':'no-store' });
    response.end(await readFile(file));
  } catch (_) { response.writeHead(404); response.end('Not found'); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const profile = await mkdtemp(join(tmpdir(), 'mm-smoke-'));
const chromePath = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const chrome = spawn(chromePath, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { stdio:['ignore','ignore','pipe'] });

let stderr = '';
const browserWs = await new Promise((resolve, reject) => {
  const timeout = setTimeout(() => reject(new Error(`Chrome did not expose DevTools: ${stderr}`)), 10000);
  chrome.stderr.on('data', chunk => {
    stderr += chunk;
    const match = stderr.match(/DevTools listening on (ws:\/\/[^\s]+)/);
    if (match) { clearTimeout(timeout); resolve(match[1]); }
  });
  chrome.once('exit', code => reject(new Error(`Chrome exited before DevTools was ready (${code})`)));
});

const ws = new WebSocket(browserWs);
await new Promise((resolve, reject) => { ws.addEventListener('open', resolve, { once:true }); ws.addEventListener('error', reject, { once:true }); });
let nextId = 0;
const pending = new Map();
const listeners = new Set();
ws.addEventListener('message', event => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) {
    const { resolve, reject } = pending.get(message.id); pending.delete(message.id);
    if (message.error) reject(new Error(message.error.message)); else resolve(message.result);
  } else listeners.forEach(listener => listener(message));
});
function send(method, params = {}, sessionId) {
  const id = ++nextId;
  return new Promise((resolve, reject) => { pending.set(id, {resolve,reject}); ws.send(JSON.stringify({ id, method, params, ...(sessionId ? {sessionId} : {}) })); });
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

const failures = [];
try {
  const { targetId } = await send('Target.createTarget', {url:'about:blank'});
  const { sessionId } = await send('Target.attachToTarget', {targetId, flatten:true});
  await Promise.all(['Page.enable','Runtime.enable','Network.enable','Log.enable'].map(method => send(method, {}, sessionId)));
  listeners.add(message => {
    if (message.sessionId !== sessionId) return;
    if (message.method === 'Runtime.exceptionThrown') {
      const details = message.params.exceptionDetails;
      failures.push(`runtime: ${details.exception && details.exception.description || details.text}`);
    }
    if (message.method === 'Log.entryAdded' && message.params.entry.level === 'error') failures.push(`console: ${message.params.entry.text}`);
    if (message.method === 'Network.responseReceived') {
      const response = message.params.response;
      if (response.status >= 400 && !new URL(response.url).pathname.startsWith('/api/')) failures.push(`HTTP ${response.status}: ${response.url}`);
    }
  });

  for (const viewport of [{name:'desktop',width:1280,height:800,mobile:false},{name:'mobile',width:390,height:844,mobile:true}]) {
    await send('Emulation.setDeviceMetricsOverride', {width:viewport.width,height:viewport.height,deviceScaleFactor:1,mobile:viewport.mobile}, sessionId);
    for (const route of routes) {
      const start = failures.length;
      const loaded = waitFor('Page.loadEventFired', sessionId);
      await send('Page.navigate', {url:`${origin}/${route}`}, sessionId);
      await loaded;
      await new Promise(resolve => setTimeout(resolve, 450));
      const { result } = await send('Runtime.evaluate', { expression:`({title:document.title, text:(document.body&&document.body.innerText||'').trim().length, width:document.documentElement.scrollWidth, viewport:document.documentElement.clientWidth})`, returnByValue:true }, sessionId);
      assert.ok(result.value.title, `${viewport.name} ${route} has no title`);
      assert.ok(result.value.text > 80, `${viewport.name} ${route} rendered too little content`);
      assert.ok(result.value.width <= result.value.viewport + 1, `${viewport.name} ${route} overflows horizontally (${result.value.width}px > ${result.value.viewport}px)`);
      if (!viewport.mobile && interactions[route]) {
        const selector = JSON.stringify(interactions[route]);
        let clicked = {result:{value:false}};
        for (let attempt = 0; attempt < 30; attempt++) {
          clicked = await send('Runtime.evaluate', { expression:`(function(){var item=document.querySelector(${selector});if(!item||item.disabled)return false;item.click();return true})()`, returnByValue:true }, sessionId);
          if (clicked.result.value) break;
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        assert.equal(clicked.result.value, true, `${route} did not render its primary control ${interactions[route]}`);
        await new Promise(resolve => setTimeout(resolve, 350));
      }
      if (failures.length > start) failures.splice(start, failures.length - start, ...failures.slice(start).map(item => `${viewport.name} ${route}: ${item}`));
    }
  }

  await send('Emulation.setDeviceMetricsOverride', {width:390,height:844,deviceScaleFactor:1,mobile:true}, sessionId);
  {
    const loaded = waitFor('Page.loadEventFired', sessionId);
    await send('Page.navigate', {url:`${origin}/index.html`}, sessionId);
    await loaded;
    await send('Runtime.evaluate', { expression:`localStorage.setItem('mm-onboarded','1')` }, sessionId);
    await new Promise(resolve => setTimeout(resolve, 450));
    await send('Runtime.evaluate', { expression:`document.querySelector('.upgrade-link').click()` }, sessionId);
    await new Promise(resolve => setTimeout(resolve, 250));
    const { result } = await send('Runtime.evaluate', { expression:`({
      title: document.getElementById('mm-auth-title') && document.getElementById('mm-auth-title').textContent,
      sub: document.getElementById('mm-auth-sub') && document.getElementById('mm-auth-sub').textContent,
      button: document.getElementById('mm-auth-btn') && document.getElementById('mm-auth-btn').textContent,
      width: document.documentElement.scrollWidth,
      viewport: document.documentElement.clientWidth
    })`, returnByValue:true }, sessionId);
    assert.equal(result.value.title, 'Create account to unlock');
    assert.match(result.value.sub, /Stripe unlocks Grade 2 and 3/);
    assert.equal(result.value.button, 'Create account and continue');
    assert.ok(result.value.width <= result.value.viewport + 1, `mobile upgrade auth overflows horizontally (${result.value.width}px > ${result.value.viewport}px)`);
  }

  await send('Emulation.setDeviceMetricsOverride', {width:390,height:844,deviceScaleFactor:1,mobile:true}, sessionId);
  {
    const loaded = waitFor('Page.loadEventFired', sessionId);
    await send('Page.navigate', {url:`${origin}/note-values.html?grade=1&ref=smoke`}, sessionId);
    await loaded;
    await new Promise(resolve => setTimeout(resolve, 650));
    const { result } = await send('Runtime.evaluate', { expression:`(function(){
      localStorage.removeItem('mm-unlocked');
      window.__tracked = [];
      window.mmTrack = function(eventName, extra){ window.__tracked.push({eventName, extra}); };
      showSessionSummary({module:'note-values',correct:8,total:10});
      return {
        text: document.getElementById('session-summary-modal').innerText,
        tracked: window.__tracked,
        width: document.documentElement.scrollWidth,
        viewport: document.documentElement.clientWidth
      };
    })()`, returnByValue:true }, sessionId);
    assert.match(result.value.text, /Ready for Grade 2 or 3/);
    assert.match(result.value.text, /Unlock Grade 2 & 3 - \$14\.99 AUD/);
    assert.ok(result.value.tracked.some(item => item.eventName === 'upgrade_view' && item.extra && item.extra.experiment === 'summary:note-values'));
    assert.ok(result.value.width <= result.value.viewport + 1, `mobile note-values summary overflows horizontally (${result.value.width}px > ${result.value.viewport}px)`);
  }

  await send('Emulation.setDeviceMetricsOverride', {width:390,height:844,deviceScaleFactor:1,mobile:true}, sessionId);
  {
    const loaded = waitFor('Page.loadEventFired', sessionId);
    await send('Page.navigate', {url:`${origin}/note-namer.html?grade=1&ref=smoke`}, sessionId);
    await loaded;
    await new Promise(resolve => setTimeout(resolve, 650));
    const { result } = await send('Runtime.evaluate', { expression:`(function(){
      localStorage.removeItem('mm-unlocked');
      window.__tracked = [];
      window.mmTrack = function(eventName, extra){ window.__tracked.push({eventName, extra}); };
      showSessionSummary({module:'note-namer',correct:8,total:10});
      return {
        text: document.getElementById('session-summary-modal').innerText,
        tracked: window.__tracked,
        width: document.documentElement.scrollWidth,
        viewport: document.documentElement.clientWidth
      };
    })()`, returnByValue:true }, sessionId);
    assert.match(result.value.text, /Ready for Grade 2 or 3/);
    assert.match(result.value.text, /Unlock Grade 2 & 3 - \$14\.99 AUD/);
    assert.ok(result.value.tracked.some(item => item.eventName === 'upgrade_view' && item.extra && item.extra.experiment === 'summary:note-namer'));
    assert.ok(result.value.width <= result.value.viewport + 1, `mobile generic summary upgrade overflows horizontally (${result.value.width}px > ${result.value.viewport}px)`);
  }

  assert.deepEqual(failures, []);
  console.log(`browser smoke passed: ${routes.length} product routes on desktop and mobile, plus upgrade auth and summary upgrade paths`);
} finally {
  ws.close();
  const exited = new Promise(resolve => chrome.once('exit', resolve));
  chrome.kill('SIGTERM');
  const stopped = await Promise.race([exited.then(() => true), new Promise(resolve => setTimeout(() => resolve(false), 3000))]);
  if (!stopped) { chrome.kill('SIGKILL'); await exited; }
  server.closeAllConnections();
  await new Promise(resolve => server.close(resolve));
  for (let attempt = 0; attempt < 3; attempt++) {
    try { await rm(profile, {recursive:true, force:true}); break; }
    catch (error) { if (attempt === 2) throw error; await new Promise(resolve => setTimeout(resolve, 150)); }
  }
}
