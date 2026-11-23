import {useSyncExternalStore} from 'react';

export const LANGUAGES=Object.freeze([
 {code:'fr',name:'Français',tag:'fr-FR'},
 {code:'en',name:'English',tag:'en-GB'},
 {code:'es',name:'Español',tag:'es-ES'},
 {code:'de',name:'Deutsch',tag:'de-DE'},
 {code:'it',name:'Italiano',tag:'it-IT'},
 {code:'pt',name:'Português',tag:'pt-PT'},
]);
export const LANGUAGE_KEY='checkpoint-language-v1';
const listeners=new Set(),catalogs={fr:{}},patterns=new Map();
let state={language:'fr',confirmed:false},pendingChoice=false,requestVersion=0;
export function validLanguage(code){return LANGUAGES.some(item=>item.code===code);}
export function readLanguagePreference(storage){
 try{const target=storage||(typeof window!=='undefined'?window.localStorage:null);const value=JSON.parse(target?.getItem(LANGUAGE_KEY)||'null');return validLanguage(value?.language)&&value.confirmed===true?value:null;}catch{return null;}
}
export function suggestedLanguage(languages=typeof navigator==='undefined'?[]:navigator.languages){
 for(const value of languages||[]){const code=String(value).toLowerCase().split(/[-_]/)[0];if(validLanguage(code))return code;}return 'fr';
}
export const getLanguage=()=>state.language;
export const getIntlLocale=()=>LANGUAGES.find(item=>item.code===state.language)?.tag||'fr-FR';
const subscribe=callback=>{listeners.add(callback);return()=>listeners.delete(callback);};
export function useLanguage(){return useSyncExternalStore(subscribe,()=>state,()=>state);}
export function consumeLanguageChoice(){const value=pendingChoice;pendingChoice=false;return value;}
export async function selectLanguage(language,{remember=true,explicit=true}={}){
 if(!validLanguage(language))throw new Error('Unsupported language');
 const version=++requestVersion;
 if(!catalogs[language]){
  const loaders={en:()=>import('./locales/en.json'),es:()=>import('./locales/es.json'),de:()=>import('./locales/de.json'),it:()=>import('./locales/it.json'),pt:()=>import('./locales/pt.json')};
  const module=await loaders[language]();catalogs[language]=module.default||module;
 }
 if(version!==requestVersion)return;
 if(explicit)pendingChoice=true;
 state={language,confirmed:remember||state.confirmed};
 document.documentElement.lang=language;
 if(remember){try{localStorage.setItem(LANGUAGE_KEY,JSON.stringify({language,confirmed:true}));}catch{/* The choice remains valid for this visit. */}}
 for(const callback of listeners)callback();
}
const normalize=value=>value.replace(/\s+/g,' ').trim();
function templatePatterns(language){
 if(patterns.has(language))return patterns.get(language);
 const result=[];
 for(const [source,translation] of Object.entries(catalogs[language]||{})){
  if(!source.includes('{{'))continue;
  const indexes=[],segments=source.split(/(\{\{\d+\}\})/g);
  const regex=segments.map(piece=>{const m=/^\{\{(\d+)\}\}$/.exec(piece);if(m){indexes.push(Number(m[1]));return '(.+?)';}return piece.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');}).join('');
  const prefix=segments[0];if(prefix.length<3)continue;
  result.push({regex:new RegExp('^'+regex+'$'),prefix,indexes,translation});
 }
 result.sort((a,b)=>b.prefix.length-a.prefix.length);patterns.set(language,result);return result;
}
export function translatedSource(source,language=state.language){
 if(typeof source!=='string'||language==='fr')return source;
 const normalized=normalize(source),catalog=catalogs[language]||{};
 if(catalog[source])return catalog[source];
 if(catalog[normalized])return (source.match(/^\s*/)?.[0]||'')+catalog[normalized]+(source.match(/\s*$/)?.[0]||'');
 return source;
}
export function translateText(value,language=state.language){
 if(typeof value!=='string'||language==='fr')return value;
 const exact=translatedSource(value,language);if(exact!==value)return exact;
 const normalized=normalize(value);
 for(const entry of templatePatterns(language)){
  if(!normalized.startsWith(entry.prefix))continue;
  const match=entry.regex.exec(normalized);if(!match)continue;
  const values={};entry.indexes.forEach((index,i)=>{values[index]=match[i+1];});
  return entry.translation.replace(/\{\{(\d+)\}\}/g,(_,index)=>values[index]??'');
 }
 return value;
}
