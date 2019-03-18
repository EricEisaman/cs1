if ('serviceWorker' in navigator) {
  caches.open('pwa-assets').then(cache => 
      {
        return cache.addAll([
          'index.html',
          'bundle.css',
          'bundle.js',
          'https://cdn.glitch.com/acadb18d-b5ae-4adb-a2c5-f622d42904f7%2Feddies.png?1549840827111',
          'https://cdnjs.cloudflare.com/ajax/libs/d3/5.7.0/d3.min.js',
          '//aframe.io/releases/0.9.0/aframe.min.js',
          '//cdn.rawgit.com/donmccurdy/aframe-extras/v5.0.1/dist/aframe-extras.min.js',
          'https://rawgit.com/feiss/aframe-environment-component/master/dist/aframe-environment-component.min.js',
          '/socket.io/socket.io.js',
          'https://cdn.glitch.com/d79adbae-e5bb-4b24-b647-549242a95845%2Fexample_no_path.glb?1549196250049',
          'https://cdn.glitch.com/d79adbae-e5bb-4b24-b647-549242a95845%2Fpath.glb?1549196849622'
        ])
      })
}