const fs = require('fs');
const path = require('path');
const project = 'game-tracker-a1e22';
const ownerEmail = 'bodyjordan@gmail.com';
const privateNames = ['games','hardware','gameCollections','playerPrivateSettings','playerProgress'];
const base = `https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/documents`;
async function main() {
  const config = JSON.parse(fs.readFileSync(path.join(process.env.USERPROFILE,'.config/configstore/firebase-tools.json')));
  async function api(url, method='GET', body) {
    const r = await fetch(url, {method, headers:{Authorization:`Bearer ${config.tokens.access_token}`,'Content-Type':'application/json'},body:body ? JSON.stringify(body):undefined});
    const data = await r.json(); if (!r.ok) throw new Error(`${method} ${new URL(url).pathname}: ${r.status} ${data.error?.message || ''}`); return data;
  }
  async function list(name) {
    const docs=[]; let token;
    do { const data=await api(`${base}/${name}?pageSize=300${token ? `&pageToken=${encodeURIComponent(token)}`:''}`); docs.push(...(data.documents||[]));token=data.nextPageToken; } while(token);
    return docs;
  }
  const backup = {project,createdAt:new Date().toISOString(),collections:{}};
  for (const name of [...privateNames,'publicProfiles','news','events']) backup.collections[name]=await list(name);
  const dir=path.join(process.cwd(),'.account-backups');fs.mkdirSync(dir,{recursive:true});
  const backupFile=path.join(dir,`${Date.now()}.json`);fs.writeFileSync(backupFile,JSON.stringify(backup));
  console.log('Sauvegarde locale créée.',JSON.stringify(Object.fromEntries(Object.entries(backup.collections).map(([k,v])=>[k,v.length]))));
  const users=await api(`https://identitytoolkit.googleapis.com/v1/projects/${project}/accounts:lookup`,'POST',{email:[ownerEmail]}).catch(e=>{if(e.message.includes('USER_NOT_FOUND')) return {users:[]};throw e;});
  const owner=users.users?.[0] || await api(`https://identitytoolkit.googleapis.com/v1/projects/${project}/accounts`,'POST',{email:ownerEmail,displayName:'Jordan',emailVerified:false});
  const uid=owner.localId; if(!uid) throw new Error('UID propriétaire manquant.');
  fs.writeFileSync(path.join(dir,'owner.json'),JSON.stringify({uid,email:ownerEmail}));
  console.log('Export terminé. Aucun document Firestore modifié. UID propriétaire:',uid);
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
