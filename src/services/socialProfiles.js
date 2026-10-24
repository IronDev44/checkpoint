export async function readPublicSocialProfile(value, readDocument) {
  const handle = String(value || "").trim().replace(/^@/, "").toLowerCase();
  if (!/^[a-z0-9_-]+$/.test(handle)) throw new Error("Entre un identifiant Checkpoint valide.");
  const snapshot = await readDocument(handle);
  if (!snapshot.exists()) throw new Error("Ce profil n’est plus disponible ou est privé.");
  const profile = snapshot.data();
  if (profile.visibility && !["public","friends"].includes(profile.visibility)) throw new Error("Ce profil est privé.");
  return { ...profile, handle };
}

export function getFriendsFeed(profiles) {
  return profiles.flatMap(profile => profile.publicSections?.activity === false ? [] :
    (profile.recentActivity || []).map((activity, index) => ({ ...activity, profile,
      feedId: `${profile.handle}:${activity.id || index}`,
    }))).sort((a, b) => (Date.parse(b.date) || 0) - (Date.parse(a.date) || 0));
}

export const SOCIAL_FEED_FILTERS=[['all','Tout'],['completed','Jeux terminés'],['reviews','Notes et avis'],['added','Nouveaux ajouts'],['posts','Publications']];
export function activityMatchesFilter(item,filter){
 if(filter==='all')return true;
 const type=String(item.kind||item.type||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 if(filter==='completed')return type==='completed'||type.includes('termine');
 if(filter==='reviews')return ['note','avis','review','rating'].includes(type)||type.endsWith(' note');
 if(filter==='added')return ['collection','materiel','added'].includes(type);
 if(filter==='posts')return item.source==='posts'||['post','publication'].includes(type);
 return false;
}
