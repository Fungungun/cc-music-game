const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync(new URL('../progress.js', `file://${__filename}`), 'utf8');
const context = { window: {}, document: { addEventListener() {} }, Date };
vm.runInNewContext(source, context);
const progress = context.window.mmProgress;

const data = {
  'note-namer:treble-c': { correct: 4, wrong: 1, lastSeen: Date.UTC(2026, 6, 17, 1) },
  'note-namer:bass-g': { correct: 1, wrong: 3, lastSeen: Date.UTC(2026, 6, 16, 2) },
  'note-values:crotchet': { correct: 2, wrong: 1, lastSeen: Date.UTC(2026, 6, 15, 3) },
  'invalid-key': { correct: 999, wrong: 0, lastSeen: Date.now() }
};
const result = progress.summarize(data);

assert.equal(result.total, 12);
assert.equal(result.accuracy, 58);
assert.equal(result.modules.length, 2);
assert.equal(result.modules[0].label, 'Note and rest values');
assert.equal(result.modules[0].quality, 'Early sample');
assert.equal(result.modules[1].label, 'Note reading');
assert.equal(result.modules[1].accuracy, 56);
assert.equal(result.modules[1].quality, 'Needs review');
assert.equal(result.focus.length, 2);
assert.equal(result.focus[0].concept, 'bass-g');
assert.equal(result.focus[0].accuracy, 25);
assert.equal(progress.quality(90, 2), 'Early sample');
assert.equal(progress.quality(80, 5), 'Secure in recent practice');
assert.equal(progress.quality(60, 5), 'Developing');
assert.equal(progress.quality(59, 5), 'Needs review');
assert.equal(progress.recentLabel(0), 'Not yet');
assert.equal(progress.recentLabel(Date.UTC(2026, 6, 17, 1), Date.UTC(2026, 6, 17, 10)), 'Today');
assert.equal(progress.recentLabel(Date.UTC(2026, 6, 16, 1), Date.UTC(2026, 6, 17, 10)), 'Yesterday');
assert.match(progress.summaryText(result, 3), /Current day streak: 3/);

const empty = progress.summarize({});
assert.equal(empty.total, 0);
assert.equal(empty.accuracy, null);
assert.equal(empty.modules.length, 0);

const html = fs.readFileSync(new URL('../progress.html', `file://${__filename}`), 'utf8');
assert.match(html, /name="robots" content="noindex,follow"/);
assert.doesNotMatch(html, /linear-gradient|Suggested focus areas|Overall Progress/i);
/* Guards a deliberate design decision (commit f78ac73, "Redesign Parent View
   as a practice record"): no visible version footer on any page. APP_VERSION
   itself now lives in engine/version.js (tests/version-sync.test.mjs), which
   game.js still does not reference — this assertion stays narrowly about the
   footer-injection pattern so it doesn't forbid legitimate future use of the
   term "APP_VERSION" elsewhere in game.js. */
assert.doesNotMatch(fs.readFileSync(new URL('../game.js', `file://${__filename}`), 'utf8'), /footer\.textContent\s*=\s*APP_VERSION/);

console.log('progress record tests passed');
