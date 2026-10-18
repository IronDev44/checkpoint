import { auth } from "../firebase";

export async function syncGamingProgress(payload, signal) {
  const user=auth.currentUser;
  if(!user)throw new Error("Connexion nécessaire.");
  const token=await user.getIdToken();
  if(auth.currentUser?.uid!==user.uid)throw new Error("Le compte a changé.");
  for(let attempt=0;attempt<3;attempt+=1){
    const response=await fetch('/api/account-data?collection=playerProgress&id=gaming',{
      method:'POST',signal,cache:'no-store',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},
      body:JSON.stringify({mode:'progress',data:payload}),
    });
    const result=await response.json();
    if(auth.currentUser?.uid!==user.uid)throw new Error("Le compte a changé.");
    if(response.status===409)continue;
    if(!response.ok||!result.data)throw new Error(result.error||"Synchronisation indisponible.");
    return result.data;
  }
  throw new Error("Une modification est en cours sur un autre appareil. Réessaie.");
}
