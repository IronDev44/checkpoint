import {useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import './SaveFeedback.css';

// Writes to one document run in order. Failed edits retain their retry action
// only while that edit is still current; an older retry must not overwrite it.
export function useSaveFeedback() {
  const queues=useRef(new Map());
  const mounted=useRef(true);
  const ownerGeneration=useRef(0);
  const [pending,setPending]=useState(0);
  const [failures,setFailures]=useState([]);
  const [receipt,setReceipt]=useState(null);
  useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;ownerGeneration.current+=1;};},[]);
  useEffect(()=>{
    if(!receipt)return undefined;
    const timer=setTimeout(()=>setReceipt(current=>current===receipt?null:current),receipt.undo?9000:3500);
    return()=>clearTimeout(timer);
  },[receipt]);
  const run=async operation=>{
    const generation=ownerGeneration.current;
    if(!mounted.current)return false;
    setPending(value=>value+1);if(!operation.quiet)setReceipt(null);
    setFailures(current=>current.filter(item=>item!==operation && item.isCurrent()));
    const previous=queues.current.get(operation.key)||Promise.resolve();
    const task=previous.catch(()=>{}).then(async()=>{
      if(!mounted.current||ownerGeneration.current!==generation||!operation.isCurrent())return false;
      try{
        const result=await operation.write();
        if(!mounted.current||ownerGeneration.current!==generation)return false;
        setFailures(current=>current.filter(item=>item!==operation&&item.isCurrent()));
        if(operation.isCurrent()&&(!operation.quiet||result?.queued))setReceipt({message:result?.queued?'Modification conservée sur cet appareil · synchronisation en attente':operation.success||'Enregistré',undo:operation.undo,isCurrent:operation.isCurrent});
        return result?.queued?result:true;
      }catch{
        if(mounted.current&&operation.isCurrent())setFailures(current=>[...current.filter(item=>item!==operation&&item.isCurrent()),operation]);
        return false;
      }
    });
    queues.current.set(operation.key,task);
    try{return await task;}finally{
      if(queues.current.get(operation.key)===task)queues.current.delete(operation.key);
      if(mounted.current&&generation===ownerGeneration.current)setPending(value=>value-1);
    }
  };
  const retry=()=>{const current=failures.filter(item=>item.isCurrent());setFailures(current);current.forEach(operation=>run(operation));};
  const undo=async()=>{
    const current=receipt;setReceipt(null);
    if(current?.undo&&current.isCurrent())await current.undo();
  };
  return {run, pending, failures:failures.filter(item=>item.isCurrent()), receipt, retry, undo};
}

export default function SaveFeedback({state}) {
  const {pending,failures,receipt,retry,undo}=state;
  if(!pending&&!failures.length&&!receipt)return null;
  const error=failures.length>0;
  return createPortal(<div className={`save-feedback ${error?'has-error':''}`} role={error?'alert':'status'} aria-live={error?'assertive':'polite'}>
    <span>{error?`${failures.length>1?`${failures.length} modifications non enregistrées.`:'Modification non enregistrée.'} Ton choix reste affiché ; réessaie avant de quitter.`:pending?'Enregistrement…':receipt.message}</span>
    {error&&<button type="button" disabled={pending>0} onClick={retry}>Réessayer</button>}
    {!error&&!pending&&receipt?.undo&&receipt.isCurrent()&&<button type="button" onClick={undo}>Annuler</button>}
  </div>,document.body);
}
