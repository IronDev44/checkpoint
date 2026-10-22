import {useMemo,useState} from 'react';
import {Image,Compass,Music2,BookOpen,Sparkles,ArrowRight} from 'lucide-react';
import {ARENA_VARIANTS,arenaVariant,isArenaOpenWorld} from '../services/arenaVariants';
import {duelCandidates} from '../services/soloDuel';
import ArenaGameCover from './ArenaGameCover';
const ICONS={visual:Image,exploration:Compass,soundtrack:Music2,story:BookOpen,atmosphere:Sparkles};
export function ArenaVariantIcon({id,...props}){const Icon=ICONS[id]||Sparkles;return <Icon {...props}/>;}
const clean=value=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const PAGE_SIZE=12;
export default function ArenaVariants({games,tournament,onStart,onResume}){
 const owned=useMemo(()=>[...new Map(duelCandidates(games).map(g=>[String(g.id),g])).values()].sort((a,b)=>a.name.localeCompare(b.name,'fr')),[games]);
 const [variantId,setVariantId]=useState('visual'),[selected,setSelected]=useState(()=>owned.map(g=>String(g.id))),[query,setQuery]=useState(''),[openWorldOnly,setOpenWorldOnly]=useState(false),[page,setPage]=useState(1),[confirm,setConfirm]=useState(false);

 const variant=arenaVariant(variantId),selectedIds=new Set(owned.filter(game=>selected.includes(String(game.id))||game.arenaEdition?.members.some(id=>selected.includes(id))).map(game=>String(game.id)));
 const filtered=owned.filter(g=>(!openWorldOnly||isArenaOpenWorld(g))&&clean(g.name).includes(clean(query.trim()))),visible=filtered.slice(0,page*PAGE_SIZE);
 const changeVariant=id=>{setVariantId(id);setSelected(owned.filter(g=>id!=='exploration'||isArenaOpenWorld(g)).map(g=>String(g.id)));setOpenWorldOnly(id==='exploration');setQuery('');setPage(1);setConfirm(false);};
 const toggle=game=>{setConfirm(false);const id=String(game.id),members=game.arenaEdition?.members||[id];setSelected(old=>selectedIds.has(id)?old.filter(value=>!members.includes(value)):[...new Set([...old,id])]);};
 return <section className="arena-variants"><header className="arena-variants-heading"><span className="arena-eyebrow">UN AUTRE REGARD SUR TES JEUX</span><h3>À chacun son champion.</h3><p>La plus belle image, la musique qui reste… Choisis ce que tu veux départager.</p></header>
 {tournament&&!tournament.winner&&<aside className="arena-variant-resume"><p>Un tournoi est en cours{tournament.variant?` : ${arenaVariant(tournament.variant)?.label}`:''}. Tu peux préparer ta sélection sans le remplacer.</p><button className="option-pill" onClick={onResume}>Reprendre mon tournoi</button></aside>}
 <div className="arena-variant-types" role="group" aria-label="Type de tournoi thématique">{ARENA_VARIANTS.map(item=><button type="button" key={item.id} className={`arena-variant-type ${variantId===item.id?'is-selected':''}`} aria-pressed={variantId===item.id} onClick={()=>changeVariant(item.id)}><ArenaVariantIcon id={item.id} size={22} aria-hidden="true"/><span>{item.label}</span></button>)}</div>
 <div className="arena-variant-intent"><span className="arena-eyebrow">{variant.label}</span><h4>{variant.question}</h4><p>{variant.description} Ton choix exprime ton ressenti, pas une note technique.</p></div>
 <section className="arena-variant-selection" aria-label="Participants de la variante"><header><h4>Choisir les participants</h4><span>{selectedIds.size} jeu{selectedIds.size!==1?'x':''} sélectionné{selectedIds.size!==1?'s':''} · {Math.max(0,selectedIds.size-1)} duel{selectedIds.size>2?'s':''}</span></header><p>Garde les jeux que tu connais assez pour les comparer. Chaque jeu sélectionné participera une fois ; la wishlist est exclue.</p>
 {variantId==='exploration'&&<><p>La suggestion utilise uniquement les mentions explicites « monde ouvert ». Si un jeu manque, affiche tous tes jeux et ajoute-le toi-même.</p><label className="arena-variant-filter"><input type="checkbox" checked={openWorldOnly} onChange={e=>{setOpenWorldOnly(e.target.checked);setPage(1);}}/>Afficher seulement les mondes ouverts repérés</label></>}
 <label className="arena-variant-search">Rechercher dans ma collection<input type="search" value={query} onChange={e=>{setQuery(e.target.value);setPage(1);}} placeholder="Nom d’un jeu…"/></label>
 <div className="arena-variant-select-actions"><button className="option-pill" disabled={!filtered.length} onClick={()=>{setSelected(old=>[...new Set([...old,...filtered.map(g=>String(g.id))])]);setConfirm(false);}}>Sélectionner les résultats ({filtered.length})</button><button className="option-pill" disabled={!selectedIds.size} onClick={()=>{setSelected([]);setConfirm(false);}}>Vider la sélection</button></div>
 {!filtered.length&&<p role="status">{openWorldOnly?'Aucun monde ouvert repéré avec ces informations. Décoche le filtre pour choisir parmi tous tes jeux.':'Aucun jeu trouvé dans ta collection.'}</p>}
 <div className="arena-variant-list">{visible.map(game=><label key={game.id} className={`arena-variant-game ${selectedIds.has(String(game.id))?'is-selected':''}`}><input type="checkbox" checked={selectedIds.has(String(game.id))} aria-label={`Faire participer ${game.name}`} onChange={()=>toggle(game)}/><ArenaGameCover game={game}/><span>{game.name}{game.arenaEdition?.count>1&&<small>{game.arenaEdition.count} versions liées · une participation</small>}{variantId==='exploration'&&isArenaOpenWorld(game)&&<small>Monde ouvert repéré</small>}</span></label>)}</div>
 {visible.length<filtered.length&&<button className="option-pill" onClick={()=>setPage(n=>n+1)}>Afficher plus de jeux · {visible.length}/{filtered.length}</button>}
 <p className="arena-variant-selection-note">La recherche et le filtre changent la liste affichée, pas les jeux déjà sélectionnés. {selectedIds.size} participants au total.</p>
 </section>
 <footer className="arena-variant-start"><p>Un champion « {variant.label} », dans son propre palmarès. Tes notes, favoris et autres titres restent inchangés.</p><button className="option-pill checkpoint-primary-action" disabled={selectedIds.size<2} onClick={()=>{if(tournament&&!tournament.winner)setConfirm(true);else onStart(variantId,[...selectedIds]);}}>Lancer {variant.label}<ArrowRight size={17} aria-hidden="true"/></button>{selectedIds.size<2&&<small>Sélectionne au moins deux jeux pour commencer.</small>}</footer>
 {confirm&&<div className="duel-restart" role="group" aria-label="Remplacer le tournoi en cours"><p>Lancer « {variant.label} » remplacera le tableau en cours et ses {tournament.choices} choix. Ses titres déjà obtenus restent dans ton palmarès.</p><div className="duel-actions"><button className="option-pill" disabled={selectedIds.size<2} onClick={()=>onStart(variantId,[...selectedIds])}>Remplacer et lancer la variante</button><button className="option-pill" onClick={()=>setConfirm(false)}>Garder mon tournoi</button></div></div>}
 </section>;
}
