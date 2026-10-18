import {useCallback,useEffect,useRef,useState} from 'react';
import {auth} from '../firebase';
import {accountsEnabled,d1Enabled} from '../services/accountConfig';
import {syncGamingProgress} from '../services/progressSync';

export function useProgressSync(quiz,goals,trials,onRestore){
 const [status,setStatus]=useState('loading');
 const [revision,setRevision]=useState(0);
 const payload=JSON.stringify({quiz,goals,trials});
 const latest=useRef(payload);latest.current=payload;
 const restore=useRef(onRestore);restore.current=onRestore;
 const retry=useCallback(()=>setRevision(n=>n+1),[]);
 useEffect(()=>{
   if(!accountsEnabled||!d1Enabled){setStatus('local');return;}
   const userId=auth.currentUser?.uid;
   let cancelled=false;
   const controller=new AbortController();
   setStatus('loading');
   const timer=window.setTimeout(async()=>{
     if(cancelled||auth.currentUser?.uid!==userId)return;
     const timeout=window.setTimeout(()=>controller.abort(),20000);
     try{
       const merged=await syncGamingProgress(JSON.parse(payload),controller.signal);
       if(cancelled||auth.currentUser?.uid!==userId)return;
       if(latest.current!==payload){retry();return;}
       restore.current(merged);setStatus('synced');
     }catch{
       if(!cancelled&&auth.currentUser?.uid===userId)setStatus('pending');
     }finally{window.clearTimeout(timeout);}
   },500);
   return()=>{cancelled=true;window.clearTimeout(timer);controller.abort();};
 },[payload,revision,retry]);
 useEffect(()=>{
   const visible=()=>{if(!document.hidden)retry();};
   const timer=window.setInterval(visible,60000);
   window.addEventListener('online',retry);window.addEventListener('focus',retry);document.addEventListener('visibilitychange',visible);
   return()=>{window.clearInterval(timer);window.removeEventListener('online',retry);window.removeEventListener('focus',retry);document.removeEventListener('visibilitychange',visible);};
 },[retry]);
 return {status,retry};
}

export default function ProgressSync({status,retry}){
 if(status==='local')return null;
 return <div className="progress-sync" role="status"><span>{status==='synced'?'Progression synchronisée':status==='loading'?'Synchronisation de la progression…':'Progression gardée sur cet appareil'}</span>{status==='pending'&&<button type="button" onClick={retry}>Réessayer la synchronisation</button>}</div>;
}
