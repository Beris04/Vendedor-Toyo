const CACHE = "toyo-simple-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./sw.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => (k !== CACHE ? caches.delete(k) : null)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // 🔥 IMPORTANTÍSIMO: NO interceptar Supabase (cross-origin)
  if (url.origin !== self.location.origin) {
    return; // deja que el navegador haga fetch normal
  }

  // Solo GET
  if (event.request.method !== "GET") return;

  event.respondWith((async () => {
    const cached = await caches.match(event.request);
    if (cached) return cached;

    try {
      const res = await fetch(event.request);
      const cache = await caches.open(CACHE);
      cache.put(event.request, res.clone());
      return res;
    } catch (e) {
      // si no hay red y no hay cache, regresa index
      return caches.match("./index.html");
    }
  })());
});
