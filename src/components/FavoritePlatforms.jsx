import { useId } from "react";
import { X } from "lucide-react";
import { FAVORITE_PLATFORM_GROUPS, parseFavoritePlatforms, serializeFavoritePlatforms } from "../services/favoritePlatforms";
import "./FavoritePlatforms.css";

export function FavoritePlatformTags({ value }) {
  const platforms = parseFavoritePlatforms(value);
  if (!platforms.length) return null;
  return <ul className="favorite-platform-tags" aria-label="Plateformes favorites">
    {platforms.map(platform => <li key={platform}>{platform}</li>)}
  </ul>;
}

export default function FavoritePlatforms({ value, onChange }) {
  const id = useId();
  const selected = parseFavoritePlatforms(value);
  const changeSelection = platforms => onChange(serializeFavoritePlatforms(platforms));
  return <div className="favorite-platform-editor">
    <label htmlFor={id}>Plateformes favorites</label>
    <p id={`${id}-hint`}>Choisis celles que tu préfères. Tu peux en ajouter plusieurs.</p>
    <select id={id} value="" aria-describedby={`${id}-hint`} onChange={event => {
      const platform = event.target.value;
      if (platform && !selected.includes(platform)) changeSelection([...selected, platform]);
    }}>
      <option value="">Ajouter une plateforme…</option>
      {FAVORITE_PLATFORM_GROUPS.map(group => <optgroup key={group.label} label={group.label}>
        {group.platforms.map(platform => <option key={platform} value={platform} disabled={selected.includes(platform)}>{platform}</option>)}
      </optgroup>)}
    </select>
    {selected.length ? <ul className="favorite-platform-choices" aria-label="Tes plateformes favorites">
      {selected.map(platform => <li key={platform}>
        <span>{platform}</span>
        <button type="button" aria-label={`Retirer ${platform}`} onClick={() => changeSelection(selected.filter(item => item !== platform))}>
          <X size={16} aria-hidden="true" />
        </button>
      </li>)}
    </ul> : <span className="favorite-platform-empty">Aucune plateforme choisie pour le moment.</span>}
  </div>;
}
