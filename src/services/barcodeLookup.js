import {auth} from '../firebase';
export async function lookupBarcode(code,{signal}={}){
 const user=auth.currentUser;if(!user)throw Error('Connecte-toi pour identifier ce code-barres.');
 const token=await user.getIdToken();if(auth.currentUser?.uid!==user.uid)throw Error('Le compte a changé.');
 const controller=new AbortController(),relay=()=>controller.abort();
 if(signal?.aborted)controller.abort();else signal?.addEventListener('abort',relay,{once:true});
 const timer=setTimeout(()=>controller.abort(),15000);
 try{
  const response=await fetch(`/api/account-data?collection=barcodeLookup&code=${encodeURIComponent(code)}`,{headers:{Authorization:`Bearer ${token}`},cache:'no-store',signal:controller.signal});
  if(!(response.headers.get('content-type')||'').includes('application/json'))throw Error('Le service de codes-barres n’est pas disponible ici. La recherche par nom reste possible.');
  const data=await response.json();if(auth.currentUser?.uid!==user.uid)throw Error('Le compte a changé.');if(!response.ok)throw Error(data?.error||'Code-barres indisponible.');if(!Array.isArray(data?.items))throw Error('Le catalogue de codes-barres a renvoyé une réponse inexploitable.');return data;
 }catch(error){if(error.name==='AbortError')throw Error('Recherche interrompue ou trop longue. Tu peux rechercher le jeu par son nom.');throw error;}
 finally{clearTimeout(timer);signal?.removeEventListener('abort',relay);}
}
