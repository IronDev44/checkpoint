import {arenaVariant} from './arenaVariants';
export function arenaRecap(tournament,games){
 const name=id=>games.find(g=>String(g.id)===id)?.name||'Jeu indisponible';
 const runner=tournament.round.find(id=>id!==tournament.winner);
 return {winner:name(tournament.winner),finalist:name(runner),participants:tournament.roster.length,path:(tournament.matches||[]).filter(m=>m.winner===tournament.winner).map(m=>({round:m.round,name:name(m.loser)})),partial:(tournament.trackedFrom??tournament.choices)>0};
}
export async function createArenaRecap(tournament,games){
 const recap=arenaRecap(tournament,games),canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1350;const ctx=canvas.getContext('2d');
 if(!ctx)throw new Error('Création de l’image indisponible sur cet appareil.');
 ctx.fillStyle='#0b0d11';ctx.fillRect(0,0,1080,1350);ctx.strokeStyle='#d6b66f';ctx.lineWidth=2;ctx.strokeRect(42,42,996,1266);
 const text=(value,y,size,color='#f5f1e8')=>{ctx.font=`${size>=40?'600 ':''}${size}px sans-serif`;ctx.fillStyle=color;ctx.textAlign='center';ctx.fillText(value,540,y,900);};
 text('CHECKPOINT',125,38,'#d6b66f');text(arenaVariant(tournament.variant)?.label.toUpperCase()||'MON GRAND VAINQUEUR',235,26,'#d6b66f');text(recap.winner,345,60);text(`${recap.participants} jeux au départ · ${tournament.variant?'un seul champion':'un seul préféré'}`,410,27);text('FINALISTE',525,22,'#d6b66f');text(recap.finalist,580,36);text('SON PARCOURS',690,24,'#d6b66f');
 recap.path.forEach((opponent,index)=>text(`Tour ${opponent.round} · victoire contre ${opponent.name}`,750+index*Math.min(48,420/Math.max(1,recap.path.length)),26));
 if(recap.partial)text('Parcours enregistré depuis la mise à jour',1230,20,'#bab5a9');text('Mes jeux. Mes choix. Mon Checkpoint.',1275,22,'#d6b66f');
 const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw new Error('L’image n’a pas pu être créée.');return new File([blob],'checkpoint-mon-tournoi.png',{type:'image/png'});
}
export function downloadArenaRecap(file){const url=URL.createObjectURL(file),link=document.createElement('a');link.href=url;link.download=file.name;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
