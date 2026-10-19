import {compareFriendGames} from './friendComparison';
import {sharedGamePlatforms,multiplayerInfo} from './playTogether';
export function tonightCandidates(ownGames,profiles,{platform='all',mood='all',players=2,mode='all',location='any',verified={}}={}){
 if(!profiles.length||profiles.some(p=>p.visibility&&p.visibility!=='public'))return [];
 const common=profiles.map(profile=>compareFriendGames(ownGames,profile).common),moods={action:/action|shooter|combat|fighting/i,relax:/puzzle|simulation|casual|platform/i,adventure:/adventure|aventure|rpg|role.play/i,strategy:/strategy|strategie|tactical/i};
 return common[0].filter(row=>common.every(rows=>rows.some(other=>String(other.ownGame.id)===String(row.ownGame.id)))).map(row=>{
  const id=String(row.ownGame.id),info=verified[id]||multiplayerInfo(row.ownGame),shared=common.map(rows=>sharedGamePlatforms(row.ownGame,rows.find(r=>String(r.ownGame.id)===id).game));
  const platforms=shared[0].filter(p=>shared.every(values=>values.includes(p)));
  const capacity=location==='local'?info.capacity?.local:location==='online'?info.capacity?.online:Math.max(info.capacity?.local||0,info.capacity?.online||0);
  const confirmed=['coop','multi'].includes(info.kind)&&capacity>=players&&platforms.length>0;
  return {game:row.ownGame,info,platforms,capacity:capacity||null,confirmed,score:common.reduce((sum,rows)=>sum+(rows.find(r=>String(r.ownGame.id)===id).friendRating||0),Number(row.ownGame.rating)||0)};
 }).filter(row=>(platform==='all'||row.platforms.includes(platform))&&(mood==='all'||moods[mood]?.test((row.game.genreNames||row.game.genres||[]).map(g=>typeof g==='string'?g:g.name).join(' ').normalize('NFD').replace(/[\u0300-\u036f]/g,'')))&&(mode==='all'||row.info.kind===mode||row.info.kind==='unknown')&&row.info.kind!=='solo'&&(!row.capacity||row.capacity>=players)).sort((a,b)=>Number(b.confirmed)-Number(a.confirmed)||b.score-a.score);
}
