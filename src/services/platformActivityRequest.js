import {auth} from '../firebase';
export async function requestPlatformActivity(gameId,provider,{signal}={}){
 const user=auth.currentUser;if(!user)throw Error('Connecte-toi pour actualiser ce jeu.');
 const token=await user.getIdToken();if(auth.currentUser?.uid!==user.uid)throw Error('Le compte a changé.');
 const controller=new AbortController(),relay=()=>controller.abort();if(signal?.aborted)controller.abort();else signal?.addEventListener('abort',relay,{once:true});const timer=setTimeout(()=>controller.abort(),25000);
 try{
  const response=await fetch(`/api/platform/game-activity?id=${encodeURIComponent(gameId)}&provider=${provider}`,{headers:{Authorization:`Bearer ${token}`},credentials:'same-origin',cache:'no-store',signal:controller.signal});
  if(!(response.headers.get('content-type')||'').includes('application/json'))throw Error('L’actualisation des plateformes n’est pas disponible ici.');
  const data=await response.json();if(auth.currentUser?.uid!==user.uid)throw Error('Le compte a changé.');if(!response.ok)throw Error(data?.error||'Cette plateforme est indisponible.');if(data?.provider!==provider||!data?.game||!data?.profileId||!Number.isFinite(Date.parse(data.updatedAt)))throw Error('La plateforme a renvoyé un relevé incomplet. Les anciennes données sont conservées.');return data;
 }catch(error){if(error.name==='AbortError')throw Error('L’actualisation prend trop de temps. Réessaie plus tard.');if(error instanceof TypeError)throw Error('La plateforme est inaccessible. Vérifie ta connexion Internet et réessaie.');throw error;}finally{clearTimeout(timer);signal?.removeEventListener('abort',relay);}
}
