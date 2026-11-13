/* ==========================================================================
   Psicologo Digitale · service worker
   Licenza del codice: MIT · Danilo D'Auria
   ========================================================================== */

const VERSION = "psd-v1.3.42";

const ASSETS = [
  "./",
  "index.html",
  "come-installare.html",
  "scheda-rapida.html",
  "manifest.webmanifest",
  "assets/css/styles.css",
  "assets/img/icon.svg",
  "assets/img/icon-192.png",
  "assets/img/icon-512.png",
  "assets/js/data-scales.js",
  "assets/js/data-intake.js",
  "assets/js/data-course.js",
  "assets/js/data-manual.js",
  "assets/js/data-manual2.js",
  "assets/js/data-extra.js",
  "assets/js/data-quiz.js",
  "assets/js/data-nutrizione.js",
  "assets/js/data-ai.js",
  "assets/js/neura.js",
  "assets/js/app.js",
  "assets/js/app-intake.js",
  "assets/js/app-scales.js",
  "assets/js/app-course.js",
  "assets/js/app-neura.js",
  "assets/js/app-views.js",
  "assets/js/app-versioni.js",
  "assets/js/app-nutrizione.js",
  "assets/js/app-installa.js",
  "assets/js/app-status.js",
  "assets/js/app-report.js",
  "assets/js/app-init.js",
  "assets/js/app-welcome.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(VERSION).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (/\.pdf$/i.test(url.pathname)) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(VERSION).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached || caches.match("index.html"));

      return cached || network;
    })
  );
});
