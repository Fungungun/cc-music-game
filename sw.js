/* Music Maestro — Service Worker v2.0 */
var CACHE = 'music-maestro-v2';
var STATIC = [
  '/',
  '/index.html',
  '/style.css',
  '/game.js',
  '/i18n.js',
  '/manifest.json',
  '/icon.svg',
  '/note-namer.html',
  '/scale-builder.html',
  '/interval-quiz.html',
  '/chord-game.html',
  '/rhythm-tapper.html',
  '/terms-flashcards.html',
  '/form-detective.html',
  '/guitar-chords.html',
  '/mock-test.html',
  '/aural-training.html',
  '/daily-challenge.html',
  '/barline-quiz.html',
  '/learn.html'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.addAll(STATIC);
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); })
      );
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e) {
  /* Network-first for CDN resources (Tone.js, Tonal, abcjs) */
  if (e.request.url.includes('cdn') || e.request.url.includes('tonejs.github.io')) {
    e.respondWith(
      fetch(e.request).catch(function() { return caches.match(e.request); })
    );
    return;
  }
  /* Cache-first for local assets */
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      return cached || fetch(e.request).then(function(resp) {
        var clone = resp.clone();
        caches.open(CACHE).then(function(cache){ cache.put(e.request, clone); });
        return resp;
      });
    })
  );
});
