import {useCallback,useEffect,useRef,useState} from 'react';
import {friendshipRequest} from '../services/friendships';

export default function useFriendships({accountUid,enabled,onSync}){
 const [connections,setConnections]=useState([]),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const sequence=useRef(0),lock=useRef(false),active=useRef(false),sync=useRef(onSync),owner=useRef(accountUid);
 sync.current=onSync;owner.current=accountUid;
 const refresh=useCallback(async()=>{
  if(!enabled||!accountUid||!active.current)return;
  const version=++sequence.current;
  try{
   const data=await friendshipRequest();
   if(active.current&&version===sequence.current&&owner.current===accountUid){setConnections(data.connections);sync.current(data.connections);setError('');}
  }catch(e){if(active.current&&version===sequence.current&&owner.current===accountUid)setError(e.message);}
 },[accountUid,enabled]);
 useEffect(()=>{
  active.current=true;setConnections([]);setError('');lock.current=false;setBusy(false);
  refresh();
  const visible=()=>{if(document.visibilityState==='visible')refresh();};
  const timer=setInterval(()=>{if(document.visibilityState==='visible')refresh();},60000);
  window.addEventListener('focus',visible);window.addEventListener('online',visible);window.addEventListener('checkpoint-social-changed',visible);document.addEventListener('visibilitychange',visible);
  return()=>{active.current=false;sequence.current++;clearInterval(timer);window.removeEventListener('focus',visible);window.removeEventListener('online',visible);window.removeEventListener('checkpoint-social-changed',visible);document.removeEventListener('visibilitychange',visible);};
 },[refresh]);
 const act=async(action,payload)=>{
  if(!enabled||!active.current||owner.current!==accountUid)throw new Error('Attends la fin du chargement de ton compte.');
  if(lock.current)throw new Error('Une invitation est déjà en cours de traitement.');
  lock.current=true;setBusy(true);setError('');sequence.current++;
  try{const result=await friendshipRequest(action,payload);if(active.current&&owner.current===accountUid)await refresh();return result;}
  catch(e){if(active.current&&owner.current===accountUid)setError(e.message);throw e;}
  finally{if(active.current&&owner.current===accountUid){lock.current=false;setBusy(false);}}
 };
 return {connections,busy,error,refresh,act};
}
