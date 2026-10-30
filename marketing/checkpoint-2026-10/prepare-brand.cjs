const fs=require('node:fs');
const path=require('node:path');
const root=__dirname;
async function main(){
 for(const dir of ['assets','captures','exports'])fs.mkdirSync(path.join(root,dir),{recursive:true});
 const icon=fs.readFileSync(path.resolve(root,'../../public/checkpoint-icon.svg'),'utf8');
 const mark=icon.match(/<svg width="120"[\s\S]*?<\/svg>/)[0].replace('width="120" height="128"','width="100%" height="100%"');
 fs.writeFileSync(path.join(root,'assets/checkpoint-mark.svg'),mark.replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" '));
 const css=await (await fetch('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;800;900&display=swap',{headers:{'User-Agent':'Mozilla/5.0'}})).text();
 const url=[...css.matchAll(/url\(([^)]+)\)/g)].at(-1)[1];
 const font=await (await fetch(url)).arrayBuffer();fs.writeFileSync(path.join(root,'assets/orbitron.woff2'),Buffer.from(font));
 const license=await fetch('https://raw.githubusercontent.com/google/fonts/main/ofl/orbitron/OFL.txt');if(license.ok)fs.writeFileSync(path.join(root,'assets/Orbitron-OFL.txt'),await license.text());
 console.log('Original Checkpoint mark and brand font prepared.');
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
