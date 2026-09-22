/*
 * Service worker for the installed app (PWA). Its job is a fast cold start: without it every
 * launch waits on the network for the HTML before painting anything.
 *
 * - Page loads (navigations): stale-while-revalidate — answer instantly from cache, refresh the
 *   cached copy in the background so the next launch is current. Falls back to the network the
 *   first time, and to the cached home page when offline.
 * - /_next/static/*: cache-first — filenames are content-hashed, so a cached copy never goes stale.
 * - Images, icons, fonts: stale-while-revalidate.
 * - Videos (range requests), RSC payloads and anything cross-origin pass straight through.
 *
 * Bump VERSION to drop every old cache on the next activation.
 */
const VERSION = "v1";
const PAGES = `pages-${VERSION}`;
const STATIC = `static-${VERSION}`;
const ASSETS = `assets-${VERSION}`;
const PRECACHE = ["/", "/manifest.webmanifest", "/syunik-icon.png", "/logo.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(PAGES)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  const keep = new Set([PAGES, STATIC, ASSETS]);
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => !keep.has(key)).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

function staleWhileRevalidate(cacheName, request, fallbackUrl) {
  return caches.open(cacheName).then((cache) =>
    cache.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response.ok) cache.put(request, response.clone());
          return response;
        })
        .catch(() => cached || (fallbackUrl && cache.match(fallbackUrl)));
      return cached || network;
    }),
  );
}

function cacheFirst(cacheName, request) {
  return caches.open(cacheName).then((cache) =>
    cache.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((response) => {
          if (response.ok) cache.put(request, response.clone());
          return response;
        }),
    ),
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  // Client-side navigations fetch RSC payloads for the same URLs — never mix those with HTML.
  if (request.headers.get("RSC") || url.searchParams.has("_rsc")) return;
  // Videos are streamed with range requests, which the Cache API can't answer partially.
  if (request.headers.has("range") || /\.(mp4|webm)$/.test(url.pathname)) return;

  if (request.mode === "navigate") {
    event.respondWith(staleWhileRevalidate(PAGES, request, "/"));
    return;
  }
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(STATIC, request));
    return;
  }
  if (
    url.pathname.startsWith("/_next/image") ||
    /\.(png|jpe?g|webp|avif|svg|ico|woff2?)$/.test(url.pathname)
  ) {
    event.respondWith(staleWhileRevalidate(ASSETS, request));
  }
});
