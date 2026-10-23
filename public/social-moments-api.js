const reply=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
const get=async(db,owner,collection,id)=>{const row=await db.prepare('SELECT data FROM documents WHERE owner=? AND collection=? AND id=?').bind(owner,collection,id).first();return row?JSON.parse(row.data):null;};
const text=(value,max)=>typeof value==='string'&&value.trim().length>0&&value.trim().length<=max;
const web=value=>{try{const url=new URL(value);return url.protocol==='https:'&&!url.username&&!url.password;}catch{return false;}};
async function body(request){const raw=await request.text();if(raw.length>8000)throw Error();const data=JSON.parse(raw);if(!data||typeof data!=='object'||Array.isArray(data))throw Error();return data;}
async function save(db,collection,id,old,data){
 const result=old?await db.prepare("UPDATE documents SET data=? WHERE owner='__shared__' AND collection=? AND id=? AND data=?").bind(JSON.stringify(data),collection,id,JSON.stringify(old)).run():await db.prepare("INSERT OR IGNORE INTO documents(owner,collection,id,data) VALUES('__shared__',?,?,?)").bind(collection,id,JSON.stringify(data)).run();
 return Boolean(result.meta.changes);
}
const recommendationView=(id,data,uid)=>({id,author:data.author,friend:data.friend,game:data.game,message:data.message,createdAt:data.createdAt,isSender:data.sender===uid,saved:data.saved,response:data.response||'',repliedAt:data.repliedAt||null,archived:data.archived?.includes(uid)||false});
export async function handleRecommendations(request,env,uid,url,now=new Date()){
 const db=env.ACCOUNT_DB,id=url.searchParams.get('id');
 try{
  if(request.method==='GET'){
   const rows=await db.prepare("SELECT id,data FROM documents WHERE owner='__shared__' AND collection='gameRecommendations' AND (json_extract(data,'$.sender')=? OR json_extract(data,'$.recipient')=?) ORDER BY json_extract(data,'$.createdAt') DESC LIMIT 200").bind(uid,uid).all();
   return reply({recommendations:rows.results.map(r=>recommendationView(r.id,JSON.parse(r.data),uid))});
  }
  if(request.method!=='POST')return reply({error:'Méthode non autorisée.'},405);
  if(!id||!/^[a-zA-Z0-9_-]{1,100}$/.test(id))return reply({error:'Recommandation invalide.'},400);
  let input;try{input=await body(request);}catch{return reply({error:'Demande invalide.'},400);}
  const old=await get(db,'__shared__','gameRecommendations',id);let data;
  if(input.action==='create'){
   if(old)return old.sender===uid?reply({recommendation:recommendationView(id,old,uid)}):reply({error:'Cet envoi existe déjà.'},409);
   if(!text(input.handle,80)||!text(input.gameId,250)||!text(input.message,500))return reply({error:'Choisis un ami, un jeu et un petit mot (500 caractères maximum).'},400);
   const settings=await get(db,uid,'playerPrivateSettings','main');
   if(!(settings?.socialFriends||[]).some(f=>f.handle===input.handle))return reply({error:'Choisis un ami enregistré.'},403);
   const profile=await get(db,'__shared__','publicProfiles',input.handle),game=await get(db,uid,'games',input.gameId);
   if(!profile?.ownerUid||profile.ownerUid===uid||(profile.visibility&&profile.visibility!=='public'))return reply({error:'Ce profil est indisponible.'},403);
   if(!game?.name||game._deletedAt||game.status==='wishlist')return reply({error:'Choisis un jeu de ta collection.'},400);
   const recent=await db.prepare("SELECT COUNT(*) AS total FROM documents WHERE owner='__shared__' AND collection='gameRecommendations' AND json_extract(data,'$.sender')=? AND json_extract(data,'$.createdAt')>?").bind(uid,new Date(now.getTime()-86400000).toISOString()).first();
   if(recent.total>=10)return reply({error:'Dix recommandations par jour suffisent : laisse le temps à tes amis de les découvrir.'},429);
   data={sender:uid,recipient:profile.ownerUid,author:String(settings.socialProfile?.displayName||'Un ami').slice(0,80),friend:String(profile.displayName||input.handle).slice(0,80),game:{name:String(game.name).slice(0,180)},message:input.message.trim(),createdAt:now.toISOString(),saved:false,response:'',archived:[]};
  }else{
   if(!old||![old.sender,old.recipient].includes(uid))return reply({error:'Recommandation indisponible.'},403);
   data=structuredClone(old);
   if(input.action==='archive'){data.archived=[...new Set([...(data.archived||[]),uid])];}
   else if(input.action==='restore'){data.archived=(data.archived||[]).filter(member=>member!==uid);}
   else if(uid!==old.recipient)return reply({error:'Cette action est réservée au destinataire.'},403);
   else if(input.action==='save'&&typeof input.saved==='boolean')data.saved=input.saved;
   else if(input.action==='respond'&&typeof input.response==='string'&&input.response.length<=1000){data.response=input.response.trim();data.repliedAt=now.toISOString();}
   else return reply({error:'Action invalide.'},400);
  }
  if(!await save(db,'gameRecommendations',id,old,data))return reply({error:'Cet échange a changé. Actualise puis réessaie.'},409);
  return reply({recommendation:recommendationView(id,data,uid)});
 }catch{return reply({error:'Impossible de charger les recommandations. Réessaie.'},503);}
}
function predictionView(id,data,choice,counts,now){
 const closed=now.getTime()>=Date.parse(data.closesAt),resolved=data.result!==null;
 return {id,title:data.title,event:data.event,options:data.options,closesAt:data.closesAt,source:data.source,createdAt:data.createdAt,closed,result:data.result,resultSource:data.resultSource||'',resolvedAt:data.resolvedAt||null,cancelled:data.cancelled||false,myVote:choice??null,counts:closed?counts:null,total:closed?counts.reduce((a,b)=>a+b,0):null,correct:resolved&&choice!=null?choice===data.result:null};
}
export async function handlePredictions(request,env,uid,url,now=new Date()){
 const db=env.ACCOUNT_DB,id=url.searchParams.get('id'),admin=Boolean(env.ACCOUNT_OWNER_UID&&uid===env.ACCOUNT_OWNER_UID);
 try{
  if(request.method==='GET'){
   const rows=await db.prepare("SELECT id,data FROM documents WHERE owner='__shared__' AND collection='gamingPredictions' ORDER BY json_extract(data,'$.createdAt') DESC LIMIT 100").bind().all();
   const personal=await db.prepare("SELECT id,data FROM documents WHERE owner=? AND collection='predictionVotes' AND id IN (SELECT id FROM documents WHERE owner='__shared__' AND collection='gamingPredictions' ORDER BY json_extract(data,'$.createdAt') DESC LIMIT 100)").bind(uid).all();
   const mine=Object.fromEntries(personal.results.map(r=>[r.id,JSON.parse(r.data).choice]));
   const totals=await db.prepare("SELECT id,json_extract(data,'$.choice') AS choice,COUNT(*) AS total FROM documents WHERE collection='predictionVotes' AND id IN (SELECT id FROM documents WHERE owner='__shared__' AND collection='gamingPredictions' ORDER BY json_extract(data,'$.createdAt') DESC LIMIT 100) GROUP BY id,json_extract(data,'$.choice')").bind().all();
   return reply({canManage:admin,serverTime:now.toISOString(),predictions:rows.results.map(row=>{const data=JSON.parse(row.data),counts=data.options.map((_,i)=>totals.results.find(r=>r.id===row.id&&r.choice===i)?.total||0);return predictionView(row.id,data,mine[row.id],counts,now);})});
  }
  if(request.method!=='POST')return reply({error:'Méthode non autorisée.'},405);
  if(!id||!/^[a-zA-Z0-9_-]{1,100}$/.test(id))return reply({error:'Pronostic invalide.'},400);
  let input;try{input=await body(request);}catch{return reply({error:'Demande invalide.'},400);}
  const old=await get(db,'__shared__','gamingPredictions',id);
  if(input.action==='vote'){
   if(!old||old.cancelled||old.result!==null||now.getTime()>=Date.parse(old.closesAt))return reply({error:'Ce pronostic est terminé ou indisponible.'},410);
   if(!Number.isInteger(input.choice)||input.choice<0||input.choice>=old.options.length)return reply({error:'Choix invalide.'},400);
   // The deadline and cancellation are checked again in the same statement as the vote.
   const result=await db.prepare("INSERT INTO documents(owner,collection,id,data) SELECT ?,'predictionVotes',?,? WHERE EXISTS (SELECT 1 FROM documents WHERE owner='__shared__' AND collection='gamingPredictions' AND id=? AND data=? AND json_extract(data,'$.closesAt')>?) ON CONFLICT(owner,collection,id) DO UPDATE SET data=excluded.data").bind(uid,id,JSON.stringify({choice:input.choice,at:now.toISOString()}),id,JSON.stringify(old),now.toISOString()).run();
   return result.meta.changes?reply({ok:true}):reply({error:'Le pronostic a changé. Actualise.'},409);
  }
  if(!admin)return reply({error:'Cet outil est réservé au propriétaire.'},403);
  let data;
  if(input.action==='create'){
   if(old)return reply({error:'Ce pronostic existe déjà.'},409);
   const deadline=Date.parse(input.closesAt);
   if(!text(input.title,180)||!text(input.event,120)||!Array.isArray(input.options)||input.options.length<2||input.options.length>6||!input.options.every(o=>text(o,100))||new Set(input.options.map(o=>o.trim().toLowerCase())).size!==input.options.length||!web(input.source)||!Number.isFinite(deadline)||deadline<=now.getTime()||deadline>now.getTime()+366*86400000)return reply({error:'Renseigne une question, un événement, 2 à 6 réponses distinctes, une source HTTPS et une clôture future (un an maximum).'},400);
   data={title:input.title.trim(),event:input.event.trim(),options:input.options.map(o=>o.trim()),source:input.source,closesAt:new Date(deadline).toISOString(),createdAt:now.toISOString(),result:null,cancelled:false};
  }else if(input.action==='resolve'){
   if(!old||old.cancelled||old.result!==null||now.getTime()<Date.parse(old.closesAt))return reply({error:'Attends la clôture ; un résultat publié reste définitif.'},400);
   if(!Number.isInteger(input.result)||input.result<0||input.result>=old.options.length||!web(input.resultSource))return reply({error:'Choisis une réponse et la source du résultat.'},400);
   data={...old,result:input.result,resultSource:input.resultSource,resolvedAt:now.toISOString()};
  }else if(input.action==='cancel'&&old&&old.result===null){data={...old,cancelled:true};}
  else return reply({error:'Action indisponible.'},400);
  if(!await save(db,'gamingPredictions',id,old,data))return reply({error:'Le pronostic a changé. Actualise puis réessaie.'},409);
  return reply({ok:true});
 }catch{return reply({error:'Impossible de charger les pronostics. Réessaie.'},503);}
}
