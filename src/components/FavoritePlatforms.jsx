import { useLanguage } from "../i18n/language";import { LocalizedValue, LocalizedElement, LocalizedMessage } from "../i18n/Localized";import { useId } from "react";
import { X } from "lucide-react";
import { FAVORITE_PLATFORM_GROUPS, parseFavoritePlatforms, serializeFavoritePlatforms } from "../services/favoritePlatforms";
import "./FavoritePlatforms.css";

export function FavoritePlatformTags({ value }) {useLanguage();
  const platforms = parseFavoritePlatforms(value);
  if (!platforms.length) return null;
  return <LocalizedElement __as={"ul"} className="favorite-platform-tags" aria-label="Plateformes favorites">{
    platforms.map((platform) => <li key={platform}><LocalizedValue value={platform} /></li>)}
  </LocalizedElement>;
}

export default function FavoritePlatforms({ value, onChange }) {useLanguage();
  const id = useId();
  const selected = parseFavoritePlatforms(value);
  const changeSelection = (platforms) => onChange(serializeFavoritePlatforms(platforms));
  return <div className="favorite-platform-editor">
    <label htmlFor={id}><LocalizedMessage source={"Plateformes favorites"} values={[]} /></label>
    <p id={`${id}-hint`}><LocalizedMessage source={"Choisis celles que tu préfères. Tu peux en ajouter plusieurs."} values={[]} /></p>
    <select id={id} value="" aria-describedby={`${id}-hint`} onChange={(event) => {
      const platform = event.target.value;
      if (platform && !selected.includes(platform)) changeSelection([...selected, platform]);
    }}>
      <option value=""><LocalizedMessage source={"Ajouter une plateforme…"} values={[]} /></option>{
      FAVORITE_PLATFORM_GROUPS.map((group) => <optgroup key={group.label} label={group.label}>{
        group.platforms.map((platform) => <option key={platform} value={platform} disabled={selected.includes(platform)}><LocalizedValue value={platform} /></option>)}
      </optgroup>)}
    </select>{
    selected.length ? <LocalizedElement __as={"ul"} className="favorite-platform-choices" aria-label="Tes plateformes favorites">{
      selected.map((platform) => <li key={platform}>
        <span><LocalizedValue value={platform} /></span>
        <LocalizedElement __as={"button"} type="button" onClick={() => changeSelection(selected.filter((item) => item !== platform))} __messages={{ "aria-label": { source: "Retirer {{0}}", values: [platform], preserve: [] } }}>
          <X size={16} aria-hidden="true" />
        </LocalizedElement>
      </li>)}
    </LocalizedElement> : <span className="favorite-platform-empty"><LocalizedMessage source={"Aucune plateforme choisie pour le moment."} values={[]} /></span>}
  </div>;
}
