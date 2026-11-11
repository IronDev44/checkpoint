const assert=require('node:assert/strict');
const {auditErasureReferences}=require('./audit-erasure-references.cjs');
const uid='qa-erasure-123';
const documents=[
 {owner:uid,collection:'games',id:'one',data:{name:'Jeu A'}},
 {owner:uid,collection:'_privacyPreferences',id:'main',data:{usage:false}},
 {owner:'__shared__',collection:'publicProfiles',id:'ancien-pseudo',data:{ownerUid:uid,displayName:'Exemple'}},
 {owner:'__shared__',collection:'friendChallenges',id:'challenge',data:{members:[uid,'friend'],votes:{[uid]:1,friend:0}}},
 {owner:'friend',collection:'socialReactions',id:'reaction',data:{author:uid,value:'great'}},
 {owner:'friend',collection:'playerPrivateSettings',id:'main',data:{socialFriends:[{handle:'ANCIEN-PSEUDO'}]}},
 {owner:'friend',collection:'games',id:'their-game',data:{name:'Jeu B',notes:'Données à conserver'}},
];
const before=JSON.stringify(documents);
const report=auditErasureReferences({uid,handles:['@ancien-pseudo'],documents});
assert.equal(report.readOnly,true);assert.equal(report.ownDocuments,2);assert.equal(report.referencingDocuments,4);
assert.equal(JSON.stringify(documents),before,'L’audit ne modifie aucune ligne.');
assert.equal(report.hits.some(r=>r.id==='their-game'),false,'Le jeu de l’ami n’est pas inclus arbitrairement.');
assert(report.hits.find(r=>r.id==='challenge').references.some(r=>r.path==='/data/votes/'+uid&&r.kind==='uid-cle'));
assert(report.hits.find(r=>r.owner==='friend'&&r.collection==='playerPrivateSettings').references.some(r=>r.kind==='pseudo'));
const afterNaiveDeletion=auditErasureReferences({uid,handles:['ancien-pseudo'],documents:documents.filter(r=>r.owner!==uid)});
assert.equal(afterNaiveDeletion.ownDocuments,0);assert.equal(afterNaiveDeletion.referencingDocuments,4,'Supprimer seulement owner=UID laisse des références sociales.');
assert.equal(auditErasureReferences({uid,documents:[{owner:'friend',collection:'other',id:'bad',data:'{'}]}).invalid.length,1);
assert.throws(()=>auditErasureReferences({uid:'__shared__',documents}),/UID/);
console.log('Audit d’effacement : documents propres, références sociales, clés de votes, anciens pseudos, JSON invalide et absence de mutation vérifiés sur données fictives.');
