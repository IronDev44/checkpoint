const reply=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
// Explicit sentinels, rather than a wildcard that could match real Firebase UIDs.
const roster=`WITH users AS (SELECT DISTINCT owner AS uid FROM documents WHERE collection IN ('games','hardware','gameCollections','playerProgress','playerPrivateSettings','_appActivity') AND owner NOT IN ('__shared__','__internal__'))`;
export async function handleUsage(request,env,uid){
 const db=env.ACCOUNT_DB,admin=Boolean(env.ACCOUNT_OWNER_UID)&&uid===env.ACCOUNT_OWNER_UID;
 const now=new Date().toISOString();
 try{
  if(request.method==='POST'){
   const raw=await request.text();if(raw.length>2000)return reply({error:'Requête trop longue.'},413);
   let body;try{body=JSON.parse(raw);}catch{return reply({error:'Requête invalide.'},400);}
   if(body?.action==='visit'){
    await db.prepare(`INSERT INTO documents(owner,collection,id,data) VALUES(?,'_appActivity','main',?) ON CONFLICT(owner,collection,id) DO UPDATE SET data=json_set(documents.data,'$.lastSeen',json_extract(excluded.data,'$.lastSeen'),'$.firstSeen',COALESCE(json_extract(documents.data,'$.firstSeen'),json_extract(excluded.data,'$.firstSeen'))) WHERE json_extract(documents.data,'$.lastSeen') IS NULL OR json_extract(documents.data,'$.lastSeen')<?`).bind(uid,JSON.stringify({firstSeen:now,lastSeen:now}),new Date(Date.now()-5*60000).toISOString()).run();
    return reply({ok:true});
   }
   if(!admin)return reply({error:'Accès réservé au propriétaire.'},403);
   if(body?.action!=='exclude'||typeof body.uid!=='string'||!body.uid||body.uid.length>128||body.uid.startsWith('__')||typeof body.excluded!=='boolean')return reply({error:'Compte invalide.'},400);
   if(body.uid===env.ACCOUNT_OWNER_UID)return reply({error:'Ton compte est toujours exclu.'},400);
   const known=await db.prepare(`${roster} SELECT uid FROM users WHERE uid=?`).bind(body.uid).first();
   if(!known)return reply({error:'Compte introuvable.'},404);
   await db.prepare(`INSERT INTO documents(owner,collection,id,data) VALUES(?,'_appActivity','main',?) ON CONFLICT(owner,collection,id) DO UPDATE SET data=json_set(documents.data,'$.excluded',json_extract(excluded.data,'$.excluded'))`).bind(body.uid,JSON.stringify({excluded:body.excluded})).run();
   return reply({ok:true});
  }
  if(request.method!=='GET')return reply({error:'Méthode non autorisée.'},405);
  if(!admin)return reply({error:'Accès réservé au propriétaire.'},403);
  const join=` FROM users u LEFT JOIN documents a ON a.owner=u.uid AND a.collection='_appActivity' AND a.id='main'`;
  const filter=` WHERE u.uid<>? AND COALESCE(json_extract(a.data,'$.excluded'),0)<>1`;
  const summary=await db.prepare(`${roster} SELECT COUNT(*) AS total,COUNT(json_extract(a.data,'$.lastSeen')) AS observed,SUM(CASE WHEN json_extract(a.data,'$.lastSeen')>=? THEN 1 ELSE 0 END) AS active1,SUM(CASE WHEN json_extract(a.data,'$.lastSeen')>=? THEN 1 ELSE 0 END) AS active7,SUM(CASE WHEN json_extract(a.data,'$.lastSeen')>=? THEN 1 ELSE 0 END) AS active30,SUM(CASE WHEN json_extract(a.data,'$.firstSeen')>=? THEN 1 ELSE 0 END) AS new7,MIN(json_extract(a.data,'$.firstSeen')) AS since${join}${filter}`).bind(...[1,7,30,7].map(days=>new Date(Date.now()-days*86400000).toISOString()),env.ACCOUNT_OWNER_UID).first();
  const accounts=await db.prepare(`${roster} SELECT u.uid,json_extract(a.data,'$.lastSeen') AS lastSeen,COALESCE(json_extract(a.data,'$.excluded'),0) AS excluded${join} WHERE u.uid<>? ORDER BY excluded DESC,lastSeen DESC,u.uid LIMIT 100`).bind(env.ACCOUNT_OWNER_UID).all();
  return reply({summary:Object.fromEntries(Object.entries(summary).map(([key,value])=>[key,key==='since'?value:Number(value||0)])),accounts:accounts.results.map(row=>({...row,excluded:row.excluded===1})),updatedAt:now});
 }catch{return reply({error:'Les statistiques sont temporairement indisponibles. Réessaie.'},503);}
}
