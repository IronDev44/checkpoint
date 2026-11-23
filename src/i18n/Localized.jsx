import {createElement,Fragment} from 'react';
import {translatedSource,translateText,useLanguage} from './language';

// React owns these text nodes. No DOM observer, HTML injection or data mutation.
export function LocalizedMessage({source,values=[]}){
 const {language}=useLanguage(),translated=translatedSource(source,language);
 const pieces=String(translated).split(/(\{\{\d+\}\})/g);
 return <>{pieces.map((piece,index)=>{const match=/^\{\{(\d+)\}\}$/.exec(piece);return <Fragment key={index}>{match?values[Number(match[1])]:piece}</Fragment>;})}</>;
}
export function LocalizedValue({value}){
 const {language}=useLanguage();
 return typeof value==='string'?translateText(value,language):value??null;
}
export function LocalizedElement({__as,__preserve=[],__messages={},children,...props}){
 const {language}=useLanguage(),localized={...props};
 for(const key of ['title','placeholder','aria-label','aria-description','aria-valuetext']){
  if(__preserve.includes(key))continue;
  const message=__messages[key];
  if(message){const source=translatedSource(message.source,language);localized[key]=source.replace(/\{\{(\d+)\}\}/g,(_,index)=>String(message.preserve?.includes(Number(index))?message.values[index]:translateText(message.values[index],language)));}
  else if(typeof props[key]==='string')localized[key]=translateText(props[key],language);
 }
 return createElement(__as,localized,children);
}
