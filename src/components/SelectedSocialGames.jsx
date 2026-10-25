import './SelectedSocialGames.css';

export default function SelectedSocialGames({ids,games,onRemove,disabled=false}){
 if(!ids.length)return null;
 return <section className="selected-social-games" aria-label="Jeux sélectionnés"><p>Ta sélection reste conservée quand tu changes de filtre.</p><ul>{ids.map(id=><li key={id}><span>{games.find(game=>String(game.id)===id)?.name||'Jeu indisponible'}</span><button type="button" className="option-pill" disabled={disabled} aria-label={`Retirer ${games.find(game=>String(game.id)===id)?.name||'ce jeu'} de la sélection`} onClick={()=>onRemove(id)}>Retirer</button></li>)}</ul></section>;
}
