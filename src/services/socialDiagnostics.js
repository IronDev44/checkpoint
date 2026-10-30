import {auth} from '../firebase';
const recent=new Map();
const operations=new Set(['search','friendships','socialControls','socialReactions','sharedGames','socialReports','friendPolls','friendChallenges','gameRecommendations','profile']);
export async function reportSocialNetworkIssue(operation,error){
 if(!operations.has(operation)||error?.status||!auth.currentUser||navigator.onLine===false)return;
 const key=`${auth.currentUser.uid}:${operation}`,now=Date.now();if(now-(recent.get(key)||0)<60000)return;recent.set(key,now);
 const user=auth.currentUser,controller=new AbortController(),timer=setTimeout(()=>controller.abort(),5000);
 try{const token=await user.getIdToken();if(auth.currentUser?.uid!==user.uid)return;await fetch('/api/account-data?collection=socialDiagnostics',{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({operation,status:['AbortError','TimeoutError'].includes(error?.name)?408:0}),signal:controller.signal});}catch{/* No error message or personal payload is sent. */}finally{clearTimeout(timer);}
}
