const CACHE_NAME = "recipereader-__VERSION__";

const FILES = [

    "./",
    "./index.html",
    "./css/style.css",
    "./js/app.js",
    "./manifest.json",
    "./version.json",

    "./data/recipes.json",

    "./icons/icon-192.png",
    "./icons/icon-512.png",
    "./icons/maskable-icon-512.png"

];

self.addEventListener("install", event => {

    self.skipWaiting();
    event.waitUntil(

        caches
            .open(CACHE_NAME)
            .then(cache => cache.addAll(FILES))

    );

});

self.addEventListener("activate", event => {

    event.waitUntil(

        (async () => {

            const keys = await caches.keys();

            await Promise.all(

                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))

            );

            await self.clients.claim();

        })()

    );

});

self.addEventListener("fetch", event => {

    if (event.request.mode === "navigate") {

        event.respondWith(

            fetch(event.request)
                .catch(() => caches.match("./index.html"))

        );

        return;
    }

    event.respondWith(

        caches.match(event.request)
            .then(response => response || fetch(event.request))

    );

});