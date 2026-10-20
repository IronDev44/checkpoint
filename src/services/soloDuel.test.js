import {duelCandidates,drawDuelRoster,startDuel,chooseDuel,validDuel} from './soloDuel';
const games=Array.from({length:8},(_,i)=>({id:String(i),name:`Jeu ${i}`,status:'collection',favorite:i<4,genreNames:['RPG'],platformNames:['PC']}));
test('a bracket produces exactly n-1 choices and all contestants can win',()=>{let state=startDuel(games.map(g=>g.id));const rounds=[];while(!state.winner){rounds.push(state.round.length);state=chooseDuel(state,state.round[state.index]);expect(validDuel(state,games.map(g=>g.id))).toBe(state);}expect(state.choices).toBe(7);expect(rounds).toEqual([8,8,8,8,4,4,2]);expect(state.winner).toBe('0');expect(chooseDuel(state,'7')).toBe(state);});
test('never draws wishlist entries or duplicates and adapts to a smaller pool',()=>{const candidates=duelCandidates([...games,{id:'wish',name:'Wishlist',status:'wishlist'}],{favorites:true,genre:'RPG',platform:'PC'});const roster=drawDuelRoster([...candidates,candidates[0]],8,()=>0);expect(roster).toHaveLength(4);expect(new Set(roster).size).toBe(4);expect(roster).not.toContain('wish');expect(drawDuelRoster(games.slice(0,3),8)).toHaveLength(2);expect(drawDuelRoster([],8)).toEqual([]);expect(duelCandidates(games,{seriesIds:['0','2']})).toHaveLength(2);});
test('rejects corrupt saves and unavailable participants without mutating a choice',()=>{const state=startDuel(['a','b']);expect(startDuel(['a','a'])).toBeNull();expect(chooseDuel(state,'outside')).toBe(state);expect(validDuel(state,['a'])).toBeNull();expect(validDuel({...state,index:9},['a','b'])).toBeNull();expect(validDuel({...state,round:['a','a']},['a','b'])).toBeNull();});


const {normalizeDuelHistory,mergeDuelHistory,recordDuelWinner,revokeDuelWinner,duelChampions,championCandidates}=require('./soloDuel');
const result=(id,winner,extra={})=>({id,winner,name:`Jeu ${winner}`,date:'2026-10-20T12:00:00Z',participants:4,kind:'classic',...extra});
test('keeps every completed tournament beyond eight and counts distinct champions rather than repeated titles',()=>{
 const history=Array.from({length:24},(_,i)=>result(`t${i}`,String(i%3)));
 expect(normalizeDuelHistory(history)).toHaveLength(24);expect(duelChampions(history,games)).toHaveLength(3);expect(duelChampions(history,games)[0].wins).toBe(8);expect(championCandidates(history,games)).toHaveLength(3);
});
test('champions exclude unavailable and wishlist games while the historical winner remains visible',()=>{
 const history=['0','1','2','3'].map(id=>result(id,id));
 expect(championCandidates(history,[...games.slice(0,3),{...games[3],status:'wishlist'}]).map(g=>g.id)).toEqual(['0','1','2']);
 expect(duelChampions(history,games.slice(0,3)).find(g=>g.id==='3')).toMatchObject({name:'Jeu 3',wins:1,game:null});
});
test('records a victory once, and undo tombstones beat old cloud copies even with an identical clock',()=>{
 const tournament={...startDuel(['0','1']),winner:'0'},date='2026-10-20T12:00:00Z';
 const first=recordDuelWinner([],tournament,games[0],date),again=recordDuelWinner(first,tournament,games[0],date);expect(again).toHaveLength(1);
 const undone=revokeDuelWinner(again,tournament.id,date);expect(duelChampions(mergeDuelHistory(undone,first),games)).toHaveLength(0);
 const replay=recordDuelWinner(undone,{...tournament,winner:'1'},games[1],date);expect(replay).toHaveLength(1);expect(duelChampions(replay,games)[0].id).toBe('1');expect(duelChampions(mergeDuelHistory(replay,undone),games)[0].id).toBe('1');
});
test('migrates old winners, rejects corrupt entries and retains championship titles',()=>{
 const old={winner:'0',name:'Jeu 0',participants:8,date:'2026-10-01T10:00:00Z'};
 const history=mergeDuelHistory([old],[old,result('crown','0',{kind:'champions'})]);expect(history).toHaveLength(2);expect(duelChampions(history,games)[0]).toMatchObject({wins:2,crowns:1});
 expect(normalizeDuelHistory([null,{},result('bad','0',{participants:3})])).toEqual([]);
});


test('championship brackets require at least four entrants and accept eight different champions',()=>{
 expect(startDuel(['0','1'],'champions')).toBeNull();let state=startDuel(games.map(g=>g.id),'champions');expect(state.kind).toBe('champions');while(!state.winner)state=chooseDuel(state,state.round[state.index]);expect(state.choices).toBe(7);expect(validDuel(state,games.map(g=>g.id))).toBe(state);
});

const {ultimateCandidates}=require('./soloDuel');
test('the ultimate tier needs distinct Crown winners, keeps its own titles and survives undo/cloud merge',()=>{
 const history=[...games.map(g=>result(`classic-${g.id}`,g.id)),...games.slice(0,4).map(g=>result(`crown-${g.id}`,g.id,{kind:'champions'}))];
 expect(ultimateCandidates(history,games).map(g=>g.id).sort()).toEqual(['0','1','2','3']);
 expect(ultimateCandidates(Array.from({length:8},(_,i)=>result(`repeat-${i}`,'0',{kind:'champions'})),games)).toHaveLength(1);
 expect(ultimateCandidates(history,games.slice(0,3))).toHaveLength(3);
 expect(startDuel(['0','1'],'ultimate')).toBeNull();
 let state=startDuel(['0','1','2','3'],'ultimate');while(!state.winner)state=chooseDuel(state,state.round[state.index]);
 expect(validDuel(state,games.map(g=>g.id))).toMatchObject({kind:'ultimate',winner:'0',choices:3});
 const won=recordDuelWinner(history,state,games[0]);expect(duelChampions(won,games).find(g=>g.id==='0')).toMatchObject({wins:3,crowns:1,ultimateTitles:1});
 const undone=mergeDuelHistory(won,revokeDuelWinner(won,state.id));expect(duelChampions(undone,games).find(g=>g.id==='0')).toMatchObject({wins:2,crowns:1,ultimateTitles:0});
 expect(ultimateCandidates(undone,games)).toHaveLength(4);
});

const {drawCollectionRoster}=require('./soloDuel');
test.each([2,3,5,6,7,9,17,570])('the whole-collection bracket includes all %i games and ends after exactly N-1 choices',count=>{
 const entries=Array.from({length:count},(_,i)=>({id:String(i),name:`Game ${i}`}));
 const roster=drawCollectionRoster([...entries,entries[0],{id:'wish',name:'Wish',status:'wishlist'}],()=>0.25);
 expect(roster).toHaveLength(count);expect(new Set(roster).size).toBe(count);
 let state=startDuel(roster,'collection');expect(validDuel(state,roster)).toBe(state);
 while(!state.winner){expect(state.round.slice(state.index,state.index+2)).toHaveLength(2);state=chooseDuel(state,state.round[state.index]);expect(validDuel(state,roster)).toBe(state);}
 expect(state.choices).toBe(count-1);expect(roster).toContain(state.winner);
 expect(recordDuelWinner([],state,entries.find(g=>g.id===state.winner))[0]).toMatchObject({participants:count,kind:'collection'});
});
test('every participant including a first-round bye can become the collection champion',()=>{
 const ids=['a','b','c','d','e'];for(const desired of ids){let state=startDuel(ids,'collection');while(!state.winner){const pair=state.round.slice(state.index,state.index+2);state=chooseDuel(state,pair.includes(desired)?desired:pair[0]);}expect(state.winner).toBe(desired);}
 const state=startDuel(ids,'collection');expect(validDuel({...state,choices:2},ids)).toBeNull();expect(validDuel({...state,next:['a','a','e']},ids)).toBeNull();
});
