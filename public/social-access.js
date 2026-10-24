export const readSocialDocument=async(db,owner,collection,id)=>{const row=await db.prepare('SELECT data FROM documents WHERE owner=? AND collection=? AND id=?').bind(owner,collection,id).first();return row?JSON.parse(row.data):null;};
export const socialDefaults={invitations:true,recommendations:true,challenges:true,reactions:true,sharedLibrary:false};
export const socialPreferences=data=>Object.fromEntries(Object.entries(socialDefaults).map(([key,fallback])=>[key,typeof data?.preferences?.[key]==='boolean'?data.preferences[key]:fallback]));
export async function socialPairId(a,b){const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify([a,b].sort())));return Array.from(new Uint8Array(hash),v=>v.toString(16).padStart(2,'0')).join('');}
export async function socialBlocked(db,a,b){if(!a||!b)return true;const [left,right]=await Promise.all([readSocialDocument(db,a,'socialControls','main'),readSocialDocument(db,b,'socialControls','main')]);return !!(left?.blocked?.[b]||right?.blocked?.[a]);}
export async function confirmedFriends(db,a,b){
 const relation=await readSocialDocument(db,'__shared__','friendships',await socialPairId(a,b));
 if(relation)return relation.status==='accepted';
 // Preserve mutual friendships from before invitations existed, without trusting a one-sided list.
 const [left,right]=await Promise.all([readSocialDocument(db,a,'playerPrivateSettings','main'),readSocialDocument(db,b,'playerPrivateSettings','main')]);
 const ah=left?.socialProfile?.handle,bh=right?.socialProfile?.handle;
 if(!ah||!bh||!left?.socialFriends?.some(f=>f.handle===bh)||!right?.socialFriends?.some(f=>f.handle===ah))return false;
 const [ap,bp]=await Promise.all([readSocialDocument(db,'__shared__','publicProfiles',ah),readSocialDocument(db,'__shared__','publicProfiles',bh)]);
 return ap?.ownerUid===a&&bp?.ownerUid===b;
}
export async function canContact(db,sender,recipient,kind){
 if(sender===recipient||await socialBlocked(db,sender,recipient))return false;
 const controls=await readSocialDocument(db,recipient,'socialControls','main');
 if(!socialPreferences(controls)[kind])return false;
 return kind==='invitations'||await confirmedFriends(db,sender,recipient);
}
export async function canReadSocialProfile(db,reader,profile,authority){
 if(!profile?.ownerUid)return !profile?.visibility||profile.visibility==='public';
 if(profile.ownerUid===reader)return true;
 if(await socialBlocked(db,reader,profile.ownerUid))return false;
 if(authority===undefined){const settings=await readSocialDocument(db,profile.ownerUid,'playerPrivateSettings','main');authority=settings?.socialProfile;}
 const modes=[profile.visibility,authority?.visibility].filter(Boolean);
 if(modes.some(mode=>!['public','friends'].includes(mode)))return false;
 return !modes.includes('friends')||await confirmedFriends(db,reader,profile.ownerUid);
}
