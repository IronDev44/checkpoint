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
 const variants=JSON.parse(fs.readFileSync(path.join(root,'src/data/hardware/editionVariants.json'),'utf8'));
 const editions=[...photos,...variants];
 const notes=JSON.parse(fs.readFileSync(path.join(root,'src/data/hardware/editionNotes.json'),'utf8'));
 const rows=catalog.flatMap(model=>(model.variants||[]).flatMap(variant=>(variant.versions||[]).map(version=>({type:model.type,brand:model.brand,catalogId:model.id,variantId:variant.id,versionId:version.id,name:version.name,image:version.image||'',imageExists:!!version.image&&fs.existsSync(path.join(root,'public',version.image)),photos:photos.filter(photo=>photo.type===model.type&&photo.catalogId===model.id&&photo.versionIds.includes(version.id)).length}))));
 for(const row of rows)row.editions=editions.filter(edition=>edition.type===row.type&&edition.catalogId===row.catalogId&&edition.versionIds.includes(row.versionId)).length;
 const issues=[];
 for(const [versionId,note] of Object.entries(notes)){
  if(!rows.some(row=>row.versionId===versionId))issues.push(`Unknown edition note target: ${versionId}`);
  if(!['generic','configurable'].includes(note.status)||!note.message?.trim())issues.push(`Invalid edition note: ${versionId}`);
 }
 const seen=new Set();
 for(const row of rows){const key=`${row.type}:${row.catalogId}:${row.versionId}`;if(seen.has(key))issues.push(`Duplicate model: ${key}`);seen.add(key);if(!row.imageExists)issues.push(`Missing image: ${key} ${row.image}`);}
 const photoIds=new Set();
 for(const photo of editions){
  if(photoIds.has(photo.id))issues.push(`Duplicate photo: ${photo.id}`);photoIds.add(photo.id);
  if(!photo.source?.startsWith('https://')||!photo.credit)issues.push(`Missing photo source or credit: ${photo.id}`);
  if(!['standard','limited','collector','anniversary','custom'].includes(photo.kind)||!photo.name?.trim()||!photo.color?.trim())issues.push(`Invalid edition metadata: ${photo.id}`);
  if(!Array.isArray(photo.versionIds)||!photo.versionIds.length)issues.push(`Missing edition target: ${photo.id}`);
  if(!/^[a-z0-9-]{1,100}$/.test(photo.id)||photo.name?.length>100||photo.color?.length>60)issues.push(`Edition cannot be saved without truncation: ${photo.id}`);
  if(photo.verification==='archive'&&photo.source!==`https://consolevariations.com/collectibles/${photo.archiveId}`)issues.push(`Invalid archive attribution: ${photo.id}`);
  if(photos.includes(photo)&&!photo.image)issues.push(`Missing edition image path: ${photo.id}`);
  const file=photo.image&&path.join(root,'public',photo.image);
  if(file){
  if(!fs.existsSync(file))issues.push(`Missing edition photo: ${photo.id}`);
  else {
   const bytes=fs.readFileSync(file);
   const image=bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))||bytes[0]===255&&bytes[1]===216||bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP';
   if(!image||bytes.length<1000)issues.push(`Invalid edition image: ${photo.id}`);
  }
  }
  for(const id of photo.versionIds||[])if(!rows.some(row=>row.type===photo.type&&row.catalogId===photo.catalogId&&row.versionId===id))issues.push(`Unknown edition target: ${photo.id}/${id}`);
 }
 const identities=new Set();
 for(const edition of editions)for(const version of edition.versionIds||[]){
  const normalize=value=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  const key=[edition.type,edition.catalogId,version,edition.kind,normalize(edition.name),normalize(edition.color)].join(':');
  if(identities.has(key))issues.push(`Duplicate edition metadata: ${edition.id}/${version}`);identities.add(key);
 }
 for(const row of rows){
  const choices=editions.filter(edition=>edition.type===row.type&&edition.catalogId===row.catalogId&&edition.versionIds.includes(row.versionId));
  row.editionScope=notes[row.versionId]?.status||(choices.length?(choices.every(choice=>choice.coverage==='standard-finish')?'standard-finish':'documented'):'not-documented');
 }
 return {rows,issues,summary:{consoles:rows.filter(row=>row.type==='console').length,controllers:rows.filter(row=>row.type==='controller').length,illustratedModels:rows.filter(row=>row.photos>0).length,documentedModels:rows.filter(row=>row.editions>0).length,standardFinishOnlyModels:rows.filter(row=>row.editionScope==='standard-finish').length,editionPhotos:photos.length,documentedEditions:editions.length,editionsAwaitingPhotos:variants.length,archiveEditions:editions.filter(edition=>edition.verification==='archive').length,genericModels:rows.filter(row=>row.editionScope==='generic').length,configurableModels:rows.filter(row=>row.editionScope==='configurable').length,modelsAwaitingDocumentation:rows.filter(row=>row.editionScope==='not-documented').length}};
}
function report(result){
 const {summary,rows,issues}=result;
 const lines=['# Audit du catalogue consoles et manettes','',`État du projet au 22 octobre 2026 : ${summary.consoles} références dans Consoles et ${summary.controllers} dans Manettes. La catégorie Consoles contient aussi les PC et Mac déjà présents dans l’application.`,
 '', '## Contrôles réalisés','',
 'Toutes les références ont été inventoriées et leurs images de base examinées sur une planche de contrôle. Les identifiants, chemins d’images et correspondances des éditions sont contrôlés par `npm run audit:hardware`. Ce contrôle ne certifie pas les caractéristiques internes invisibles sur une photo (capacité, révision matérielle).',
 '',`Le catalogue contient ${summary.documentedEditions} déclinaisons répertoriées pour ${summary.documentedModels} modèles techniques : ${summary.editionPhotos} avec photo sur ${summary.illustratedModels} modèles, et ${summary.editionsAwaitingPhotos} encore sans photo dédiée. Ces dernières restent sélectionnables avec un avertissement explicite. ${summary.archiveEditions} entrées complémentaires proviennent de Consolevariations, une archive collaborative : elles sont distinguées des sources constructeur, et ne sont pas présentées comme certifiées par le fabricant.`,
 '',`${summary.genericModels} fiches sont trop génériques pour rattacher des éditions sans préciser le modèle, et ${summary.configurableModels} modèles acceptent des configurations ou finitions personnalisées. Une explication propre à ces références apparaît dans le formulaire. ${summary.standardFinishOnlyModels} références ne disposent encore que d’une finition de base confirmée : la galerie le précise, sans prétendre que leurs variantes sont toutes recensées. ${summary.modelsAwaitingDocumentation} références précises restent entièrement sans donnée d’édition. La passe actuelle ne constitue pas un inventaire mondial exhaustif.`,
 '', '## Méthode et limites','',
 'Le périmètre recherché est celui des coloris et éditions de matériel commercialisés, y compris les séries régionales. Les prototypes, kits de développement, cadeaux internes, lots de concours gratuits, personnalisations isolées et simples boîtes de jeux sont exclus lorsqu’ils sont identifiables. Les capacités absentes du catalogue ne sont pas rattachées à une autre capacité par approximation. Les entrées ambiguës ont été laissées de côté plutôt que rattachées au premier modèle ressemblant.',
 '', 'La source publique de Consolevariations a servi à découvrir les références ; ses étiquettes « officiel » ou « unique » ne suffisent pas à valider une édition. Les correspondances ont été restreintes par famille et une sélection explicite a écarté les références douteuses. Les noms régionaux évidents ont été rapprochés des entrées constructeur déjà présentes. Les indices de rareté ne sont pas importés. Les photos ajoutées ont été contrôlées visuellement : matériel visible, fond transparent et correspondance avec l’édition. Les emballages et les cas incertains restent sans photo. Chaque entrée conserve sa source ; les photos ajoutées conservent aussi l’URL de leur fichier source. Les futures corrections de faits doivent être faites dans le manifeste, pas par une règle de correspondance approximative à l’affichage.',
 '', '## Corrections','',
 '- Victrix Pro FS-12 : remplacement de la photo à joystick par le véritable modèle sans levier. Ajout des coloris blanc et violet depuis Turtle Beach.',
 '- ROG Ally Z1 Extreme : utilisation du châssis blanc de l’Ally 2023, au lieu de la photo noire de l’Ally X. L’ancien chemin erroné est corrigé à l’affichage dans Matériel ; les photos personnelles restent intactes.',
 '- Switch OLED Splatoon 3 : choix de la vue complète de face plutôt que du seul dock.',
 '', '## Couverture par modèle illustré','', '| Modèle | Photos d’éditions | Source |','| --- | ---: | --- |'];
 const photos=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../src/data/hardware/editionPhotos.json'),'utf8'));
 for(const row of rows.filter(row=>row.photos)){const photo=photos.find(photo=>photo.type===row.type&&photo.catalogId===row.catalogId&&photo.versionIds.includes(row.versionId));lines.push(`| ${row.name} | ${row.photos} | [${photo.credit.replaceAll('|','/')}](${photo.source}) |`);}
 const scopeLabels={documented:'Liste sourcée','standard-finish':'Finition de base confirmée',generic:'Modèle à préciser',configurable:'Configurations personnalisées','not-documented':'À documenter'};
 lines.push('', '## Inventaire complet','', '| Type | Marque | Modèle | Identifiant technique | Photo de base | Éditions répertoriées | Avec photo | Couverture |','| --- | --- | --- | --- | --- | --- | --- | --- |');
 for(const row of rows)lines.push(`| ${row.type==='console'?'Consoles':'Manettes'} | ${row.brand} | ${row.name.replaceAll('|','/')} | ${row.versionId} | ${row.imageExists?'Présente':'Manquante'} | ${row.editions||'—'} | ${row.photos} | ${scopeLabels[row.editionScope]} |`);
 lines.push('', '## Intégrité technique','',...(issues.length?issues.map(issue=>'- '+issue):['Aucun fichier absent, identifiant dupliqué ou lien d’édition vers un modèle inconnu détecté.']), '');
 return lines.join('\n');
}
if(require.main===module)inventory().then(result=>{const output=process.argv[2];if(output==='--report')fs.writeFileSync(process.argv[3],report(result));else if(output)fs.writeFileSync(output,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({summary:result.summary,issues:result.issues},null,2));if(result.issues.length)process.exitCode=1;}).catch(error=>{console.error(error);process.exitCode=1;});
module.exports={inventory};
