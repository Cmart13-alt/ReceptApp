
const CACHE_NAME = "recipe-reader-1785526096283";

const FILES = [
    "./css/style.css",
    "./data/recipes.json",
    "./icons/icon-192.png",
    "./icons/icon-512.png",
    "./icons/maskable-icon-512.png",
    "./index.html",
    "./js/app.js",
    "./manifest.json",
    "./service-worker.js",
    "./version.json"
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

    const url = new URL(event.request.url);

    //
    // Hämta alltid senaste versionsfilen
    //

    if (
        url.pathname.endsWith("/version.json") ||
        url.pathname.endsWith("/data/version.json")
    ) {

        event.respondWith(fetch(event.request));

        return;

    }

    //
    // Övriga filer hämtas från cachen
    //

    event.respondWith(

        caches.match(event.request)
            .then(response => response || fetch(event.request))

    );

});

