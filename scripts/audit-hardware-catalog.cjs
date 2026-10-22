const fs=require('node:fs');
const path=require('node:path');
async function inventory(){
 const root=path.resolve(__dirname,'..');
 const index=fs.readFileSync(path.join(root,'src/data/hardware/index.js'),'utf8');
 const files=[...index.matchAll(/from "\.\/([^"\n]+)"/g)].map(match=>match[1]);
 const catalog=[];
 for(const file of files){
  const source=fs.readFileSync(path.join(root,'src/data/hardware',file+'.js'),'utf8');
  const exports=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
  for(const value of Object.values(exports))if(Array.isArray(value))catalog.push(...value.filter(item=>['console','controller'].includes(item.type)));
 }
 const photos=JSON.parse(fs.readFileSync(path.join(root,'src/data/hardware/editionPhotos.json'),'utf8'));
 const rows=catalog.flatMap(model=>(model.variants||[]).flatMap(variant=>(variant.versions||[]).map(version=>({type:model.type,brand:model.brand,catalogId:model.id,variantId:variant.id,versionId:version.id,name:version.name,image:version.image||'',imageExists:!!version.image&&fs.existsSync(path.join(root,'public',version.image)),photos:photos.filter(photo=>photo.type===model.type&&photo.catalogId===model.id&&photo.versionIds.includes(version.id)).length}))));
 const issues=[];
 const seen=new Set();
 for(const row of rows){const key=`${row.type}:${row.catalogId}:${row.versionId}`;if(seen.has(key))issues.push(`Duplicate model: ${key}`);seen.add(key);if(!row.imageExists)issues.push(`Missing image: ${key} ${row.image}`);}
 const photoIds=new Set();
 for(const photo of photos){
  if(photoIds.has(photo.id))issues.push(`Duplicate photo: ${photo.id}`);photoIds.add(photo.id);
  if(!photo.source?.startsWith('https://')||!photo.credit)issues.push(`Missing photo source or credit: ${photo.id}`);
  const file=path.join(root,'public',photo.image);
  if(!fs.existsSync(file))issues.push(`Missing edition photo: ${photo.id}`);
  else {
   const bytes=fs.readFileSync(file);
   const image=bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))||bytes[0]===255&&bytes[1]===216||bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP';
   if(!image||bytes.length<1000)issues.push(`Invalid edition image: ${photo.id}`);
  }
  for(const id of photo.versionIds)if(!rows.some(row=>row.type===photo.type&&row.catalogId===photo.catalogId&&row.versionId===id))issues.push(`Unknown edition target: ${photo.id}/${id}`);
 }
 return {rows,issues,summary:{consoles:rows.filter(row=>row.type==='console').length,controllers:rows.filter(row=>row.type==='controller').length,illustratedModels:rows.filter(row=>row.photos>0).length,editionPhotos:photos.length}};
}
function report(result){
 const {summary,rows,issues}=result;
 const lines=['# Audit du catalogue consoles et manettes','',`État du projet au 22 octobre 2026 : ${summary.consoles} références dans Consoles et ${summary.controllers} dans Manettes. La catégorie Consoles contient aussi les PC et Mac déjà présents dans l’application.`,
 '', '## Contrôles réalisés','',
 'Toutes les références ont été inventoriées et leurs images de base examinées sur une planche de contrôle. Les identifiants, chemins d’images et correspondances des éditions sont contrôlés par `npm run audit:hardware`. Ce contrôle ne certifie pas les caractéristiques internes invisibles sur une photo (capacité, révision matérielle).',
 '',`Le catalogue contient ${summary.editionPhotos} photos d’éditions pour ${summary.illustratedModels} modèles techniques. Les autres références conservent leur photo standard. « À documenter » ne signifie pas qu’aucune édition n’existe : leurs variantes régionales, couleurs et collectors ne sont pas encore vérifiés dans ce catalogue. L’inventaire mondial des éditions reste donc incomplet.`,
 '', '## Corrections','',
 '- Victrix Pro FS-12 : remplacement de la photo à joystick par le véritable modèle sans levier. Ajout des coloris blanc et violet depuis Turtle Beach.',
 '- ROG Ally Z1 Extreme : utilisation du châssis blanc de l’Ally 2023, au lieu de la photo noire de l’Ally X. L’ancien chemin erroné est corrigé à l’affichage dans Matériel ; les photos personnelles restent intactes.',
 '- Switch OLED Splatoon 3 : choix de la vue complète de face plutôt que du seul dock.',
 '', '## Couverture par modèle illustré','', '| Modèle | Photos d’éditions | Source |','| --- | ---: | --- |'];
 const photos=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../src/data/hardware/editionPhotos.json'),'utf8'));
 for(const row of rows.filter(row=>row.photos)){const source=photos.find(photo=>photo.catalogId===row.catalogId&&photo.versionIds.includes(row.versionId)).source;lines.push(`| ${row.name} | ${row.photos} | [Fabricant](${source}) |`);}
 lines.push('', '## Inventaire complet','', '| Type | Marque | Modèle | Identifiant technique | Photo de base | Éditions illustrées |','| --- | --- | --- | --- | --- | --- |');
 for(const row of rows)lines.push(`| ${row.type==='console'?'Consoles':'Manettes'} | ${row.brand} | ${row.name.replaceAll('|','/')} | ${row.versionId} | ${row.imageExists?'Présente':'Manquante'} | ${row.photos||'À documenter'} |`);
 lines.push('', '## Intégrité technique','',...(issues.length?issues.map(issue=>'- '+issue):['Aucun fichier absent, identifiant dupliqué ou lien d’édition vers un modèle inconnu détecté.']), '');
 return lines.join('\n');
}
if(require.main===module)inventory().then(result=>{const output=process.argv[2];if(output==='--report')fs.writeFileSync(process.argv[3],report(result));else if(output)fs.writeFileSync(output,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({summary:result.summary,issues:result.issues},null,2));if(result.issues.length)process.exitCode=1;}).catch(error=>{console.error(error);process.exitCode=1;});
module.exports={inventory};
