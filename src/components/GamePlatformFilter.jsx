import { useLanguage } from "../i18n/language";import { LocalizedMessage, LocalizedValue } from "../i18n/Localized";import { getCoverPlatformNames } from '../services/gameCovers';

export const gamePlatformNames = (game) => [...new Set(getCoverPlatformNames(game).map((name) => name.trim()).filter(Boolean))];
export const matchesGamePlatform = (game, platform) => platform === 'all' || (platform === 'unknown' ? !gamePlatformNames(game).length : gamePlatformNames(game).includes(platform));

export default function GamePlatformFilter({ games, value, onChange, disabled = false }) {useLanguage();
  const platforms = [...new Set(games.flatMap(gamePlatformNames))].sort((a, b) => a.localeCompare(b, 'fr', { numeric: true }));
  return <label><LocalizedMessage source={"Plateforme"} values={[]} /><select value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)}><option value="all"><LocalizedMessage source={"Toutes les plateformes"} values={[]} /></option>{platforms.map((name) => <option key={name} value={name}>{name}</option>)}{games.some((game) => !gamePlatformNames(game).length) && <option value="unknown"><LocalizedMessage source={"Plateforme non renseignée"} values={[]} /></option>}</select></label>;
}
