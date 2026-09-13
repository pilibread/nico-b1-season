/* Service worker: keeps the app opening with no signal.
   Network first, so a new version shows on the next online load; the cached copy
   is only used when the network fails. Firebase and fonts are never intercepted.
   The network request asks the server whether the file changed ("no-cache"), because
   GitHub Pages otherwise lets browsers reuse a copy for 10 minutes after an update. */
const CACHE="nico-b1-v2";
const FILES=["nico-b1-season.html","index.html","manifest.webmanifest","icon-192.png","icon-512.png","icon-180.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET")return;
  if(new URL(e.request.url).origin!==location.origin)return;
  e.respondWith(
    fetch(new Request(e.request.url,{cache:"no-cache",redirect:e.request.mode==="navigate"?"manual":"follow"}))
      .then(r=>{if(r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));}return r;})
      .catch(()=>caches.match(e.request,{ignoreSearch:true}))
  );
});
