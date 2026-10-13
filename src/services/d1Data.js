import * as firestore from "firebase/firestore";
import { auth } from "../firebase";
import { d1Enabled } from "./accountConfig";
export { d1Enabled } from "./accountConfig";
const listeners=new Map();
function reference(collection,id){return {collection,id,type:"d1",path:id?`${collection}/${id}`:collection};}
export const collection=(db,...parts)=>d1Enabled?reference(parts[0]):firestore.collection(db,...parts);
export const doc=(db,...parts)=>d1Enabled?reference(parts[0],parts[1]):firestore.doc(db,...parts);
async function request(ref,method="GET",body){
  const user=auth.currentUser;if(!user)throw new Error("Connexion nécessaire.");
  const token=await user.getIdToken();const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),20000);
  try{const result=await fetch(`/api/account-data?collection=${encodeURIComponent(ref.collection)}${ref.id?`&id=${encodeURIComponent(ref.id)}`:""}`,{method,headers:{Authorization:`Bearer ${token}`,"Content-Type":"application/json"},body:body?JSON.stringify(body):undefined,cache:"no-store",signal:controller.signal});const data=await result.json();if(!result.ok)throw new Error(data.error||"Enregistrement impossible.");return data;}finally{clearTimeout(timer);}
}
function snapshot(data){return {id:data.id,exists:()=>data.exists!==false,data:()=>data.data};}
function refresh(name){for(const fn of listeners.get(name)||[])fn();}
export function onSnapshot(ref,callback,onError){
  if(!d1Enabled)return firestore.onSnapshot(ref,callback,onError);
  let active=true;let busy=false;let pending=false;
  const load=async()=>{if(!active)return;if(busy){pending=true;return;}busy=true;try{const data=await request(ref);if(active)callback(ref.id?snapshot(data):{docs:data.documents.map(snapshot)});}catch(e){if(active)onError?.(e);}finally{busy=false;if(pending){pending=false;load();}}};
  if(!listeners.has(ref.collection))listeners.set(ref.collection,new Set());listeners.get(ref.collection).add(load);load();
  const focus=()=>load();window.addEventListener("focus",focus);
  return ()=>{active=false;listeners.get(ref.collection)?.delete(load);window.removeEventListener("focus",focus);};
}
export const getDoc=async ref=>d1Enabled?snapshot(await request(ref)):firestore.getDoc(ref);
export async function setDoc(ref,data,options){if(!d1Enabled)return firestore.setDoc(ref,data,options);await request(ref,"POST",{data,mode:options?.merge?"merge":"replace"});refresh(ref.collection);}
export async function updateDoc(ref,data){if(!d1Enabled)return firestore.updateDoc(ref,data);await request(ref,"POST",{data,mode:"update"});refresh(ref.collection);}
export async function deleteDoc(ref){if(!d1Enabled)return firestore.deleteDoc(ref);await request(ref,"DELETE");refresh(ref.collection);}
export async function addDoc(ref,data){if(!d1Enabled)return firestore.addDoc(ref,data);const result=reference(ref.collection,crypto.randomUUID());await setDoc(result,data);return result;}
export const arrayUnion=(...values)=>d1Enabled?{__checkpointOperation:"union",values}:firestore.arrayUnion(...values);
export const serverTimestamp=()=>d1Enabled?{__checkpointOperation:"timestamp"}:firestore.serverTimestamp();
