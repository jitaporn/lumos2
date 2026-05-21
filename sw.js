const CACHE_NAME = 'secure-wallet-v4'; // ถ้าแก้โค้ดแล้วไม่เปลี่ยน ให้เปลี่ยนเลขเวอร์ชันตรงนี้ (เช่น v3 -> v4)
const ASSETS_TO_CACHE = [
    './',
    './index.html',        // ชื่อไฟล์ HTML หลักของคุณ
    './manifest.json',
    './icon.png',          // อย่าลืมหาไฟล์รูปชื่อ icon.png มาวางด้วยนะครับ
    './lib/tailwindcss.js',
    './lib/vue.global.js',
    './lib/zxcvbn.js',
    // Cache ไฟล์ภายนอก (Font และ Icon) ให้ใช้ offline ได้
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;600&display=swap'
];

// 1. Install Service Worker & Cache Assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
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
        })
    );
});

// 3. Fetch (Serve from Cache first, then Network)
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            // ถ้ามีใน cache ให้ใช้เลย (Offline) ถ้าไม่มีให้โหลดจากเน็ต
            return cachedResponse || fetch(event.request);
        })
    );
});
