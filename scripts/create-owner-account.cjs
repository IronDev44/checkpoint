const fs=require('fs');const path=require('path');const crypto=require('crypto');
async function main(){
  const session=JSON.parse(fs.readFileSync(path.join(process.env.USERPROFILE,'.config/configstore/firebase-tools.json')));
  const dir=path.join(process.cwd(),'.account-backups');fs.mkdirSync(dir,{recursive:true});
  async function api(endpoint,body){const r=await fetch(`https://identitytoolkit.googleapis.com/v1/projects/game-tracker-a1e22/${endpoint}`,{method:'POST',headers:{Authorization:`Bearer ${session.tokens.access_token}`,'Content-Type':'application/json'},body:JSON.stringify(body)});const data=await r.json();if(!r.ok)throw new Error(`${r.status}: ${data.error?.message}`);return data;}
  const email='bodyjordan@gmail.com';const lookup=await api('accounts:lookup',{email:[email]});let owner=lookup.users?.[0];
  if(!owner){const password=crypto.randomBytes(32).toString('base64url');owner=await api('accounts',{email,displayName:'Jordan',emailVerified:false,password});fs.writeFileSync(path.join(dir,'owner-login.json'),JSON.stringify({email,password}));}
  if(!owner.localId)throw new Error('UID propriétaire absent.');
  fs.writeFileSync(path.join(dir,'owner.json'),JSON.stringify({uid:owner.localId,email}));
  console.log('Compte propriétaire réservé :',owner.localId);
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
