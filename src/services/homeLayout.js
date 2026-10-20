export const HOME_BLOCKS={collection:'Ma collection',nextLevel:'Prochain niveau',session:'Prochaine session',picker:'À quoi je joue ?',rediscover:'À redécouvrir',duel:'L’Arène — Raccourci',monthly:'Bilan du mois',experiences:'Expériences Checkpoint',quiz:'Quiz de la semaine',library:'À retrouver',deals:'Promos',actions:'Actions proposées',activity:'Activité récente',radar:'Découvertes',agenda:'Agenda',rewards:'Récompenses'};
export function normalizeHomeLayout(value={}){
 const keys=Object.keys(HOME_BLOCKS),order=[...new Set((Array.isArray(value?.order)?value.order:[]).filter(k=>keys.includes(k)))];
 return {groupActivities:value?.groupActivities!==false,order:[...order,...keys.filter(k=>!order.includes(k))],hidden:[...new Set((Array.isArray(value?.hidden)?value.hidden:[]).filter(k=>keys.includes(k)))]};
}

export const HOME_ACTIVITIES={experiences:{label:'Expériences Checkpoint',description:'Ton film, tes capsules et tes prochaines soirées.'},picker:{label:'À quoi je joue ?',description:'Une suggestion selon ton envie.'},rediscover:{label:'À redécouvrir',description:'Retrouve un jeu que tu as aimé.'},duel:{label:'L’Arène',description:'Retrouve tes tournois et tes champions.'},monthly:{label:'Bilan du mois',description:'Reviens sur tes dernières parties.'},quiz:{label:'Quiz de la semaine',description:'Quelques questions pour le plaisir.'}};
