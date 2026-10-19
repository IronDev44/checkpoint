import React,{useState,useEffect} from 'react';
import JourneyTrailer from './JourneyTrailer';
import TonightPlanner from './TonightPlanner';
import CouchMode from './CouchMode';
import TimeCapsules from './TimeCapsules';
import {dueCapsules} from '../services/experiences';
import './CheckpointExperiences.css';
export default function CheckpointExperiences({games,profile={},friends=[],lists=[],level=1,value,onChange,loadProfile,onOpenGame}){
 const [open,setOpen]=useState(null),[now,setNow]=useState(new Date());useEffect(()=>{const id=setInterval(()=>setNow(new Date()),60000);return()=>clearInterval(id);},[]);const due=dueCapsules(value,now).length;
 const cards=[['trailer','01','La bande-annonce de mon parcours','Tes jeux marquants, dans un film à partager.'],['tonight','02','On joue à quoi ce soir ?','Trouve une idée parmi les jeux de tes amis et les tiens.'],['couch','03','Mode canapé','Parcours ta collection à la manette, au clavier ou au toucher.'],['capsules','04','Capsules temporelles',due?`${due} capsule${due>1?'s':''} à ouvrir.`:'Une prédiction ou un souvenir à retrouver plus tard.']];
 return <section className="checkpoint-experiences"><small>TON PARCOURS PREND VIE</small><h2>Expériences Checkpoint</h2><p>Des façons de retrouver tes jeux et de préparer les prochaines soirées.</p><div className="experience-hub-grid">{cards.map(([id,number,title,text])=><button key={id} className="experience-hub-card" type="button" onClick={()=>setOpen(id)}><span>{number}</span><strong>{title}</strong><small>{text}</small><em>Découvrir →</em></button>)}</div>{open==='trailer'&&<JourneyTrailer games={games} profile={profile} level={level} onClose={()=>setOpen(null)}/>} {open==='tonight'&&<TonightPlanner games={games} friends={friends} loadProfile={loadProfile} onClose={()=>setOpen(null)} onOpenGame={onOpenGame}/>} {open==='couch'&&<CouchMode games={games} lists={lists} onClose={()=>setOpen(null)} onOpenGame={onOpenGame}/>} {open==='capsules'&&<TimeCapsules value={value} games={games} level={level} onChange={onChange} onClose={()=>setOpen(null)}/>}</section>;
}
