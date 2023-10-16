const staticCacheName = "static-assets-v2";
const assets = [
    "/channeldata", "/epg", "/ip",
    "/remote.html", "/style.css", "/modules/main.js",
    "/modules/data_processing.js", "/modules/epg_processing.js", "/modules/remote_control.js", "/modules/ui_control.js", "/modules/utils.js", "/modules/voice_control.js",
    "/assets/manifest.json", "/assets/favicon.ico", "/assets/192.png", "/assets/512.png"
];

// const assets = [ //for debgugging
//     "/channeldata", "/epg","/ip",
//     "/data/remote.html", "/data/style.css", "/data/modules/main.js",
//     "/data/modules/data_processing.js", "/data/modules/epg_processing.js", "/data/modules/remote_control.js", "/data/modules/ui_control.js", "/data/modules/utils.js", "/data/modules/voice_control.js",
//     "/data/assets/manifest.json", "/data/assets/favicon.ico", "/data/assets/192.png", "/data/assets/512.png"
// ];

function formatDate(date) {
    return date.toISOString().split('T')[0];
}
function getEpgMaxAge() {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(23, 59, 59, 0);
    const timeDifference = midnight.getTime() - now.getTime();
    const cacheMaxAge = Math.floor(timeDifference / 1000);
    return cacheMaxAge;
}
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(staticCacheName)
            .then((cache) => {
                console.log('Installation in progress, caching shell assets...');
                return Promise.all(
                    assets.map((asset) => {
                        console.debug("caching " + asset);
                        if (asset == '/epg') {
                            return fetchAndCachedEpg(asset);
                        } else {
                            return fetch(asset)
                                .then((response) => {
                                    if (response.status != 200) {
                                        throw new Error(`Failed to fetch asset: ${asset}`);
                                    }
                                    return cache.put(asset, response);
                                })
                                .catch((error) => {
                                    console.error(`Failed to cache asset: ${asset}`, error);
                                });
                        }
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
                const contentLength = (cacheRes && cacheRes.headers.has('content-length')) ? cacheRes.headers.get('content-length') > 0 : false;
                const cachedDate = (cacheRes && cacheRes.headers.has("date")) ? cacheRes.headers.get('date') : null;
                const currentDate = formatDate(new Date());
                console.debug(`contentLength: ${contentLength} | cachedDate: ${cachedDate} | currentDate: ${currentDate}`);
                let cacheIsValid = contentLength && cachedDate === currentDate;
                if (cacheIsValid) {
                    console.debug("cached epg is valid");
                    return cacheRes;
                } else {
                    console.warn("cached epg is invalid", "| date: ", cachedDate);
                    return fetchAndCachedEpg(evt);
                }
            })
        );
    } else {
        evt.respondWith(
            caches.match(evt.request).then(cacheRes => {
                return cacheRes || fetch(evt.request);
            })
        );
    }
});

async function fetchAndCachedEpg(evt) {
    return fetch(evt.request).then(fetchRes => {
        const clonedResponse = fetchRes.clone();
        if (fetchRes.status === 200 && fetchRes.type === 'basic') {
            console.debug('caching new epg');
            const customHeaders = new Headers(fetchRes.headers);
            customHeaders.set('cache-control', `max-age:${getEpgMaxAge()}`);
            customHeaders.set('date', formatDate(new Date()));
            const responseWithCustomHeaders = new Response(fetchRes.body, {
                status: fetchRes.status,
                statusText: fetchRes.statusText,
                headers: customHeaders
            });
            caches.open(staticCacheName).then(cache => {
                cache.put(evt.request, responseWithCustomHeaders);
            });
            return clonedResponse;
        } else {
            console.warn("EPG not available ", fetchRes.status, fetchRes.statusText);
            return new Response(null);
        }
    }).catch(error => {
        console.error('Fetch error:', error);
    });
}