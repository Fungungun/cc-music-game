const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync(new URL('../teacher-share.js', `file://${__filename}`), 'utf8');
const context = {
  window: {}, location: { origin: 'https://music.vensoai.com' }, URL,
  document: { addEventListener() {} }
};
vm.runInNewContext(source, context);

const share = context.window.mmTeacherShare;
assert.equal(Object.keys(share.choices).length, 10);

for (const key of Object.keys(share.choices)) {
  const result = share.build(key, 'https://music.vensoai.com');
  const url = new URL(result.url);
  assert.equal(url.origin, 'https://music.vensoai.com');
  assert.equal(url.searchParams.get('utm_source'), 'teacher-share');
  assert.equal(url.searchParams.get('utm_medium'), 'referral');
  assert.equal(url.searchParams.get('utm_campaign'), 'practice-link');
  assert.equal(url.searchParams.get('utm_content'), key);
  assert.ok(result.message.includes(result.url));
  assert.ok(!/student(name|id)|teacher(name|id)|email/i.test(result.url));
}

for (const key of ['note-reading', 'note-values', 'key-signatures', 'aural-training', 'daily-review']) {
  assert.equal(new URL(share.build(key, 'https://music.vensoai.com').url).searchParams.get('grade'), '1');
}

for (const key of ['grade2-dotted-notes', 'grade2-diagnostic', 'general-knowledge', 'weekly-checklist', 'note-values-sheet']) {
  assert.equal(new URL(share.build(key, 'https://music.vensoai.com').url).searchParams.has('grade'), false);
}

const html = fs.readFileSync(new URL('../teachers.html', `file://${__filename}`), 'utf8');
assert.match(html, /<script src="teacher-share\.js" defer><\/script>/);
assert.equal((html.match(/<option value=/g) || []).length, 10);
assert.match(html, /ameb-grade-1-note-values-practice\.html\?ref=teachers/);
assert.match(html, /<option value="grade2-dotted-notes">Free Grade 2 dotted-notes worksheet<\/option>/);

console.log('teacher share tests passed');
