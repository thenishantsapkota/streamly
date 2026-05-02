// Streamly service worker — basic install + offline shell.
// Auth-protected dynamic content is left for the network; this SW only caches
// static assets and provides an offline fallback for navigations.

const CACHE = "streamly-shell-v1";
const SHELL_ASSETS = ["/", "/manifest.webmanifest", "/icon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      // Best-effort: ignore failures (e.g. when "/" requires auth).
      await Promise.allSettled(SHELL_ASSETS.map((u) => cache.add(u)));
    })(),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Don't cache API routes or auth-related requests.
  if (url.pathname.startsWith("/api/")) return;
  if (url.pathname === "/login" || url.pathname.startsWith("/api/login")) return;

  // Navigations: network-first with cache fallback.
  if (req.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(req);
          // Don't cache redirects (e.g. login redirects from middleware).
          if (fresh.ok && fresh.type === "basic") {
            const cache = await caches.open(CACHE);
            cache.put(req, fresh.clone()).catch(() => {});
          }
          return fresh;
        } catch {
          const cached = await caches.match(req);
          return cached || (await caches.match("/")) || Response.error();
        }
      })(),
    );
    return;
  }

  // Static assets: cache-first.
  if (
    req.destination === "image" ||
    req.destination === "style" ||
    req.destination === "script" ||
    req.destination === "font"
  ) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(req);
        if (cached) return cached;
        try {
          const fresh = await fetch(req);
          if (fresh.ok) {
            const cache = await caches.open(CACHE);
            cache.put(req, fresh.clone()).catch(() => {});
          }
          return fresh;
        } catch {
          return Response.error();
        }
      })(),
    );
  }
});
