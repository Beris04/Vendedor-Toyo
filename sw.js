const CACHE_NAME = "toyo-visitas-v12";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./sw.js"
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Solo manejar lo de tu GitHub Pages
  if (url.origin !== location.origin) return;

  // Network-first para manifest (evita “manifest viejo”)
  if (url.pathname.endsWith("/manifest.webmanifest")) {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        const cache = await caches.open(CACHE_NAME);
        cache.put(req, fresh.clone());
        return fresh;
      } catch {
        return caches.match(req);
      }
    })());
    return;
  }

  // Cache-first para lo demás
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req))
  );
});


