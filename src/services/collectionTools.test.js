import {stampGameHistory,gameHistory} from './gameHistory';
import {matchesHardwareFilters,hardwareFilterChoices} from './hardwareFilters';
import {multiplayerInfo,loadMultiplayerInfo,sharedGamePlatforms} from './playTogether';
import {publicFavoriteGames} from './rediscovery';
const at='2026-10-19T10:00:00.000Z';
test('history keeps actual dated milestones, records transitions once and respects undo',()=>{
 const before={status:'collection',progressStatus:'completed',completed:true,createdAt:'2020-01-01',completedAt:'2021-01-01'};
 const pause=stampGameHistory(before,{progressStatus:'paused',completed:false,completedAt:null},at);expect(pause.playHistory.map(event=>event.type)).toEqual(['added','completed','paused']);
 const next={...before,...pause};expect(stampGameHistory(next,{progressStatus:'paused'},at)).not.toHaveProperty('playHistory');
 const resume=stampGameHistory(next,{status:'en cours',progressStatus:'in_progress'},'2026-10-20T10:00:00Z');expect(resume.playHistory.at(-1).type).toBe('resumed');expect(gameHistory({...next,...resume})[0].type).toBe('resumed');
 expect(stampGameHistory(next,{playHistory:[],progressStatus:'completed'}).playHistory).toEqual([]);expect(gameHistory({completed:true})).toEqual([]);
});
test('history caps stored transitions and omits arbitrary private event fields',()=>{
 const before={progressStatus:'paused',playHistory:Array.from({length:205},(_,id)=>({id,type:'paused',at,secret:'hidden'}))};const next=stampGameHistory(before,{progressStatus:'in_progress'},at);expect(next.playHistory).toHaveLength(200);expect(JSON.stringify(next)).not.toContain('secret');
});
test('hardware filters combine without guessing missing years or generations',()=>{
 const catalog=[{id:'ps5',name:'PlayStation 5'}],item={id:'a',type:'console',name:'PS5 Slim',brand:'Sony',catalogId:'ps5',acquiredYear:2024,status:'possédé'};
 expect(matchesHardwareFilters(item,{query:'sony',brand:'Sony',family:'PlayStation 5',year:'2024',status:'possede'},catalog)).toBe(true);
 expect(matchesHardwareFilters(item,{year:'unknown'},catalog)).toBe(false);expect(matchesHardwareFilters({...item,acquiredYear:null},{year:'unknown'},catalog)).toBe(true);expect(matchesHardwareFilters(item,{brand:'Nintendo'},catalog)).toBe(false);
 expect(hardwareFilterChoices([item],catalog)).toMatchObject({families:['PlayStation 5'],years:['2024'],statuses:['possede']});
});
test('multiplayer requires actual metadata, handles platform aliases and never infers cross-play',()=>{
 expect(multiplayerInfo({name:'Co-op Adventure',tags:[{name:'Action'}]}).kind).toBe('unknown');expect(multiplayerInfo({game_modes:[{name:'Single player'}]}).kind).toBe('solo');expect(multiplayerInfo({game_modes:[{name:'Co-operative'}]}).kind).toBe('coop');expect(multiplayerInfo({multiplayer_modes:[{onlinecoop:true}]}).labels).toContain('Coop en ligne');expect(multiplayerInfo({game_modes:[{name:'Multiplayer'}]}).kind).toBe('multi');
 expect(sharedGamePlatforms({playedPlatforms:['PS5','PC']},{platforms:['PlayStation 5','PC (Microsoft Windows)']})).toEqual(['PS5','PC']);expect(sharedGamePlatforms({platformNames:['Xbox One']},{platforms:['Xbox Series X/S']})).toEqual([]);
});
test('multiplayer lookup uses canonical identity and refuses ambiguous same-name editions',async()=>{
 const request=jest.fn(async path=>path==='/games/42'?{id:42,game_modes:[{name:'Co-operative'}]}:{results:[{id:1,name:'Game',released:'2020'},{id:2,name:'Game',released:'2020'}]});expect((await loadMultiplayerInfo({id:'igdb:42'},request)).kind).toBe('coop');expect(request).toHaveBeenCalledTimes(1);expect((await loadMultiplayerInfo({name:'Game',released:'2020'},request)).kind).toBe('unknown');expect(request).toHaveBeenCalledTimes(2);
});
test('public snapshots still exclude play history, stop reasons and private lists',()=>{const snapshot=publicFavoriteGames([{id:'a',name:'Game',favorite:true,platformNames:['PC'],playHistory:[{type:'paused',at}],progressNote:'Private reason',personalLists:['Private list']}]);expect(snapshot[0].platforms).toEqual(['PC']);expect(JSON.stringify(snapshot)).not.toMatch(/Private|playHistory|progressNote/);});
