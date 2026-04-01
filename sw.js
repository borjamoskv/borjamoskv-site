const CACHE_NAME = 'moskv-cache-v6';

// Priority assets for offline shell
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/data.js',
  '/autodj-video.js',
  '/site.webmanifest',
  '/img/icon-192.png',
  '/img/icon-512.png',
  '/img/apple-touch-icon.png',
  '/img/favicon.ico',
  '/js/core.js',
  '/js/mutator.js',
  '/js/media.js',
  '/js/chat.js',
  '/js/scroll.js',
  '/js/works.js',
  '/js/particles.js',
  '/js/cursor.js',
  '/js/interactions.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

self.addEventListener('fetch', event => {
  // Only intercept GET requests
  if (event.request.method !== 'GET') return;
  // Ignore API calls if any exist on the same origin
  if (event.request.url.includes('/api/')) return;

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request because it's a stream and can only be consumed once
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          response => {
            // Check if we received a valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response because it's a stream
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                // Don't cache media files to avoid bloating storage
                if (!event.request.url.match(/\.(mp4|webm|mp3|wav)$/)) {
                  cache.put(event.request, responseToCache);
                }
              });

            return response;
          }
        ).catch(() => {
            // Offline fallback strategy could go here
            console.log('Fetch failed, likely offline.');
        });
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});
