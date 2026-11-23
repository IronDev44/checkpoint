import { useLanguage } from "../i18n/language";import { LocalizedValue, LocalizedMessage, LocalizedElement } from "../i18n/Localized";import CatalogImage from './CatalogImage';
import { useId, useState } from 'react';
import { hardwareBaseImage, hardwareEditionChoices, hardwareEditionNote, editionFromPhoto, selectedHardwarePhoto } from '../services/hardwareEditionPhotos';
import { hardwareColorKey, hardwareEditionKey } from '../services/hardwareEditions';
import './HardwareEditions.css';

export default function HardwareEditionGallery({ item, edition = item.edition, onChoose, disabled = false }) {useLanguage();
  const choices = hardwareEditionChoices(item),selected = selectedHardwarePhoto(item, edition),note = hardwareEditionNote(item);
  const [query, setQuery] = useState('');
  const searchId = useId();
  if (!choices.length) return <p className="hardware-photo-unavailable"><LocalizedValue value={note?.message || 'Pas encore de photos ni de liste d’éditions pour ce modèle. Tu peux renseigner son édition et son coloris dans le formulaire.'} /></p>;
  const standard = { id: 'standard', name: 'Modèle standard', image: hardwareBaseImage(item) };
  const matches = (photo) => hardwareColorKey([photo.name, photo.color, photo.region].filter(Boolean).join(' ')).includes(hardwareColorKey(query));
  const visible = [standard, ...choices].filter(matches),illustrated = visible.filter((choice) => choice.image),documented = visible.filter((choice) => !choice.image);
  const pressed = (choice) => choice.id === 'standard' ? !selected && !edition?.name && !edition?.color : hardwareEditionKey({ edition: choice }) === hardwareEditionKey({ edition });
  const choose = (choice) => onChoose(choice.id === 'standard' ? { kind: 'standard', name: '', color: '' } : editionFromPhoto(choice));
  const source = (choice) => choice.source && <a href={choice.source} target="_blank" rel="noreferrer"><LocalizedValue value={choice.image ? 'Photo' : 'Source'} /> : <LocalizedValue value={choice.credit} /><LocalizedValue value={choice.region ? ` · ${choice.region}` : ''} /><LocalizedValue value={choice.processing ? choice.processingKind === 'crop' ? ' · vue recadrée' : ' · fond retiré' : ''} /></a>;
  return <details className="hardware-photo-gallery">
  <summary><LocalizedMessage source={"Couleurs et éditions · {{0}}"} values={[choices.length]} /></summary>
  <p><LocalizedMessage source={"Choisis ta version, puis enregistre. Les sources et les régions sont indiquées pour chaque édition."} values={[]} /></p>
  {choices.every((choice) => choice.coverage === 'standard-finish') && <p className="hardware-photo-unavailable"><LocalizedMessage source={"La finition de base est confirmée pour ce modèle. Les autres coloris et éditions spéciales restent à compléter."} values={[]} /></p>}
  {choices.some((choice) => choice.verification === 'archive') && <p className="hardware-photo-unavailable"><LocalizedMessage source={"Certaines éditions anciennes proviennent d’archives de collectionneurs. Leur source est consultable sous chaque choix ; la liste peut encore être complétée ou corrigée."} values={[]} /></p>}
  {choices.some((choice) => ['archived-manual', 'archive-reference', 'retailer'].includes(choice.verification)) && <p className="hardware-photo-unavailable"><LocalizedMessage source={"Certaines références sont documentées par un ancien manuel, une archive ou une fiche revendeur. La source précise est indiquée sous chaque choix."} values={[]} /></p>}
  {choices.length > 6 && <label className="hardware-edition-search" htmlFor={searchId}><LocalizedMessage source={"Rechercher une édition ou une couleur"} values={[]} /><LocalizedElement __as={"input"} id={searchId} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nom, couleur…" /></label>}
  {!!illustrated.length && <><h4><LocalizedMessage source={"Voir les versions en photo · {{0}}"} values={[illustrated.length]} /></h4><div className="hardware-photo-choices">{illustrated.map((photo) => <div className="hardware-photo-choice" key={photo.id}><button type="button" disabled={disabled} aria-pressed={pressed(photo)} onClick={() => choose(photo)}><CatalogImage src={photo.image} alt={photo.name} loading="lazy" /><span><LocalizedValue value={photo.name} /></span>{photo.color && <small><LocalizedValue value={photo.color} /></small>}</button><LocalizedValue value={source(photo)} /></div>)}</div></>}
  {!!documented.length && <><h4><LocalizedMessage source={"Éditions répertoriées · photos à compléter"} values={[]} /></h4><p><LocalizedMessage source={"Ces versions sont sélectionnables. La photo standard du modèle restera affichée."} values={[]} /></p><div className="hardware-documented-editions">{documented.map((choice) => <div className="hardware-photo-choice" key={choice.id}><button type="button" disabled={disabled} aria-pressed={pressed(choice)} onClick={() => choose(choice)}><span><LocalizedValue value={choice.name} /></span><small><LocalizedMessage source={"{{0}} · Photo à compléter"} values={[choice.color]} /></small></button><LocalizedValue value={source(choice)} /></div>)}</div></>}
  {!visible.length && <p role="status"><LocalizedMessage source={"Aucune édition ne correspond. Tu peux aussi saisir son nom dans le formulaire."} values={[]} /></p>}
 </details>;
}
