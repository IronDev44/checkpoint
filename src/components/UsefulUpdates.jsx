import {useEffect,useState} from 'react';
import {pollRequest} from '../services/friendPolls';
import {buildUsefulUpdates,NOTIFICATION_GROUPS,normalizeNotificationPreferences} from '../services/usefulUpdates';
export function useUsefulUpdates({games,preferences,enabled,request=pollRequest}){
 const [polls,setPolls]=useState([]),[now,setNow]=useState(()=>new Date());
 const wantsPolls=normalizeNotificationPreferences(preferences).polls;
 useEffect(()=>{
  let active=true,inFlight=false,last=0;
  if(!enabled){setPolls([]);return undefined;}
  const load=async(force=false)=>{
   if(!active||inFlight||document.visibilityState==='hidden')return;
   setNow(new Date());if(!wantsPolls||navigator.onLine===false)return;
   if(!force&&Date.now()-last<60000)return;last=Date.now();inFlight=true;
   try{const data=await request();if(active)setPolls(data.polls||[]);}catch{/* Notifications never block the collection; Social offers an explicit retry. */}finally{inFlight=false;}
  };
  const focus=()=>load(),changed=()=>load(true);load(true);
  const timer=setInterval(()=>load(),300000);
  window.addEventListener('focus',focus);window.addEventListener('online',changed);window.addEventListener('checkpoint-polls-changed',changed);document.addEventListener('visibilitychange',focus);
  return()=>{active=false;clearInterval(timer);window.removeEventListener('focus',focus);window.removeEventListener('online',changed);window.removeEventListener('checkpoint-polls-changed',changed);document.removeEventListener('visibilitychange',focus);};
 },[enabled,wantsPolls,request]);
 return buildUsefulUpdates({polls,games,preferences,now});
}
export function NotificationPreferences({value,onChange}){
 const preferences=normalizeNotificationPreferences(value);
 return <div className="notification-preferences"><p>Choisis ce qui apparaît dans la cloche de Checkpoint. Ces notifications restent dans l’appli, sans e-mail ni notification du téléphone.</p>{Object.entries(NOTIFICATION_GROUPS).map(([key,label])=><label key={key}><input type="checkbox" checked={preferences[key]} onChange={e=>onChange({...preferences,[key]:e.target.checked})}/><span>{label}</span></label>)}</div>;
}
