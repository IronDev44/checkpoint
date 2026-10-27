import {socialBlocked,socialPairId} from './social-access.js';
export const normalizeProfileQuery=value=>String(value||'').normalize('NFKD').replace(/\p{M}/gu,'').toLowerCase().replace(/œ/g,'oe').replace(/æ/g,'ae').replace(/[’‘]/g,"'").replace(/[‐‑–—]/g,'-').replace(/\s+/g,' ').trim();
const rank=(row,query)=>{
 const handle=normalizeProfileQuery(row.id),name=normalizeProfileQuery(row.displayName);
 return handle===query?0:name===query?1:handle.startsWith(query)?2:name.startsWith(query)?3:handle.includes(query)||name.includes(query)?4:Infinity;
};
// SQLite's lower() does not fold Unicode accents. Read only small identity fields,
// then rank normalized matches; fetch full profiles only after selecting candidates.
export async function findVisibleProfiles(db,query,uid,readable){
 const candidates=[];let cursor='',overflow=false;
 do{
  // Search only identity metadata. Never return private settings or a private photo.
  const page=await db.prepare(`SELECT * FROM (
   SELECT 'p:'||p.id AS searchKey,p.id,
    COALESCE(json_extract(s.data,'$.socialProfile.displayName'),json_extract(p.data,'$.displayName')) AS displayName,
    json_extract(p.data,'$.ownerUid') AS profileOwner,
    CASE WHEN COALESCE(json_extract(s.data,'$.socialProfile.visibility'),'public') NOT IN ('public','friends') OR COALESCE(json_extract(p.data,'$.visibility'),'public') NOT IN ('public','friends') THEN 1 ELSE 0 END AS isPrivate
   FROM documents p LEFT JOIN documents s ON s.owner=json_extract(p.data,'$.ownerUid') AND s.collection='playerPrivateSettings' AND s.id='main'
   WHERE p.owner='__shared__' AND p.collection='publicProfiles'
   UNION ALL
   SELECT 's:'||s.owner AS searchKey,COALESCE(json_extract(s.data,'$.socialProfile.handle'),'') AS id,
    json_extract(s.data,'$.socialProfile.displayName') AS displayName,s.owner AS profileOwner,1 AS isPrivate
   FROM documents s WHERE s.collection='playerPrivateSettings' AND s.id='main'
    AND COALESCE(json_extract(s.data,'$.socialProfile.visibility'),'prive') NOT IN ('public','friends')
    AND trim(COALESCE(json_extract(s.data,'$.socialProfile.displayName'),''))<>''
  ) WHERE searchKey>? ORDER BY searchKey LIMIT 500`).bind(cursor).all();
  for(const row of page.results){
   const score=rank(row,query);if(!Number.isFinite(score))continue;
   const existing=row.profileOwner?candidates.findIndex(candidate=>candidate.profileOwner===row.profileOwner):-1;
   if(existing>=0){if(candidates[existing].score<=score)continue;candidates.splice(existing,1);}
   candidates.push({...row,score});
  }
  candidates.sort((a,b)=>a.score-b.score||a.id.localeCompare(b.id));
  if(candidates.length>100){candidates.length=100;overflow=true;}
  if(page.results.length<500)break;cursor=page.results.at(-1).searchKey;
 }while(true);
 const profiles=[];
 const seen=new Set();
 for(const candidate of candidates){
  if(candidate.profileOwner&&seen.has(candidate.profileOwner))continue;
  if(candidate.isPrivate){
   if(!candidate.profileOwner||await socialBlocked(db,uid,candidate.profileOwner))continue;
   const handle=candidate.id||`private-${await socialPairId('profile-search',candidate.profileOwner)}`;
   profiles.push({handle,displayName:String(candidate.displayName||'Joueur'),photoURL:'',private:true,...(candidate.profileOwner===uid?{self:true}:{})});
   seen.add(candidate.profileOwner);
   if(profiles.length===21)break;
   continue;
  }
  const row=await db.prepare("SELECT data FROM documents WHERE owner='__shared__' AND collection='publicProfiles' AND id=?").bind(candidate.id).first();
  const profile=row&&await readable(JSON.parse(row.data));if(!profile)continue;
  profiles.push({handle:candidate.id,displayName:String(profile.displayName||candidate.id),photoURL:profile.photoURL||'',...(profile.ownerUid===uid?{self:true}:{})});
  if(candidate.profileOwner)seen.add(candidate.profileOwner);
  if(profiles.length===21)break;
 }
 return {profiles:profiles.slice(0,20),limited:overflow||profiles.length>20};
}
