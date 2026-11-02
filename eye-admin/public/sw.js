// Analiza service worker (served at /sw.js, scope /).
// Strategy: network-first for navigations (falls back to the cached app shell),
// cache-first for hashed build assets under /assets/. Everything else — API calls,
// Auth0, fonts, other origins — is never intercepted. Non-OK responses are never cached.

const CACHE_PREFIX = 'analiza-static-';
const CACHE_VERSION = 'v1';
const CACHE_NAME = CACHE_PREFIX + CACHE_VERSION;
const APP_SHELL = '/index.html';

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

async function cachePut(request, response) {
  const cache = await caches.open(CACHE_NAME);
  await cache.put(request, response);
}

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only same-origin GET requests; let everything else go to the network untouched.
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Hashed build assets: cache-first, populate the cache on miss.
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        const response = await fetch(request);
        if (response && response.ok) {
          await cachePut(request, response.clone());
        }
        return response;
      })()
    );
    return;
  }

  // Navigations: network-first, fall back to the cached app shell.
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request);
          if (response && response.ok) {
            await cachePut(APP_SHELL, response.clone());
          }
          return response;
        } catch (err) {
          const cached = await caches.match(APP_SHELL);
          if (cached) return cached;
          throw err;
        }
      })()
    );
    return;
  }

  // Anything else (API calls, fonts, etc.): do not intercept.
});
