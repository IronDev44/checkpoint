import React,{useMemo,useState} from 'react';
import './DataProtection.css';
const moods={all:'Peu importe',adventure:'Partir à l’aventure',action:'De l’action',relax:'Une pause tranquille',strategy:'Me creuser la tête'};
const matches={adventure:/adventure|aventure|role.playing|rpg|exploration/i,action:/action|shooter|fighting|combat|racing|course/i,relax:/puzzle|simulation|casual|platform|plate.forme/i,strategy:/strategy|stratégie|tactical|puzzle/i};
export function sessionCandidates(games,{platform='all',mood='all',time='any'}={}){
  return games.filter(g=>g.status!=='wishlist'&&!['paused','abandoned'].includes(g.progressStatus)&&!g.completed&&g.progressStatus!=='completed'&&g.status!=='termine'&&g.status!=='terminé').filter(g=>platform==='all'||(g.playedPlatforms||g.platformNames||[]).some(p=>(typeof p==='string'?p:p.name)===platform)).filter(g=>mood==='all'||matches[mood]?.test((g.genres||g.genreNames||[]).map(v=>typeof v==='string'?v:v.name).join(' '))).map(g=>({game:g,score:(g.status==='en cours'||g.progressStatus==='in_progress'?time==='short'?4:1:time==='long'?2:0)})).sort((a,b)=>b.score-a.score).map(v=>v.game);
}
export default function SessionPicker({games=[],onOpen}){
  const [platform,setPlatform]=useState('all'),[mood,setMood]=useState('all'),[time,setTime]=useState('any'),[picked,setPicked]=useState(null);
  const platforms=useMemo(()=>Array.from(new Set(games.flatMap(g=>g.playedPlatforms||g.platformNames||[]).map(p=>typeof p==='string'?p:p.name).filter(Boolean))).sort(),[games]);
  const candidates=sessionCandidates(games,{platform,mood,time});
  const game=picked&&candidates.find(g=>g.id===picked);
  if(!games.some(g=>g.status!=='wishlist'))return null;
  const change=(setter,value)=>{setter(value);setPicked(null);};
  return <section className="session-picker" aria-labelledby="session-picker-title"><h2 id="session-picker-title">À quoi je joue ?</h2><p>Une idée parmi les jeux de ta bibliothèque que tu n’as pas terminés.</p>
    <div className="session-picker-controls"><label>Mon envie<select value={mood} onChange={e=>change(setMood,e.target.value)}>{Object.entries(moods).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label><label>Mon temps<select value={time} onChange={e=>change(setTime,e.target.value)}><option value="any">Pas de préférence</option><option value="short">Une petite session</option><option value="long">J’ai du temps devant moi</option></select></label><label>Ma plateforme<select value={platform} onChange={e=>change(setPlatform,e.target.value)}><option value="all">Toutes mes plateformes</option>{platforms.map(p=><option key={p}>{p}</option>)}</select></label></div>
    <button type="button" className="option-pill checkpoint-primary-action" disabled={!candidates.length} onClick={()=>{const pool=candidates.filter(g=>g.id!==picked);const preferred=(pool.length?pool:candidates);const best=sessionCandidates(preferred,{platform,mood,time});const topScore=time==='short'?best.filter(g=>g.status==='en cours'||g.progressStatus==='in_progress'):[];const choices=topScore.length?topScore:best;setPicked(choices[Math.floor(Math.random()*choices.length)].id);}}>{picked?'Une autre idée':'Trouver mon prochain jeu'}</button>
    {!candidates.length&&<p role="status">Aucun jeu ne correspond. Essaie une autre envie ou une autre plateforme.</p>}
    {game&&<div className="session-picker-result" role="status">{game.image&&<img src={game.image} alt=""/>}<div><h3>{game.name}</h3><p>{time==='short'&&(game.status==='en cours'||game.progressStatus==='in_progress')?'Une partie déjà commencée, facile à reprendre.':mood!=='all'?'Son genre correspond à ton envie.':'Un jeu à découvrir dans ta collection.'} Le temps choisi sert à privilégier une reprise ou une découverte, sans estimer la durée du jeu.</p><button type="button" className="option-pill" onClick={()=>onOpen(game)}>Voir le jeu</button></div></div>}
  </section>;
}
