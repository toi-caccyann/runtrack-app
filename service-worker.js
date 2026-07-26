// オフラインでもアプリの見た目が表示されるように、静的ファイルをキャッシュする
const CACHE_NAME = 'runtrack-cache-v1';
const PRECACHE_URLS = [
  './',
  './index.html',
  './header.html',
  './header.js',
  './home.css',
  './home.js',
  './calorie-calc.js',
  './profile.css',
  './profile.html',
  './profile.js',
  './simulation.css',
  './simulation.html',
  './simulation.js',
  './timer.css',
  './timer.html',
  './timer.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

// キャッシュ優先、なければネットワークから取得してキャッシュに追加する
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          return response;
        })
        .catch(() => cached);
    })
  );
});
