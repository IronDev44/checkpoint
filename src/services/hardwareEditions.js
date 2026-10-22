export const HARDWARE_EDITION_KINDS=[{id:'standard',label:'Standard'},{id:'collector',label:'Collector'},{id:'limited',label:'Édition limitée'},{id:'anniversary',label:'Anniversaire'},{id:'custom',label:'Personnalisée'}];
export const HARDWARE_COLORS=['Noir','Blanc','Rouge','Bleu','Vert','Violet','Rose','Jaune','Orange','Gris','Argenté','Doré','Transparent','Multicolore'];
const key=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
export const hardwareColorKey=key;
export function normalizeHardwareEdition(value){return {kind:HARDWARE_EDITION_KINDS.some(k=>k.id===value?.kind)?value.kind:'standard',name:typeof value?.name==='string'?value.name.trim().slice(0,100):'',color:typeof value?.color==='string'?value.color.trim().slice(0,60):'',...(typeof value?.photoId==='string'&&/^[a-z0-9-]{1,100}$/.test(value.photoId)?{photoId:value.photoId}:{})};}
export const hardwareEdition=item=>normalizeHardwareEdition(item?.edition);
export function hardwareEditionLabel(item){const edition=hardwareEdition(item),parts=[edition.kind!=='standard'&&HARDWARE_EDITION_KINDS.find(k=>k.id===edition.kind).label,edition.name,edition.color].filter(Boolean);return [...new Map(parts.map(part=>[key(part),part])).values()].join(' · ');}
export const hasHardwareEdition=item=>Boolean(hardwareEditionLabel(item));
export const hardwareEditionKey=item=>{const e=hardwareEdition(item);return JSON.stringify([e.kind,key(e.name),key(e.color)]);};
export function sameHardwareModel(a,b){
 if(a.type!==b.type)return false;
 if(a.catalogId&&b.catalogId&&a.catalogId!==b.catalogId)return false;
 if(a.variantId&&b.variantId&&a.variantId!==b.variantId)return false;
 if(a.versionId&&b.versionId)return a.versionId===b.versionId;
 return Boolean(key(a.name))&&key(a.name)===key(b.name)&&key(a.brand)===key(b.brand);
}
export function duplicateHardwareEdition(items,candidate,excludeId){return items.find(item=>(excludeId==null||item.id!==excludeId)&&sameHardwareModel(item,candidate)&&key(item.status||'possédé')===key(candidate.status||'possédé')&&hardwareEditionKey(item)===hardwareEditionKey(candidate))||null;}
