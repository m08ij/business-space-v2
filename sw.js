/* =========================================================
   Service Worker — offline cache for Business Development
   ========================================================= */
const CACHE = 'biz-dev-v1';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './js/i18n.js',
  './js/store.js',
  './js/ui.js',
  './js/views.js',
  './js/app.js',
  './manifest.json',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => {
      return Promise.all(
        ASSETS.map((url) =>
          cache.add(url).catch((err) => console.warn('SW cache skip', url, err))
        )
      );
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  /* Supabase API — network only */
  if (url.hostname.endsWith('.supabase.co')) {
    return; // let browser handle it
  }

  /* Same-origin and CDN — cache first, fallback to network */
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) {
        /* Refresh cache in background */
        fetch(req).then((res) => {
          if (res && res.ok) {
            caches.open(CACHE).then((c) => c.put(req, res.clone()));
          }
        }).catch(() => {});
        return cached;
      }

      return fetch(req).then((res) => {
        if (!res || !res.ok) return res;
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
        return res;
      }).catch(() => {
        /* Offline fallback for navigation requests */
        if (req.mode === 'navigate') {
          return caches.match('./index.html');
        }
        return new Response('', { status: 503, statusText: 'Offline' });
      });
    })
  );
});