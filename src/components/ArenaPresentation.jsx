import {ArrowRight,Crown,ShieldCheck,Swords} from 'lucide-react';
import {getKnownGameCover} from '../services/gameCovers';
import ArenaGameCover from './ArenaGameCover';

export function ArenaCrest({small=false}){
 return <span className={`arena-crest ${small?'arena-crest-small':''}`} aria-hidden="true"><svg viewBox="0 0 160 160" fill="none"><path d="M80 5 145 42v76l-65 37-65-37V42Z"/><path d="M80 16 135 48v64l-55 32-55-32V48Z"/><path d="M8 80h22m100 0h22M80 0v25m0 110v25"/></svg><Crown strokeWidth={1.25}/></span>;
}
export function ArenaCoverFan({games=[]}){
 const selected=[...games.filter(g=>getKnownGameCover(g)),...games.filter(g=>!getKnownGameCover(g))].slice(0,5);
 return <div className="arena-cover-fan" aria-hidden="true"><div className="arena-cover-orbit"/>{selected.map((game,index)=>{return <span className="arena-fan-cover" key={game.id} style={{'--cover-position':index-(selected.length-1)/2,'--cover-depth':Math.abs(index-(selected.length-1)/2),zIndex:10-Math.round(Math.abs(index-(selected.length-1)/2)*2)}}><ArenaGameCover game={game} fallback={<span className="arena-fan-fallback"><Swords size={24} strokeWidth={1}/><span>{game.name}</span></span>}/></span>;})}<span className="arena-fan-medallion"><Crown size={21} strokeWidth={1.4}/></span></div>;
}
export function ArenaGrandInvitation({games,onStart}){
 const count=new Set(games.map(game=>String(game.id))).size;
 return <section className="arena-grand-invitation"><div className="arena-invitation-copy"><span className="arena-eyebrow"><Swords size={14} aria-hidden="true"/> LE GRAND TOURNOI</span><h3>Un seul jeu<br/><em>au sommet.</em></h3><p>Ta collection entre en lice.<br/>À toi de choisir sa légende.</p></div><ArenaCoverFan games={games}/><dl className="arena-tournament-numbers"><div><dt>Jeux en lice</dt><dd>{count}</dd></div><div><dt>Duels à jouer</dt><dd>{Math.max(0,count-1)}</dd></div><div><dt>Vainqueur</dt><dd>1</dd></div></dl><button type="button" className="option-pill checkpoint-primary-action arena-start" disabled={count<2} onClick={onStart}>Commencer le grand tournoi<ArrowRight size={17} aria-hidden="true"/></button>{count<2&&<p className="arena-empty-note">Ajoute au moins deux jeux à ta collection pour commencer.</p>}<span className="arena-save-note"><ShieldCheck size={14} aria-hidden="true"/> À ton rythme · progression sauvegardée sur cet appareil</span><ArenaRules/></section>;
}
export function ArenaRules(){
 return <details className="arena-rules"><summary>Les règles du tournoi</summary><ul><li>Tous les jeux de ta collection au lancement participent une fois, hors wishlist.</li><li>Les exemptions du premier tour sont tirées au sort. Aucun jeu n’est écarté.</li><li>Chaque choix est sauvegardé sur cet appareil. Tu peux fermer et reprendre plus tard.</li><li>Les jeux ajoutés ensuite attendront le prochain tournoi. Tes notes et tes favoris ne changent pas.</li></ul></details>;
}
