/*
 Probably one of the simplest functional service workers
 
 Version: 0.0.1
*/

self.addEventListener('install', e => {
  e.waitUntil(
    // caches.open('pwa-assets').then(cache => 
    //   {
    //     return cache.addAll([
    //       'index.html',
    //       'bundle.css',
    //       'bundle.js'
    //     ])
    //   })
  )
});

if ('serviceWorker' in navigator) {
  caches.keys().then(function(cacheNames) {
    cacheNames.forEach(function(cacheName) {
      caches.delete(cacheName);
    });
  });
}