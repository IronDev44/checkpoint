const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const handlers={},entries=new Map();let disconnected=false,revision='one';
const html=()=>`<html><script src="/static/js/main.${revision}.js"></script><link href="/static/css/main.${revision}.css" rel="stylesheet"></html>`;
const key=request=>typeof request==='string'?request:request.url;
const cache={addAll:async assets=>{for(const asset of assets)entries.set(asset,new Response('asset'));},put:async(request,response)=>entries.set(key(request),response),match:async request=>entries.get(key(request))?.clone()};
const fetch=async request=>{if(disconnected)throw new Error('Network down');return new Response(html());};
const context={self:{location:{origin:'https://checkpoint.test'},clients:{claim:async()=>{}},addEventListener:(name,handler)=>handlers[name]=handler},caches:{open:async()=>cache,match:request=>cache.match(request)},fetch,URL};
vm.runInNewContext(fs.readFileSync('public/checkpoint-offline.js','utf8'),context);
(async()=>{
 let installed;handlers.install({waitUntil:promise=>installed=promise});await installed;
 assert(entries.has('/'));assert(entries.has('https://checkpoint.test/static/js/main.one.js'));
 let intercepted=false;handlers.fetch({request:{url:'https://checkpoint.test/api/account-data',method:'GET'},respondWith:()=>intercepted=true});assert.equal(intercepted,false);
 handlers.fetch({request:{url:'https://other.test/private.png',method:'GET'},respondWith:()=>intercepted=true});assert.equal(intercepted,false);
 disconnected=true;let result;handlers.fetch({request:{url:'https://checkpoint.test/',method:'GET',mode:'navigate'},respondWith:promise=>result=promise});assert((await (await result).text()).includes('main.one.js'));
 disconnected=false;revision='two';let background;handlers.fetch({request:{url:'https://checkpoint.test/',method:'GET',mode:'navigate'},respondWith:promise=>result=promise,waitUntil:promise=>background=promise});await result;await background;
 assert((await entries.get('/').clone().text()).includes('main.two.js'));assert(entries.has('https://checkpoint.test/static/js/main.two.js'));
 console.log('Offline shell: public assets, private API exclusion, offline reload and deployment refresh verified.');
})().catch(error=>{console.error(error);process.exitCode=1;});
