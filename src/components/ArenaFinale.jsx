import {useState} from 'react';
import {arenaVariant} from '../services/arenaVariants';
import {arenaRecap,createArenaRecap,downloadArenaRecap} from '../services/arenaShare';
export default function ArenaFinale({tournament,games}){
 const [busy,setBusy]=useState(false),[message,setMessage]=useState('');const recap=arenaRecap(tournament,games);
 const exportImage=async share=>{setBusy(true);setMessage('');try{const file=await createArenaRecap(tournament,games);if(share&&typeof navigator.share==='function'&&navigator.canShare?.({files:[file]}))await navigator.share({files:[file],title:'Mon tournoi Checkpoint'});else{downloadArenaRecap(file);setMessage('Ton récapitulatif est prêt à être enregistré.');}}catch(error){if(error.name!=='AbortError')setMessage(error.message||'Création de l’image indisponible.');}finally{setBusy(false);}};
 return <section className="arena-finale-recap"><span className="arena-eyebrow">LE DERNIER FACE-À-FACE</span><h4>Finaliste : {recap.finalist}</h4><p>{recap.participants} participants · {tournament.choices} choix pour désigner {tournament.variant?`ton champion « ${arenaVariant(tournament.variant)?.label} »`:'ton préféré'}.</p><p>Retrouve les adversaires battus dans le parcours ci-dessous.</p><div className="duel-actions"><button className="option-pill" disabled={busy} onClick={()=>exportImage(false)}>Enregistrer le récapitulatif</button><button className="option-pill" disabled={busy} onClick={()=>exportImage(true)}>Partager le récapitulatif</button></div>{message&&<p role="status">{message}</p>}</section>;
}
