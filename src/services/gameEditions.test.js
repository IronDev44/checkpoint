import {editionTitle,linkGameEditions,changeEditionLink,normalizeEditionLinks,mergeEditionLinks,arenaEditionCandidates,suggestEditionLinks} from './gameEditions';
import {startDuel,chooseDuel} from './soloDuel';
import {normalizeArenaEnvelope} from './arenaState';
const games=[{id:'ps2',name:'Shadow of the Colossus',released:'2005-01-01'},{id:'ps3',name:'Shadow of the Colossus HD',released:'2011-01-01'},{id:'ps4',name:'Shadow of the Colossus (2018)',released:'2018-01-01'},{id:'other',name:'Another game'}];
const linked=()=>linkGameEditions([],['ps2','ps3','ps4'],'shadow','ps4','2026-10-22');
test('three versions remain distinct until approved, then participate once without altering the collection',()=>{
 const before=JSON.stringify(games);expect(arenaEditionCandidates(games,[])).toHaveLength(4);expect(suggestEditionLinks(games,[])).toHaveLength(1);
 const pool=arenaEditionCandidates(games,linked());expect(pool.map(g=>g.id)).toEqual(['ps4','other']);expect(pool[0].arenaEdition.count).toBe(3);expect(arenaEditionCandidates(games,linked(),true)).toHaveLength(4);expect(JSON.stringify(games)).toBe(before);expect(suggestEditionLinks(games,linked())).toHaveLength(0);
});
test('preference, missing edition fallback and the explicit all-versions choice are reversible',()=>{
 const links=changeEditionLink(linked(),'shadow',{preferred:'ps3'});expect(arenaEditionCandidates(games,links)[0].id).toBe('ps3');expect(arenaEditionCandidates(games.filter(g=>g.id!=='ps3'),links)[0].id).toBe('ps2');
 const removed=changeEditionLink(links,'shadow',{revoked:true});expect(arenaEditionCandidates(games,mergeEditionLinks(linked(),removed))).toHaveLength(4);
});
test('relinking a new version keeps the old representative and revokes replaced groups',()=>{
 const next=linkGameEditions(linked(),['ps4','new'],'expanded');expect(next.find(g=>g.id==='shadow').revoked).toBe(true);expect(next.find(g=>g.id==='expanded')).toMatchObject({preferred:'ps4',members:expect.arrayContaining(['ps2','ps3','ps4','new'])});
});
test('reboots and sequels are never automatically collapsed on similar names',()=>{
 const reboots=[{id:'old',name:'God of War',released:'2005'},{id:'new',name:'God of War',released:'2018'},{id:'ii',name:'God of War II'},{id:'iii',name:'God of War III'}];expect(arenaEditionCandidates(reboots,[])).toHaveLength(4);const suggestions=suggestEditionLinks(reboots,[]);expect(suggestions).toHaveLength(1);expect(suggestions[0].games.map(g=>g.id)).toEqual(['old','new']);
 expect(editionTitle('Final Fantasy VII Rebirth')).not.toBe(editionTitle('Final Fantasy VII Remake'));expect(editionTitle('FIFA 22')).not.toBe(editionTitle('FIFA 23'));
});
test('catalogue version_parent can suggest different titles, while DLC parent_game and cross-provider numeric IDs cannot',()=>{
 expect(suggestEditionLinks([{id:'igdb:12',name:'Original'},{id:'igdb:13',name:'Edition',normalized:{versionParent:12}}],[])).toHaveLength(1);
 expect(suggestEditionLinks([{id:'igdb:12',name:'Original'},{id:'igdb:13',name:'DLC',normalized:{parentGame:12}}],[])).toHaveLength(0);
 expect(suggestEditionLinks([{id:'rawg:12',name:'Original'},{id:'igdb:13',name:'Edition',normalized:{versionParent:12}}],[])).toHaveLength(0);
});
test('bad records are discarded, removed links survive old copies, and concurrent equal timestamps converge',()=>{
 expect(normalizeEditionLinks([{id:'bad',members:['a','a']}])).toEqual([]);const a=linked()[0],b={...a,preferred:'ps2'};expect(mergeEditionLinks([a],[b])).toEqual(mergeEditionLinks([b],[a]));
 const removed=changeEditionLink([a],a.id,{revoked:true});expect(mergeEditionLinks(removed,[a])[0].revoked).toBe(true);
});
test('duplicate source records and overlapping links never create repeated or missing Arena participants',()=>{
 const links=[...linked(),{id:'overlap',members:['ps4','other'],preferred:'other',updatedAt:'2026-10-23'}];const pool=arenaEditionCandidates([...games,games[0]],links);expect(new Set(pool.map(g=>g.id)).size).toBe(pool.length);expect(pool).toHaveLength(2);
});
test('edition policy and chosen actual IDs survive tournament sync; existing brackets are independent of later linking',()=>{
 const legacy=startDuel(games.map(g=>g.id),'collection');const ids=[...legacy.roster];const pool=arenaEditionCandidates(games,linked());let current={...startDuel(pool.map(g=>g.id),'collection'),editionMode:'grouped'};current=chooseDuel(current,'ps4');expect(normalizeArenaEnvelope({revision:'remote',tournament:current}).tournament).toMatchObject({editionMode:'grouped',winner:'ps4'});expect(legacy.roster).toEqual(ids);
});
