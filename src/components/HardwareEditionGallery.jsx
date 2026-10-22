import {hardwareBaseImage, hardwareEditionPhotos, editionFromPhoto, selectedHardwarePhoto} from '../services/hardwareEditionPhotos';
import './HardwareEditions.css';

export default function HardwareEditionGallery({item, edition=item.edition, onChoose, disabled=false}) {
 const choices=hardwareEditionPhotos(item), selected=selectedHardwarePhoto(item,edition);
 if(!choices.length)return <p className="hardware-photo-unavailable">Pas encore de photos d’éditions pour ce modèle. L’image standard reste affichée.</p>;
 const standard={id:'standard',name:'Modèle standard',image:hardwareBaseImage(item)};
 return <details className="hardware-photo-gallery"><summary>Voir les versions en photo · {choices.length+1}</summary><p>Choisis la photo de ta version, puis enregistre pour actualiser ta fiche.</p><div className="hardware-photo-choices">{[standard,...choices].map(photo=><div className="hardware-photo-choice" key={photo.id}><button type="button" disabled={disabled} aria-pressed={photo.id==='standard'?!selected:selected?.id===photo.id} onClick={()=>onChoose(photo.id==='standard'?{kind:'standard',name:'',color:''}:editionFromPhoto(photo))}><img src={photo.image} alt={photo.name} loading="lazy"/><span>{photo.name}</span>{photo.color&&<small>{photo.color}</small>}</button>{photo.source&&<a href={photo.source} target="_blank" rel="noreferrer">Photo : {photo.credit}</a>}</div>)}</div></details>;
}
