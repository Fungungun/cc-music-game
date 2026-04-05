/* Music Maestro — Service Worker v6.0 */
var CACHE = 'music-maestro-v6';

/* Only cache truly static assets — NOT HTML pages.
   HTML is always fetched fresh so stale cached pages never cause navigation failures. */
var STATIC_ASSETS = [
  '/style.css',
  '/game.js',
  '/supabase.js',
  '/i18n.js',
  '/manifest.json',
  '/icon.svg'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return Promise.all(
        STATIC_ASSETS.map(function(url) {
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
  var url = e.request.url;

  /* Ignore non-http(s) requests (e.g. chrome-extension://) */
  if (!url.startsWith('http')) return;

  /* CDN / audio samples — network first, cache fallback */
  if (url.includes('cdn') || url.includes('tonejs.github.io') || url.includes('cdnjs')) {
    e.respondWith(
      fetch(e.request).catch(function() { return caches.match(e.request); })
    );
    return;
  }

  /* HTML navigation — don't intercept, let the browser handle natively */
  if (e.request.mode === 'navigate') {
    return;
  }

  /* Static assets (CSS, JS, icons) — cache first */
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
      return caches.match('/index.html');
    })
  );
});
