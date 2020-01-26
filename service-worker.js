

const CACHE_NAME = 'buddhism_ver_1';
const urlsToCache = [
    './',
    './index.html',
    './中国禅宗史.html',
    './工事中.html',
    './service-worker.js',
    './manifest.json',
    './assets/css/main.css',
    './images/chinesezenhistory.jpg',
    './images/hotokelogo.png',
    './images/hotokelogo192.png',
    './images/hotokelogo256.png',
    './images/hotokelogo512.png',
];

self.addEventListener('install', function(event) {
    // インストール処理
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(function(cache) {
            console.log('Opened cache');
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener('activate', function(event) {
    const cacheWhitelist = [CACHE_NAME];

    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', function(event) {

    // 管理画面はキャッシュを使用しない
    if (/\/wp-admin|\/wp-login|preview=true/.test(event.request.url)) {
        return;
    }

    // POSTの場合はキャッシュを使用しない
    if ('POST' === event.request.method) {
        return;
    }

    // 管理画面にログイン時はキャッシュを使用しない
    console.log(event);

    event.respondWith(
        caches.match(event.request)
        .then(function(response) {
            // キャッシュがあったら、そのレスポンスを返す
            if (response) {
                return response;
            }

            // 重要：リクエストをcloneする。リクエストはStreamなので
            // 一度しか処理できない。ここではキャッシュ用、fetch用と2回
            // 必要なのでリクエストはcloneしないといけない
            const fetchRequest = event.request.clone();

            return fetch(fetchRequest,{credentials: 'include'}).then(
                function(response) {
                    // レスポンスが正しいかをチェック
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    // 重要：レスポンスを clone する。レスポンスは Stream で
                    // ブラウザ用とキャッシュ用の2回必要。なので clone して
                    // 2つの Stream があるようにする
                    const responseToCache = response.clone();

                    caches.open(CACHE_NAME)
                        .then(function(cache) {
                            cache.put(event.request, responseToCache);
                        });

                    return response;
                }
            );
        })
    );
});