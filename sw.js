/* Music Maestro — Service Worker v3.0 */
var CACHE = 'music-maestro-v3';
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
  '/learn.html',
  '/landing.html',
  '/privacy.html'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      /* Cache each file individually — one failure won't block the rest */
      return Promise.all(
        STATIC.map(function(url) {
          return cache.add(url).catch(function(err) {
            console.warn('[SW] Failed to cache:', url, err);
          });
        })
      );
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
  /* Network-first for CDN resources (Tone.js, Tonal, abcjs, Salamander audio) */
  if (e.request.url.includes('cdn') || e.request.url.includes('tonejs.github.io') || e.request.url.includes('cdnjs')) {
    e.respondWith(
      fetch(e.request).catch(function() { return caches.match(e.request); })
    );
    return;
  }
  /* Cache-first for local assets, with network fallback and error handling */
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      if (cached) return cached;
      return fetch(e.request).then(function(resp) {
        if (resp && resp.status === 200) {
          var clone = resp.clone();
          caches.open(CACHE).then(function(cache){ cache.put(e.request, clone); });
        }
        return resp;
      });
    }).catch(function() {
      /* If both cache and network fail, return a minimal offline page */
      return caches.match('/index.html');
    })
  );
});
