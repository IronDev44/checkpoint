const fs=require('fs');const path=require('path');
async function main(){
  const session=JSON.parse(fs.readFileSync(path.join(process.env.USERPROFILE,'.config/configstore/firebase-tools.json')));
  const headers={Authorization:`Bearer ${session.tokens.access_token}`,'Content-Type':'application/json'};
  const url='https://identitytoolkit.googleapis.com/admin/v2/projects/game-tracker-a1e22/config';
  const response=await fetch(url,{headers});if(!response.ok)throw new Error(`Lecture: ${response.status}`);
  const config=await response.json();
  const authorizedDomains=[...new Set([...(config.authorizedDomains||[]),'checkpoint-eka.pages.dev'])];
  const saved=await fetch(`${url}?updateMask=authorizedDomains`,{method:'PATCH',headers,body:JSON.stringify({authorizedDomains})});
  if(!saved.ok)throw new Error(`Enregistrement: ${saved.status}`);
  console.log('Domaine Checkpoint autorisé ; domaines existants conservés.');
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
