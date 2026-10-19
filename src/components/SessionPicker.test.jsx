import {sessionCandidates} from './SessionPicker';
const games=[{id:'playing',status:'en cours',playedPlatforms:['PC'],genres:['Action']},{id:'new',status:'collection',playedPlatforms:['PS5'],genres:[{name:'Adventure'}]},{id:'done',completed:true},{id:'wish',status:'wishlist'}];
test('ignores finished games and wishlist, respects actual platform and genre',()=>{
 expect(sessionCandidates(games).map(g=>g.id)).toEqual(['playing','new']);
 expect(sessionCandidates(games,{platform:'PS5',mood:'adventure'}).map(g=>g.id)).toEqual(['new']);
 expect(sessionCandidates(games,{mood:'strategy'})).toEqual([]);
});
test('short sessions favour an existing game, without interpreting hours already played as duration',()=>{
 expect(sessionCandidates([...games].reverse(),{time:'short'})[0].id).toBe('playing');
 expect(sessionCandidates(games,{time:'long'})[0].id).toBe('new');
});
