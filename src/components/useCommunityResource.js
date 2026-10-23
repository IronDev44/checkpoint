import {useCallback,useEffect,useRef,useState} from 'react';

// One request sequence for manual refreshes, focus refreshes and writes. An old
// response must never replace a newer action or the state of an unmounted view.
export default function useCommunityResource(request,field){
 const [data,setData]=useState([]),[meta,setMeta]=useState({}),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const seq=useRef(0),active=useRef(false),writing=useRef(false),generation=useRef(0);
 const invalidate=useCallback(()=>{++generation.current;++seq.current;},[]);
 const refresh=useCallback(async()=>{
  if(writing.current)return;
  const token=++seq.current;
  try{const result=await request();if(active.current&&token===seq.current){setData(result[field]||[]);setMeta(result);setError('');}}
  catch(e){if(active.current&&token===seq.current)setError(e.message);}
  finally{if(active.current&&token===seq.current)setLoading(false);}
 },[request,field]);
 useEffect(()=>{active.current=true;++generation.current;writing.current=false;setBusy(false);setData([]);setMeta({});setError('');setLoading(true);refresh();const focus=()=>{if(document.visibilityState!=='hidden'&&navigator.onLine!==false)refresh();};const timer=setInterval(focus,60000);window.addEventListener('focus',focus);window.addEventListener('online',focus);return()=>{active.current=false;invalidate();clearInterval(timer);window.removeEventListener('focus',focus);window.removeEventListener('online',focus);};},[refresh,invalidate]);
 const mutate=async(action,payload)=>{
  if(writing.current)return false;
  const started=generation.current;writing.current=true;++seq.current;setBusy(true);setError('');let success=false;
  try{await request(action,payload);success=true;if(active.current&&started===generation.current)window.dispatchEvent(new Event('checkpoint-rendezvous-changed'));}
  catch(e){if(active.current&&started===generation.current)setError(e.message);}
  finally{if(started===generation.current){writing.current=false;if(active.current){setBusy(false);if(success)await refresh();}}}
  return success&&active.current&&started===generation.current;
 };
 return {data,meta,loading,busy,error,refresh,mutate};
}
