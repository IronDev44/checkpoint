const fs=require('fs');const path=require('path');
async function main(){
  const email=process.argv[2];if(!/^checkpoint-qa-\d+@example\.com$/.test(email||''))throw new Error('Compte de test attendu.');
  const session=JSON.parse(fs.readFileSync(path.join(process.env.USERPROFILE,'.config/configstore/firebase-tools.json')));
  async function api(endpoint,body){const r=await fetch(`https://identitytoolkit.googleapis.com/v1/projects/game-tracker-a1e22/${endpoint}`,{method:'POST',headers:{Authorization:`Bearer ${session.tokens.access_token}`,'Content-Type':'application/json'},body:JSON.stringify(body)});if(!r.ok)throw new Error(`Nettoyage : ${r.status}`);return r.json();}
  const user=(await api('accounts:lookup',{email:[email]})).users?.[0];if(!user)throw new Error('Compte introuvable.');
  if(user.email!==email||!/^\w+$/.test(user.localId)||user.localId===JSON.parse(fs.readFileSync('.account-backups/owner.json')).uid)throw new Error('Compte non autorisé au nettoyage.');
  await api('accounts:delete',{localId:user.localId});
  fs.writeFileSync('.account-backups/cleanup-qa.sql',`DELETE FROM documents WHERE owner='${user.localId}';`);
  console.log('Compte temporaire retiré. Nettoyage D1 limité à son UID préparé.');
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
