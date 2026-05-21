/* =========================================
SILENT JOURNAL SERVICE WORKER
========================================= */

const CACHE_NAME = "silent-journal-v1";

/* =========================================
FILES TO CACHE
========================================= */

const urlsToCache = [

    "./",
    "./index.html",

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

    event.respondWith(

        caches.match(event.request)
        .then((response)=>{

            /* =========================================
            RETURN CACHE
            ========================================= */

            if(response){

                return response;

            }

            /* =========================================
            FETCH FROM NETWORK
            ========================================= */

            return fetch(event.request)
            .then((networkResponse)=>{

                /* =========================================
                INVALID RESPONSE
                ========================================= */

                if(
                    !networkResponse ||
                    networkResponse.status !== 200 ||
                    networkResponse.type !== "basic"
                ){

                    return networkResponse;

                }

                /* =========================================
                CACHE NEW REQUEST
                ========================================= */

                const responseClone = networkResponse.clone();

                caches.open(CACHE_NAME)
                .then((cache)=>{

                    cache.put(event.request,responseClone);

                });

                return networkResponse;

            });

        })

    );

});
