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

for (const route of ['family-practice-handout', 'ameb-grade-1-theory-practice', 'ameb-grade-1-note-values-practice', 'ameb-grade-1-aural-test-practice', 'ameb-grade-2-dotted-notes-practice', 'ameb-grade-2-piano-theory-practice']) {
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
assert.match(readme, /parents\?utm_source=github&utm_medium=repository&utm_campaign=owned-repo&utm_content=readme-primary/);
assert.match(readme, /music\.vensoai\.com\/\?utm_source=github&utm_medium=repository&utm_campaign=owned-repo&utm_content=readme-app/);
assert.match(readme, /ameb-grade-1-note-values-practice\?utm_source=github&utm_medium=repository&utm_campaign=owned-repo&utm_content=readme-note-values/);
assert.match(readme, /ameb-grade-1-aural-test-practice\?utm_source=github&utm_medium=repository&utm_campaign=owned-repo&utm_content=readme-grade1-aural/);
assert.match(readme, /ameb-grade-2-dotted-notes-practice\?utm_source=github&utm_medium=repository&utm_campaign=owned-repo&utm_content=readme-grade2-dotted/);

const checklist = fs.readFileSync(path.join(root, 'ameb-practice-checklist.html'), 'utf8');
assert.match(checklist, /ameb-grade-1-note-values-practice\.html\?ref=practice-checklist/);

const generalKnowledge = fs.readFileSync(path.join(root, 'ameb-piano-general-knowledge-questions.html'), 'utf8');
assert.match(generalKnowledge, /ameb-grade-1-note-values-practice\.html\?ref=general-knowledge-sheet/);

const grade2Dotted = fs.readFileSync(path.join(root, 'ameb-grade-2-dotted-notes-practice.html'), 'utf8');
assert.match(grade2Dotted, /"@type":"LearningResource"/);
assert.match(grade2Dotted, /index\.html\?unlock=1&amp;ref=organic-grade2-dotted-notes/);
assert.match(grade2Dotted, /data-paid-click="grade2-dotted-unlock"/);
assert.match(grade2Dotted, /id="copy-family-note"/);
assert.match(grade2Dotted, /id="copy-family-note-bottom"/);
assert.match(grade2Dotted, /utm_source=family-note&utm_medium=referral&utm_campaign=grade2-dotted-notes/);
assert.match(grade2Dotted, /mmTrack\('landing_visit',\{channel:'organic-grade2-dotted-notes'\}\)/);
assert.match(grade2Dotted, /mmTrack\('resource_click',\{channel:'organic-grade2-dotted-notes',experiment:link\.getAttribute\('data-paid-click'\)\}\)/);
assert.match(grade2Dotted, /mmTrack\('resource_share',\{channel:'organic-grade2-dotted-notes',experiment:'family-note'\}\)/);

const grade1Aural = fs.readFileSync(path.join(root, 'ameb-grade-1-aural-test-practice.html'), 'utf8');
assert.match(grade1Aural, /"@type":"LearningResource"/);
assert.match(grade1Aural, /aural-training\.html\?grade=1&amp;ref=organic-grade1-aural/);
assert.match(grade1Aural, /mmTrack\('landing_visit',\{channel:'organic-grade1-aural'\}\)/);
assert.match(grade1Aural, /mmTrack\('resource_click',\{channel:'organic-grade1-aural',experiment:link\.getAttribute\('data-resource-click'\)\}\)/);
assert.match(grade1Aural, /utm_source=family-note&utm_medium=referral&utm_campaign=grade1-aural/);
assert.match(grade1Aural, /mmTrack\('resource_share',\{channel:'organic-grade1-aural',experiment:'family-note'\}\)/);

const grade2Diagnostic = fs.readFileSync(path.join(root, 'ameb-grade-2-piano-theory-practice.html'), 'utf8');
assert.match(grade2Diagnostic, /ameb-grade-2-dotted-notes-practice\.html\?ref=grade2-diagnostic/);
assert.match(grade2Diagnostic, /data-paid-click="grade2-diagnostic-unlock"/);
assert.match(grade2Diagnostic, /mmTrack\('resource_click',\{channel:'organic-grade2-diagnostic',experiment:link\.getAttribute\('data-paid-click'\)\}\)/);

const teachers = fs.readFileSync(path.join(root, 'teachers.html'), 'utf8');
assert.match(teachers, /ameb-grade-2-dotted-notes-practice\.html\?ref=teachers/);
assert.match(teachers, /ameb-grade-1-aural-test-practice\.html\?ref=teachers/);
assert.match(teachers, /family-practice-handout\.html\?ref=teachers/);
assert.match(teachers, /downloads\/music-maestro-family-practice-handout\.pdf/);

const handout = fs.readFileSync(path.join(root, 'family-practice-handout.html'), 'utf8');
assert.match(handout, /"@type":"LearningResource"/);
assert.match(handout, /music\.vensoai\.com\/parents\?utm_source=teacher-handout&amp;utm_medium=print&amp;utm_campaign=family-practice/);
assert.match(handout, /downloads\/music-maestro-family-practice-handout\.pdf/);
assert.match(handout, /mmTrack\('resource_download',\{channel:'teacher-handout',experiment:'family-practice-pdf'\}\)/);
assert.match(handout, /mmTrack\('landing_visit',\{channel:'teacher-handout'\}\)/);
assert.match(handout, /mmTrack\('resource_print',\{channel:'teacher-handout',experiment:'family-practice'\}\)/);
assert.match(handout, /mmTrack\('resource_share',\{channel:'teacher-handout',experiment:'family-practice'\}\)/);

const handoutPdf = fs.readFileSync(path.join(root, 'downloads/music-maestro-family-practice-handout.pdf'));
assert.equal(handoutPdf.subarray(0, 4).toString(), '%PDF');
assert.ok(handoutPdf.length > 200000, 'family handout PDF should be a real generated PDF asset');

const landing = fs.readFileSync(path.join(root, 'landing.html'), 'utf8');
assert.match(landing, /"@type":"SoftwareApplication"/);
assert.match(landing, /"applicationCategory":"EducationalApplication"/);
assert.match(landing, /"name":"Grade 2-3 unlock","price":"14\.99","priceCurrency":"AUD"/);

const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
assert.match(index, /parents\.html">For Parents<\/a>/);
assert.match(index, /https:\/\/music\.vensoai\.com\/parents\?utm_source=app-share&utm_medium=referral&utm_campaign=parent-guide/);
assert.match(index, /mmTrack\('resource_share', \{ channel:'app-share', experiment:method \}\)/);

const parents = fs.readFileSync(path.join(root, 'parents.html'), 'utf8');
assert.match(parents, /<link rel="canonical" href="https:\/\/music\.vensoai\.com\/parents">/);
assert.match(parents, /"@type":"SoftwareApplication"/);
assert.match(parents, /"applicationCategory":"EducationalApplication"/);
assert.match(parents, /"name":"Grade 1 access","price":"0","priceCurrency":"AUD"/);
assert.match(parents, /mmTrack\('landing_visit',\{channel:'organic-parent-resource'\}\)/);
assert.match(parents, /data-parent-click="hero-start-free"/);
assert.match(parents, /data-parent-click="resource-grade2-diagnostic"/);
assert.match(parents, /data-parent-click="resource-grade1-aural"/);
assert.match(parents, /data-parent-click="resource-family-handout"/);
assert.match(parents, /data-parent-click="parents-paid-unlock"/);
assert.match(parents, /mmTrack\('resource_click',\{channel:'organic-parent-resource',experiment:link\.getAttribute\('data-parent-click'\)\}\)/);
assert.match(parents, /id="copy-parent-note"/);
assert.match(parents, /utm_source=family-note&utm_medium=referral&utm_campaign=parent-guide/);
assert.match(parents, /mmTrack\('resource_share',\{channel:'organic-parent-resource',experiment:method\}\)/);
assert.match(parents, /ameb-grade-2-piano-theory-practice\.html\?ref=parents-resources/);

const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
for (const route of routes) {
  assert.match(sitemap, new RegExp(`<loc>https://music\\.vensoai\\.com/${route}</loc><lastmod>2026-07-17</lastmod>`));
}
assert.match(sitemap, /<loc>https:\/\/music\.vensoai\.com\/parents<\/loc><lastmod>2026-07-18<\/lastmod>/);
assert.match(sitemap, /<loc>https:\/\/music\.vensoai\.com\/family-practice-handout<\/loc><lastmod>2026-07-18<\/lastmod>/);
assert.match(sitemap, /<loc>https:\/\/music\.vensoai\.com\/ameb-grade-1-note-values-practice<\/loc><lastmod>2026-07-17<\/lastmod>/);
assert.match(sitemap, /<loc>https:\/\/music\.vensoai\.com\/ameb-grade-1-aural-test-practice<\/loc><lastmod>2026-07-18<\/lastmod>/);
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
assert.match(ownerReport, /visit_to_resource_download/);
assert.match(ownerReport, /resource_download_to_practice/);
assert.match(ownerReport, /visit_to_resource_share/);
assert.match(ownerReport, /practice_to_upgrade_view/);
assert.match(ownerReport, /upgrade_view_to_checkout/);
assert.match(ownerReport, /teacher_outreach/);

console.log('SEO metadata tests passed');
