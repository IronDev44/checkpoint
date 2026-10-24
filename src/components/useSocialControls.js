import {useCallback,useEffect,useRef,useState} from 'react';
import {socialControlsRequest} from '../services/friendships';
export default function useSocialControls({accountUid,enabled,onBlocked}){
 const [data,setData]=useState(null),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const epoch=useRef(0),active=useRef(false),lock=useRef(false),sync=useRef(onBlocked);sync.current=onBlocked;
 const apply=useCallback(value=>{setData(value);sync.current(value.blocked||[]);},[]);
 const refresh=useCallback(async()=>{
  if(!enabled||!accountUid||!active.current||lock.current)return;
  const version=++epoch.current;
  try{const value=await socialControlsRequest();if(active.current&&version===epoch.current){apply(value);setError('');}}
  catch(e){if(active.current&&version===epoch.current)setError(e.message);}
 },[enabled,accountUid,apply]);
 useEffect(()=>{
  active.current=true;setData(null);setError('');setBusy(false);lock.current=false;refresh();
  const visible=()=>{if(document.visibilityState==='visible')refresh();};
  window.addEventListener('focus',visible);window.addEventListener('online',visible);
  const timer=setInterval(visible,60000);
  return()=>{active.current=false;epoch.current++;clearInterval(timer);window.removeEventListener('focus',visible);window.removeEventListener('online',visible);};
 },[refresh]);
 const act=async(action,payload)=>{
  if(!enabled||!active.current||lock.current)throw new Error('Attends la fin du chargement.');
  const version=++epoch.current;lock.current=true;setBusy(true);setError('');
  try{const value=await socialControlsRequest(action,payload);if(active.current&&version===epoch.current){apply(value);window.dispatchEvent(new Event('checkpoint-social-changed'));window.dispatchEvent(new Event('checkpoint-rendezvous-changed'));}return value;}
  catch(e){if(active.current&&version===epoch.current)setError(e.message);throw e;}
  finally{if(active.current&&version===epoch.current){lock.current=false;setBusy(false);}}
 };
 return {data,error,busy,refresh,act};
}
