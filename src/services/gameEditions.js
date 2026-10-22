const idOf=game=>String(game.id);
const normalize=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[’']/g,'').replace(/[^a-z0-9]+/g,' ').trim();
export function editionTitle(name){
 let title=String(name||'').trim(),previous;
 do{previous=title;title=title.replace(/\s*[([](?:19|20)\d{2}[)\]]\s*$/i,'').replace(/\s*[([](?:ps[1-5]|playstation\s*[1-5]|pc|xbox(?:\s+(?:one|360|series\s*[xs]))?)[)\]]\s*$/i,'').replace(/\s*[:–—-]?\s*\b(?:(?:hd\s+)?remaster(?:ed)?|remake|hd|(?:game of the year|goty|definitive|complete|deluxe|ultimate|gold|standard|anniversary|limited|collectors?)\s+edition|directors?['’]?\s+cut)\s*$/i,'').trim();}while(title!==previous);
 return normalize(title)||normalize(name);
}
export function normalizeEditionLinks(value){
 const byId=new Map();
 for(const item of Array.isArray(value)?value:[]){
  if(!item||typeof item.id!=='string'||!item.id||item.id.length>160||!Array.isArray(item.members))continue;
  const members=[...new Set(item.members.filter(id=>typeof id==='string'&&id&&id.length<=200))];
  if(members.length<2)continue;
  const updatedAt=Number.isFinite(Date.parse(item.updatedAt))?new Date(item.updatedAt).toISOString():'';
  const next={id:item.id,members,preferred:members.includes(item.preferred)?item.preferred:members[0],revoked:item.revoked===true,updatedAt};
  const old=byId.get(item.id),stamp=Date.parse(updatedAt)||0,oldStamp=Date.parse(old?.updatedAt)||0;
  if(!old||stamp>oldStamp||(stamp===oldStamp&&((next.revoked&&!old.revoked)||(next.revoked===old.revoked&&JSON.stringify(next)>JSON.stringify(old)))))byId.set(item.id,next);
 }
 return [...byId.values()].sort((a,b)=>(Date.parse(b.updatedAt)||0)-(Date.parse(a.updatedAt)||0)||a.id.localeCompare(b.id));
}
export const mergeEditionLinks=(...sources)=>normalizeEditionLinks(sources.flatMap(v=>Array.isArray(v)?v:[]));
function revision(links,date){return new Date(Math.max(Date.parse(date)||Date.now(),...links.map(v=>(Date.parse(v.updatedAt)||0)+1))).toISOString();}
export function linkGameEditions(value,members,id,preferred,date=new Date().toISOString()){
 const links=normalizeEditionLinks(value);
 if(!Array.isArray(members)||typeof id!=='string'||!id||id.length>160)return links;
 const ids=[...new Set(members.filter(member=>typeof member==='string'&&member&&member.length<=200))],updatedAt=revision(links,date);
 if(ids.length<2)return links;
 const overlapping=links.filter(g=>!g.revoked&&g.members.some(member=>ids.includes(member)));
 // Explicit relinking can unite existing families; no member is silently dropped.
 const joined=[...new Set([...ids,...overlapping.flatMap(g=>g.members)])];
 const result=links.map(g=>overlapping.includes(g)?{...g,revoked:true,updatedAt}:g);
 return mergeEditionLinks(result,[{id,members:joined,preferred:joined.includes(preferred)?preferred:overlapping.find(g=>joined.includes(g.preferred))?.preferred||joined[0],revoked:false,updatedAt}]);
}
export function changeEditionLink(value,id,patch,date=new Date().toISOString()){
 const links=normalizeEditionLinks(value),updatedAt=revision(links,date);
 return normalizeEditionLinks(links.map(g=>g.id===id?{...g,...(g.members.includes(patch?.preferred)?{preferred:patch.preferred}:{}),...(typeof patch?.revoked==='boolean'?{revoked:patch.revoked}:{}),updatedAt}:g));
}
export function availableEditionGroups(games,value){
 const byId=new Map(games.map(g=>[idOf(g),g])),used=new Set(),result=[];
 for(const link of normalizeEditionLinks(value).filter(g=>!g.revoked)){
  const members=link.members.filter(id=>byId.has(id)&&!used.has(id)).map(id=>byId.get(id));
  if(!members.length)continue;
  members.forEach(g=>used.add(idOf(g)));
  result.push({...link,games:members,representative:members.find(g=>idOf(g)===link.preferred)||members[0]});
 }
 return result;
}
export function arenaEditionCandidates(games,value,allVersions=false){
 const unique=[...new Map(games.map(g=>[idOf(g),g])).values()];
 if(allVersions)return unique;
 const groups=availableEditionGroups(unique,value),byMember=new Map(groups.flatMap(group=>group.games.map(game=>[idOf(game),group]))),seen=new Set(),result=[];
 for(const game of unique){const group=byMember.get(idOf(game));if(!group){result.push(game);continue;}if(seen.has(group.id))continue;seen.add(group.id);result.push({...group.representative,arenaEdition:{id:group.id,count:group.games.length,members:group.games.map(idOf)},arenaIdentity:`checkpoint-family:${group.id}`});}
 return result;
}
function identities(game){
 const ids=new Set();for(const source of ['igdb','rawg']){const value=game.sourceIds?.[source]||game.normalized?.sourceIds?.[source];if(value)ids.add(`${source}:${value}`);}
 for(const value of [game.canonicalId,game.id,game.rawgId])if(/^(?:igdb|rawg):\d+$/.test(String(value)))ids.add(String(value));
 if(game.rawgId!=null&&/^\d+$/.test(String(game.rawgId)))ids.add(`rawg:${game.rawgId}`);
 if(game.source==='igdb'&&/^\d+$/.test(String(game.id)))ids.add(`igdb:${game.id}`);
 return ids;
}
export function suggestEditionLinks(games,links){
 const unique=[...new Map(games.map(g=>[idOf(g),g])).values()],parents=unique.map((_,i)=>i),find=i=>parents[i]===i?i:(parents[i]=find(parents[i]));
 const join=(a,b)=>{parents[find(b)]=find(a);},tokens=new Map();
 unique.forEach((game,i)=>{
  const keys=[...identities(game)],parent=game.normalized?.versionParent||game.versionParent;
  if(parent&&keys.some(key=>key.startsWith('igdb:'))){const value=typeof parent==='object'?parent.id:parent;if(/^\d+$/.test(String(value)))keys.push(`igdb:${value}`);}
  const title=editionTitle(game.name);if(title)keys.push(`title:${title}`);
  keys.forEach(key=>{if(tokens.has(key))join(tokens.get(key),i);else tokens.set(key,i);});
 });
 const clusters=new Map();unique.forEach((game,i)=>{const key=find(i);if(!clusters.has(key))clusters.set(key,[]);clusters.get(key).push(game);});
 const approved=availableEditionGroups(unique,links);
 return [...clusters.values()].filter(group=>group.length>=2&&!approved.some(link=>group.every(g=>link.members.includes(idOf(g))))).map(group=>({games:group,label:group[0].name}));
}
