import {useEffect,useState} from 'react';
import {selectionRequest,challengeRequest,recommendationRequest,predictionRequest} from '../services/rendezvousRequest';
import {rendezvousUpdates} from '../services/rendezvousUpdates';
export default function useRendezvousUpdates({enabled,accountUid,games,value,preferences}) {
 const [data,setData]=useState({rounds:[],challenges:[],recommendations:[],predictions:[]}),[loadedUid,setLoadedUid]=useState(null),[now,setNow]=useState(new Date());
 const selections=preferences?.rendezvous!==false,challenges=preferences?.challenges!==false,recommendations=preferences?.recommendations!==false;
 useEffect(()=>{
  let active=true,busy=false,last=0;
  setData({rounds:[],challenges:[],recommendations:[],predictions:[]});setLoadedUid(null);
  if(!enabled||!accountUid)return undefined;
  const load=async(force=false)=>{
   if(!active||busy||document.visibilityState==='hidden'||navigator.onLine===false||(!force&&Date.now()-last<60000))return;
   last=Date.now();busy=true;setNow(new Date());
   const results=await Promise.allSettled([selections?selectionRequest():Promise.resolve({rounds:[]}),challenges?challengeRequest():Promise.resolve({challenges:[]}),recommendations?recommendationRequest():Promise.resolve({recommendations:[]}),selections?predictionRequest():Promise.resolve({predictions:[]})]);
   if(active){setData(old=>Object.fromEntries(['rounds','challenges','recommendations','predictions'].map((key,i)=>[key,results[i].status==='fulfilled'?results[i].value[key]||[]:old[key]])));setLoadedUid(accountUid);}busy=false;
  };
  const focus=()=>load(),changed=()=>load(true);load(true);const timer=setInterval(focus,300000);
  window.addEventListener('focus',focus);window.addEventListener('online',changed);window.addEventListener('checkpoint-rendezvous-changed',changed);
  return()=>{active=false;clearInterval(timer);window.removeEventListener('focus',focus);window.removeEventListener('online',changed);window.removeEventListener('checkpoint-rendezvous-changed',changed);};
 },[enabled,accountUid,selections,challenges,recommendations]);
 return enabled&&accountUid&&loadedUid===accountUid?rendezvousUpdates({...data,games,value,preferences,now}):[];
}
