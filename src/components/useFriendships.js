import {useCallback,useEffect,useRef,useState} from 'react';
import {friendshipRequest} from '../services/friendships';

export default function useFriendships({accountUid,enabled,onSync}){
 const [connections,setConnections]=useState([]),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const sequence=useRef(0),lock=useRef(false),active=useRef(false),sync=useRef(onSync),owner=useRef(accountUid);
 const generation=useRef(0);
 sync.current=onSync;owner.current=accountUid;
 const refresh=useCallback(async(force=false,preserveError=false)=>{
  if(!enabled||!accountUid||!active.current||(lock.current&&force!==true))return;
  const version=++sequence.current;
  try{
   const data=await friendshipRequest();
   if(active.current&&version===sequence.current&&owner.current===accountUid){setConnections(data.connections);sync.current(data.connections);if(!preserveError)setError('');}
  }catch(e){if(active.current&&version===sequence.current&&owner.current===accountUid)setError(e.message);}
 },[accountUid,enabled]);
 useEffect(()=>{
  active.current=true;generation.current++;setConnections([]);setError('');lock.current=false;setBusy(false);
  refresh();
  const visible=()=>{if(document.visibilityState==='visible')refresh();};
  const timer=setInterval(()=>{if(document.visibilityState==='visible'&&navigator.onLine!==false)refresh();},30000);
  const storage=event=>{if(event.key==='checkpoint-social-sync')visible();};window.addEventListener('storage',storage);
  window.addEventListener('focus',visible);window.addEventListener('online',visible);window.addEventListener('checkpoint-social-changed',visible);document.addEventListener('visibilitychange',visible);
  return()=>{active.current=false;sequence.current++;clearInterval(timer);window.removeEventListener('storage',storage);window.removeEventListener('focus',visible);window.removeEventListener('online',visible);window.removeEventListener('checkpoint-social-changed',visible);document.removeEventListener('visibilitychange',visible);};
 },[refresh]);
 const act=async(action,payload)=>{
  if(!enabled||!active.current||owner.current!==accountUid)throw new Error('Attends la fin du chargement de ton compte.');
  if(lock.current)throw new Error('Une invitation est déjà en cours de traitement.');
  const started=generation.current;
  lock.current=true;setBusy(true);setError('');sequence.current++;
  try{const result=await friendshipRequest(action,payload);if(active.current&&owner.current===accountUid&&started===generation.current){await refresh(true);try{localStorage.setItem('checkpoint-social-sync',String(Date.now()));}catch{/* Cross-tab refresh is optional when storage is unavailable. */}}return result;}
  catch(e){if(active.current&&owner.current===accountUid&&started===generation.current){setError(e.message);if(e.status===409)await refresh(true,true);}throw e;}
  finally{if(active.current&&owner.current===accountUid&&started===generation.current){lock.current=false;setBusy(false);}}
 };
 return {connections,busy,error,refresh,act};
}
