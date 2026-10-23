// @zxing/browser 0.2.1 publishes source maps pointing at absent TypeScript files.
// Remove only those broken debug references; keep runtime code and valid maps.
const fs=require('node:fs');
const path=require('node:path');
const root=path.dirname(require.resolve('@zxing/browser/package.json'));
function prepare(directory){
 for(const entry of fs.readdirSync(directory,{withFileTypes:true})){
  const file=path.join(directory,entry.name);
  if(entry.isDirectory())prepare(file);
  else if(entry.name.endsWith('.js')){
   const source=fs.readFileSync(file,'utf8'),match=source.match(/\/\/# sourceMappingURL=([^\s]+)/);
   if(!match||match[1].startsWith('data:'))continue;
   const mapPath=path.resolve(directory,match[1]);let broken=!fs.existsSync(mapPath);
   if(!broken){try{const map=JSON.parse(fs.readFileSync(mapPath,'utf8'));broken=(map.sources||[]).some((name,i)=>!map.sourcesContent?.[i]&&!fs.existsSync(path.resolve(path.dirname(mapPath),map.sourceRoot||'',name)));}catch{broken=true;}}
   if(broken)fs.writeFileSync(file,source.replace(/\/\/# sourceMappingURL=[^\r\n]+/g,''));
  }
 }
}
prepare(root);
