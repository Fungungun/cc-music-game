const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const routes = [
  'note-namer', 'scale-builder', 'key-signatures', 'note-values', 'interval-quiz',
  'chord-game', 'rhythm-trainer', 'terms-flashcards', 'aural-training',
  'form-detective', 'learn', 'course', 'mock-exam', 'daily-challenge', 'syllabus'
];

for (const route of routes) {
  const html = fs.readFileSync(path.join(root, `${route}.html`), 'utf8');
  const descriptions = html.match(/<meta name="description" content="[^"]+">/g) || [];
  const canonicals = html.match(/<link rel="canonical" href="[^"]+">/g) || [];
  assert.equal(descriptions.length, 1, `${route} must have one description`);
  assert.equal(canonicals.length, 1, `${route} must have one canonical`);
  assert.match(canonicals[0], new RegExp(`https://music\\.vensoai\\.com/${route}`));
}

for (const route of ['ameb-grade-1-theory-practice', 'ameb-grade-1-note-values-practice', 'ameb-grade-2-piano-theory-practice']) {
  const html = fs.readFileSync(path.join(root, `${route}.html`), 'utf8');
  assert.equal((html.match(/<h1[ >]/g) || []).length, 1, `${route} must have one primary heading`);
}

const noteValuesResource = fs.readFileSync(path.join(root, 'ameb-grade-1-note-values-practice.html'), 'utf8');
assert.match(noteValuesResource, /note-values\.html\?grade=1&amp;ref=organic-note-values/);
assert.match(noteValuesResource, /"@type":"LearningResource"/);

const readme = fs.readFileSync(path.join(root, 'README.md'), 'utf8');
assert.match(readme, /ameb-grade-1-note-values-practice\?utm_source=github&utm_medium=repository&utm_campaign=owned-repo&utm_content=readme-note-values/);

const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
for (const route of routes) {
  assert.match(sitemap, new RegExp(`<loc>https://music\\.vensoai\\.com/${route}</loc><lastmod>2026-07-17</lastmod>`));
}
assert.match(sitemap, /<loc>https:\/\/music\.vensoai\.com\/ameb-grade-1-note-values-practice<\/loc><lastmod>2026-07-17<\/lastmod>/);

const indexNowKey = 'a8eb59ee77ba35e0d503b2521e062f7c';
assert.equal(fs.readFileSync(path.join(root, `${indexNowKey}.txt`), 'utf8').trim(), indexNowKey);
const indexNowScript = fs.readFileSync(path.join(root, 'scripts/indexnow-submit.mjs'), 'utf8');
assert.match(indexNowScript, new RegExp(`const key = '${indexNowKey}'`));
assert.match(indexNowScript, /const host = 'music\.vensoai\.com'/);

console.log('SEO metadata tests passed');
