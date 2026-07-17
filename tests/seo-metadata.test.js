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

for (const route of ['ameb-grade-1-theory-practice', 'ameb-grade-1-note-values-practice', 'ameb-grade-2-dotted-notes-practice', 'ameb-grade-2-piano-theory-practice']) {
  const html = fs.readFileSync(path.join(root, `${route}.html`), 'utf8');
  assert.equal((html.match(/<h1[ >]/g) || []).length, 1, `${route} must have one primary heading`);
}

const noteValuesResource = fs.readFileSync(path.join(root, 'ameb-grade-1-note-values-practice.html'), 'utf8');
assert.match(noteValuesResource, /note-values\.html\?grade=1&amp;ref=organic-note-values/);
assert.match(noteValuesResource, /note-values\.html\?grade=1&amp;ref=organic-note-values-top/);
assert.match(noteValuesResource, /data-resource-click="note-values-drill-top"/);
assert.match(noteValuesResource, /mmTrack\('resource_click',\{channel:'organic-note-values',experiment:link\.getAttribute\('data-resource-click'\)\}\)/);
assert.match(noteValuesResource, /"@type":"LearningResource"/);
assert.match(noteValuesResource, /id="copy-family-note"/);
assert.match(noteValuesResource, /utm_source=family-note&utm_medium=referral&utm_campaign=note-values-sheet/);
assert.match(noteValuesResource, /mmTrack\('resource_share',\{channel:'organic-note-values',experiment:'family-note'\}\)/);

const readme = fs.readFileSync(path.join(root, 'README.md'), 'utf8');
assert.match(readme, /ameb-grade-1-note-values-practice\?utm_source=github&utm_medium=repository&utm_campaign=owned-repo&utm_content=readme-note-values/);
assert.match(readme, /ameb-grade-2-dotted-notes-practice\?utm_source=github&utm_medium=repository&utm_campaign=owned-repo&utm_content=readme-grade2-dotted/);

const checklist = fs.readFileSync(path.join(root, 'ameb-practice-checklist.html'), 'utf8');
assert.match(checklist, /ameb-grade-1-note-values-practice\.html\?ref=practice-checklist/);

const generalKnowledge = fs.readFileSync(path.join(root, 'ameb-piano-general-knowledge-questions.html'), 'utf8');
assert.match(generalKnowledge, /ameb-grade-1-note-values-practice\.html\?ref=general-knowledge-sheet/);

const grade2Dotted = fs.readFileSync(path.join(root, 'ameb-grade-2-dotted-notes-practice.html'), 'utf8');
assert.match(grade2Dotted, /"@type":"LearningResource"/);
assert.match(grade2Dotted, /index\.html\?unlock=1&amp;ref=organic-grade2-dotted-notes/);
assert.match(grade2Dotted, /mmTrack\('landing_visit',\{channel:'organic-grade2-dotted-notes'\}\)/);

const grade2Diagnostic = fs.readFileSync(path.join(root, 'ameb-grade-2-piano-theory-practice.html'), 'utf8');
assert.match(grade2Diagnostic, /ameb-grade-2-dotted-notes-practice\.html\?ref=grade2-diagnostic/);

const teachers = fs.readFileSync(path.join(root, 'teachers.html'), 'utf8');
assert.match(teachers, /ameb-grade-2-dotted-notes-practice\.html\?ref=teachers/);

const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
for (const route of routes) {
  assert.match(sitemap, new RegExp(`<loc>https://music\\.vensoai\\.com/${route}</loc><lastmod>2026-07-17</lastmod>`));
}
assert.match(sitemap, /<loc>https:\/\/music\.vensoai\.com\/ameb-grade-1-note-values-practice<\/loc><lastmod>2026-07-17<\/lastmod>/);
assert.match(sitemap, /<loc>https:\/\/music\.vensoai\.com\/ameb-grade-2-dotted-notes-practice<\/loc><lastmod>2026-07-17<\/lastmod>/);

const indexNowKey = 'a8eb59ee77ba35e0d503b2521e062f7c';
assert.equal(fs.readFileSync(path.join(root, `${indexNowKey}.txt`), 'utf8').trim(), indexNowKey);
const indexNowScript = fs.readFileSync(path.join(root, 'scripts/indexnow-submit.mjs'), 'utf8');
assert.match(indexNowScript, new RegExp(`const key = '${indexNowKey}'`));
assert.match(indexNowScript, /const host = 'music\.vensoai\.com'/);

const eventsApi = fs.readFileSync(path.join(root, 'functions/api/events.js'), 'utf8');
assert.match(eventsApi, /resource_click/);

const ownerReport = fs.readFileSync(path.join(root, 'functions/api/owner-report.js'), 'utf8');
assert.match(ownerReport, /visit_to_resource_click/);
assert.match(ownerReport, /resource_click_to_practice/);

console.log('SEO metadata tests passed');
