import {useEffect,useRef,useState} from 'react';
import {mergeEditionLinks,normalizeEditionLinks} from '../services/gameEditions';
const KEY='checkpoint-edition-links-v1';
export default function useEditionLinks(storage,remote,onChange){
 const [links,setLinks]=useState(()=>{let local;try{local=JSON.parse(storage.getItem(KEY)||'[]');}catch{}return mergeEditionLinks(local,remote);});
 const signature=useRef('');
 const persist=value=>{try{storage.setItem(KEY,JSON.stringify(value));}catch{/* Account settings still receive the change. */}};
 useEffect(()=>{
  const nextSignature=JSON.stringify(normalizeEditionLinks(remote));if(signature.current===nextSignature)return;signature.current=nextSignature;
  const merged=mergeEditionLinks(links,remote);setLinks(merged);persist(merged);if(onChange&&JSON.stringify(merged)!==nextSignature)onChange(merged);
 // Local tombstones protect removed edition links from old account copies.
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[remote]);
 return [links,value=>{const merged=mergeEditionLinks(links,value);setLinks(merged);persist(merged);onChange?.(merged);}];
}
