const CACHE_NAME = 'secure-wallet-v7'; // ถ้าแก้โค้ดแล้วไม่เปลี่ยน ให้เปลี่ยนเลขเวอร์ชันตรงนี้ (เช่น v3 -> v4)
const ASSETS_TO_CACHE = [
    './',
    './index.html',        // ชื่อไฟล์ HTML หลักของคุณ
    './manifest.json',
    './icon.png',          // อย่าลืมหาไฟล์รูปชื่อ icon.png มาวางด้วยนะครับ
    './lib/tailwindcss.js',
    './lib/vue.global.js',
    './lib/zxcvbn.js'
];

// 1. Install Service Worker & Cache Assets
self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return Promise.all(ASSETS_TO_CACHE.map((asset) => cache.add(asset).catch((err) => {
                console.warn('Cache failed:', asset, err);
            })));
        })
    );
});

// 2. Activate & Clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// 3. Fetch (Serve from Cache first, then Network)
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;
    event.respondWith(
        fetch(event.request).then((networkResponse) => {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(() => {});
            return networkResponse;
        }).catch(() => {
            return caches.match(event.request).then((cachedResponse) => {
                return cachedResponse || caches.match('./index.html');
            });
        })
    );
});
