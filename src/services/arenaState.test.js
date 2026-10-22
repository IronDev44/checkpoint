import {startDuel,chooseDuel,postponeDuel,validDuel,duelGameJourney} from './soloDuel';
import {normalizeArenaEnvelope} from './arenaState';
import {arenaRecap} from './arenaShare';
test.each([4,5,7,16,31,585])('deferrals preserve qualifications, completed matches and N−1 choices for %i games',n=>{
 const ids=Array.from({length:n},(_,i)=>String(i));let state=startDuel(ids,'collection'),steps=0;
 while(!state.winner){
  const old=state;state=postponeDuel(state);expect(state.choices).toBe(old.choices);expect(state.next).toEqual(old.next);expect(validDuel(state,ids)).toBe(state);
  state=chooseDuel(state,state.round[state.index]);expect(validDuel(state,ids)).toBe(state);if(++steps>n)throw new Error('Loop');
 }
 expect(state.choices).toBe(n-1);expect(state.matches).toHaveLength(n-1);expect(new Set(state.matches.map(m=>m.loser)).size).toBe(n-1);expect(duelGameJourney(state,state.winner).status).toBe('champion');
});
test('deferring the last pair is a no-op and does not eliminate either game',()=>{const state=startDuel(['a','b']);expect(postponeDuel(state)).toBe(state);});
test('journeys distinguish active, eliminated, champion and partial legacy histories',()=>{
 let state=chooseDuel(startDuel(['a','b','c','d']),'a');expect(duelGameJourney(state,'a').status).toBe('active');expect(duelGameJourney(state,'b').status).toBe('eliminated');
 delete state.matches;delete state.trackedFrom;state=chooseDuel(state,'c');expect(duelGameJourney(state,'a').partial).toBe(true);expect(duelGameJourney(state,'b').status).toBe('earlier');
 state=chooseDuel(state,'a');expect(duelGameJourney(state,'a').matches).toEqual([{choice:3,round:2,winner:'a',loser:'c'}]);
});
test('private envelopes reject invalid brackets and remove unrelated participant fields',()=>{
 const tournament=startDuel(['a','b']);tournament.participants=[{id:'a',name:'Alpha',email:'private@example.test',image:'gameplay',sourceIds:{igdb:12}},{id:'stranger',name:'No'}];
 const result=normalizeArenaEnvelope({revision:'one',tournament});expect(result.tournament.participants).toHaveLength(1);expect(JSON.stringify(result)).not.toMatch(/private@|gameplay/);expect(result.tournament.participants[0].sourceIds.igdb).toBe(12);
 expect(normalizeArenaEnvelope({revision:'x',tournament:{...tournament,choices:1}})).toBeNull();expect(normalizeArenaEnvelope({revision:'x',tournament:{...tournament,kind:'unknown'}})).toBeNull();expect(normalizeArenaEnvelope({revision:'reset',tournament:null})).toEqual({revision:'reset',tournament:null});
});
test('final recap has the actual finalist and only the recorded winner path',()=>{
 let state=startDuel(['a','b','c','d']);state=chooseDuel(state,'b');state=chooseDuel(state,'c');state=chooseDuel(state,'b');
 const games=['a','b','c','d'].map(id=>({id,name:id.toUpperCase()}));expect(arenaRecap(state,games)).toEqual({winner:'B',finalist:'C',participants:4,path:[{round:1,name:'A'},{round:2,name:'C'}],partial:false});
});
