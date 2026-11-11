// Build output only. The original source files remain available for rights review.
const fs=require('node:fs'),path=require('node:path');
const policy=require('../src/data/catalogVisualRights.json');
const build=path.resolve(__dirname,'../build');
let excluded=0;
for(const row of policy.replacements){
 const target=path.resolve(build,'.'+row.url);
 if(!target.startsWith(build+path.sep))throw new Error('Asset outside build');
 if(fs.existsSync(target)){fs.unlinkSync(target);excluded++;}
}
console.log(`Visual rights: ${excluded} source assets excluded from build; originals preserved.`);
