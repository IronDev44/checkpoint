import {auth} from '../firebase';
export async function usageRequest(payload){
 const user=auth.currentUser;if(!user)throw Error('Connexion nécessaire.');
 const token=await user.getIdToken();if(auth.currentUser?.uid!==user.uid)throw Error('Le compte a changé.');
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
 try{
  const response=await fetch('/api/account-data?collection=appUsage',{method:payload?'POST':'GET',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},cache:'no-store',signal:controller.signal,...(payload?{body:JSON.stringify(payload)}:{})});
  const data=await response.json();if(auth.currentUser?.uid!==user.uid)throw Error('Le compte a changé.');
  if(!response.ok)throw Error(data.error||'Statistiques indisponibles.');return data;
 }finally{clearTimeout(timer);}
}
// One account across devices. Hidden tabs and idle background sessions do not ping.
export function startUsageTracking(){
 let stopped=false,pending=false,lastSent=0,lastAttempt=0,lastInteraction=Date.now();
 const ping=()=>{
  if(stopped||pending||document.visibilityState==='hidden'||Date.now()-lastSent<5*60000||Date.now()-lastAttempt<60000||Date.now()-lastInteraction>15*60000)return;
  pending=true;lastAttempt=Date.now();usageRequest({action:'visit'}).then(()=>{lastSent=Date.now();}).catch(()=>{}).finally(()=>{pending=false;});
 };
 const interact=()=>{lastInteraction=Date.now();ping();};
 const visible=()=>{if(document.visibilityState!=='hidden')interact();};
 document.addEventListener('pointerdown',interact,{passive:true});document.addEventListener('keydown',interact);document.addEventListener('visibilitychange',visible);
 const interval=setInterval(ping,5*60000);ping();
 return ()=>{stopped=true;clearInterval(interval);document.removeEventListener('pointerdown',interact);document.removeEventListener('keydown',interact);document.removeEventListener('visibilitychange',visible);};
}
