// A small identity index, independent of profile pictures and shared libraries.
// Database triggers keep a durable queue, including writes from older clients.
const initialized=new WeakMap();
const run=(db,sql,args=[])=>db.prepare(sql).bind(...args).run();
export async function ensureSocialDirectory(db){
 if(initialized.has(db))return initialized.get(db);
 const pending=(async()=>{
  try{const ready=await db.prepare("SELECT id FROM social_directory_state WHERE id='seeded'").bind().first();if(ready)return;}catch{/* First use creates the durable index and queue. */}
  for(const sql of [
   'CREATE TABLE IF NOT EXISTS social_directory(account TEXT PRIMARY KEY,handle TEXT NOT NULL,displayName TEXT NOT NULL,nameKey TEXT NOT NULL,handleKey TEXT NOT NULL,isPrivate INTEGER NOT NULL)',
   'CREATE TABLE IF NOT EXISTS social_directory_tokens(token TEXT NOT NULL,account TEXT NOT NULL,PRIMARY KEY(token,account))',
   'CREATE INDEX IF NOT EXISTS social_directory_token_account ON social_directory_tokens(account)',
   'CREATE TABLE IF NOT EXISTS social_directory_dirty(account TEXT PRIMARY KEY,revision TEXT NOT NULL)',
   'CREATE TABLE IF NOT EXISTS social_directory_state(id TEXT PRIMARY KEY)',
   "CREATE INDEX IF NOT EXISTS social_public_profile_owner ON documents(json_extract(data,'$.ownerUid')) WHERE owner='__shared__' AND collection='publicProfiles'",
  ])await run(db,sql);
  for(const [event,value] of [['INSERT','NEW'],['UPDATE','NEW'],['DELETE','OLD']]){
   const account=`CASE WHEN ${value}.collection='publicProfiles' THEN json_extract(${value}.data,'$.ownerUid') ELSE ${value}.owner END`;
   await run(db,`CREATE TRIGGER IF NOT EXISTS social_directory_${event.toLowerCase()} AFTER ${event} ON documents
    WHEN (${value}.collection='publicProfiles' OR (${value}.collection='playerPrivateSettings' AND ${value}.id='main')) AND ${account} IS NOT NULL
    BEGIN INSERT INTO social_directory_dirty(account,revision) VALUES(${account},hex(randomblob(16))) ON CONFLICT(account) DO UPDATE SET revision=excluded.revision; END`);
  }
  await run(db,`INSERT OR IGNORE INTO social_directory_dirty(account,revision)
   SELECT owner,hex(randomblob(16)) FROM documents WHERE collection='playerPrivateSettings' AND id='main' AND NOT EXISTS(SELECT 1 FROM social_directory_state WHERE id='seeded')
   UNION SELECT json_extract(data,'$.ownerUid'),hex(randomblob(16)) FROM documents WHERE owner='__shared__' AND collection='publicProfiles' AND json_extract(data,'$.ownerUid') IS NOT NULL AND NOT EXISTS(SELECT 1 FROM social_directory_state WHERE id='seeded')`);
  await run(db,"INSERT OR IGNORE INTO social_directory_state VALUES('seeded')");
 })();initialized.set(db,pending);
 try{await pending;}catch(error){initialized.delete(db);throw error;}
}
export async function updateSocialDirectory(db,normalize){
 await ensureSocialDirectory(db);
 const dirty=await db.prepare(`SELECT d.account,d.revision,p.id AS publicHandle,
  substr(COALESCE(json_extract(s.data,'$.socialProfile.displayName'),json_extract(p.data,'$.displayName'),''),1,160) AS displayName,
  COALESCE(json_extract(s.data,'$.socialProfile.handle'),p.id,'') AS handle,
  CASE WHEN COALESCE(json_extract(s.data,'$.socialProfile.visibility'),'public') NOT IN ('public','friends') OR COALESCE(json_extract(p.data,'$.visibility'),'public') NOT IN ('public','friends') THEN 1 ELSE 0 END AS isPrivate,
  CASE WHEN s.data IS NULL AND p.data IS NULL THEN 0 ELSE 1 END AS existsNow,
  COALESCE(json_extract(s.data,'$.socialProfile.visibility'),'prive') AS settingsVisibility
  FROM social_directory_dirty d
  LEFT JOIN documents s ON s.owner=d.account AND s.collection='playerPrivateSettings' AND s.id='main'
  LEFT JOIN documents p ON p.owner='__shared__' AND p.collection='publicProfiles' AND json_extract(p.data,'$.ownerUid')=d.account
  ORDER BY d.account LIMIT 50`).bind().all();
 const byAccount=new Map();for(const row of dirty.results)if(!byAccount.has(row.account))byAccount.set(row.account,row);
 if(byAccount.size){
  const entries=[...byAccount.values()].map(row=>{
   const isPrivate=row.isPrivate||(!row.publicHandle&&!['public','friends'].includes(row.settingsVisibility));
   const handle=row.publicHandle||row.handle,nameKey=normalize(row.displayName),handleKey=normalize(handle);
   const tokens=[...new Set([nameKey,handleKey].flatMap(value=>Array.from({length:Math.max(0,value.length-1)},(_,i)=>value.slice(i,i+2))))];
   return {...row,handle,nameKey,handleKey,isPrivate:Number(isPrivate),include:Boolean(row.existsNow&&nameKey&&(row.publicHandle||isPrivate)),tokens};
  });
  const payload=JSON.stringify(entries),statements=[
   db.prepare("DELETE FROM social_directory_tokens WHERE account IN (SELECT json_extract(value,'$.account') FROM json_each(?))").bind(payload),
   db.prepare("DELETE FROM social_directory WHERE account IN (SELECT json_extract(value,'$.account') FROM json_each(?))").bind(payload),
   db.prepare(`INSERT INTO social_directory(account,handle,displayName,nameKey,handleKey,isPrivate) SELECT json_extract(value,'$.account'),json_extract(value,'$.handle'),json_extract(value,'$.displayName'),json_extract(value,'$.nameKey'),json_extract(value,'$.handleKey'),json_extract(value,'$.isPrivate') FROM json_each(?) WHERE json_extract(value,'$.include')=1`).bind(payload),
   db.prepare(`INSERT OR IGNORE INTO social_directory_tokens(token,account) SELECT t.value,json_extract(e.value,'$.account') FROM json_each(?) e,json_each(e.value,'$.tokens') t WHERE json_extract(e.value,'$.include')=1`).bind(payload),
   db.prepare(`DELETE FROM social_directory_dirty WHERE EXISTS(SELECT 1 FROM json_each(?) e WHERE json_extract(e.value,'$.account')=social_directory_dirty.account AND json_extract(e.value,'$.revision')=social_directory_dirty.revision)`).bind(payload),
  ];
  if(db.batch)await db.batch(statements);else for(const statement of statements)await statement.run();
 }
 const remaining=await db.prepare('SELECT COUNT(*) AS total FROM social_directory_dirty').bind().first();
 return {pending:Number(remaining.total)};
}
export async function indexedSocialCandidates(db,query,normalize){
 const state=await updateSocialDirectory(db,normalize);if(state.pending)return null;
 const rows=await db.prepare(`SELECT d.handle AS id,d.displayName,d.account AS profileOwner,d.isPrivate,
  CASE WHEN d.handleKey=? THEN 0 WHEN d.nameKey=? THEN 1 WHEN substr(d.handleKey,1,length(?))=? THEN 2 WHEN substr(d.nameKey,1,length(?))=? THEN 3 ELSE 4 END AS score
  FROM social_directory_tokens t JOIN social_directory d ON d.account=t.account
  WHERE t.token=? AND (instr(d.nameKey,?)>0 OR instr(d.handleKey,?)>0)
  ORDER BY score,d.handle LIMIT 101`).bind(query,query,query,query,query,query,query.slice(0,2),query,query).all();
 return rows.results;
}
