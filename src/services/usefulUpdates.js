import {monthlyRecap,monthKey} from './monthlyRecap';
export const NOTIFICATION_GROUPS={updates:'Nouveautés de Checkpoint',polls:'Sondages entre amis',rendezvous:'Sélections, pronostics, expéditions et souvenirs',recommendations:'Recommandations entre amis',challenges:'Défis entre amis',monthly:'Bilan mensuel',collection:'Jeux à noter',releases:'Sorties et wishlist',progression:'Épreuves et progression',service:'Disponibilité des sources'};
export function normalizeNotificationPreferences(value={}){return Object.fromEntries(Object.keys(NOTIFICATION_GROUPS).map(key=>[key,value?.[key]!==false]));}
export function notificationAllowed(item,preferences){const category=item.category||({trial:'progression',rating:'collection',release:'releases',wishlist:'releases',source:'service'}[item.type])||'service';return normalizeNotificationPreferences(preferences)[category];}
export function buildUsefulUpdates({polls=[],games=[],preferences={},now=new Date()}={}){
 const options=normalizeNotificationPreferences(preferences),notifications=[];
 if(options.polls)for(const poll of polls){
  const end=Date.parse(poll.endsAt),created=Date.parse(poll.createdAt);if(!Number.isFinite(end)||!Number.isFinite(created))continue;
  const closed=poll.closed||now.getTime()>=end;
  if(closed&&now.getTime()-end>30*86400000)continue;
  if(!closed&&!poll.isOwner&&poll.myVote==null)notifications.push({id:`poll-invite-${poll.id}`,category:'polls',type:'poll',priority:85,title:`${poll.author||'Un ami'} attend ton vote`,message:'Quel jeu devrait-il commencer ? Aide-le à choisir.',cta:'Voter',tab:'social',pollId:poll.id,tone:'focus'});
  if(closed&&(poll.isOwner||poll.myVote!=null))notifications.push({id:`poll-ended-${poll.id}`,category:'polls',type:'poll',priority:82,title:'Un sondage est terminé',message:`${poll.isOwner?'Ton sondage':`Le sondage de ${poll.author||'ton ami'}`} : ${poll.total||0} participant${poll.total>1?'s':''}.`,cta:'Voir les résultats',tab:'social',pollId:poll.id,tone:'focus'});
 }
 if(options.monthly){const key=monthKey(new Date(now.getFullYear(),now.getMonth()-1,1)),recap=monthlyRecap(games,key);if(recap.added.length||recap.completed.length||recap.favorites.length)notifications.push({id:`monthly-${key}`,category:'monthly',type:'monthly',priority:78,title:'Ton bilan du mois est prêt',message:`Retrouve les jeux qui ont marqué ${recap.label}.`,cta:'Voir mon bilan',tab:'home',month:key,tone:'legendary'});}
 return notifications.sort((a,b)=>b.priority-a.priority);
}
