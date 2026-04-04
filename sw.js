/* Music Maestro — Service Worker v4.0 */
var CACHE = 'music-maestro-v4';
/* Use canonical URLs (no .html) — Cloudflare Pages redirects .html → no-extension */
var STATIC = [
  '/',
  '/index.html',
  '/style.css',
  '/game.js',
  '/i18n.js',
  '/manifest.json',
  '/icon.svg',
  '/note-namer',
  '/scale-builder',
  '/interval-quiz',
  '/chord-game',
  '/rhythm-tapper',
  '/terms-flashcards',
  '/form-detective',
  '/guitar-chords',
  '/mock-test',
  '/aural-training',
  '/daily-challenge',
  '/barline-quiz',
  '/learn',
  '/landing',
  '/privacy'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
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
  /* Network-first for CDN resources */
  if (e.request.url.includes('cdn') || e.request.url.includes('tonejs.github.io') || e.request.url.includes('cdnjs')) {
    e.respondWith(
      fetch(e.request).catch(function() { return caches.match(e.request); })
    );
    return;
  }

  /* Cache-first for local assets.
     Use redirect:'follow' so Cloudflare's .html → no-extension redirects
     are resolved transparently and the final response is returned + cached. */
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      if (cached) return cached;
      return fetch(e.request, { redirect: 'follow' }).then(function(resp) {
        if (resp && resp.status === 200) {
          var clone = resp.clone();
          caches.open(CACHE).then(function(cache){ cache.put(e.request, clone); });
        }
        return resp;
      });
    }).catch(function() {
      return caches.match('/index.html');
    })
  );
});
