// Private device data are partitioned by Firebase UID. No account data go in the service worker cache.
let database;
export function openDeviceStore() {
  if (!database) database = new Promise((resolve,reject) => {
    const request = indexedDB.open('checkpoint-device-v1',1);
    request.onupgradeneeded = () => request.result.createObjectStore('records',{keyPath:'key'});
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => { database=null; reject(request.error); };
  });
  return database;
}
export async function deviceRead(owner,kind) {
  const db=await openDeviceStore();
  return new Promise((resolve,reject)=>{
    const request=db.transaction('records').objectStore('records').get(`${owner}:${kind}`);
    request.onsuccess=()=>resolve(request.result?.value);
    request.onerror=()=>reject(request.error);
  });
}
export async function deviceWrite(owner,kind,value) {
  const db=await openDeviceStore();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction('records','readwrite');
    tx.objectStore('records').put({key:`${owner}:${kind}`,value});
    tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);
  });
}
const backupQueues=new Map();
export async function captureBackup(owner,payload,reason='Automatique',force=false) {
  const previous=backupQueues.get(owner)||Promise.resolve();
  const task=previous.catch(()=>{}).then(()=>writeBackup(owner,payload,reason,force));
  backupQueues.set(owner,task);
  try{return await task;}finally{if(backupQueues.get(owner)===task)backupQueues.delete(owner);}
}
async function writeBackup(owner,payload,reason,force) {
  if(!owner)throw new Error('Connexion nécessaire.');
  const versions=await deviceRead(owner,'backups')||[];
  if(!force && versions.some(v=>v.reason==='Automatique'&&v.createdAt.slice(0,10)===new Date().toISOString().slice(0,10)))return;
  const version={id:crypto.randomUUID(),createdAt:new Date().toISOString(),reason,payload:JSON.parse(JSON.stringify(payload))};
  // Keep the last 20 versions, including safety copies made before restoration.
  await deviceWrite(owner,'backups',[version,...versions].slice(0,20));
  window.dispatchEvent(new Event('checkpoint-device-change'));
}
