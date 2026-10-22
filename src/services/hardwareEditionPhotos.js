import photos from '../data/hardware/editionPhotos.json';
import {HARDWARE_CATALOG} from '../data/hardware';
import {hardwareEditionKey} from './hardwareEditions';

export const hardwareEditionPhotos = item => photos.filter(photo => photo.type === item.type && photo.catalogId === item.catalogId && photo.versionIds.includes(item.versionId));
export function selectedHardwarePhoto(item, edition = item.edition) {
  return hardwareEditionPhotos(item).find(photo => photo.id === edition?.photoId && hardwareEditionKey({edition:photo}) === hardwareEditionKey({edition})) || null;
}
export function hardwareBaseImage(item) {
  const model = HARDWARE_CATALOG.find(model => model.id === item.catalogId && model.type === item.type);
  const version = model?.variants?.flatMap(variant => variant.versions || []).find(version => version.id === item.versionId);
  return version?.image || item.catalogImage || item.image || '';
}
export function hardwareImageForEdition(item, edition = item.edition) {
  return selectedHardwarePhoto(item, edition)?.image || hardwareBaseImage(item);
}
export function hardwareDisplayImage(item) {
  // Old library entries stored the Ally X photo for the original Z1 Extreme.
  // Correct that known catalogue error without overwriting personal images.
  if(item.type==='console'&&item.catalogId==='rog-ally'&&item.versionId==='rog-ally-z1-extreme'&&item.image==='/images/consoles/rog-ally-x.png')return hardwareBaseImage(item);
  return selectedHardwarePhoto(item)?.image || item.image || hardwareBaseImage(item);
}
export function editionFromPhoto(photo) {
  return {kind:photo.kind, name:photo.name, color:photo.color, photoId:photo.id};
}
