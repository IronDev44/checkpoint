import {auth} from '../firebase';
export async function pollRequest(action='list',payload={}){
 const user=auth.currentUser;if(!user)throw new Error('Connecte-toi pour retrouver les sondages.');
 if(navigator.onLine===false)throw new Error('Les sondages nécessitent une connexion Internet.');
 const token=await user.getIdToken();if(auth.currentUser?.uid!==user.uid)throw new Error('Compte changé.');
 const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),15000);
 try{
  const result=await fetch(`/api/account-data?collection=friendPolls${payload.id?`&id=${encodeURIComponent(payload.id)}`:''}`,{method:action==='list'?'GET':action==='delete'?'DELETE':'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},cache:'no-store',signal:controller.signal,...(action!=='list'&&action!=='delete'?{body:JSON.stringify({...payload,action})}:{})});
  const data=await result.json();if(auth.currentUser?.uid!==user.uid)throw new Error('Compte changé.');if(!result.ok)throw new Error(data.error||'Sondage indisponible.');return data;
 }catch(error){if(error.name==='AbortError')throw new Error('Le chargement prend trop de temps. Réessaie.');throw error;}finally{clearTimeout(timeout);}
}
