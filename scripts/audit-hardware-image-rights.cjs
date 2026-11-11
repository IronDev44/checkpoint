// Inventory of recorded provenance, not an automated copyright clearance.
const fs=require('node:fs');
const rows=JSON.parse(fs.readFileSync('src/data/hardware/editionPhotos.json','utf8'));
const tritton=JSON.parse(fs.readFileSync('docs/tritton-photo-sources.json','utf8'));
const quote=value=>'"'+String(value??'').replaceAll('"','""')+'"';
const columns=['catalogue','id','image','source','fichier_source','credit','licence_documentee','statut','conditions_examinees','suite_a_donner'];
const inventory=[...rows.map(row=>({catalogue:'editions',id:row.id,image:row.image,source:row.source,asset:row.asset,credit:row.credit,license:row.license||row.licence||row.permission||''})),...tritton.map(row=>({catalogue:'tritton',id:row.slug,image:'',source:row.source,asset:row.imageUrl,credit:'',license:row.license||row.licence||row.permission||''}))];
const sonyTerms='https://www.playstation.com/en-us/legal/website-terms-of-use/';
const sony=row=>{try{return new URL(row.source).hostname.endsWith('.playstation.com');}catch{return false;}};
const output=[columns,...inventory.map(row=>[row.catalogue,row.id,row.image,row.source,row.asset,row.credit,row.license,row.license?'preuve_a_examiner':'licence_non_renseignee_dans_le_manifeste',sony(row)?sonyTerms:'',sony(row)?'autorisation_ecrite_ou_remplacement_a_examiner':'conditions_et_autorisation_a_verifier'])].map(row=>row.map(quote).join(';')).join('\n')+'\n';
fs.writeFileSync('docs/legal/inventaire-droits-photos.csv','\ufeff'+output);
const hosts={};for(const row of rows){try{const host=new URL(row.source).hostname;hosts[host]=(hosts[host]||0)+1;}catch{}}
const summary={checkedOn:'2026-11-11',editionImages:rows.length,trittonReferences:tritton.length,editionImagesWithLicenseField:rows.filter(row=>row.license||row.licence||row.permission).length,sourceHosts:hosts,sonyEntriesWithTermsReview:inventory.filter(sony).length,sonyTerms,scope:'Edition-photo manifest and Tritton source list only; excludes other base images and remote game covers.',interpretation:'Missing metadata is not proof that no permission exists; do not treat credits or source URLs as licenses. The Sony website terms do not provide blanket permission for republication in this app; review authorizations and exceptions separately.'};
fs.writeFileSync('docs/legal/inventaire-droits-photos.json',JSON.stringify(summary,null,2)+'\n');
console.log(JSON.stringify({editionImages:summary.editionImages,trittonReferences:summary.trittonReferences,editionImagesWithLicenseField:summary.editionImagesWithLicenseField}));
