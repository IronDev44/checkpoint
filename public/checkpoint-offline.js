/* Only the public application shell is cached here. Private data stay in account-scoped IndexedDB. */
const SHELL='checkpoint-shell-v1';
async function saveShell(response){
  const html=await response.clone().text();
  const assets=[...html.matchAll(/(?:src|href)="([^"#]+)"/g)].map(m=>new URL(m[1],self.location.origin)).filter(u=>u.origin===self.location.origin&&(/\/static\//.test(u.pathname)||/\.(png|ico|webmanifest)$/.test(u.pathname))).map(u=>u.href);
  const cache=await caches.open(SHELL);await cache.addAll(assets);await cache.put('/',response);
}
self.addEventListener('install',event=>event.waitUntil((async()=>{
  const response=await fetch('/',{cache:'reload'});
  if(!response.ok)throw new Error('Shell unavailable');
  await saveShell(response);
})()));
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('fetch',event=>{
  const request=event.request,url=new URL(request.url);
  if(request.method!=='GET'||url.origin!==self.location.origin||url.pathname.startsWith('/api/'))return;
  if(request.mode==='navigate'){
    event.respondWith((async()=>{
      try{const response=await fetch(request);if(!response.ok)throw new Error('Unavailable');event.waitUntil(saveShell(response.clone()).catch(()=>{}));return response;}
      catch{return caches.open(SHELL).then(cache=>cache.match('/'));}
    })());return;
  }
  if(url.pathname.startsWith('/static/')||/\.(png|ico|webmanifest)$/.test(url.pathname))event.respondWith((async()=>{
    const cached=await caches.match(request);if(cached)return cached;
    const response=await fetch(request);if(response.ok){const cache=await caches.open(SHELL);await cache.put(request,response.clone());}return response;
  })());
});
