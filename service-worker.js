self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('qr-tracker-v1').then((cache) =>
      cache.addAll([
        './',
        './index.html',
        './app.js',
        './manifest.json',
        'https://unpkg.com/html5-qrcode'
      ])
    )
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((r) => r || fetch(e.request))
  );
});
