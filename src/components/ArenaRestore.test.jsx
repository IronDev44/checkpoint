jest.mock('./useArenaSync',()=>({__esModule:true,default:jest.fn(()=>({active:false,commit:jest.fn()}))}));
jest.mock('../services/gameCovers',()=>({...jest.requireActual('../services/gameCovers'),resolveGameCover:jest.fn(()=>new Promise(()=>{}))}));
import {render,act} from '@testing-library/react';
import ArenaTab from './ArenaTab';
import useArenaSync from './useArenaSync';
import {startDuel,chooseDuel,recordDuelWinner,revokeDuelWinner,DUEL_STORAGE_KEY} from '../services/soloDuel';
const games=[{id:'a',name:'Alpha'},{id:'b',name:'Beta'}];
beforeEach(()=>useArenaSync.mockImplementation(()=>({active:false,commit:jest.fn()})));
function mount(revoked=false){const seed=startDuel(['a','b']),local=chooseDuel(seed,'a');let history=recordDuelWinner([],local,games[0]);if(revoked)history=revokeDuelWinner(history,local.id);const values=new Map([[DUEL_STORAGE_KEY,JSON.stringify({tournament:local,history})]]);const storage={getItem:key=>values.get(key),setItem:(key,value)=>values.set(key,value)};render(<ArenaTab games={games} storage={storage}/>);return {seed,storage};}
test('choosing a conflicting remote finale updates the active title for the same tournament',()=>{const {seed,storage}=mount();act(()=>useArenaSync.mock.calls.at(-1)[0].onRestore(chooseDuel(seed,'b')));expect(JSON.parse(storage.getItem(DUEL_STORAGE_KEY)).history[0].winner).toBe('b');});
test('restoring a remote undo revokes the formerly completed result',()=>{const {seed,storage}=mount();act(()=>useArenaSync.mock.calls.at(-1)[0].onRestore(seed));expect(JSON.parse(storage.getItem(DUEL_STORAGE_KEY)).history[0].revoked).toBe(true);});
test('a remotely restored finale cannot recreate a manually removed title',()=>{const {seed,storage}=mount(true);act(()=>useArenaSync.mock.calls.at(-1)[0].onRestore(chooseDuel(seed,'b')));expect(JSON.parse(storage.getItem(DUEL_STORAGE_KEY)).history[0].revoked).toBe(true);});
