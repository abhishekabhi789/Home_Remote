const staticCacheName = "static-assets-v1";
const assets = [
    "/remote",
    "/channeldata", "/epg",
    "/remote.html", "/script.js", "/style.css",
    "/assets/manifest.json", "/assets/favicon.ico", "/assets/192.png", "/assets/512.png"
];
// const assets = [ //for debgugging
//     "/channeldata", "/epg",
//     "/data/remote.html", "/data/script.js", "/data/style.css",
//     "/data/assets/manifest.json", "/data/assets/favicon.ico", "/data/assets/192.png", "/data/assets/512.png"
// ];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(staticCacheName)
            .then((cache) => {
                console.log('Installation in progress, caching shell assets...');
                return Promise.all(
                    assets.map((asset) => {
                        console.log("caching " + asset);
                        return fetch(asset)
                            .then((response) => {
                                if (!response.ok) {
                                    throw new Error(`Failed to fetch asset: ${asset}`);
                                }
                                return cache.put(asset, response);
                            })
                            .catch((error) => {
                                console.error(`Failed to cache asset: ${asset}`, error);
                            });
                    })
                );
            })
            .then(() => {
                console.log('Cache installation successful');
            })
            .catch((error) => {
                console.error('Cache installation failed:', error);
            })
    );
});


self.addEventListener('activate', evt => {
    evt.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(keys
                .filter(key => key !== staticCacheName)
                .map(key => caches.delete(key))
            );
        })
    );
});

self.addEventListener('fetch', evt => {
    if (evt.request.url.endsWith("/epg")) {
        evt.respondWith(
            caches.match(evt.request).then(cacheRes => {
                if (cacheRes.headers.get('content-length') > 0) {
                    return cacheRes;
                } else {
                    return fetch(evt.request).then(fetchRes => {
                        if (fetchRes && fetchRes.status === 200 && fetchRes.type === 'basic') {
                            const responseToCache = fetchRes.clone();
                            caches.open(staticCacheName).then(cache => {
                                cache.put(evt.request, responseToCache);
                            });
                        }
                        return fetchRes;
                    }).catch(error => {
                        console.error('Fetch error:', error);
                    });
                }
            })
        );
    } else evt.respondWith(
        caches.match(evt.request).then(cacheRes => {
            return cacheRes || fetch(evt.request);
        })
    );
});

