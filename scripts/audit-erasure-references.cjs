// Read-only aid for an administrator's export. Never connects to any service.
const fs=require('node:fs');
function auditErasureReferences({uid,handles=[],documents=[]}){
 if(typeof uid!=='string'||!uid.trim()||uid.startsWith('__'))throw Error('UID individuel requis.');
 if(!Array.isArray(handles)||!Array.isArray(documents))throw Error('Export invalide.');
 const names=new Set(handles.filter(h=>typeof h==='string'&&h.trim()).map(h=>h.trim().replace(/^@/,'').toLowerCase()));
 const hits=[],invalid=[];
 const escape=s=>String(s).replaceAll('~','~0').replaceAll('/','~1');
 function scalar(value){
  if(value===uid)return 'uid';
  if(typeof value==='string'&&names.has(value.trim().replace(/^@/,'').toLowerCase()))return 'pseudo';
  return null;
 }
 for(const row of documents){
  const identity={owner:row.owner,collection:row.collection,id:row.id};
  if(!['owner','collection','id'].every(key=>typeof row[key]==='string')){invalid.push({reason:'Identité de ligne invalide'});continue;}
  let data=row.data;
  try{if(typeof data==='string')data=JSON.parse(data);}catch{invalid.push({...identity,reason:'JSON invalide'});continue;}
  if(row.owner===uid){hits.push({...identity,kind:'document-du-compte',references:[]});continue;}
  const references=[];
  // A profile's identifier can itself be a handle, even without an ownerUid.
  if(row.collection==='publicProfiles'&&scalar(row.id))references.push({path:'/id',kind:scalar(row.id)});
  const seen=new WeakSet();
  function walk(value,path,depth=0){
   const kind=scalar(value);if(kind)references.push({path,kind});
   if(!value||typeof value!=='object')return;
   if(depth>40){invalid.push({...identity,reason:'Profondeur non analysée'});return;}
   if(seen.has(value))return;seen.add(value);
   for(const [key,child]of Object.entries(value)){
    const childPath=path+'/'+escape(key),keyKind=scalar(key);
    if(keyKind)references.push({path:childPath,kind:keyKind+'-cle'});
    walk(child,childPath,depth+1);
   }
  }
  walk(data,'/data');
  if(references.length)hits.push({...identity,kind:'reference-a-examiner',references});
 }
 return {readOnly:true,uid,documentsScanned:documents.length,ownDocuments:hits.filter(r=>r.kind==='document-du-compte').length,referencingDocuments:hits.filter(r=>r.kind==='reference-a-examiner').length,hits,invalid,limits:['Ne détecte pas exhaustivement les noms, photos, anciens pseudos inconnus ou mentions en texte libre.','Ne couvre pas Firebase Authentication, KV, Gmail, les index SQL ni les copies locales et sauvegardes.','Une référence ne justifie pas automatiquement la suppression du document d’un autre utilisateur.']};
}
module.exports={auditErasureReferences};
if(require.main===module){
 try{
  const file=process.argv[2];if(!file)throw Error('Usage : node scripts/audit-erasure-references.cjs export-prive.json');
  process.stdout.write(JSON.stringify(auditErasureReferences(JSON.parse(fs.readFileSync(file,'utf8'))),null,2)+'\n');
 }catch(error){console.error(error.message);process.exitCode=1;}
}
