import {journeyPatch} from './gameJourney';
import {normalizePersonalLists,moveListGame} from './personalLists';
import {normalizeHiddenTabs} from './contentPreferences';
import {sessionCandidates} from '../components/SessionPicker';
test('paused and abandoned games stay owned, become unfinished and resume without losing their private note',()=>{
 const game={id:'one',status:'en cours',completed:true,rating:9,progressNote:'Reprendre cet hiver'};
 for(const state of ['paused','abandoned']){const patch=journeyPatch(game,state,'  Pas le bon moment  ');expect(patch).toMatchObject({status:'collection',completed:false,progressStatus:state,progressNote:'Pas le bon moment'});expect(patch).not.toHaveProperty('rating');expect(journeyPatch({...game,...patch},'in_progress')).toMatchObject({status:'en cours',completed:false});expect(journeyPatch(game,'completed').completed).toBe(true);}
 expect(journeyPatch(game,'invalid')).toBeNull();
 expect(sessionCandidates([{id:'a',status:'collection',progressStatus:'paused'},{id:'b',status:'collection',progressStatus:'abandoned'},{id:'c',status:'collection'}]).map(g=>g.id)).toEqual(['c']);
});
test('list normalization preserves order and rejects malformed lists and duplicate memberships',()=>{
 expect(normalizePersonalLists([{id:'a',name:' Coop ',gameIds:['x','x',3,{},null],coverId:3},{id:'a',name:'Other'},null])).toEqual([{id:'a',name:'Coop',gameIds:['x',3],coverId:3}]);
 expect(moveListGame(['a','b','c'],'b',1)).toEqual(['a','c','b']);expect(moveListGame([1,2],'2',-1)).toEqual([2,1]);
});
test('home and options cannot be hidden and obsolete tab names are dropped',()=>{expect(normalizeHiddenTabs(['home','options','social','social','unknown'])).toEqual(['social']);});
