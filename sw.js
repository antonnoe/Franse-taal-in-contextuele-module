// sw.js — "soft" runtime caching (geen vaste precache-lijst)
// Cachet wat de gebruiker bezoekt (HTML/PNG/JS/CSS), met network-first voor HTML.

const CACHE = "nlfr-soft-v1";

self.addEventListener("install", (e) => {
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => (k === CACHE ? null : caches.delete(k))))
    )
  );
  self.clients.claim();
});

// Network-first voor HTML; Cache-first voor statics
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);
  // Alleen GET en zelfde origin
  if (req.method !== "GET" || url.origin !== location.origin) return;

  const isHTML = req.headers.get("accept")?.includes("text/html");
  if (isHTML) {
    event.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
        return res;
      }).catch(() => caches.match(req))
    );
    return;
  }

  // Statics: cache-first, daarna netwerk
  event.respondWith(
    caches.match(req).then(hit =>
      hit || fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
        return res;
      })
    )
  );
});
