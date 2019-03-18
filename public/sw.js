const cacheName = 'cs1.0.0';

let assetsToCache = [
          'index.html',
          'bundle.css',
          'bundle.js',
          'https://cdn.glitch.com/acadb18d-b5ae-4adb-a2c5-f622d42904f7%2Feddies.png',
          'https://cdnjs.cloudflare.com/ajax/libs/d3/5.7.0/d3.min.js',
          '//aframe.io/releases/0.9.0/aframe.min.js',
          '//cdn.rawgit.com/donmccurdy/aframe-extras/v5.0.1/dist/aframe-extras.min.js',
          'https://rawgit.com/feiss/aframe-environment-component/master/dist/aframe-environment-component.min.js',
          '/socket.io/socket.io.js',
          'https://cdn.glitch.com/d79adbae-e5bb-4b24-b647-549242a95845%2Fexample_no_path.glb?1549196250049',
          'https://cdn.glitch.com/d79adbae-e5bb-4b24-b647-549242a95845%2Fpath.glb?1549196849622'
        ];
self.addEventListener('install', e => {
  e.waitUntil(
    caches
    .open(cacheName)
    .then(cache => 
      {
        return cache.addAll(assetsToCache)
      })
    .then(()=>self.skipWaiting())
  )
});

self.addEventListener('activate', e => {
 console.log('Service worker activated.');
 e.waitUntil(
   caches.keys().then(cacheNames=> {
      return Promise.all(
        cacheNames.map(cache=>{
          if(cache != cacheName){
            console.log('Clearing old cache.');
            return caches.delete(cache);
          }
        })
      )
    })
 )
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(response => {
      return response || fetch(e.request).catch(err=>{console.log(`Fetch error: ${err}`)});
    })
  );
});