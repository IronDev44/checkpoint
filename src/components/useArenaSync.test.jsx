jest.mock('../firebase',()=>({auth:{currentUser:{uid:'alice'}}}));
jest.mock('../services/accountConfig',()=>({accountsEnabled:true,d1Enabled:true}));
jest.mock('../services/arenaSync',()=>({readArenaState:jest.fn(),writeArenaState:jest.fn()}));
import {useState} from 'react';
import {renderHook,act,waitFor} from '@testing-library/react';
import useArenaSync from './useArenaSync';
import {readArenaState,writeArenaState} from '../services/arenaSync';
import {startDuel,chooseDuel} from '../services/soloDuel';
import {ARENA_SYNC_KEY,normalizeArenaEnvelope} from '../services/arenaState';
import {auth} from '../firebase';
const store=()=>{const values=new Map();return {getItem:key=>values.get(key),setItem:(key,value)=>values.set(key,value)};};
const envelope=(revision,tournament)=>normalizeArenaEnvelope({revision,tournament});
function useHarness(storage,initial=null){const [tournament,setTournament]=useState(initial);const sync=useArenaSync({enabled:true,ready:true,tournament,storage,onRestore:setTournament});return {sync,tournament,save:next=>{setTournament(next);sync.commit(next);}};}
beforeEach(()=>{jest.resetAllMocks();auth.currentUser={uid:'alice'};readArenaState.mockResolvedValue(null);writeArenaState.mockImplementation(async state=>({state:normalizeArenaEnvelope(state)}));});
test('clean devices restore the account bracket and unchanged polls preserve local undo state',async()=>{
 const remote=envelope('remote',startDuel(['a','b','c','d']));readArenaState.mockResolvedValue(remote);const storage=store(),view=renderHook(()=>useHarness(storage));
 await waitFor(()=>expect(view.result.current.sync.status).toBe('synced'));expect(view.result.current.tournament.id).toBe(remote.tournament.id);expect(writeArenaState).not.toHaveBeenCalled();
 const same=view.result.current.tournament;await act(async()=>view.result.current.sync.retry());expect(view.result.current.tournament).toBe(same);
});
test('local votes survive an outstanding initial read and are written before acknowledgement',async()=>{
 let resolve;readArenaState.mockReturnValueOnce(new Promise(r=>{resolve=r;}));const storage=store(),view=renderHook(()=>useHarness(storage));const state=startDuel(['a','b']);
 act(()=>view.result.current.save(state));expect(JSON.parse(storage.getItem(ARENA_SYNC_KEY)).dirty).toBe(true);
 await act(async()=>resolve(null));await waitFor(()=>expect(view.result.current.sync.status).toBe('synced'));expect(writeArenaState.mock.calls[0][0].tournament.id).toBe(state.id);expect(view.result.current.tournament.id).toBe(state.id);
});
test('offline local changes remain pending and retry without losing the bracket',async()=>{
 readArenaState.mockRejectedValue(new Error('offline'));const storage=store(),state=startDuel(['a','b']);const view=renderHook(()=>useHarness(storage,state));
 await waitFor(()=>expect(view.result.current.sync.status).toBe('pending'));expect(view.result.current.tournament).toBe(state);readArenaState.mockResolvedValue(null);await act(async()=>view.result.current.sync.retry());expect(view.result.current.sync.status).toBe('synced');expect(writeArenaState).toHaveBeenCalledTimes(1);
});
test.each(['cloud','local'])('divergent devices require an explicit %s choice',async choice=>{
 const local=startDuel(['a','b','c','d']),remote=envelope('remote',chooseDuel(local,'b'));readArenaState.mockResolvedValue(remote);const storage=store(),view=renderHook(()=>useHarness(storage,local));
 await waitFor(()=>expect(view.result.current.sync.status).toBe('conflict'));expect(writeArenaState).not.toHaveBeenCalled();expect(view.result.current.tournament.choices).toBe(0);
 act(()=>view.result.current.sync.resolve(choice));if(choice==='cloud'){expect(view.result.current.tournament.choices).toBe(1);expect(writeArenaState).not.toHaveBeenCalled();}else{await waitFor(()=>expect(writeArenaState).toHaveBeenCalled());expect(writeArenaState.mock.calls[0][1]).toBe('remote');expect(view.result.current.tournament.choices).toBe(0);}
});
test('a vote during an outstanding write stays dirty and is sent against the acknowledged revision',async()=>{
 const storage=store(),initial=startDuel(['a','b','c','d']);let resolve;writeArenaState.mockReturnValueOnce(new Promise(r=>{resolve=r;}));const view=renderHook(()=>useHarness(storage,initial));await waitFor(()=>expect(writeArenaState).toHaveBeenCalledTimes(1));const first=writeArenaState.mock.calls[0][0];
 act(()=>view.result.current.save(chooseDuel(initial,'a')));await act(async()=>resolve({state:normalizeArenaEnvelope(first)}));expect(JSON.parse(storage.getItem(ARENA_SYNC_KEY)).dirty).toBe(true);
 readArenaState.mockResolvedValue(normalizeArenaEnvelope(first));await waitFor(()=>expect(writeArenaState).toHaveBeenCalledTimes(2));expect(writeArenaState.mock.calls[1][1]).toBe(first.revision);expect(writeArenaState.mock.calls[1][0].tournament.choices).toBe(1);
});
test('late replies after unmount or an account change cannot restore a bracket',async()=>{
 let resolve;readArenaState.mockReturnValue(new Promise(r=>{resolve=r;}));const storage=store(),view=renderHook(()=>useHarness(storage));auth.currentUser={uid:'bob'};
 await act(async()=>resolve(envelope('alice',startDuel(['a','b']))));expect(view.result.current.tournament).toBeNull();expect(writeArenaState).not.toHaveBeenCalled();
});
test('a write-time conflict never reports success or overwrites the remote revision',async()=>{
 const local=startDuel(['a','b']),remote=envelope('competing',local);writeArenaState.mockResolvedValue({conflict:true,state:remote});const storage=store(),view=renderHook(()=>useHarness(storage,local));
 await waitFor(()=>expect(view.result.current.sync.status).toBe('conflict'));expect(view.result.current.sync.conflict.revision).toBe('competing');expect(writeArenaState).toHaveBeenCalledTimes(1);
});
test('an unexpectedly missing remote document does not erase a previously synced bracket',async()=>{
 const storage=store(),state=envelope('existing',startDuel(['a','b']));storage.setItem(ARENA_SYNC_KEY,JSON.stringify({current:state,baseRevision:state.revision,dirty:false}));
 const view=renderHook(()=>useHarness(storage,state.tournament));await waitFor(()=>expect(view.result.current.sync.status).toBe('synced'));expect(view.result.current.tournament.id).toBe(state.tournament.id);expect(writeArenaState.mock.calls[0][1]).toBeNull();
});
