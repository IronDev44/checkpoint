import {normalizeBarcode,barcodeKey} from './barcode-model.js';
const reply=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
export async function handleBarcodeLookup(request,env,uid,url,fetcher=fetch,now=new Date()){
 if(request.method!=='GET')return reply({error:'Méthode non autorisée.'},405);
 const code=normalizeBarcode(url.searchParams.get('code'));if(!code)return reply({error:'Code-barres invalide. Vérifie les chiffres sous la boîte.'},400);
 const key=barcodeKey(code),db=env.ACCOUNT_DB;
 try{
  const row=await db.prepare("SELECT data FROM documents WHERE owner='__service__' AND collection='barcodeCache' AND id=?").bind(key).first();
  if(row){const saved=JSON.parse(row.data);if(Date.parse(saved.expiresAt)>now.getTime())return reply({...saved.result,cached:true});}
  // Protect the shared free provider quota, including concurrent worker requests.
  const quota=await db.prepare("INSERT INTO documents(owner,collection,id,data) VALUES('__service__','barcodeQuota',?,?) ON CONFLICT(owner,collection,id) DO UPDATE SET data=json_set(documents.data,'$.count',json_extract(documents.data,'$.count')+1,'$.lastAt',?) WHERE json_extract(documents.data,'$.count')<90 AND json_extract(documents.data,'$.lastAt')<=? RETURNING data").bind(now.toISOString().slice(0,10),JSON.stringify({count:1,lastAt:now.getTime()}),now.getTime(),now.getTime()-10000).first();
  if(!quota)return reply({error:'Le service de codes-barres est momentanément limité. Tu peux rechercher le jeu par son nom.',code:'BARCODE_RATE_LIMIT'},429);
  const response=await fetcher(`https://api.upcitemdb.com/prod/trial/lookup?upc=${encodeURIComponent(code)}`,{headers:{Accept:'application/json'},signal:AbortSignal.timeout(10000)});
  if(response.status===429)return reply({error:'Le catalogue de codes-barres a atteint sa limite. La recherche par nom reste disponible.',code:'BARCODE_RATE_LIMIT'},429);
  if(!response.ok&&response.status!==404)return reply({error:'Le catalogue de codes-barres est indisponible. Recherche le jeu par son nom.'},503);
  const payload=await response.json();
  if(response.status!==404&&(!Array.isArray(payload.items)||payload.code!=='OK'))return reply({error:'Le catalogue a renvoyé une réponse inexploitable. Recherche le jeu par son nom.'},503);
  const items=(payload.items||[]).filter(item=>[item.ean,item.upc,item.gtin].some(value=>barcodeKey(value)===key)).slice(0,4).map(item=>({title:String(item.title||'').slice(0,240),brand:String(item.brand||'').slice(0,80),category:String(item.category||'').slice(0,150)})).filter(item=>item.title);
  const result={code,items,source:'UPCitemdb'};
  await db.prepare("INSERT INTO documents(owner,collection,id,data) VALUES('__service__','barcodeCache',?,?) ON CONFLICT(owner,collection,id) DO UPDATE SET data=excluded.data").bind(key,JSON.stringify({result,expiresAt:new Date(now.getTime()+(items.length?30:1)*86400000).toISOString()})).run();
  return reply(result);
 }catch{return reply({error:'Impossible de vérifier ce code-barres. La recherche par nom reste disponible.'},503);}
}
