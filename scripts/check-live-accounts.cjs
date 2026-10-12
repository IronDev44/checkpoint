const fs=require('fs');
async function main(){
  const url=process.argv[2];if(!url||!url.startsWith('https://'))throw new Error('URL HTTPS requise.');
  const login=JSON.parse(fs.readFileSync('.account-backups/owner-login.json'));
  const signed=await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyBwoejy_sOGbJdCzmGkhy4cN_layGgEEbE',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...login,returnSecureToken:true})});
  const auth=await signed.json();if(!signed.ok)throw new Error(`Connexion propriétaire : ${signed.status}`);
  const expected=JSON.parse(fs.readFileSync('.account-backups/expected-d1.json'));
  for(const name of ['games','hardware','playerPrivateSettings']){
    const response=await fetch(`${url}/api/account-data?collection=${name}`,{headers:{Authorization:`Bearer ${auth.idToken}`}});const data=await response.json();if(!response.ok)throw new Error(`Lecture ${name}: ${response.status}`);
    const rows=expected.filter(x=>x.collection===name);const actual=new Map(data.documents.map(x=>[x.id,JSON.stringify(x.data)]));
    if(data.documents.length!==rows.length||rows.some(x=>actual.get(x.id)!==x.data))throw new Error(`Contenu différent: ${name}`);
    console.log(name,rows.length,'documents identiques via API authentifiée.');
  }
  const denied=await fetch(`${url}/api/account-data?collection=games`);if(denied.status!==401)throw new Error('Accès anonyme non bloqué.');
  console.log('Accès anonyme refusé. Aucun jeton affiché.');
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
