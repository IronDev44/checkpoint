import {selectionCalendar,monthlyFinal,EXPEDITIONS,CHALLENGE_QUESTIONS} from './rendezvous-catalog.js';
import {canContact,socialBlocked,canReadSocialProfile} from './social-access.js';
const response=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
const read=async(db,owner,collection,id)=>{const row=await db.prepare('SELECT data FROM documents WHERE owner=? AND collection=? AND id=?').bind(owner,collection,id).first();return row?JSON.parse(row.data):null;};
async function bodyOf(request){const text=await request.text();if(text.length>12000)throw new Error('Demande trop volumineuse.');const body=JSON.parse(text);if(!body||typeof body!=='object'||Array.isArray(body))throw new Error('Demande invalide.');return body;}
async function selectionState(db,uid,now,archiveMonth=null){
 let weekly=selectionCalendar(now);
 const months=Array.from({length:3},(_,i)=>new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth()-i-1,1)).toISOString().slice(0,7));
 if(archiveMonth){const [year,month]=archiveMonth.split('-').map(Number);weekly=[...new Map([...weekly,...selectionCalendar(new Date(Date.UTC(year,month,0)))].map(r=>[r.id,r])).values()];if(!months.includes(archiveMonth))months.push(archiveMonth);}
 const ids=[...weekly.map(r=>r.id),...months.map(m=>`final-${m}`),...EXPEDITIONS.map(e=>`expedition-${e.id}`)],slots=ids.map(()=>'?').join(',');
 const rows=await db.prepare(`SELECT id,json_extract(data,'$.choice') AS choice,COUNT(*) AS total FROM documents WHERE collection='selectionVotes' AND id IN (${slots}) GROUP BY id,json_extract(data,'$.choice')`).bind(...ids).all();
 const personal=await db.prepare(`SELECT id,data FROM documents WHERE owner=? AND collection='selectionVotes' AND id IN (${slots})`).bind(uid,...ids).all();
 const totals={},mine={};
 for(const row of rows.results){if(typeof row.choice!=='string'||row.choice==='skip')continue;totals[row.id]??={};totals[row.id][row.choice]=row.total;}
 for(const row of personal.results)mine[row.id]=JSON.parse(row.data).choice;
 const finals=months.map(month=>monthlyFinal(month,weekly,totals));
 const expeditions=EXPEDITIONS.map(e=>({id:`expedition-${e.id}`,kind:'expedition',title:e.taste.title,options:e.taste.options,startsAt:`${e.opensAt}T00:00:00.000Z`,endsAt:null}));
 const rounds=[...weekly,...finals,...expeditions].map(round=>{
  const started=Date.parse(round.startsAt)<=now.getTime(),closed=Boolean(round.endsAt&&Date.parse(round.endsAt)<=now.getTime()),eligible=round.options.length>=2;
  const counts=round.options.map(option=>totals[round.id]?.[option.id]||0),total=counts.reduce((a,b)=>a+b,0),myVote=mine[round.id]??null;
  const showResults=closed||myVote!==null;
  return {...round,started,closed,eligible,myVote,total:showResults?total:null,counts:showResults?counts:null,winners:closed&&total>0?round.options.filter((_,i)=>counts[i]===Math.max(...counts)).map(g=>g.id):[]};
 });
 return {rounds,serverTime:now.toISOString()};
}
export async function handleSelections(request,env,uid,now=new Date()){
 const db=env.ACCOUNT_DB;
 try{
  const archiveMonth=new URL(request.url).searchParams.get('month');
  if(archiveMonth&&(!/^\d{4}-(0[1-9]|1[0-2])$/.test(archiveMonth)||archiveMonth<'2026-10'||archiveMonth>now.toISOString().slice(0,7)))return response({error:'Mois invalide.'},400);
  const state=await selectionState(db,uid,now,archiveMonth);
  if(request.method==='GET')return response(state);
  if(request.method!=='POST')return response({error:'Méthode non autorisée.'},405);
  let body;try{body=await bodyOf(request);}catch{return response({error:'Vote invalide.'},400);}
  const round=state.rounds.find(item=>item.id===body.id);
  if(!round||!round.started||!round.eligible)return response({error:'Cette sélection n’est pas disponible.'},400);
  if(round.closed)return response({error:'Ce vote est terminé. Actualise pour voir les résultats.'},410);
  if(body.choice!=='skip'&&!round.options.some(option=>option.id===body.choice))return response({error:'Choix invalide.'},400);
  await db.prepare("INSERT INTO documents(owner,collection,id,data) VALUES(?,'selectionVotes',?,?) ON CONFLICT(owner,collection,id) DO UPDATE SET data=excluded.data").bind(uid,round.id,JSON.stringify({choice:body.choice,updatedAt:now.toISOString()})).run();
  return response(await selectionState(db,uid,now));
 }catch{return response({error:'Impossible de charger les sélections. Réessaie.'},503);}
}
function challengeView(id,data,uid,now){
 const members=data.members||[],both=members.length===2&&members.every(member=>Number.isInteger(data.votes?.[member]));
 return {id,question:data.question,options:data.options,author:data.author,friend:data.friend,isOwner:data.ownerUid===uid,createdAt:data.createdAt,endsAt:data.endsAt,closed:now.getTime()>=Date.parse(data.endsAt),myVote:data.votes?.[uid]??null,revealed:both,...(both?{choices:members.map(member=>data.votes[member]),comments:members.map(member=>String(data.comments?.[member]||''))}:{}),myComment:String(data.comments?.[uid]||'')};
}
export async function handleChallenges(request,env,uid,url,now=new Date()){
 const db=env.ACCOUNT_DB,id=url.searchParams.get('id');
 try{
  if(request.method==='GET'){
   const rows=await db.prepare("SELECT id,data FROM documents WHERE owner='__shared__' AND collection='friendChallenges' AND EXISTS (SELECT 1 FROM json_each(documents.data,'$.members') WHERE value=?) ORDER BY json_extract(data,'$.createdAt') DESC LIMIT 100").bind(uid).all();
   const visible=await Promise.all(rows.results.map(async row=>{const data=JSON.parse(row.data),other=data.members.find(member=>member!==uid);return await socialBlocked(db,uid,other)?null:challengeView(row.id,data,uid,now);}));
   return response({challenges:visible.filter(Boolean)});
  }
  if(request.method!=='POST')return response({error:'Méthode non autorisée.'},405);
  if(!id||!/^[a-zA-Z0-9_-]{1,100}$/.test(id))return response({error:'Défi invalide.'},400);
  let body;try{body=await bodyOf(request);}catch{return response({error:'Défi invalide.'},400);}
  const row=await db.prepare("SELECT data FROM documents WHERE owner='__shared__' AND collection='friendChallenges' AND id=?").bind(id).first();
  const old=row?JSON.parse(row.data):null;
  if(old?.members?.includes(uid)&&await socialBlocked(db,uid,old.members.find(member=>member!==uid)))return response({error:'Ce défi est indisponible.'},403);
  let data;
  if(body.action==='create'){
   if(old)return old.ownerUid===uid?response({challenge:challengeView(id,old,uid,now)}):response({error:'Ce défi existe déjà.'},409);
   if(!CHALLENGE_QUESTIONS.includes(body.question)||![0,1].includes(body.choice)||!Array.isArray(body.gameIds)||body.gameIds.length!==2||new Set(body.gameIds).size!==2||!body.gameIds.every(key=>typeof key==='string'&&key.length<=250)||typeof body.handle!=='string')return response({error:'Choisis deux jeux, une question, un ami et ton choix.'},400);
   const settings=await read(db,uid,'playerPrivateSettings','main');
   const profile=await read(db,'__shared__','publicProfiles',body.handle);
   if(!profile?.ownerUid||profile.ownerUid===uid||!await canReadSocialProfile(db,uid,profile))return response({error:'Le profil de cet ami est indisponible.'},403);
   if(!await canContact(db,uid,profile.ownerUid,'challenges'))return response({error:'Ce joueur accepte uniquement les défis de ses amis confirmés, selon ses réglages.'},403);
   const options=[];
   for(const key of body.gameIds){const game=await read(db,uid,'games',key);if(!game?.name||game._deletedAt)return response({error:'Un jeu n’est plus disponible.'},400);options.push({name:String(game.name).slice(0,180)});}
   if(options[0].name.toLocaleLowerCase()===options[1].name.toLocaleLowerCase())return response({error:'Choisis deux jeux différents.'},400);
   const count=await db.prepare("SELECT COUNT(*) AS total FROM documents WHERE owner='__shared__' AND collection='friendChallenges' AND json_extract(data,'$.ownerUid')=? AND json_extract(data,'$.endsAt')>? AND (SELECT COUNT(*) FROM json_each(documents.data,'$.votes'))<2").bind(uid,now.toISOString()).first();
   if(count.total>=20)return response({error:'Tu as déjà 20 défis en attente. Attends quelques réponses avant d’en créer un autre.'},400);
   data={ownerUid:uid,members:[uid,profile.ownerUid],question:body.question,options,author:String(settings.socialProfile?.displayName||'Un ami').slice(0,80),friend:String(profile.displayName||body.handle).slice(0,80),votes:{[uid]:body.choice},comments:{},createdAt:now.toISOString(),endsAt:new Date(now.getTime()+7*86400000).toISOString()};
  }else{
   if(!old?.members?.includes(uid))return response({error:'Défi indisponible.'},403);
   data=structuredClone(old);
   const both=data.members.every(member=>Number.isInteger(data.votes[member]));
   if(body.action==='vote'){
    if(both||now.getTime()>=Date.parse(data.endsAt))return response({error:'Le choix est déjà révélé ou le défi est terminé.'},410);
    if(![0,1].includes(body.choice))return response({error:'Choix invalide.'},400);
    data.votes[uid]=body.choice;
   }else if(body.action==='comment'){
    if(!both||typeof body.comment!=='string'||body.comment.length>500)return response({error:'Les commentaires sont ouverts après la révélation (500 caractères maximum).'},400);
    data.comments[uid]=body.comment.trim();
   }else return response({error:'Action invalide.'},400);
  }
  const result=row?await db.prepare("UPDATE documents SET data=? WHERE owner='__shared__' AND collection='friendChallenges' AND id=? AND data=?").bind(JSON.stringify(data),id,row.data).run():await db.prepare("INSERT OR IGNORE INTO documents(owner,collection,id,data) VALUES('__shared__','friendChallenges',?,?)").bind(id,JSON.stringify(data)).run();
  if(!result.meta.changes)return response({error:'Le défi a changé. Actualise puis réessaie.'},409);
  return response({challenge:challengeView(id,data,uid,now)});
 }catch{return response({error:'Impossible de charger les défis. Réessaie.'},503);}
}
