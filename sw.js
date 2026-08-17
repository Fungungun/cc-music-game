/* Music Maestro — Service Worker v7.6 */
var CACHE = 'music-maestro-v7-6';

/* On install: just pre-cache the offline shell assets.
   CSS/JS are handled network-first so they never go stale. */
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.addAll(['/manifest.json', '/icon.svg']).catch(function(){});
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

/* On activate: delete ALL old caches so stale CSS/JS is wiped immediately */
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

  /* Ignore non-http(s) requests */
  if (!url.startsWith('http')) return;

  /* API calls — always straight to the network, never cached */
  if (new URL(url).pathname.indexOf('/api/') === 0) return;

  /* Phase 1.2 (2026-08-17) vendored every third-party script and the
     Salamander piano samples to same-origin (vendor/, audio/salamander/),
     so the CDN/audio special case that used to live here is gone — those
     requests now fall through to the same-origin network-first branch
     below, which already does the identical fetch/cache/fallback dance. */

  /* HTML navigation — browser default, never intercept */
  if (e.request.mode === 'navigate') return;

  /* All same-origin assets (CSS, JS, markdown, icons) — network first.
     Always fetches fresh so deployments take effect immediately.
     Falls back to cache only when offline. */
  e.respondWith(
    fetch(e.request)
      .then(function(resp) {
        if (resp && resp.status === 200) {
          var clone = resp.clone();
          caches.open(CACHE).then(function(c){ c.put(e.request, clone); });
        }
        return resp;
      })
      .catch(function() {
        return caches.match(e.request);
      })
  );
});
