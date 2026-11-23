import { useLanguage } from "../i18n/language";import { LocalizedMessage, LocalizedValue, LocalizedElement } from "../i18n/Localized";import './SelectedSocialGames.css';

export default function SelectedSocialGames({ ids, games, onRemove, disabled = false }) {useLanguage();
  if (!ids.length) return null;
  return <LocalizedElement __as={"section"} className="selected-social-games" aria-label="Jeux sélectionnés"><p><LocalizedMessage source={"Ta sélection reste conservée quand tu changes de filtre."} values={[]} /></p><ul>{ids.map((id) => <li key={id}><span><LocalizedValue value={games.find((game) => String(game.id) === id)?.name || 'Jeu indisponible'} /></span><LocalizedElement __as={"button"} type="button" className="option-pill" disabled={disabled} onClick={() => onRemove(id)} __messages={{ "aria-label": { source: "Retirer {{0}} de la sélection", values: [games.find((game) => String(game.id) === id)?.name || 'ce jeu'], preserve: [] } }}><LocalizedMessage source="Retirer" values={[]}/></LocalizedElement></li>)}</ul></LocalizedElement>;
}
