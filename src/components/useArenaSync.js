import {useEffect,useRef,useState} from 'react';
import {auth} from '../firebase';
import {accountsEnabled,d1Enabled} from '../services/accountConfig';
import {ARENA_SYNC_KEY,normalizeArenaEnvelope} from '../services/arenaState';
import {newDuelId} from '../services/soloDuel';
import {readArenaState,writeArenaState} from '../services/arenaSync';

// A revision describes one complete bracket. Divergent brackets cannot be merged.
export default function useArenaSync({enabled,ready,tournament,storage,onRestore}){
 const owner=useRef(auth.currentUser?.uid);
 const active=Boolean(enabled&&accountsEnabled&&d1Enabled&&auth.currentUser&&auth.currentUser.uid===owner.current);
 const [status,setStatus]=useState('local'),[conflict,setConflict]=useState(null);
 const ledger=useRef(null),restore=useRef(onRestore),pump=useRef(()=>{}),timer=useRef(),busy=useRef(false);
 restore.current=onRestore;
 const persist=()=>{try{storage.setItem(ARENA_SYNC_KEY,JSON.stringify(ledger.current));return true;}catch{setStatus('storage-error');return false;}};
 const schedule=()=>{clearTimeout(timer.current);timer.current=setTimeout(()=>pump.current(),450);};
 const commit=next=>{
  if(!active||auth.currentUser?.uid!==owner.current||!ledger.current||JSON.stringify(ledger.current.current?.tournament??null)===JSON.stringify(next))return;
  ledger.current={...ledger.current,current:{revision:newDuelId(),tournament:next},dirty:true};
  if(persist())setStatus('pending');schedule();
 };
 useEffect(()=>{
  if(!active||!ready)return;
  let alive=true,controller;const uid=auth.currentUser.uid;
  let saved;try{saved=JSON.parse(storage.getItem(ARENA_SYNC_KEY)||'null');}catch{/* The legacy local bracket is still available. */}
  const valid=normalizeArenaEnvelope(saved?.current);
  const same=valid&&JSON.stringify(valid.tournament)===JSON.stringify(normalizeArenaEnvelope({revision:'local',tournament})?.tournament);
  ledger.current=valid&&same?{current:valid,baseRevision:typeof saved.baseRevision==='string'?saved.baseRevision:null,dirty:saved.dirty===true}:{current:tournament?{revision:newDuelId(),tournament}:null,baseRevision:valid?.revision||null,dirty:Boolean(tournament)};
  persist();
  const live=()=>alive&&auth.currentUser?.uid===uid;
  const adopt=remote=>{ledger.current={current:remote,baseRevision:remote?.revision??null,dirty:false};persist();restore.current(remote?.tournament??null);setConflict(null);setStatus('synced');};
  pump.current=async()=>{
   if(!live()||busy.current)return;
   busy.current=true;controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),15000);
   try{
    setStatus('syncing');const remote=await readArenaState(controller.signal);if(!live())return;
    let local=ledger.current;
    // A missing document is not an intentional reset (a reset has its own revision).
    if(!remote&&local.current&&!local.dirty){local={...local,baseRevision:null,dirty:true};ledger.current=local;persist();}
    if(!local.dirty){if((local.current?.revision??null)===(remote?.revision??null)){setStatus('synced');setConflict(null);}else adopt(remote);return;}
    if(local.current?.revision===remote?.revision){ledger.current={...local,baseRevision:remote.revision,dirty:false};persist();setStatus('synced');setConflict(null);return;}
    if((remote?.revision??null)!==local.baseRevision){setConflict(remote||{revision:null,tournament:null});setStatus('conflict');return;}
    const sent=local.current;const result=await writeArenaState(sent,local.baseRevision,controller.signal);if(!live())return;
    if(result.conflict){setConflict(result.state||{revision:null,tournament:null});setStatus('conflict');return;}
    local=ledger.current;ledger.current={...local,baseRevision:result.state.revision,dirty:local.current.revision!==sent.revision};persist();setConflict(null);setStatus(ledger.current.dirty?'pending':'synced');
    if(ledger.current.dirty)schedule();
   }catch{if(live())setStatus('pending');}
   finally{clearTimeout(timeout);busy.current=false;}
  };
  const refresh=()=>{if(document.visibilityState!=='hidden')pump.current();};
  pump.current();const interval=setInterval(refresh,30000);
  window.addEventListener('online',refresh);window.addEventListener('focus',refresh);document.addEventListener('visibilitychange',refresh);
  return()=>{alive=false;controller?.abort();clearInterval(interval);clearTimeout(timer.current);window.removeEventListener('online',refresh);window.removeEventListener('focus',refresh);document.removeEventListener('visibilitychange',refresh);};
 // Hydration happens once for this mounted, account-scoped Arena.
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[active,ready,storage]);
 const resolve=choice=>{
  if(!conflict)return;
  if(choice==='cloud'){
   const remote=conflict.revision?conflict:null;
   ledger.current={current:remote,baseRevision:remote?.revision??null,dirty:false};persist();restore.current(remote?.tournament??null);setConflict(null);setStatus('synced');
  }else{
   ledger.current={...ledger.current,baseRevision:conflict.revision,current:{revision:newDuelId(),tournament:ledger.current.current?.tournament??null},dirty:true};persist();setConflict(null);setStatus('pending');schedule();
  }
 };
 return {active,status,conflict,commit,resolve,retry:()=>pump.current()};
}
