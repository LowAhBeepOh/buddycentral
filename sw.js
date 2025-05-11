const CACHE_NAME = 'buddycentral-cache-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './assets/buddycentralAppIcon.svg',
  './assets/buddycentral.svg',
  './assets/buddydocs.svg',
  './assets/buddymusic.svg',
  './assets/compactb.svg',
  'https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500&display=swap',
  // External sites will be cached as opaque responses if CORS is not configured
  'https://lowahbeepoh.github.io/buddydocs/',
  'https://lowahbeepoh.github.io/buddydocs-minimal/',
  'https://lowahbeepoh.github.io/buddymusic/',
  'https://lowahbeepoh.github.io/buddymusic-studio/'
];

self.addEventListener('install', event => {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        const cachePromises = urlsToCache.map(urlToCache => {
          if (urlToCache.startsWith('http')) {
            return cache.add(new Request(urlToCache, { mode: 'no-cors' }));
          } else {
            return cache.add(urlToCache);
          }
        });
        return Promise.all(cachePromises);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        let fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || (response.type !== 'basic' && response.type !== 'cors' && response.type !== 'opaque')) {
              if (response.type !== 'opaque') {
                  return response;
              }
            }

            let responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                if (response.type === 'opaque' || (response.status === 200 && (response.type === 'basic' || response.type === 'cors'))) {
                    cache.put(event.request, responseToCache);
                }
              });

            return response;
          }
        );
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
    })
  );
});