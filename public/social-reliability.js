import {ensureSocialDirectory,updateSocialDirectory} from './social-directory.js';
import {normalizeProfileQuery} from './profile-search.js';
const reply=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
export async function socialQuota(db,uid,kind,limit,windowMs,now=Date.now()){
 const result=await db.prepare(`INSERT INTO documents(owner,collection,id,data) VALUES(?,'_socialQuota',?,json_object('events',json_array(?)))
 ON CONFLICT(owner,collection,id) DO UPDATE SET data=json_object('events',json_insert((SELECT json_group_array(value) FROM json_each(documents.data,'$.events') WHERE value>?), '$[#]',?))
 WHERE (SELECT COUNT(*) FROM json_each(documents.data,'$.events') WHERE value>?)<?`).bind(uid,kind,now,now-windowMs,now,now-windowMs,limit).run();
 return Boolean(result.meta.changes);
}
const operations=new Set(['search','friendships','socialControls','socialReactions','sharedGames','socialReports','friendPolls','friendChallenges','gameRecommendations','profile']);
export async function recordSocialIssue(db,operation,status,source='server'){
 if(!operations.has(operation)||![0,408,409,429,500,502,503,504].includes(status))return;
 const now=new Date().toISOString(),id=`${now.slice(0,10)}:${operation}:${status}:${source}`;
 try{
  await db.prepare(`INSERT INTO documents(owner,collection,id,data) VALUES('__internal__','_socialDiagnostics',?,json_object('operation',?,'status',?,'source',?,'count',1,'lastSeen',?))
  ON CONFLICT(owner,collection,id) DO UPDATE SET data=json_set(documents.data,'$.count',json_extract(documents.data,'$.count')+1,'$.lastSeen',?)`).bind(id,operation,status,source,now,now).run();
  await db.prepare("DELETE FROM documents WHERE owner='__internal__' AND collection='_socialDiagnostics' AND id<?").bind(new Date(Date.now()-30*86400000).toISOString().slice(0,10)).run();
 }catch{/* Diagnostics must never interrupt a player's action. */}
}
export async function handleSocialDiagnostics(request,env,uid){
 const db=env.ACCOUNT_DB;
 if(request.method==='GET'){
  if(!env.ACCOUNT_OWNER_UID||uid!==env.ACCOUNT_OWNER_UID)return reply({error:'Accès réservé au propriétaire.'},403);
  await ensureSocialDirectory(db);
  const pending=await db.prepare('SELECT COUNT(*) AS total FROM social_directory_dirty').bind().first();
  const indexed=await db.prepare('SELECT COUNT(*) AS total FROM social_directory').bind().first();
  const rows=await db.prepare("SELECT data FROM documents WHERE owner='__internal__' AND collection='_socialDiagnostics' AND id>=? ORDER BY json_extract(data,'$.lastSeen') DESC LIMIT 300").bind(new Date(Date.now()-30*86400000).toISOString().slice(0,10)).all();
  return reply({issues:rows.results.map(row=>JSON.parse(row.data)),directory:{pending:Number(pending.total),indexed:Number(indexed.total)},updatedAt:new Date().toISOString()});
 }
 if(request.method!=='POST')return reply({error:'Méthode non autorisée.'},405);
 const raw=await request.text();if(raw.length>300)return reply({error:'Requête invalide.'},400);
 let input;try{input=JSON.parse(raw);}catch{return reply({error:'Requête invalide.'},400);}
 if(input?.action==='index'){
  if(!env.ACCOUNT_OWNER_UID||uid!==env.ACCOUNT_OWNER_UID)return reply({error:'Accès réservé au propriétaire.'},403);
  return reply(await updateSocialDirectory(db,normalizeProfileQuery));
 }
 if(!operations.has(input?.operation)||![0,408].includes(input.status))return reply({error:'Diagnostic invalide.'},400);
 if(!await socialQuota(db,uid,'diagnostics',20,3600000))return reply({error:'Réessaie plus tard.'},429);
 await recordSocialIssue(db,input.operation,input.status,'client');return reply({ok:true});
}
