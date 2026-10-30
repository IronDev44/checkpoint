import * as firestore from 'firebase/firestore';
import { auth } from '../firebase';
import { d1Enabled } from './accountConfig';
import { deviceRead, deviceWrite } from './deviceStore';
import {reportSocialNetworkIssue} from './socialDiagnostics';
export { d1Enabled } from './accountConfig';
const listeners=new Map();
const privateNames=new Set(['games','hardware','gameCollections','playerProgress','playerPrivateSettings']);
const editable=new Set(['games','hardware','playerPrivateSettings']);
const recoverableNames=new Set(['games','hardware']);
const locks=new Map();
let syncing;
const changed=()=>window.dispatchEvent(new Event('checkpoint-device-change'));
function reference(collection,id){return {collection,id,type:'d1',path:id?`${collection}/${id}`:collection};}
export const collection=(db,...parts)=>d1Enabled?reference(parts[0]):firestore.collection(db,...parts);
export const doc=(db,...parts)=>d1Enabled?reference(parts[0],parts[1]):firestore.doc(db,...parts);
async function request(ref,method='GET',body,owner=auth.currentUser?.uid,extra=''){
  if(navigator.onLine===false)throw new Error('Appareil hors ligne.');
  const user=auth.currentUser;if(!user||user.uid!==owner)throw new Error('Connexion nécessaire.');
  const token=await user.getIdToken();if(auth.currentUser?.uid!==owner)throw new Error('Compte changé.');
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),20000);
  try{const result=await fetch(`/api/account-data?collection=${encodeURIComponent(ref.collection)}${ref.id?`&id=${encodeURIComponent(ref.id)}`:''}${extra}`,{method,headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined,cache:'no-store',signal:controller.signal});const data=await result.json();if(auth.currentUser?.uid!==owner){const error=new Error('Compte changé.');error.status=401;throw error;}if(!result.ok){const error=new Error(data.error||'Enregistrement impossible.');error.status=result.status;throw error;}return data;}catch(error){if(ref.collection==='publicProfiles'&&auth.currentUser?.uid===owner)void reportSocialNetworkIssue('profile',error);throw error;}finally{clearTimeout(timer);}
}
function snapshot(data){return {id:data.id,exists:()=>data.exists!==false,data:()=>data.data};}
function refresh(name,localOnly=false){for(const fn of listeners.get(name)||[])fn(localOnly);}
async function locked(owner,fn){const prior=locks.get(owner)||Promise.resolve();const task=prior.catch(()=>{}).then(fn);locks.set(owner,task);try{return await task;}finally{if(locks.get(owner)===task)locks.delete(owner);}}
const fieldValue=(data,key)=>key.split('.').reduce((value,part)=>value?.[part],data)??null;
export function applyLocalJob(previous,job){
  if(job.method==='DELETE')return null;
  let result=['replace','recovery'].includes(job.body.mode)?{}:{...(previous||{})};
  for(const [field,value] of Object.entries(job.body.data||{})){
    const parts=job.body.mode==='update'?field.split('.'):[field];let target=result;
    for(const part of parts.slice(0,-1)){target[part]={...(target[part]||{})};target=target[part];}
    const key=parts.at(-1);
    if(value?.__checkpointOperation==='union')target[key]=Array.from(new Set([...(target[key]||[]),...value.values]));
    else if(value?.__checkpointOperation==='timestamp')target[key]=job.createdAt;
    else target[key]=value;
  }
  return result;
}
async function localCollection(owner,name){
  const cache=await deviceRead(owner,`cache:${name}`);const jobs=await deviceRead(owner,'jobs')||[];if(!cache&&!jobs.some(j=>j.ref.collection===name))return null;
  const values=new Map((cache?.documents||[]).map(d=>[d.id,d]));
  for(const job of jobs){if(job.ref.collection!==name)continue;if(!values.has(job.ref.id)){const saved=await deviceRead(owner,`doc:${job.ref.path}`);if(saved?.exists)values.set(job.ref.id,{id:job.ref.id,data:saved.data});}const data=applyLocalJob(values.get(job.ref.id)?.data,job);if(data)values.set(job.ref.id,{id:job.ref.id,data});else values.delete(job.ref.id);}
  return {documents:[...values.values()]};
}
export async function offlineState(){const owner=auth.currentUser?.uid;if(!owner)return {jobs:[],enabled:true};return {jobs:await deviceRead(owner,'jobs')||[],enabled:(await deviceRead(owner,'offline-enabled'))!==false};}
export async function setOfflineEnabled(enabled){const owner=auth.currentUser?.uid;if(!owner)return;await deviceWrite(owner,'offline-enabled',enabled);changed();}
export async function discardConflict(collectionName,id){
  const owner=auth.currentUser?.uid;if(!owner)return;
  await locked(owner,async()=>{const jobs=await deviceRead(owner,'jobs')||[];await deviceWrite(owner,'jobs',jobs.filter(j=>j.ref.collection!==collectionName||j.ref.id!==id));});
  changed();refresh(collectionName);await syncOffline();if(collectionName==='playerPrivateSettings')window.dispatchEvent(new Event('checkpoint-settings-resolved'));
}
export async function keepLocalConflict(name,id){
  await syncOffline();
  const owner=auth.currentUser?.uid;if(!owner)throw new Error('Connexion nécessaire.');
  const ref=reference(name,id),remote=await request(ref,'GET',undefined,owner);
  if(!remote.exists)throw new Error('Cette fiche a été supprimée. Restaure-la depuis la corbeille avant de réappliquer tes changements.');
  await locked(owner,async()=>{
    const jobs=await deviceRead(owner,'jobs')||[],selected=jobs.filter(j=>j.ref.path===ref.path);
    if(!selected.length)return;
    const data=selected.reduce((value,job)=>applyLocalJob(value,job),remote.data);
    const job={id:crypto.randomUUID(),ref,method:data?'POST':'DELETE',body:{...(data?{mode:'replace',data}:{}),expected:remote.data},createdAt:new Date().toISOString()};
    await deviceWrite(owner,'jobs',[...jobs.filter(j=>j.ref.path!==ref.path),job]);
  });
  changed();refresh(name);await syncOffline();if(name==='playerPrivateSettings')window.dispatchEvent(new Event('checkpoint-settings-resolved'));
}
export async function syncOffline(){
  if(!d1Enabled||!auth.currentUser||navigator.onLine===false)return;
  if(syncing){await syncing;if(auth.currentUser)return syncOffline();return;}
  const owner=auth.currentUser.uid;
  syncing=(async()=>{
    const jobs=await deviceRead(owner,'jobs')||[];const blocked=new Set(),touched=new Set();
    for(const job of jobs){
      if(auth.currentUser?.uid!==owner)break;
      const key=job.ref.path;if(blocked.has(key))continue;
      try{
        const acknowledgement=await request(job.ref,job.method,job.body,owner);
        await locked(owner,async()=>{
          const cache=await deviceRead(owner,`cache:${job.ref.collection}`)||{documents:[]};
          const previous=cache.documents.find(d=>d.id===job.ref.id)?.data;
          const data=job.method==='DELETE'?null:acknowledgement.data||applyLocalJob(previous,job);
          cache.documents=cache.documents.filter(d=>d.id!==job.ref.id);if(data)cache.documents.push({id:job.ref.id,data});
          await deviceWrite(owner,`cache:${job.ref.collection}`,cache);
          await deviceWrite(owner,`doc:${job.ref.path}`,{id:job.ref.id,exists:!!data,data});
          await deviceWrite(owner,'jobs',(await deviceRead(owner,'jobs')||[]).filter(j=>j.id!==job.id));
        });
        touched.add(job.ref.collection);changed();
      }catch(error){
        await locked(owner,async()=>{const current=await deviceRead(owner,'jobs')||[];await deviceWrite(owner,'jobs',current.map(j=>j.id===job.id?{...j,error:error.message,conflict:[404,409,410].includes(error.status)}:j));});
        changed();blocked.add(key);if(!error.status||error.status===401||error.status>=500)break;
      }
    }
    for(const name of touched)refresh(name);
  })();
  try{await syncing;}finally{syncing=null;}
}
if(typeof window!=='undefined')window.addEventListener('online',()=>{syncOffline().catch(()=>{});for(const name of privateNames)refresh(name);});
export function onSnapshot(ref,callback,onError){
  if(!d1Enabled)return firestore.onSnapshot(ref,callback,onError);
  const owner=auth.currentUser?.uid;let active=true,busy=false,pending=false;
  const emit=data=>{if(active&&auth.currentUser?.uid===owner)callback(ref.id?snapshot(data.documents.find(d=>d.id===ref.id)||{id:ref.id,exists:false,data:null}):{docs:data.documents.map(snapshot)});};
  const load=async(localOnly=false)=>{
    if(!active||auth.currentUser?.uid!==owner)return;if(busy){if(!localOnly)pending=true;return;}busy=true;
    try{
      if(privateNames.has(ref.collection)){try{const local=await localCollection(owner,ref.collection);if(local)emit(local);}catch{/* An unavailable device store must not prevent online access. */}}
      if(localOnly)return;
      const data=await request(reference(ref.collection), 'GET',undefined,owner);
      if(privateNames.has(ref.collection)){try{await locked(owner,()=>deviceWrite(owner,`cache:${ref.collection}`,data));emit(await localCollection(owner,ref.collection));}catch{emit(data);}}else emit(data);
    }catch(error){if(active)onError?.(error);}finally{busy=false;if(pending){pending=false;load();}}
  };
  if(!listeners.has(ref.collection))listeners.set(ref.collection,new Set());listeners.get(ref.collection).add(load);
  load();syncOffline().catch(()=>{});
  const focus=()=>{load();syncOffline().catch(()=>{});};window.addEventListener('focus',focus);
  return()=>{active=false;listeners.get(ref.collection)?.delete(load);window.removeEventListener('focus',focus);};
}
async function documentView(owner,ref,base){
  const jobs=(await deviceRead(owner,'jobs')||[]).filter(job=>job.ref.path===ref.path);
  const data=jobs.reduce((value,job)=>applyLocalJob(value,job),base?.exists===false?null:base?.data??null);
  return {id:ref.id,exists:data!==null,data};
}
export async function getDoc(ref){
  if(!d1Enabled)return firestore.getDoc(ref);
  const owner=auth.currentUser?.uid;if(!owner)throw new Error('Connexion nécessaire.');
  try{
    if(privateNames.has(ref.collection))await syncOffline().catch(()=>{});
    const result=await request(ref);
    if(privateNames.has(ref.collection))try{await deviceWrite(owner,`doc:${ref.path}`,result);const local=await documentView(owner,ref,result);if(auth.currentUser?.uid===owner)return snapshot(local);}catch{/* Online reads remain available without a device cache. */}
    if(auth.currentUser?.uid!==owner)throw Object.assign(new Error('Compte changé.'),{status:401});
    return snapshot(result);
  }catch(error){
    if((!error.status||error.status>=500||error.status===429)&&privateNames.has(ref.collection)){
      const collectionCache=await deviceRead(owner,`cache:${ref.collection}`);
      const row=collectionCache?.documents.find(d=>d.id===ref.id);
      const cached=row?{...row,exists:true}:await deviceRead(owner,`doc:${ref.path}`);
      const local=await documentView(owner,ref,cached);
      if((cached||local.exists)&&auth.currentUser?.uid===owner)return snapshot(local);
    }
    throw error;
  }
}

async function write(ref,method,body){
  if(body)body=JSON.parse(JSON.stringify(body));
  const owner=auth.currentUser?.uid;if(!owner)throw new Error('Connexion nécessaire.');
  const offlineEnabled=editable.has(ref.collection)?await deviceRead(owner,'offline-enabled').catch(()=>false):false;
  if(!editable.has(ref.collection)||offlineEnabled===false){await request(ref,method,body,owner);refresh(ref.collection);return;}
  await locked(owner,async()=>{
    const local=await localCollection(owner,ref.collection);
    const previous=local?.documents.find(d=>d.id===ref.id)?.data||(await deviceRead(owner,`doc:${ref.path}`))?.data;
    // Reconnection compares only the edited fields; another device's unrelated edits survive.
    const base=['update','merge'].includes(body?.mode)?Object.fromEntries(Object.keys(body.data).filter(key=>key!=='updatedAt').map(key=>[key,fieldValue(previous,key)])):null;
    const job={id:crypto.randomUUID(),ref,method,body:{...body,...(base?{base}:{}),...(method==='DELETE'?{expected:previous??null}:{}),...(body?.mode==='replace'?{expected:previous??null}:{})},createdAt:new Date().toISOString()};
    const previousJobs=await deviceRead(owner,'jobs')||[];
    await deviceWrite(owner,'jobs',[...previousJobs.filter(j=>body?.mode!=='recovery'||j.ref.path!==ref.path),job]);
  });
  changed();refresh(ref.collection,true);await syncOffline();
  return {queued:(await deviceRead(owner,'jobs')||[]).some(j=>j.ref.path===ref.path)};
}
export async function setDoc(ref,data,options){if(!d1Enabled)return firestore.setDoc(ref,data,options);return write(ref,'POST',{data,mode:options?.recovery?'recovery':options?.merge?'merge':'replace'});}
export async function updateDoc(ref,data){if(!d1Enabled)return firestore.updateDoc(ref,data);return write(ref,'POST',{data,mode:'update'});}
export async function deleteDoc(ref){if(!d1Enabled)return firestore.deleteDoc(ref);return write(ref,'DELETE');}
export async function addDoc(ref,data){if(!d1Enabled)return firestore.addDoc(ref,data);const result=reference(ref.collection,crypto.randomUUID());await setDoc(result,data);return result;}
export async function listTrash(){await syncOffline();const documents=[];for(const name of recoverableNames){const result=await request(reference(name),'GET',undefined,auth.currentUser?.uid,'&trash=1');documents.push(...result.documents.map(d=>({...d,collection:name})));}return documents.sort((a,b)=>b.data._deletedAt.localeCompare(a.data._deletedAt));}
export async function restoreTrash(name,id){await syncOffline();if((await offlineState()).jobs.some(j=>j.ref.collection===name&&j.ref.id===id))throw new Error('Règle d’abord les modifications en attente pour cette fiche.');await request(reference(name,id),'POST',{mode:'restore',data:{}});refresh(name);}
export const arrayUnion=(...values)=>d1Enabled?{__checkpointOperation:'union',values}:firestore.arrayUnion(...values);
export const serverTimestamp=()=>d1Enabled?{__checkpointOperation:'timestamp'}:firestore.serverTimestamp();
