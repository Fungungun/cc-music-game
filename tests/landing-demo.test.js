const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync(new URL('../landing-demo.js', `file://${__filename}`), 'utf8');
const context = { window: { addEventListener() {} } };
vm.runInNewContext(source, context);

assert.deepEqual({ ...context.window.mmLandingDemo.answerMessage('3') }, {
  correct: true,
  text: 'Correct. A minim is worth 2 beats; the dot adds half of that value, making 3 beats.'
});
assert.equal(context.window.mmLandingDemo.answerMessage('2').correct, false);

const html = fs.readFileSync(new URL('../landing.html', `file://${__filename}`), 'utf8');
assert.match(html, /One question\. No sign-up\./);
assert.match(html, /aria-live="polite"/);
assert.match(html, /landing-demo\.js/);
assert.match(html, /note-values\.html\?grade=1&amp;ref=landing-hero/);
assert.match(html, /note-values\.html\?grade=1&amp;ref=landing-free-plan/);
assert.match(html, /note-values\.html\?grade=1&amp;ref=landing-bottom/);
assert.match(html, /note-values\.html\?grade=1&amp;ref=landing-sample/);
assert.match(html, /ameb-grade-2-dotted-notes-practice\.html\?ref=landing/);
assert.equal((html.match(/class="sample-options" role="group" aria-label="Answer choices"/g) || []).length, 1);
assert.match(html, /data-paid-click="landing-pricing-unlock"/);
assert.match(html, /data-paid-click="landing-bottom-unlock"/);
assert.match(html, /mmTrack\('resource_click',\{channel:'landing',experiment:link\.getAttribute\('data-paid-click'\)\}\)/);
assert.doesNotMatch(html, /href="index\.html\?ref=landing"/);
assert.doesNotMatch(html, /[\u{1F300}-\u{1FAFF}]/u);

console.log('landing demo tests passed');
