/* PiA Stundentracker DGVT Dresden – Service Worker v2
   Als sw.js neben index.html hochladen. Löscht nur pia-stundentracker-*.
   Google Fonts sind optional: Die App nutzt offline ihre CSS-Fallback-Schriften. */
const CACHE_NAME="pia-stundentracker-v2", CACHE_PREFIX="pia-stundentracker-";
const APP_SHELL=["./","./index.html","./manifest.json","./icons/icon-192.png"];
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE_NAME).then(c=>Promise.allSettled(APP_SHELL.map(u=>c.add(u)))).then(()=>self.skipWaiting())));
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith(CACHE_PREFIX)&&k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>{if(e.request.method!=="GET"||new URL(e.request.url).origin!==self.location.origin)return;e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(hit=>hit||fetch(e.request).then(r=>{if(r.ok&&r.type==="basic")caches.open(CACHE_NAME).then(c=>c.put(e.request,r.clone()));return r}).catch(()=>e.request.mode==="navigate"?caches.match("./index.html"):Response.error())))});
