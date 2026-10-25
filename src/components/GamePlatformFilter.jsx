import {getCoverPlatformNames} from '../services/gameCovers';

export const gamePlatformNames=game=>[...new Set(getCoverPlatformNames(game).map(name=>name.trim()).filter(Boolean))];
export const matchesGamePlatform=(game,platform)=>platform==='all'||(platform==='unknown'?!gamePlatformNames(game).length:gamePlatformNames(game).includes(platform));

export default function GamePlatformFilter({games,value,onChange,disabled=false}){
 const platforms=[...new Set(games.flatMap(gamePlatformNames))].sort((a,b)=>a.localeCompare(b,'fr',{numeric:true}));
 return <label>Plateforme<select value={value} disabled={disabled} onChange={e=>onChange(e.target.value)}><option value="all">Toutes les plateformes</option>{platforms.map(name=><option key={name} value={name}>{name}</option>)}{games.some(game=>!gamePlatformNames(game).length)&&<option value="unknown">Plateforme non renseignée</option>}</select></label>;
}
