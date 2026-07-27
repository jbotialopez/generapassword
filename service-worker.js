const CACHE_NAME = "generapass-v2";
const ASSETS = [
    "./",
    "./index.html",
    "./styles.css",
    "./app.js",
    "./favicon.svg",
    "./manifest.json",
    "./icon-192.png",
    "./icon-512.png",
];

self.addEventListener("install", event => {
    event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
    self.skipWaiting();
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
        )
    );
    self.clients.claim();
});

self.addEventListener("fetch", event => {
    if (event.request.method !== "GET") return;

    // Las navegaciones (abrir la app) se sirven siempre desde la copia en
    // caché de index.html. GitHub Pages redirige "/generapassword" (sin
    // barra) a ".../generapassword/" (con barra); si dejamos que el fetch
    // event resuelva esa navegación redirigida, el navegador la rechaza en
    // silencio y hay que tocar el icono varias veces para que abra. Al
    // responder siempre con el index.html ya cacheado evitamos ese salto.
    if (event.request.mode === "navigate") {
        event.respondWith(caches.match("./index.html").then(cached => cached || fetch(event.request)));
        return;
    }

    // Resto de recursos: cache-first (y sin conexión); si no está cacheado,
    // va a la red y guarda una copia limpia (sin redirecciones) para la
    // próxima vez.
    event.respondWith(
        caches.match(event.request).then(cached => {
            if (cached) return cached;
            return fetch(event.request).then(response => {
                if (response.ok && response.type === "basic") {
                    const copy = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
                }
                return response;
            });
        })
    );
});
