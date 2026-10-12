const privateNames = new Set(['games','hardware','gameCollections','playerPrivateSettings','playerProgress']);
function value(source) {
  if ('nullValue' in source) return null;
  if ('stringValue' in source) return source.stringValue;
  if ('booleanValue' in source) return source.booleanValue;
  if ('integerValue' in source) { const n=Number(source.integerValue); if(!Number.isSafeInteger(n))throw new Error('Entier hors précision JSON.');return n; }
  if ('doubleValue' in source) { if(!Number.isFinite(source.doubleValue))throw new Error('Nombre non fini.');return source.doubleValue; }
  if ('timestampValue' in source) return source.timestampValue;
  if ('arrayValue' in source) return (source.arrayValue.values||[]).map(value);
  if ('mapValue' in source) return fields(source.mapValue.fields||{});
  throw new Error('Type Firestore non pris en charge : '+Object.keys(source).join(','));
}
function fields(source){return Object.fromEntries(Object.entries(source).map(([k,v])=>[k,value(v)]));}
function rowsFromBackup(backup,uid){
  if(backup.project!=='game-tracker-a1e22'||!uid)throw new Error('Projet ou propriétaire invalide.');
  const required=[...privateNames,'news','events','publicProfiles'];
  if(required.some(name=>!Array.isArray(backup.collections?.[name])))throw new Error('Export incomplet.');
  return required.flatMap(name=>backup.collections[name].map(doc=>{
    const data=fields(doc.fields||{});if(name==='publicProfiles')data.ownerUid=uid;
    return {owner:privateNames.has(name)?uid:'__shared__',collection:name,id:doc.name.split('/').pop(),data:JSON.stringify(data)};
  }));
}
function importSql(rows){
  const quote=v=>"'"+v.replace(/'/g,"''")+"'";
  return rows.map(row=>{
    const statement=`INSERT INTO documents(owner,collection,id,data) VALUES(${[row.owner,row.collection,row.id,row.data].map(quote).join(',')});`;
    if(Buffer.byteLength(statement)>95000)throw new Error(`Document trop volumineux pour l’import SQL : ${row.collection}/${row.id}`);
    return statement;
  }).join('\n');
}
module.exports={value,rowsFromBackup,importSql};
