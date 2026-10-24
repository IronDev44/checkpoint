import {useEffect,useRef,useState} from 'react';
import {friendshipRequest} from '../services/friendships';
import './SocialReactions.css';
export const REACTION_LABELS={'well-played':'Bien joué','interested':'Ça me tente','great-choice':'Excellent choix'};
export function useSocialReactions(profiles){
 const [data,setData]=useState({}),[busy,setBusy]=useState(''),[error,setError]=useState('');
 const handles=[...new Set(profiles.map(p=>p.handle).filter(Boolean))].sort().join(',');
 const revision=profiles.map(p=>`${p.handle}:${p.updatedAt||''}:${(p.recentActivity||[]).map(item=>item.id).join('|')}`).sort().join(',');
 const generation=useRef(0),loadRevision=useRef(0),lock=useRef(false);
 useEffect(()=>{
  const version=++generation.current;setData({});setBusy('');setError('');lock.current=false;
  const load=()=>{if(lock.current)return;const pass=++loadRevision.current;return Promise.all(handles.split(',').filter(Boolean).map(async handle=>{
   try{const result=await friendshipRequest('list',{handle},'socialReactions');return [handle,result];}catch{return [handle,null];}
  })).then(entries=>{if(generation.current===version&&pass===loadRevision.current)setData(Object.fromEntries(entries));});};
  load();window.addEventListener('checkpoint-social-changed',load);window.addEventListener('focus',load);
  return()=>{generation.current++;window.removeEventListener('checkpoint-social-changed',load);window.removeEventListener('focus',load);};
 },[handles,revision]);
 const react=async(handle,activityId,value)=>{
  if(lock.current)return;const version=generation.current;loadRevision.current++;lock.current=true;setBusy(`${handle}:${activityId}`);setError('');
  try{const result=await friendshipRequest('react',{handle,activityId:String(activityId),value},'socialReactions');if(version===generation.current)setData(old=>({...old,[handle]:result}));}
  catch(e){if(version===generation.current)setError(e.message);}
  finally{if(version===generation.current){lock.current=false;setBusy('');}}
 };
 return {data,busy,error,react};
}
export default function SocialReactions({handle,activityId,resource}){
 const entry=resource.data[handle];if(!entry?.reactions?.[String(activityId)])return null;
 const reaction=entry.reactions[String(activityId)];
 return <div className="social-reactions" role="group" aria-label="Réactions à cette activité">
  {Object.entries(REACTION_LABELS).map(([value,label])=><button type="button" key={value} aria-pressed={reaction.mine===value} disabled={!entry.canReact||!!resource.busy} onClick={()=>resource.react(handle,activityId,reaction.mine===value?null:value)}>{label}<span>{reaction.counts[value]||0}</span></button>)}
 </div>;
}
