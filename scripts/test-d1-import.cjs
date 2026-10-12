const assert=require('node:assert/strict');const {DatabaseSync}=require('node:sqlite');const {rowsFromBackup,importSql}=require('./d1-import-data.cjs');const fs=require('fs');
const backup={project:'game-tracker-a1e22',collections:Object.fromEntries(['games','hardware','gameCollections','playerProgress','playerPrivateSettings','news','events','publicProfiles'].map(n=>[n,[]]))};
backup.collections.games=[{name:'games/one',fields:{name:{stringValue:"L’aventure d'Alice"},rating:{doubleValue:8.5},released:{timestampValue:'2026-01-01T00:00:00Z'},meta:{mapValue:{fields:{played:{booleanValue:true}}}},tags:{arrayValue:{values:[{stringValue:'RPG'}]}}}}];
backup.collections.publicProfiles=[{name:'publicProfiles/alice',fields:{ownerUid:{stringValue:'wrong'}}}];
const rows=rowsFromBackup(backup,'owner');assert.equal(rows[0].owner,'owner');assert.equal(rows[1].owner,'__shared__');assert.equal(JSON.parse(rows[1].data).ownerUid,'owner');
const db=new DatabaseSync(':memory:');db.exec(fs.readFileSync('migrations/0001_documents.sql','utf8'));db.exec(importSql(rows));
assert.deepEqual(JSON.parse(db.prepare('SELECT data FROM documents WHERE collection=?').get('games').data),{name:"L’aventure d'Alice",rating:8.5,released:'2026-01-01T00:00:00Z',meta:{played:true},tags:['RPG']});
assert.throws(()=>db.exec(importSql(rows)));assert.throws(()=>rowsFromBackup({project:backup.project,collections:{games:[]}},'owner'));
console.log('Import D1 : conversion, conservation des données, propriétaire, export incomplet et doublons vérifiés.');
