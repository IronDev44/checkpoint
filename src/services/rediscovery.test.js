import {favoriteReason,publicFavoriteGames,rediscoveryCandidates,rediscoverySelection} from './rediscovery';
const now=new Date('2026-10-19T12:00:00Z');
const old={id:'old',name:'Portal',completed:true,rating:9,status:'collection',completedAt:'2020-01-01'};
test('only finished loved games are suggested; dates are never inferred from creation or updates',()=>{
 const games=[old,{...old,id:'recent',completedAt:'2026-10-01'},{...old,id:'unknown',completedAt:null,createdAt:'2020-01-01',updatedAt:'2026-01-01'},{...old,id:'wish',status:'wishlist'},{...old,id:'active',status:'en cours'},{...old,id:'partial',progressStatus:'playing'},{...old,id:'bad',rating:4},{...old,id:'loved',rating:4,favorite:true},{...old,id:'unfinished',completed:false},{...old,id:'future',completedAt:'2030-01-01'}];
 const result=rediscoveryCandidates(games,undefined,now);expect(result.map(c=>c.game.id)).toEqual(['loved','old','unknown']);expect(result.find(c=>c.game.id==='unknown').date).toBeNull();expect(result.find(c=>c.game.id==='unknown').reason).toBe('Date de fin non renseignée');
});
test('uses detailed rating getter and retains pins while rotating recommendations',()=>{
 const games=Array.from({length:7},(_,i)=>({...old,id:String(i),rediscoverPinned:i===0}));const candidates=rediscoveryCandidates(games,()=>8,now);const first=rediscoverySelection(candidates,0),next=rediscoverySelection(candidates,2);expect(first).toHaveLength(3);expect(next[0].game.id).toBe('0');expect(next.slice(1).map(c=>c.game.id)).not.toEqual(first.slice(1).map(c=>c.game.id));expect(rediscoverySelection([])).toEqual([]);
});
test('only explicitly public reasons leave the private collection, with recent shared phrases prioritized',()=>{
 const games=[{id:'a',name:'Private',favorite:true,favoriteReason:'Private memory',review:'SECRET'},{id:'b',name:'Shared',favorite:true,favoriteReason:'  Pour son ambiance  ',favoriteReasonShared:true,favoriteReasonUpdatedAt:'2026-10-18'},{id:'c',name:'New',favorite:true,favoriteReason:'New words',favoriteReasonShared:true,favoriteReasonUpdatedAt:'2026-10-19'},{id:'d',name:'Not favorite',favoriteReason:'Hidden',favoriteReasonShared:true},{id:'e',name:'Wish',status:'wishlist',favorite:true,favoriteReason:'Hidden',favoriteReasonShared:true}];
 const result=publicFavoriteGames(games);expect(result.map(g=>g.id)).toEqual(['c','b','a']);expect(result[1].favoriteReason).toBe('Pour son ambiance');expect(result[2].favoriteReason).toBe('');expect(JSON.stringify(result)).not.toContain('Private memory');expect(JSON.stringify(result)).not.toContain('SECRET');expect(favoriteReason('a'.repeat(180))).toHaveLength(160);expect(games[0].id).toBe('a');
});

test('hiding the vitrine also removes reasons from the public payload',()=>{const games=[{id:'a',name:'Halo',favorite:true,favoriteReason:'Only in my vitrine',favoriteReasonShared:true}];expect(publicFavoriteGames(games,undefined,false)[0].favoriteReason).toBe('');});
