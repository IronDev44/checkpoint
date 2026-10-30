import {auth} from '../firebase';
import {reportSocialNetworkIssue} from './socialDiagnostics';
export async function rendezvousRequest(collection,action='list',payload={}) {
 const user=auth.currentUser;if(!user)throw new Error('Connecte-toi pour participer.');
 if(navigator.onLine===false)throw new Error('Une connexion Internet est nécessaire pour les votes et les défis.');
 const token=await user.getIdToken();if(auth.currentUser?.uid!==user.uid)throw new Error('Le compte a changé.');
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
 try{
  const response=await fetch(`/api/account-data?collection=${encodeURIComponent(collection)}${payload.id?`&id=${encodeURIComponent(payload.id)}`:''}${action==='list'&&payload.month?`&month=${encodeURIComponent(payload.month)}`:''}${action==='list'&&payload.cursor?`&cursor=${encodeURIComponent(payload.cursor)}`:''}${action==='list'&&payload.view?`&view=${encodeURIComponent(payload.view)}`:''}`,{method:action==='list'?'GET':'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},cache:'no-store',signal:controller.signal,...(action!=='list'?{body:JSON.stringify({...payload,action})}:{})});
  const data=await response.json();if(auth.currentUser?.uid!==user.uid)throw new Error('Le compte a changé.');if(!response.ok)throw Object.assign(new Error(data.error||'Ce rendez-vous est indisponible.'),{status:response.status});return data;
 }catch(error){if(auth.currentUser?.uid===user.uid)void reportSocialNetworkIssue(collection,error);if(error.name==='AbortError')throw new Error('Le chargement prend trop de temps. Réessaie.');throw error;}finally{clearTimeout(timer);}
}
export const selectionRequest=(action,payload)=>rendezvousRequest('communitySelections',action,payload);
export const challengeRequest=(action,payload)=>rendezvousRequest('friendChallenges',action,payload);
export const recommendationRequest=(action,payload)=>rendezvousRequest('gameRecommendations',action,payload);
export const predictionRequest=(action,payload)=>rendezvousRequest('gamingPredictions',action,payload);
