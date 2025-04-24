const CACHE_NAME = 'ipbpalmeirasba-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/src/css/style.css',
    '/src/js/script.js',
    '/src/imgs/acs/logo_ipp.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});
