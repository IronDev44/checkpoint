import {ARENA_VARIANTS,isArenaOpenWorld} from './arenaVariants';
import {startDuel,chooseDuel,validDuel,recordDuelWinner,normalizeDuelHistory,duelHistoryForGroup,removeDuelChampion,mergeDuelHistory,championCandidates,duelChampions} from './soloDuel';
import {normalizeArenaEnvelope} from './arenaState';
const games=Array.from({length:7},(_,i)=>({id:String(i),name:`Jeu ${i}`}));
test.each(ARENA_VARIANTS.map(v=>v.id))('%s retains every participant, its identity and an independent title through sync and revocation',variant=>{
 let state=startDuel(games.map(g=>g.id),'collection',variant);while(!state.winner){state=chooseDuel(state,state.round[state.index]);expect(validDuel(state,state.roster)).toBe(state);}
 expect(state.choices).toBe(6);const restored=normalizeArenaEnvelope({revision:'cloud',tournament:state}).tournament;expect(restored.variant).toBe(variant);expect(restored.matches).toHaveLength(6);
 const history=recordDuelWinner([],restored,games.find(g=>g.id===restored.winner));expect(normalizeDuelHistory(history)[0].variant).toBe(variant);expect(duelHistoryForGroup(history,'collection')).toHaveLength(0);expect(duelHistoryForGroup(history,'quick')).toHaveLength(0);expect(championCandidates(history,games)).toHaveLength(0);expect(duelChampions(history,games)[0].ultimateTitles).toBe(0);
 const removed=removeDuelChampion(history,state.winner,`variant:${variant}`);expect(mergeDuelHistory(history,removed)[0].revoked).toBe(true);expect(removed[0].variant).toBe(variant);
});
test('the same game can have distinct visual, soundtrack and favorite titles; removal affects only the selected category',()=>{
 const entries=[undefined,'visual','soundtrack'].map((variant,index)=>({id:`t-${index}`,kind:'collection',variant,winner:'0',name:'Jeu 0',date:'2026-10-22',participants:7}));
 const history=removeDuelChampion(entries,'0','variant:visual');expect(duelHistoryForGroup(history,'collection')[0].revoked).toBe(false);expect(duelHistoryForGroup(history,'variant:soundtrack')[0].revoked).toBe(false);expect(duelHistoryForGroup(history,'variant:visual')[0].revoked).toBe(true);
});
test('unknown variants and thematic quick-duel payloads cannot fall into a generic palmares',()=>{
 expect(startDuel(['a','b'],'collection','unknown')).toBeNull();expect(startDuel(['a','b'],'classic','visual')).toBeNull();const seed=startDuel(['a','b']);expect(validDuel({...seed,variant:'visual'},seed.roster)).toBeNull();expect(normalizeArenaEnvelope({revision:'bad',tournament:{...seed,variant:'unknown'}})).toBeNull();
 expect(normalizeDuelHistory([{id:'bad',kind:'collection',variant:'typo',winner:'a',name:'Alpha',participants:2}])).toHaveLength(0);
});
test.each([{tags:[{name:'Open World'}]},{genreNames:['Monde ouvert']},{keywords:['open-world']},{openWorld:true},{isOpenWorld:true}])('only explicit open-world metadata suggests participants: %j',game=>expect(isArenaOpenWorld(game)).toBe(true));
test.each([{genreNames:['RPG','Adventure']},{name:'Open World Simulator'},{tags:[{name:'not open world'}]},{},{keywords:[null,{},22]},{tags:'open world'}])('uncertain classifications are not guessed: %j',game=>expect(isArenaOpenWorld(game)).toBe(false));
