// Files and static references only: never deletes, downloads or clears rights.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const parser=require('@babel/parser');
const slash=p=>p.replaceAll('\\','/');
function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(dir,e.name)):[slash(path.join(dir,e.name))]);}
const policies=JSON.parse(fs.readFileSync('docs/legal/politiques-visuels.json','utf8')).policies;
const references=new Map(),parseErrors=[];
function add(value,file,line,context={}){
 if(typeof value!=='string'||!value.startsWith('/images/'))return;
 const url=value.split(/[?#]/)[0];
 if(!/\.(png|jpe?g|webp|svg|gif|avif)$/i.test(url))return;
 const refs=references.get(url)||[];
 if(!refs.some(r=>r.file===file&&r.line===line))refs.push({file,line,...context});references.set(url,refs);
}
for(const file of files('src').filter(f=>/\.(js|jsx|json|css)$/.test(f)&&!/(\.test\.|setupTests)/.test(f))){
 const code=fs.readFileSync(file,'utf8');
 if(/\.(js|jsx)$/.test(file)){
  let ast;try{ast=parser.parse(code,{sourceType:'unambiguous',plugins:['jsx']});}catch(e){parseErrors.push({file,error:e.message});continue;}
  function walk(node,context={}){
   if(!node||typeof node!=='object')return;
   if(Array.isArray(node)){node.forEach(n=>walk(n,context));return;}
   let next=context;
   if(node.type==='ObjectExpression'){
    const values={};for(const prop of node.properties||[]){const key=prop.key?.name||prop.key?.value;if(['id','name','brand'].includes(key)&&prop.value?.type==='StringLiteral')values[key]=prop.value.value;}
    next={...context,...values};
   }
   if(node.type==='StringLiteral')add(node.value,file,node.loc?.start.line,next);
   if(node.type==='TemplateLiteral'&&!node.expressions.length)add(node.quasis[0]?.value?.cooked,file,node.loc?.start.line,next);
   for(const [key,value]of Object.entries(node))if(!['loc','start','end','extra','comments','leadingComments','trailingComments','innerComments'].includes(key)&&typeof value==='object')walk(value,next);
  }walk(ast);
 }else{
  const pattern=/\/images\/[A-Za-z0-9_./%() -]+\.(?:png|jpe?g|webp|svg|gif|avif)/g;let match;
  while((match=pattern.exec(code)))add(match[0],file,code.slice(0,match.index).split('\n').length);
 }
}
const provenance=new Map();
const editions=JSON.parse(fs.readFileSync('src/data/hardware/editionPhotos.json','utf8'));
for(const row of editions)for(const key of ['image','originalImage'])if(row[key]){
 const list=provenance.get(row[key])||[];list.push({editionId:row.id,source:row.source,asset:row.asset,credit:row.credit,license:row.license||row.licence||row.permission||''});provenance.set(row[key],list);
}
const tritton=JSON.parse(fs.readFileSync('docs/tritton-photo-sources.json','utf8'));
for(const row of tritton){const filename=`/images/hardware/audio/tritton-${row.slug}.png`;if(fs.existsSync('public'+filename))provenance.set(filename,[{editionId:'tritton-'+row.slug,source:row.source,asset:row.imageUrl,credit:'',license:''}]);}
const images=files('public/images').filter(f=>/\.(png|jpe?g|webp|svg|gif|avif)$/i.test(f));
const assets=images.map(file=>{
 const url='/'+file.slice('public/'.length),sources=provenance.get(url)||[],refs=references.get(url)||[];
 const applicable=policies.filter(p=>url.startsWith('/images/brands/')?p.brandFiles.includes(path.basename(file)):sources.some(row=>{try{const host=new URL(row.source).hostname;return p.hosts.some(domain=>host===domain||host.endsWith('.'+domain));}catch{return false;}}));
 return {file,url,kind:url.startsWith('/images/brands/')?'logo-ou-icone-marque':'image',bytes:fs.statSync(file).size,sha256:crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),references:refs,provenance:sources,policies:applicable.map(p=>p.id),status:sources.some(r=>r.license)?'preuve_de_licence_a_examiner':applicable.length?'politique_examinee_autorisation_a_etablir':'droits_non_documentes',next:applicable.map(p=>p.next).join(' | ')||'Établir provenance et droit applicable ; absence de document ne signifie pas interdiction prouvée.'};
});
const hashes=new Map();for(const item of assets){const group=hashes.get(item.sha256)||[];group.push(item.file);hashes.set(item.sha256,group);}
for(const item of assets)item.identicalFiles=hashes.get(item.sha256).filter(f=>f!==item.file);
const counts={};for(const item of assets)counts[item.status]=(counts[item.status]||0)+1;
const summary={checkedOn:'2026-11-11',imageFiles:assets.length,brandImageFiles:assets.filter(a=>a.kind==='logo-ou-icone-marque').length,withStaticReference:assets.filter(a=>a.references.length).length,withoutStaticReference:assets.filter(a=>!a.references.length).length,withProvenance:assets.filter(a=>a.provenance.length).length,withPolicyReview:assets.filter(a=>a.policies.length).length,missingReferencedFiles:[...references.keys()].filter(url=>!fs.existsSync('public'+url)),duplicateGroups:[...hashes.values()].filter(group=>group.length>1),parseErrors,statusCounts:counts,limits:['Inventaire des images présentes sous public/images, sans accès aux données utilisateur.','Références statiques du code et JSON uniquement ; absence de référence littérale ne prouve pas absence d’usage dynamique.','Les photos distantes, uploads personnels et visuels dessinés dans le code ne sont pas couverts exhaustivement.','Une politique examinée ne prouve ni la provenance du fichier local ni une autorisation.','Le statut des marques et les exceptions légales doivent être examinés selon le contexte.']};
const quote=v=>'"'+String(v??'').replaceAll('"','""')+'"';
const columns=['fichier','type','references_statiques','contexte_marques','provenances','politiques_examinees','statut','suite_a_donner','sha256','copies_identiques'];
const csv=[columns,...assets.map(a=>[a.file,a.kind,a.references.map(r=>`${r.file}:${r.line}`).join(' | '),[...new Set(a.references.map(r=>r.brand).filter(Boolean))].join(' | '),[...new Set(a.provenance.map(r=>r.source))].join(' | '),a.policies.join(' | '),a.status,a.next,a.sha256,a.identicalFiles.join(' | ')])].map(row=>row.map(quote).join(';')).join('\n')+'\n';
fs.writeFileSync('docs/legal/inventaire-visuels-complet.csv','\ufeff'+csv);
fs.writeFileSync('docs/legal/inventaire-visuels-complet.json',JSON.stringify({summary,assets},null,2)+'\n');
console.log(JSON.stringify({...summary,duplicateGroups:summary.duplicateGroups.length,missingReferencedFiles:summary.missingReferencedFiles.length}));
