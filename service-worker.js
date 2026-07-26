// オフラインでもアプリの見た目が表示されるように、静的ファイルをキャッシュする
const CACHE_NAME = 'runtrack-cache-v3';
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
  './privacy.html',
  './privacy.css',
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

// ネットワーク優先：オンライン時は常に最新版を取得し、取得できた分をキャッシュに保存する。
// オフライン時（fetch失敗時）だけキャッシュから返す。
// ※以前は「キャッシュ優先」だったため、CSS/JSを更新してもCACHE_NAMEを上げ忘れると
//   ブラウザが古いファイルを配信し続けてしまう問題があった。
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
