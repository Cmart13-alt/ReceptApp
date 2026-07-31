const fs = require("fs");
const path = require("path");

const PATHS = require("../utils/paths");

function getFiles(dir, root = dir) {

    const files = [];

    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {

        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {

            files.push(...getFiles(fullPath, root));
            continue;

        }

        files.push(
            "./" + path.relative(root, fullPath).replace(/\\/g, "/")
        );

    }

    return files;

}

function generateServiceWorker(version) {

    const files = getFiles(PATHS.READER)

        .filter(file =>

            !file.endsWith(".map") &&
            !file.endsWith(".tmp") &&
            file !== "/service-worker.js"

        )

        .sort();

    const serviceWorker = `
const CACHE_NAME = "recipe-reader-${version}";

const FILES = ${JSON.stringify(files, null, 4)};

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
`;

    fs.writeFileSync(

        PATHS.SERVICE_WORKER,
        serviceWorker,
        "utf8"

    );

}

module.exports = {

    generateServiceWorker

};