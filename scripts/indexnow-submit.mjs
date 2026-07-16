const key = 'a8eb59ee77ba35e0d503b2521e062f7c';
const host = 'music.vensoai.com';
const keyLocation = `https://${host}/${key}.txt`;
const urls = process.argv.slice(2);

if (!urls.length) {
  console.error('Usage: node scripts/indexnow-submit.mjs https://music.vensoai.com/page ...');
  process.exit(1);
}

for (const url of urls) {
  const parsed = new URL(url);
  if (parsed.hostname !== host || parsed.protocol !== 'https:') {
    throw new Error(`URL must be an https://${host} URL: ${url}`);
  }
}

const response = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host, key, keyLocation, urlList: urls }),
});

const text = await response.text();
if (!response.ok) {
  console.error(`IndexNow submission failed: HTTP ${response.status}`);
  if (text) console.error(text);
  process.exit(1);
}

console.log(`IndexNow accepted ${urls.length} URL(s): HTTP ${response.status}`);
