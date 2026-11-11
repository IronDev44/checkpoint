const reply=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
// Explicit sentinels, rather than a wildcard that could match real Firebase UIDs.
const roster=`WITH users AS (SELECT DISTINCT owner AS uid FROM documents WHERE collection IN ('games','hardware','gameCollections','playerProgress','playerPrivateSettings','_appActivity') AND owner NOT IN ('__shared__','__internal__'))`;
export async function handlePrivacyPreferences(request,env,uid){
 const db=env.ACCOUNT_DB;
 const available=env.USAGE_TRACKING_ENABLED==='true';
 try{
  if(request.method==='GET'){
   const row=await db.prepare("SELECT data FROM documents WHERE owner=? AND collection='_privacyPreferences' AND id='main'").bind(uid).first();
   return reply({usage:available&&Boolean(row&&JSON.parse(row.data).usage===true),available});
  }
  if(request.method!=='POST')return reply({error:'Méthode non autorisée.'},405);
  const raw=await request.text();if(raw.length>300)return reply({error:'Requête trop longue.'},413);
  let body;try{body=JSON.parse(raw);}catch{return reply({error:'Requête invalide.'},400);}
  if(typeof body?.usage!=='boolean')return reply({error:'Choix invalide.'},400);
  if(body.usage&&!available)return reply({error:'La mesure individuelle d’activité est actuellement suspendue.'},403);
  const previous=await db.prepare("SELECT data FROM documents WHERE owner=? AND collection='_privacyPreferences' AND id='main'").bind(uid).first();
  const statements=[db.prepare("INSERT INTO documents(owner,collection,id,data) VALUES(?,'_privacyPreferences','main',?) ON CONFLICT(owner,collection,id) DO UPDATE SET data=excluded.data").bind(uid,JSON.stringify({usage:body.usage,version:'2026-11-11',updatedAt:new Date().toISOString()}))];
  // A new opt-in must not turn pre-consent measurements into consented history.
  if(!body.usage||!previous||JSON.parse(previous.data).usage!==true)statements.push(db.prepare("DELETE FROM documents WHERE owner=? AND collection='_appActivity'").bind(uid));
  if(db.batch)await db.batch(statements);else for(const statement of statements)await statement.run();
  return reply({usage:body.usage});
 }catch{return reply({error:'Impossible d’enregistrer ce choix. Réessaie.'},503);}
}
export async function handleUsage(request,env,uid){
 const db=env.ACCOUNT_DB,admin=Boolean(env.ACCOUNT_OWNER_UID)&&uid===env.ACCOUNT_OWNER_UID;
 const now=new Date().toISOString();
 try{
  if(request.method==='POST'){
   const raw=await request.text();if(raw.length>2000)return reply({error:'Requête trop longue.'},413);
   let body;try{body=JSON.parse(raw);}catch{return reply({error:'Requête invalide.'},400);}
   if(body?.action==='visit'){
    if(env.USAGE_TRACKING_ENABLED!=='true')return reply({error:'La mesure individuelle d’activité est actuellement suspendue.'},403);
    const consent=await db.prepare("SELECT data FROM documents WHERE owner=? AND collection='_privacyPreferences' AND id='main'").bind(uid).first();
    if(!consent||JSON.parse(consent.data).usage!==true)return reply({error:'Statistiques facultatives désactivées.'},403);
    await db.prepare(`INSERT INTO documents(owner,collection,id,data) SELECT ?,'_appActivity','main',? WHERE EXISTS(SELECT 1 FROM documents WHERE owner=? AND collection='_privacyPreferences' AND id='main' AND json_extract(data,'$.usage')=1) ON CONFLICT(owner,collection,id) DO UPDATE SET data=json_set(documents.data,'$.lastSeen',json_extract(excluded.data,'$.lastSeen'),'$.firstSeen',COALESCE(json_extract(documents.data,'$.firstSeen'),json_extract(excluded.data,'$.firstSeen'))) WHERE json_extract(documents.data,'$.lastSeen') IS NULL OR json_extract(documents.data,'$.lastSeen')<?`).bind(uid,JSON.stringify({firstSeen:now,lastSeen:now}),uid,new Date(Date.now()-5*60000).toISOString()).run();
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
  // Cleanup is performed on dashboard access; no background purge is promised.
  await db.prepare("DELETE FROM documents WHERE collection='_appActivity' AND (COALESCE(json_extract(data,'$.lastSeen'),'')<? OR NOT EXISTS(SELECT 1 FROM documents p WHERE p.owner=documents.owner AND p.collection='_privacyPreferences' AND p.id='main' AND json_extract(p.data,'$.usage')=1))").bind(new Date(Date.now()-30*86400000).toISOString()).run();
  const join=` FROM users u LEFT JOIN documents a ON a.owner=u.uid AND a.collection='_appActivity' AND a.id='main'`;
  const filter=` WHERE u.uid<>? AND COALESCE(json_extract(a.data,'$.excluded'),0)<>1`;
  const summary=await db.prepare(`${roster} SELECT COUNT(*) AS total,COUNT(json_extract(a.data,'$.lastSeen')) AS observed,SUM(CASE WHEN json_extract(a.data,'$.lastSeen')>=? THEN 1 ELSE 0 END) AS active1,SUM(CASE WHEN json_extract(a.data,'$.lastSeen')>=? THEN 1 ELSE 0 END) AS active7,SUM(CASE WHEN json_extract(a.data,'$.lastSeen')>=? THEN 1 ELSE 0 END) AS active30,SUM(CASE WHEN json_extract(a.data,'$.firstSeen')>=? THEN 1 ELSE 0 END) AS new7,MIN(json_extract(a.data,'$.firstSeen')) AS since${join}${filter}`).bind(...[1,7,30,7].map(days=>new Date(Date.now()-days*86400000).toISOString()),env.ACCOUNT_OWNER_UID).first();
  const accounts=await db.prepare(`${roster} SELECT u.uid,json_extract(a.data,'$.lastSeen') AS lastSeen,COALESCE(json_extract(a.data,'$.excluded'),0) AS excluded${join} WHERE u.uid<>? ORDER BY excluded DESC,lastSeen DESC,u.uid LIMIT 100`).bind(env.ACCOUNT_OWNER_UID).all();
  return reply({summary:Object.fromEntries(Object.entries(summary).map(([key,value])=>[key,key==='since'?value:Number(value||0)])),accounts:accounts.results.map(row=>({...row,excluded:row.excluded===1})),trackingAvailable:env.USAGE_TRACKING_ENABLED==='true',updatedAt:now});
 }catch{return reply({error:'Les statistiques sont temporairement indisponibles. Réessaie.'},503);}
}
