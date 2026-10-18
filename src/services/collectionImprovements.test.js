import {buildBulkGamePatch} from './libraryBulk';
import {compareFriendGames,sameSocialGame} from './friendComparison';
import {playerCardContent} from './playerCard';

test('bulk edits leave unselected fields intact and keep completed collection entries completed',()=>{
 const game={completed:true,rating:8,physicalNotes:'My edition'};
 expect(buildBulkGamePatch(game,{format:'digital'})).toEqual({physicalOwned:false});
 expect(buildBulkGamePatch(game,{platform:'PC'})).toEqual({playedPlatforms:['PC']});
 expect(buildBulkGamePatch(game,{status:'collection'})).toMatchObject({status:'collection',completed:true,progressStatus:'completed'});
 expect(buildBulkGamePatch({}, {status:'completed'})).toMatchObject({status:'collection',completed:true,ratingExperience:'completed'});
 expect(()=>buildBulkGamePatch({}, {status:'invalid'})).toThrow();
 expect(game).toEqual({completed:true,rating:8,physicalNotes:'My edition'});
});
test('social matching uses shared source IDs or title/year, never another account’s local ID',()=>{
 expect(sameSocialGame({id:'same',name:'Halo'},{id:'same',name:'Portal'})).toBe(false);
 expect(sameSocialGame({name:'Pokémon: Or',released:'2000'},{name:'Pokemon Or',released:'2000-03-01'})).toBe(true);
 expect(sameSocialGame({name:'Resident Evil',released:'1996'},{name:'Resident Evil',released:'2002'})).toBe(false);
 expect(sameSocialGame({sourceIds:{igdb:10}},{sourceIds:{igdb:10}})).toBe(true);
});
test('friend comparisons respect hidden sections, separate matches from discoveries and do not infer an overall compatibility score',()=>{
 const own=[{id:'mine',name:'Halo',rating:9},{name:'Wish',status:'wishlist'}];
 const profile={visibility:'public',identityGames:[{id:'friend',name:'Halo',rating:8.5}],favoriteGames:[{name:'Portal',rating:9},{name:'Wish',rating:10}]};
 const result=compareFriendGames(own,profile);
 expect(result.common.find(item=>item.game.name==='Halo').agreement).toBe(true);
 expect(result.discover.map(g=>g.name)).toEqual(['Portal']);
 expect(compareFriendGames([],{visibility:'public',identityGames:[{name:'Portal'}],favoriteGames:[{name:'Portal',rating:7}]}).discover).toMatchObject([{name:'Portal',rating:7,favorite:true}]);
 expect(compareFriendGames(own,{...profile,publicSections:{identityGames:false,essential:false}})).toEqual({common:[],discover:[]});
 expect(compareFriendGames(own,{...profile,visibility:'prive'})).toEqual({common:[],discover:[]});
});
test('player card exports only chosen content and never private notes or an account email',()=>{
 const profile={displayName:'Jordan',photoURL:'data:image/png;base64,abc',identityGameIds:['one'],platform:'PS5',email:'private@example.test',bio:'private bio'};
 const games=[{id:'one',name:'Halo',review:'private opinion'},{id:'two',name:'Hidden game'}];
 const content=playerCardContent(profile,games,54);
 expect(content.games.map(g=>g.name)).toEqual(['Halo']);
 expect(JSON.stringify(content)).not.toMatch(/private|Hidden game/);
 expect(playerCardContent(profile,games,54,{photo:false,games:false,platforms:false})).toMatchObject({photo:'',games:[],platforms:''});
});
