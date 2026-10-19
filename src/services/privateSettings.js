const object=value=>value&&typeof value==='object'&&!Array.isArray(value);
export function diffPrivateSettings(before={},after={},prefix=''){
 const patch={};
 for(const [key,value] of Object.entries(after)){
  if(key==='updatedAt'||value===undefined)continue;
  const field=prefix?`${prefix}.${key}`:key;
  if(object(value)&&object(before?.[key]))Object.assign(patch,diffPrivateSettings(before[key],value,field));
  else if(JSON.stringify(before?.[key])!==JSON.stringify(value))patch[field]=value;
 }
 return patch;
}
