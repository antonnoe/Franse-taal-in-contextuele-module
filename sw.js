// sw.js: zelfopruimende service worker.
// Deze module is opgegaan in TaalHulp. Deze worker verwijdert alle caches en schrijft zichzelf uit,
// zodat geinstalleerde oude versies niet blijven hangen.
self.addEventListener("install", function () {
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil((async function () {
    try {
      var keys = await caches.keys();
      await Promise.all(keys.map(function (k) { return caches.delete(k); }));
    } catch (e) {}
    try { await self.registration.unregister(); } catch (e) {}
    try {
      var clients = await self.clients.matchAll({ type: "window" });
      clients.forEach(function (c) { try { c.navigate(c.url); } catch (e) {} });
    } catch (e) {}
  })());
});
