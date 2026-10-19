export const importName=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[™®©]/g,'').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
export function providerKey(game,provider){return String(provider==='steam'?(game?.steamAppId??game?.appid??''):(game?.xboxTitleId??game?.titleId??''));}
export function planGameImport(existing,incoming,provider){
 const byId=new Map(),byName=new Map(),seen=new Set();
 for(const game of existing){const id=providerKey(game,provider),name=importName(game.name);if(id){if(!byId.has(id))byId.set(id,[]);byId.get(id).push(game);}if(name){if(!byName.has(name))byName.set(name,[]);byName.get(name).push(game);}}
 return incoming.map((raw,index)=>{
  const item=raw&&typeof raw==='object'?raw:{},id=providerKey(item,provider),name=importName(item.name),key=id?`${provider}:${id}`:`name:${name}`;
  let type='add',reason='Nouvelle fiche',match=null,needsConfirmation=false;
  if(!name){type='skip';reason='Nom manquant';}
  else if(seen.has(key)){type='skip';reason='Doublon dans cet import';}
  else{
   seen.add(key);
   const exact=id?byId.get(id)||[]:[];
   const names=(byName.get(name)||[]).filter(g=>!id||!providerKey(g,provider)||providerKey(g,provider)===id);
   const candidates=exact.length?exact:names;
   if(candidates.length===1){match=candidates[0];type='update';needsConfirmation=!exact.length;reason=exact.length?'Même identifiant de boutique':'Même titre : confirme qu’il s’agit du même jeu';}
   else if(candidates.length>1){type='skip';reason='Plusieurs fiches possibles : vérifier dans la bibliothèque';}
  }
  return {index,item,existing:match,type,reason,needsConfirmation};
 });
}
