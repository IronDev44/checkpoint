import {arenaVariant} from '../services/arenaVariants';
function versionDescription(tournament,games){
 if(!tournament)return 'Aucun tournoi';
 const name=id=>games.find(g=>String(g.id)===id)?.name||tournament.participants?.find(g=>String(g.id)===id)?.name||'Jeu indisponible';
 if(tournament.winner)return `Vainqueur : ${name(tournament.winner)}`;
 const last=tournament.matches?.at(-1);
 return last?`Dernier choix : ${name(last.winner)}`:`Prochain duel : ${tournament.round.slice(tournament.index,tournament.index+2).map(name).join(' / ')}`;
}
export default function ArenaSyncStatus({sync,tournament,games}){
 if(!sync.active)return null;
 const message=sync.status==='synced'?'Tournoi synchronisé avec ton compte.':sync.status==='syncing'?'Synchronisation du tournoi…':sync.status==='conflict'?'Deux progressions différentes ont été trouvées.':sync.status==='storage-error'?'La sauvegarde locale n’a pas abouti. Garde cette fenêtre ouverte.':'Enregistré sur cet appareil · synchronisation en attente.';
 return <div className="arena-sync"><p role="status">{message}</p>{sync.status==='pending'&&<button className="option-pill" onClick={sync.retry}>Réessayer</button>}{sync.conflict&&<section className="arena-sync-conflict"><h4>Quelle progression conserver ?</h4><p><strong>Sur cet appareil</strong> · {tournament?.choices||0} choix · {tournament?.roster.length||0} participants<br/>{arenaVariant(tournament?.variant)?.label||'Tournoi de préférences'} · {versionDescription(tournament,games)}</p><p><strong>Sur le compte</strong> · {sync.conflict.tournament?.choices||0} choix · {sync.conflict.tournament?.roster.length||0} participants<br/>{arenaVariant(sync.conflict.tournament?.variant)?.label||'Tournoi de préférences'} · {versionDescription(sync.conflict.tournament,games)}</p><p>La version choisie remplacera l’autre. Aucun choix n’est fusionné automatiquement.</p><div className="duel-actions"><button className="option-pill" onClick={()=>sync.resolve('cloud')}>Reprendre la version du compte</button><button className="option-pill" onClick={()=>sync.resolve('local')}>Conserver celle de cet appareil</button></div></section>}</div>;
}
