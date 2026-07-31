
const CACHE_NAME = "recipe-reader-1785496790382";

const FILES = [
    "/css/style.css",
    "/data/recipes.json",
    "/data/version.json",
    "/icons/icon-192.png",
    "/icons/icon-512.png",
    "/icons/maskable-icon-512.png",
    "/index.html",
    "/js/app.js",
    "/manifest.json",
    "/version.json"
];

self.addEventListener("install", event => {

    event.waitUntil(

        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(FILES))

    );

});

self.addEventListener("activate", event => {

    event.waitUntil(

        caches.keys()
            .then(keys =>

                Promise.all(

                    keys.map(key => {

                        if (key !== CACHE_NAME) {

                            return caches.delete(key);

                        }

                    })

                )

            )

    );

    self.clients.claim();

});

self.addEventListener("fetch", event => {

    event.respondWith(

        caches.match(event.request)
            .then(response => response || fetch(event.request))

    );

});
