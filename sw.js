const CACHE='pia-tracker-v4';
const ASSETS=[
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

self.addEventListener('install',e=>{
  e.waitUntil(
    caches.open(CACHE).then(c=>Promise.allSettled(ASSETS.map(u=>c.add(u))))
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',e=>{
  const url=new URL(e.request.url);
  // Google Fonts: network-first, cache fallback
  if(url.hostname==='fonts.googleapis.com'||url.hostname==='fonts.gstatic.com'){
    e.respondWith(
      caches.open(CACHE).then(c=>
        c.match(e.request).then(cached=>{
          const net=fetch(e.request).then(r=>{c.put(e.request,r.clone());return r;});
          return cached||net;
        })
      )
    );
    return;
  }
  // Alles andere: cache-first
  e.respondWith(
    caches.match(e.request).then(cached=>{
      if(cached)return cached;
      return fetch(e.request).then(r=>{
        if(!r||r.status!==200||r.type==='opaque')return r;
        const cl=r.clone();
        caches.open(CACHE).then(c=>c.put(e.request,cl));
        return r;
      }).catch(()=>caches.match('./index.html'));
    })
  );
});
