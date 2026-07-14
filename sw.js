const CACHE = "milepost-v2";
const SHELL = ["./manifest.json", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const url = e.request.url;
  // Never cache API calls to Apps Script — always go live for data.
  if (url.includes("script.google.com")) return;
  // Network-first for the HTML shell, so code updates show up immediately.
  if (e.request.mode === "navigate" || url.endsWith(".html") || url.endsWith("/")) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }
  // Cache-first only for static assets that rarely change (icons, manifest).
  e.respondWith(caches.match(e.request).then((cached) => cached || fetch(e.request)));
});
