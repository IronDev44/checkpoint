import {auth} from '../firebase';
export async function searchPublicProfiles(query,signal){
 const user=auth.currentUser;if(!user)throw Error('Connecte-toi pour rechercher des profils.');
 const token=await user.getIdToken();if(auth.currentUser?.uid!==user.uid)throw Error('Le compte a changé.');
 const response=await fetch(`/api/account-data?collection=publicProfiles&search=${encodeURIComponent(query.trim())}`,{headers:{Authorization:`Bearer ${token}`},cache:'no-store',signal});
 const data=await response.json();if(auth.currentUser?.uid!==user.uid)throw Error('Le compte a changé.');
 if(!response.ok)throw Error(data.error||'La recherche est indisponible. Réessaie.');
 if(!Array.isArray(data.profiles))throw Error('La recherche est indisponible. Réessaie.');return data;
}
