import {EXPEDITIONS} from './rendezvousCatalog';
import {personalMemories,normalizeEngagement} from './engagement';
export function rendezvousUpdates({rounds=[],challenges=[],recommendations=[],predictions=[],games=[],value,preferences={},now=new Date()}={}) {
 const notices=[];
 if(preferences.rendezvous!==false){
  for(const p of predictions){
   if(!p.cancelled&&!p.closed&&!p.resolvedAt&&p.myVote===null)notices.push({id:`prediction-open-${p.id}`,category:'rendezvous',type:'rendezvous',view:'predictions',priority:57,title:'Un pronostic est ouvert',message:p.title,cta:'Faire mon pronostic',tone:'focus'});
   if(!p.cancelled&&p.resolvedAt&&p.myVote!==null&&Date.parse(p.resolvedAt)>now.getTime()-30*86400000)notices.push({id:`prediction-result-${p.id}`,category:'rendezvous',type:'rendezvous',view:'predictions',priority:68,title:'Ton pronostic a son verdict',message:p.title,cta:'Voir le résultat',tone:'focus'});
  }
  for(const round of rounds.filter(r=>r.kind!=='expedition')){
   if(round.started&&!round.closed&&round.eligible&&round.myVote===null)notices.push({id:`selection-open-${round.id}`,category:'rendezvous',type:'rendezvous',view:'selections',priority:round.kind==='final'?72:52,title:round.kind==='final'?'La finale communautaire est ouverte':'La sélection de la semaine t’attend',message:round.title,cta:'Choisir mon jeu',tone:'focus'});
   if(round.closed&&round.myVote!==null&&round.myVote!=='skip'&&round.total>0&&Date.parse(round.endsAt)>now.getTime()-14*86400000)notices.push({id:`selection-ended-${round.id}`,category:'rendezvous',type:'rendezvous',view:'selections',priority:63,title:'Le verdict de ta sélection est disponible',message:round.title,cta:'Voir le résultat',tone:'focus'});
  }
  const data=normalizeEngagement(value),today=now.toISOString().slice(0,10),expedition=[...EXPEDITIONS].reverse().find(e=>e.opensAt<=today&&!data.expeditions[e.id]?.completedAt);
  if(expedition)notices.push({id:`expedition-open-${expedition.id}`,category:'rendezvous',type:'rendezvous',view:'expeditions',priority:48,title:'Une expédition à découvrir',message:expedition.title,cta:'Découvrir',tone:'focus'});
  const memory=personalMemories(games,now)[0];
  if(memory)notices.push({id:`memory-${memory.id}-${now.getUTCFullYear()}`,category:'rendezvous',type:'rendezvous',view:'memories',priority:54,title:`Il y a ${memory.years} an${memory.years>1?'s':''}…`,message:`${memory.label} ${memory.game.name}.`,cta:'Revoir mon souvenir',tone:'focus'});
 }
 if(preferences.recommendations!==false)for(const r of recommendations){
  if(r.archived)continue;
  if(!r.isSender&&!r.saved&&!r.response)notices.push({id:`recommendation-${r.id}`,category:'recommendations',type:'recommendation',recommendationId:r.id,priority:74,title:`${r.author} te recommande un jeu`,message:r.game.name,cta:'Lire son message',tone:'focus'});
  if(r.isSender&&r.response)notices.push({id:`recommendation-reply-${r.id}-${r.repliedAt}`,category:'recommendations',type:'recommendation',recommendationId:r.id,priority:75,title:`${r.friend} t’a répondu`,message:r.game.name,cta:'Lire son retour',tone:'focus'});
 }
 if(preferences.challenges!==false)for(const c of challenges){
  if(!c.closed&&c.myVote===null)notices.push({id:`challenge-invite-${c.id}`,category:'challenges',type:'challenge',challengeId:c.id,priority:86,title:`${c.author} te propose un choix caché`,message:c.question,cta:'Faire mon choix',tone:'focus'});
  if(c.revealed)notices.push({id:`challenge-revealed-${c.id}`,category:'challenges',type:'challenge',challengeId:c.id,priority:83,title:'Vos deux choix sont révélés',message:`${c.author} · ${c.friend} : ${c.question}`,cta:'Découvrir les réponses',tone:'focus'});
 }
 return notices;
}
