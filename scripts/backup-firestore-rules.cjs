const fs=require('fs');const path=require('path');
async function main(){
  const session=JSON.parse(fs.readFileSync(path.join(process.env.USERPROFILE,'.config/configstore/firebase-tools.json')));
  const headers={Authorization:`Bearer ${session.tokens.access_token}`};
  async function read(url){const r=await fetch(url,{headers});if(!r.ok)throw new Error(`Lecture règles: ${r.status}`);return r.json();}
  const release=await read('https://firebaserules.googleapis.com/v1/projects/game-tracker-a1e22/releases/cloud.firestore');
  const rules=await read(`https://firebaserules.googleapis.com/v1/${release.rulesetName}`);
  fs.mkdirSync('.account-backups',{recursive:true});fs.writeFileSync('.account-backups/firestore-rules-before.json',JSON.stringify({release,rules}));
  console.log('Anciennes règles sauvegardées localement.');
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
