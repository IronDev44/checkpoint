import {hardwareEditionLabel} from './hardwareEditions';
export const normalizeLocalQuery=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
export function searchPersonalSpace(query,{games=[],hardware=[],series=[],friends=[]},filter='all'){
 const terms=normalizeLocalQuery(query).split(/\s+/).filter(Boolean);if(!terms.length)return [];
 const entries=[...games.map(item=>({kind:'games',label:item.name,item,extra:[...(item.platformNames||[]),...(item.genreNames||[])]})),...hardware.map(item=>({kind:'hardware',label:[item.name,hardwareEditionLabel(item)].filter(Boolean).join(' · '),item,extra:[item.brand,item.type]})),...series.map(item=>({kind:'series',label:item.name,item,extra:[]})),...friends.map(item=>({kind:'friends',label:item.displayName||item.handle,item,extra:[item.handle,item.platform]}))];
 return entries.filter(e=>filter==='all'||e.kind===filter).map(entry=>{const label=normalizeLocalQuery(entry.label),text=normalizeLocalQuery([entry.label,...entry.extra].filter(Boolean).join(' '));return {...entry,score:terms.every(t=>text.includes(t))?(label===normalizeLocalQuery(query)?3:label.startsWith(terms[0])?2:1):0};}).filter(e=>e.score).sort((a,b)=>b.score-a.score||String(a.label).localeCompare(String(b.label),'fr'));
}
