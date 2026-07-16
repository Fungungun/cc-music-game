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

for (const route of ['ameb-grade-1-theory-practice', 'ameb-grade-2-piano-theory-practice']) {
  const html = fs.readFileSync(path.join(root, `${route}.html`), 'utf8');
  assert.equal((html.match(/<h1[ >]/g) || []).length, 1, `${route} must have one primary heading`);
}

const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
for (const route of routes) {
  assert.match(sitemap, new RegExp(`<loc>https://music\\.vensoai\\.com/${route}</loc><lastmod>2026-07-17</lastmod>`));
}

console.log('SEO metadata tests passed');
