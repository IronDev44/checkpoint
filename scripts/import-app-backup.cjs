const fs=require('fs');const path=require('path');const {importSql}=require('./d1-import-data.cjs');
const source=process.argv[2];if(!source)throw new Error('Fichier de sauvegarde requis.');
const dir=path.join(process.cwd(),'.account-backups');fs.mkdirSync(dir,{recursive:true});
const owner=JSON.parse(fs.readFileSync(path.join(dir,'owner.json')));const backup=JSON.parse(fs.readFileSync(source));
if(backup.version!==1||!Array.isArray(backup.games)||!Array.isArray(backup.hardware)||!backup.socialProfile||!backup.options)throw new Error('Sauvegarde non reconnue.');
const rows=[];
for(const name of ['games','hardware']){
  const ids=new Set();for(const doc of backup[name]){const {id,...data}=doc;if(typeof id!=='string'||!id||id.includes('/')||ids.has(id))throw new Error(`Identifiant incorrect ou doublon : ${name}`);ids.add(id);rows.push({owner:owner.uid,collection:name,id,data:JSON.stringify(data)});}
}
const settings={appOptions:backup.options,socialProfile:backup.socialProfile,socialFriends:backup.socialFriends||[]};
rows.push({owner:owner.uid,collection:'playerPrivateSettings',id:'main',data:JSON.stringify(settings)});
if(backup.socialProfile.visibility==='public'&&backup.socialProfile.handle){
  // Only deliberately public identity fields are migrated to the shared directory.
  const p=backup.socialProfile;rows.push({owner:'__shared__',collection:'publicProfiles',id:p.handle,data:JSON.stringify({ownerUid:owner.uid,handle:p.handle,displayName:p.displayName,bio:p.bio||'',visibility:'public'})});
}
fs.copyFileSync(source,path.join(dir,'original-app-backup.json'));
fs.writeFileSync(path.join(dir,'import.sql'),importSql(rows));
fs.writeFileSync(path.join(dir,'expected-d1.json'),JSON.stringify(rows));
console.log('Import prêt :',JSON.stringify(rows.reduce((c,r)=>{c[r.collection]=(c[r.collection]||0)+1;return c;},{})));
