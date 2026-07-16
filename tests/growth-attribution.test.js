const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { webcrypto } = require('node:crypto');

const source = fs.readFileSync(new URL('../growth.js', `file://${__filename}`), 'utf8');

function run({ search = '', referrer = '', saved = null } = {}) {
  const values = new Map();
  if (saved) values.set('mm-acquisition', JSON.stringify(saved));
  const localStorage = {
    getItem: key => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => values.set(key, String(value))
  };
  const context = {
    window: {}, document: { referrer },
    location: { search, hostname: 'music.vensoai.com', pathname: '/' },
    localStorage, URL, URLSearchParams, crypto: webcrypto,
    fetch: () => Promise.resolve(), Date, Uint8Array
  };
  vm.runInNewContext(source, context);
  return context.window.mmAttribution();
}

assert.equal(run({ referrer: 'https://github.com/noteflakes/awesome-music' }).channel, 'github');
assert.equal(run({ referrer: 'https://www.reddit.com/r/pianolearning/' }).channel, 'reddit');
assert.equal(run({ referrer: 'https://www.google.com.au/search?q=ameb+piano' }).channel, 'organic-search');
assert.equal(run({ referrer: 'https://example.edu.au/resources' }).channel, 'referral:example.edu.au');
assert.equal(run({ referrer: 'https://music.vensoai.com/teachers' }).channel, 'direct');
assert.equal(run({ search: '?utm_source=teacher-outreach', referrer: 'https://github.com/' }).channel, 'teacher-outreach');
assert.equal(run({ saved: { channel: 'reddit', experiment: 'resource-thread' }, referrer: 'https://github.com/' }).channel, 'reddit');

console.log('growth attribution tests passed');
