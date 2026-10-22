import {validDuel} from './arena-duel.js';
export const ARENA_SYNC_KEY='checkpoint-arena-sync-v1';
export const ARENA_SESSION_KEY='checkpoint-arena-session-v1';
export function normalizeArenaEnvelope(value){
 if(!value||typeof value.revision!=='string'||!value.revision||value.revision.length>128)return null;
 if(value.tournament===null)return {revision:value.revision,tournament:null};
 const t=value.tournament;
 if(!t||!['classic','collection','champions','ultimate'].includes(t.kind)||typeof t.id!=='string'||!t.id||t.id.length>128||!validDuel(t,Array.isArray(t.roster)?t.roster:[]))return null;
 const allowed=new Set(t.roster),names=Array.isArray(t.participants)?t.participants:[];
 const participants=names.filter(g=>g&&allowed.has(String(g.id))&&typeof g.name==='string').map(g=>({id:String(g.id),name:g.name.slice(0,200),cover_image:typeof g.cover_image==='string'?g.cover_image.slice(0,2048):'',sourceIds:g.sourceIds&&Number.isSafeInteger(Number(g.sourceIds.igdb))?{igdb:Number(g.sourceIds.igdb)}:{},released:typeof g.released==='string'?g.released.slice(0,20):'',platforms:Array.isArray(g.platforms)?g.platforms.filter(p=>typeof p==='string').slice(0,20):[]}));
 const matches=Array.isArray(t.matches)?t.matches.filter(m=>m&&allowed.has(m.winner)&&allowed.has(m.loser)&&m.winner!==m.loser&&Number.isInteger(m.choice)&&m.choice>0&&m.choice<=t.choices&&Number.isInteger(m.round)&&m.round>0&&m.round<=t.roundNumber).map(m=>({choice:m.choice,round:m.round,winner:m.winner,loser:m.loser})):[];
 if(new Set(matches.map(m=>m.choice)).size!==matches.length)return null;
 return {revision:value.revision,tournament:{id:t.id,...(['grouped','all'].includes(t.editionMode)?{editionMode:t.editionMode}:{}),...(t.variant?{variant:t.variant}:{}),kind:t.kind||'classic',roster:[...t.roster],round:[...t.round],next:[...t.next],index:t.index,roundNumber:t.roundNumber,winner:t.winner||null,choices:t.choices,participants,matches,trackedFrom:matches.length?Math.max(0,matches[0].choice-1):t.choices,...(Number.isFinite(Date.parse(t.finishedAt))?{finishedAt:new Date(t.finishedAt).toISOString()}:{})}};
}
