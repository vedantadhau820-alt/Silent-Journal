/* =========================================
SILENT JOURNAL SERVICE WORKER
========================================= */

const CACHE_NAME = "silent-journal-v2";

/* =========================================
FILES TO CACHE
========================================= */

const urlsToCache = [

    "./",
    "./index.html",
    "./manifest.json",

    "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap"

];

/* =========================================
INSTALL
========================================= */

self.addEventListener("install",(event)=>{

    event.waitUntil(

        caches.open(CACHE_NAME)
        .then((cache)=>{

            return cache.addAll(urlsToCache);

        })

    );

    self.skipWaiting();

});

/* =========================================
ACTIVATE
========================================= */

self.addEventListener("activate",(event)=>{

    event.waitUntil(

        caches.keys().then((cacheNames)=>{

            return Promise.all(

                cacheNames.map((cache)=>{

                    if(cache !== CACHE_NAME){

                        return caches.delete(cache);

                    }

                })

            );

        })

    );

    self.clients.claim();

});

/* =========================================
FETCH
========================================= */

self.addEventListener("fetch",(event)=>{

    /* =========================================
    ONLY CACHE GET REQUESTS
    ========================================= */

    if(event.request.method !== "GET") return;

    event.respondWith(

        caches.match(event.request)
        .then((cachedResponse)=>{

            /* =========================================
            RETURN CACHE FIRST
            ========================================= */

            if(cachedResponse){

                return cachedResponse;

            }

            /* =========================================
            FETCH NETWORK
            ========================================= */

            return fetch(event.request)
            .then((networkResponse)=>{

                /* =========================================
                INVALID RESPONSE
                ========================================= */

                if(
                    !networkResponse ||
                    networkResponse.status !== 200
                ){

                    return networkResponse;

                }

                /* =========================================
                CLONE RESPONSE
                ========================================= */

                const responseClone = networkResponse.clone();

                /* =========================================
                SAVE TO CACHE
                ========================================= */

                caches.open(CACHE_NAME)
                .then((cache)=>{

                    cache.put(
                        event.request,
                        responseClone
                    );

                });

                return networkResponse;

            })

            /* =========================================
            OFFLINE FALLBACK
            ========================================= */

            .catch(()=>{

                if(
                    event.request.destination === "document"
                ){

                    return caches.match("./index.html");

                }

            });

        })

    );

});
