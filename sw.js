```javascript
const CACHE_NAME = "study-reminder-v2";

const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./style.css",
    "./script.js",
    "./manifest.json"
];


// Cài service worker mới
self.addEventListener("install", function(event) {

    event.waitUntil(

        caches.open(CACHE_NAME)
            .then(function(cache) {

                return cache.addAll(
                    FILES_TO_CACHE
                );

            })

    );

    // Kích hoạt ngay, không chờ tab cũ đóng
    self.skipWaiting();

});


// Xóa cache phiên bản cũ
self.addEventListener("activate", function(event) {

    event.waitUntil(

        caches.keys()
            .then(function(cacheNames) {

                return Promise.all(

                    cacheNames.map(
                        function(cacheName) {

                            if (
                                cacheName !== CACHE_NAME
                            ) {

                                return caches.delete(
                                    cacheName
                                );

                            }

                        }
                    )

                );

            })

    );

    // Áp dụng service worker mới ngay
    self.clients.claim();

});


// Lấy file mới từ mạng trước
// Nếu mạng lỗi thì dùng cache
self.addEventListener("fetch", function(event) {

    event.respondWith(

        fetch(event.request)
            .then(function(response) {

                // Lưu bản mới vào cache
                const responseClone =
                    response.clone();

                caches.open(CACHE_NAME)
                    .then(function(cache) {

                        cache.put(
                            event.request,
                            responseClone
                        );

                    });

                return response;

            })

            .catch(function() {

                return caches.match(
                    event.request
                );

            })

    );

});
```
