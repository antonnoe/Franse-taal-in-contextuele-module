// sw.js — NLFR PWA "soft caching"
// - Network-first voor HTML (navigatie) met cachefallback
// - Cache-first + stille verversing voor statics (CSS/JS/PNG/SVG/etc.)

const CACHE = "nlfr-v1";

// Hulp: bepaal of request HTML/navigatie is
function isHTML(req) {
  const accept = req.headers.get("accept") || "";
  return req.mode === "navigate" || accept.includes("text/html");
}

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => (k === CACHE ? null : caches.delete(k))))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Alleen GET + same-origin
  if (req.method !== "GET" || url.origin !== location.origin) return;

  // HTML: network-first
  if (isHTML(req)) {
    event.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
        return res;
      }).catch(async () => {
        // fallback: cache-hit of laatste index.html
        const hit = await caches.match(req);
        if (hit) return hit;
        return caches.match("/Franse-taal-in-contextuele-module/index.html");
      })
    );
    return;
  }

  // Statics: cache-first, daarna netwerk + stille update
  event.respondWith(
    caches.match(req).then(hit => {
      const fetchAndCache = fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
        return res;
      });
      return hit || fetchAndCache;
    })
  );
});
