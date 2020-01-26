self.addEventListener('fetch', function(e) {
    //空でOK
  })
  //バナーの代わりに表示するボタンを登録する
registerInstallAppEvent(document.getElementById("InstallBtn"));

//バナー表示をキャンセルし、代わりに表示するDOM要素を登録する関数
//引数１：イベントを登録するHTMLElement
function registerInstallAppEvent(elem){
  //インストールバナー表示条件満足時のイベントを乗っ取る
  window.addEventListener('beforeinstallprompt', function(event){
    console.log("beforeinstallprompt: ", event);
    event.preventDefault(); //バナー表示をキャンセル
    elem.promptEvent = event; //eventを保持しておく
    elem.style.display = "block"; //要素を表示する
    return false;
  });
  //インストールダイアログの表示処理
  function installApp() {
    if(elem.promptEvent){
      elem.promptEvent.prompt(); //ダイアログ表示
      elem.promptEvent.userChoice.then(function(choice){
        elem.style.display = "none";
        elem.promptEvent = null; //一度しか使えないため後始末
      });//end then
    }
  }//end installApp
  //ダイアログ表示を行うイベントを追加
  elem.addEventListener("click", installApp);
}//end registerInstallAppEvent
//キャッシュの設定
var CACHE_NAME = 'Counter-cash';
var urlsToCache = [
  '/apps/Counter/app.html',
  '/apps/Counter/app.css',
  '/apps/Counter/app.js',
];

//インストール
self.addEventListener('install', function(event) {
  event.waitUntil(caches.open(CACHE_NAME).then(function(cache){
    console.log('Opened cache');
    return cache.addAll(urlsToCache);
  }));
});

//古いキャッシュの削除
self.addEventListener('activate', function(event) {
  var cacheWhitelist = [CACHE_NAME, ];
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(cacheNames.map(function(cacheName) {
        console.log('delete old cache');
        if (cacheWhitelist.indexOf(cacheName) === -1){
          return caches.delete(cacheName);
        }
      }));
    })
  );
});

//キャッシュの利用
self.addEventListener('fetch', function(event) {
  console.log('fetch');
  event.respondWith(caches.match(event.request).then(function(response){
    // Cache hit - return response
    if(response){
      return response;
    }
    var fetchRequest = event.request.clone();
    return fetch(fetchRequest).then(function(response){
      // Check if we received a valid response
      if(!response || response.status !== 200 || response.type !== 'basic') {
        return response;
      }
      var responseToCache = response.clone();
      caches.open(CACHE_NAME).then(function(cache) {
        cache.put(event.request, responseToCache);
      });
      return response;
    }));
  });
});