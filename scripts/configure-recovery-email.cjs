const fs=require('fs');const path=require('path');
async function main(){
  const session=JSON.parse(fs.readFileSync(path.join(process.env.USERPROFILE,'.config/configstore/firebase-tools.json')));
  const headers={Authorization:`Bearer ${session.tokens.access_token}`,'Content-Type':'application/json'};
  const url='https://identitytoolkit.googleapis.com/admin/v2/projects/game-tracker-a1e22/config';
  const read=await fetch(url,{headers});if(!read.ok)throw new Error(`Lecture configuration : ${read.status}`);
  const current=await read.json();
  const previous={defaultLocale:current.notification?.defaultLocale,resetPasswordTemplate:current.notification?.sendEmail?.resetPasswordTemplate};
  fs.mkdirSync('.account-backups',{recursive:true});
  fs.writeFileSync(`.account-backups/recovery-template-before-${Date.now()}.json`,JSON.stringify(previous));
  const template={
    ...previous.resetPasswordTemplate,
    senderDisplayName:'Checkpoint',
    subject:'Réinitialise ton mot de passe Checkpoint',
    body:"<p>Bonjour,</p><p>Tu as demandé à réinitialiser le mot de passe de ton compte Checkpoint associé à <strong>%EMAIL%</strong>.</p><p><a href='%LINK%'>Choisir un nouveau mot de passe</a></p><p>Si tu n’es pas à l’origine de cette demande, tu peux ignorer cet e-mail.</p><p>À bientôt,<br>L’équipe Checkpoint</p>",
    bodyFormat:'HTML',
  };
  delete template.customized;
  // The current Firebase project rejects body/subject edits through this API.
  // Public-facing app name must be updated in project settings instead.
  const mask='notification.sendEmail.resetPasswordTemplate.senderDisplayName';
  const saved=await fetch(`${url}?updateMask=${encodeURIComponent(mask)}`,{method:'PATCH',headers,body:JSON.stringify({notification:{sendEmail:{resetPasswordTemplate:template}}})});
  if(!saved.ok){const error=await saved.json();throw new Error(`${saved.status}: ${error.error?.message}`);}
  const verified=await(await fetch(url,{headers})).json();const email=verified.notification?.sendEmail?.resetPasswordTemplate;
  if(email?.senderDisplayName!=='Checkpoint')throw new Error('Configuration non confirmée.');
  console.log('Configuration relue : expéditeur Checkpoint. Aucun e-mail envoyé. Le nom public dans le texte reste à modifier dans la console.');
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
