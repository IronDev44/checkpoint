import {auth} from '../firebase';
import {reportSocialNetworkIssue} from './socialDiagnostics';
export async function friendshipRequest(action='list',payload={},collection='friendships'){
 const user=auth.currentUser;
 if(!user)throw new Error('Connecte-toi pour retrouver tes invitations.');
 if(navigator.onLine===false)throw new Error('Une connexion Internet est nécessaire pour les invitations.');
 const token=await user.getIdToken();
 if(auth.currentUser?.uid!==user.uid)throw new Error('Le compte a changé.');
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
 try{
  const response=await fetch(`/api/account-data?collection=${collection}${action==='list'&&payload.handle?`&handle=${encodeURIComponent(payload.handle)}`:''}${action==='list'&&payload.cursor?`&cursor=${encodeURIComponent(payload.cursor)}`:''}`,{method:action==='list'?'GET':'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},cache:'no-store',signal:controller.signal,...(action==='list'?{}:{body:JSON.stringify({...payload,action})})});
  const data=await response.json();
  if(auth.currentUser?.uid!==user.uid)throw new Error('Le compte a changé.');
  if(!response.ok)throw Object.assign(new Error(data.error||'Invitation indisponible.'),{status:response.status});
  if(action==='list'&&collection==='friendships'&&(!Array.isArray(data.connections)||data.connections.some(item=>!item?.profile?.handle||!item.id)))throw new Error('Les invitations sont temporairement indisponibles. Réessaie.');
  if(collection==='socialControls'&&(!data.preferences||!Array.isArray(data.blocked)))throw new Error('Les réglages sociaux sont temporairement indisponibles. Réessaie.');
  if(collection==='sharedGames'&&(typeof data.shared!=='boolean'||!Array.isArray(data.games)))throw new Error('La comparaison est temporairement indisponible. Réessaie.');
  if(collection==='socialReactions'&&(!data.reactions||typeof data.reactions!=='object'))throw new Error('Les réactions sont temporairement indisponibles. Réessaie.');
  return data;
 }catch(error){if(auth.currentUser?.uid===user.uid)void reportSocialNetworkIssue(collection,error);if(error.name==='AbortError')throw new Error('Le chargement prend trop de temps. Réessaie.');throw error;}
 finally{clearTimeout(timer);}
}

export const socialControlsRequest=(action='list',payload={})=>friendshipRequest(action,payload,'socialControls');
export const socialReportRequest=(action='list',payload={})=>friendshipRequest(action,payload,'socialReports');
export function friendshipNotices(connections=[]){
 return connections.flatMap(item=>{
  const received=item.status==='pending'&&item.direction==='received',accepted=item.status==='accepted'&&item.direction==='sent';
  if(!received&&!accepted)return [];
  return [{id:`friend-${received?'request':'accepted'}-${item.id}-${item.updatedAt||item.createdAt}`,category:'friends',type:'friendship',priority:received?91:80,title:received?`${item.profile.displayName} souhaite t’ajouter`:`${item.profile.displayName} a accepté ton invitation`,message:received?'Accepte ou refuse cette demande dans Social → Amis.':'Vous pouvez maintenant partager vos jeux.',cta:received?'Voir la demande':'Retrouver mon ami',tab:'social'}];
 });
}

export function mergeConfirmedFriends(current,connections){
 const managed=new Set(connections.map(item=>item.profile.handle));
 const friends=current.filter(friend=>!managed.has(friend.handle));
 for(const item of connections.filter(item=>item.status==='accepted'))friends.push({...current.find(friend=>friend.handle===item.profile.handle),...item.profile,addedAt:item.createdAt});
 return friends;
}
