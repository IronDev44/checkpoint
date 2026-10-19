export const EMPTY_HARDWARE_FILTERS={query:'',brand:'all',family:'all',year:'all',status:'all'};
const key=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
export const hardwareStatusKey=value=>key(value).replace(/[^a-z]/g,'');
export const HARDWARE_STATUS_LABELS={possede:'Possédé',historique:'Historique',vendu:'Vendu',areparer:'À réparer',reparer:'À réparer',wishlist:'Wishlist',ranked:'Classé uniquement'};
export function hardwareFamily(item,catalog=[]){return String(item.generation||catalog.find(model=>model.id===item.catalogId)?.name||item.parentName||'Non renseignée');}
export function matchesHardwareFilters(item,filters={},catalog=[]){
 const f={...EMPTY_HARDWARE_FILTERS,...filters},year=item.acquiredYear?String(item.acquiredYear):'unknown';
 return (f.brand==='all'||(item.brand||'Non renseignée')===f.brand)&&(f.family==='all'||hardwareFamily(item,catalog)===f.family)&&(f.year==='all'||f.year===year)&&(f.status==='all'||hardwareStatusKey(item.status)===f.status)&&key([item.name,item.parentName,item.variantName,item.brand].filter(Boolean).join(' ')).includes(key(f.query));
}
export function hardwareFilterChoices(items,catalog=[]){const unique=values=>[...new Set(values)].sort((a,b)=>a.localeCompare(b,'fr',{numeric:true}));return {brands:unique(items.map(item=>item.brand||'Non renseignée')),families:unique(items.map(item=>hardwareFamily(item,catalog))),years:unique(items.filter(item=>item.acquiredYear).map(item=>String(item.acquiredYear))).reverse(),statuses:unique(items.map(item=>hardwareStatusKey(item.status)).filter(Boolean))};}
