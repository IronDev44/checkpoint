import {accountStorage} from './accountData';
import {RELEASE_NOTES,FEATURE_TUTORIALS} from '../data/releaseNotes';
const KEY='checkpoint-release-progress-v1';
export const RELEASE_PROGRESS_EVENT='checkpoint-release-progress';
export function readReleaseProgress(){
 try{const data=JSON.parse(accountStorage.getItem(KEY)||'{}');return {
  read:Array.isArray(data?.read)?data.read.filter(id=>RELEASE_NOTES.some(r=>r.id===id)):[],
  guides:Array.isArray(data?.guides)?data.guides.filter(id=>FEATURE_TUTORIALS.some(g=>g.id===id)):[],
 };}catch{return {read:[],guides:[]};}
}
function save(field,ids){
 const progress=readReleaseProgress();
 try{accountStorage.setItem(KEY,JSON.stringify({...progress,[field]:[...new Set([...progress[field],...ids])]}));}catch{/* Discovery stays available without persistent storage. */}
 window.dispatchEvent(new Event(RELEASE_PROGRESS_EVENT));
}
export const markReleasesRead=ids=>save('read',ids.filter(id=>RELEASE_NOTES.some(r=>r.id===id)));
export const markFeatureGuidesSeen=ids=>save('guides',ids.filter(id=>FEATURE_TUTORIALS.some(g=>g.id===id)));
export const pendingFeatureGuides=tab=>{const seen=readReleaseProgress().guides;return FEATURE_TUTORIALS.filter(g=>g.tab===tab&&!seen.includes(g.id));};
