import {hardwareEditionPhotos,hardwareEditionChoices,hardwareEditionNote,hardwareImageForEdition,editionFromPhoto,selectedHardwarePhoto,hardwareDisplayImage,hardwarePhotoUrl} from './hardwareEditionPhotos';
import {normalizeHardwareEdition} from './hardwareEditions';
import photos from '../data/hardware/editionPhotos.json';
import variants from '../data/hardware/editionVariants.json';
import editionNotes from '../data/hardware/editionNotes.json';
import {HARDWARE_CATALOG} from '../data/hardware';
import fs from 'fs';
import path from 'path';
const pad={type:'controller',catalogId:'sony-controllers',versionId:'dualsense',image:'/legacy.png'};
test('old library URLs and shared profile snapshots use the transparent photo without changing personal URLs',()=>{
 const old='/images/hardware/editions/dualsense-cosmic-red.webp';
 const next='/images/hardware/editions/cutouts/dualsense-cosmic-red.webp';
 expect(hardwarePhotoUrl(old)).toBe(next);
 expect(hardwareDisplayImage({...pad,image:old})).toBe(next);
 expect(hardwarePhotoUrl('https://example.com/my-photo.jpg')).toBe('https://example.com/my-photo.jpg');
 expect(hardwarePhotoUrl(undefined)).toBeUndefined();
});

test('archive collectors stay on their precise disk capacity and unillustrated choices do not borrow photos',()=>{
 const choices=(catalogId,versionId)=>hardwareEditionChoices({type:'console',catalogId,versionId});
 expect(choices('ps3','ps3-slim-320').some(e=>/Tales of Xillia/.test(e.name))).toBe(true);
 expect(choices('ps3','ps3-slim-250').some(e=>/Tales of Xillia/.test(e.name))).toBe(false);
 expect(choices('ps3','ps3-slim-250').some(e=>/Final Fantasy XIII White/.test(e.name))).toBe(true);
 expect(choices('ps3','ps3-slim-320').some(e=>/Final Fantasy XIII White/.test(e.name))).toBe(false);
 expect(choices('xbox-one','xbox-one-s-500').some(e=>/Minecraft/.test(e.name))).toBe(false);
 expect(choices('xbox-one','xbox-one-s-1tb').some(e=>/Minecraft/.test(e.name))).toBe(true);
 for(const e of variants.filter(e=>e.verification==='archive')){
  expect(e.source).toBe(`https://consolevariations.com/collectibles/${e.archiveId}`);
  expect(e.reviewedOn).toBe('2026-10-22');
  expect(editionFromPhoto(e)).not.toHaveProperty('photoId');
 }
});

test('promotion-only hardware and technically different models are not selectable retail editions',()=>{
 const slugs=new Set(variants.map(e=>e.archiveId).filter(Boolean));
 for(const forbidden of ['nintendo-64-ique-console','nintendo-game-boy-color-ana-console','nintendo-game-boy-advance-sp-donkey-kong-console','nintendo-ds-metroid-prime-hunters-console','sony-playstation-2-tv-bravia-console','microsoft-xbox-one-i-made-this-controller','microsoft-xbox-orange-s-controller','sony-playstation-3-cloud-black-console'])expect(slugs.has(forbidden)).toBe(false);
 expect(hardwareEditionChoices({type:'controller',catalogId:'nintendo-controllers',versionId:'wii-remote'}).some(e=>/motion.plus|bowser|peach/i.test(e.name))).toBe(false);
});

test('generic and configurable references explain their scope without leaking notes to another model',()=>{
 expect(hardwareEditionNote({type:'console',catalogId:'pc-handhelds',versionId:'aya-neo'})).toMatchObject({status:'generic'});
 expect(hardwareEditionNote({type:'controller',catalogId:'scuf-controllers',versionId:'scuf-reflex'})).toMatchObject({status:'configurable'});
 expect(hardwareEditionNote({type:'console',catalogId:'ps5',versionId:'aya-neo'})).toBeNull();
 expect(hardwareEditionNote({type:'console',catalogId:'custom',versionId:'custom'})).toBeNull();
 const versions=HARDWARE_CATALOG.flatMap(m=>m.variants.flatMap(v=>v.versions));
 for(const [id,note] of Object.entries(editionNotes)){
  expect(versions.some(v=>v.id===id)).toBe(true);
  expect(['generic','configurable']).toContain(note.status);
  expect(note.message.length).toBeGreaterThan(30);
 }
});
test('a selected catalog photo is persisted by ID and resolves only for the matching model and metadata',()=>{
 const photo=hardwareEditionPhotos(pad).find(p=>p.id==='dualsense-cosmic-red'),edition=normalizeHardwareEdition(editionFromPhoto(photo));
 expect(edition.photoId).toBe(photo.id);
 expect(hardwareImageForEdition(pad,edition)).toBe(photo.image);
 expect(selectedHardwarePhoto({...pad,versionId:'dualsense-edge'},edition)).toBeNull();
 expect(selectedHardwarePhoto({...pad,catalogId:'another'},edition)).toBeNull();
 expect(selectedHardwarePhoto({...pad,type:'console'},edition)).toBeNull();
 expect(selectedHardwarePhoto(pad,{...edition,color:'Bleu'})).toBeNull();
 expect(hardwareImageForEdition(pad,{...edition,color:'Bleu'})).toBe('/images/controllers/dualsense.png');
 expect(hardwareImageForEdition(pad,{kind:'standard',name:'',color:''})).toBe('/images/controllers/dualsense.png');
});
test('custom models retain their base image and do not acquire an unrelated catalog photo',()=>{
 expect(hardwareEditionPhotos({type:'console',versionId:'dualsense'})).toEqual([]);
 expect(hardwareImageForEdition({name:'Custom',catalogImage:'/base.png',image:'/old-edition.png'},{photoId:'dualsense-midnight-black'})).toBe('/base.png');
 expect(normalizeHardwareEdition({photoId:'../../bad'})).not.toHaveProperty('photoId');
});
test('every shared photo has a bundled image and source, and Switch editions stay on the OLED model',()=>{
 expect(new Set(photos.map(photo=>photo.id)).size).toBe(photos.length);
 for(const photo of photos.filter(photo=>photo.verification==='archive')){
   expect(photo.source).toBe(`https://consolevariations.com/collectibles/${photo.archiveId}`);
   expect(photo.asset).toMatch(/^https:\/\/(cdn\.consolevariations\.com|consolevariations\.b-cdn\.net)\//);
   expect(photo.credit).toContain('archive collaborative');
   expect(photo.reviewedOn).toBe('2026-10-22');
 }
 for(const photo of photos.filter(photo=>photo.verification!=='archive'))expect(photo.source).toMatch(/^https:\/\/(www\.playstation\.com|www\.nintendo\.(com|co\.jp)|www\.xbox\.com|www\.8bitdo\.com|(?:www|hk|nz)\.turtlebeach\.com|support\.apple\.com|www\.apple\.com|stores\.horiusa\.com|(?:www|jp|uk|my)\.nacongaming\.com|www\.razer\.com|www\.logitechg\.com|www\.thrustmaster\.com|steelseries\.com|www\.gulikit\.com)\//);
 for(const photo of photos){
  for(const url of [photo.source,photo.asset].filter(Boolean))expect(url).not.toMatch(/X-Amz-(Signature|Credential)|[?&](token|api_key|access_token)=/i);
  expect(fs.statSync(path.join(process.cwd(),'public',photo.image)).size).toBeGreaterThan(1000);
 }
 const oled={type:'console',catalogId:'switch',versionId:'switch-oled-64'};
 expect(hardwareEditionPhotos(oled).map(photo=>photo.id)).toEqual(expect.arrayContaining(['switch-oled-zelda','switch-oled-pokemon','switch-oled-splatoon','switch-oled-mariored']));
 expect(hardwareEditionPhotos({...oled,versionId:'switch-v1'}).some(photo=>photo.id==='switch-oled-zelda')).toBe(false);
});

test('editions respect the precise hardware generation and capacity, including unillustrated collectors',()=>{
 const ps5=versionId=>hardwareEditionChoices({type:'console',catalogId:'ps5',versionId});
 expect(ps5('ps5-slim-digital-1tb').some(e=>e.name==='30th Anniversary')).toBe(true);
 expect(ps5('ps5-standard-disc').some(e=>e.name==='30th Anniversary')).toBe(false);
 expect(ps5('ps5-standard-disc').some(e=>e.name==='Marvel’s Spider-Man 2')).toBe(true);
 expect(ps5('ps5-slim-disc-1tb').some(e=>e.name==='30th Anniversary')).toBe(false);
 const ps4=versionId=>hardwareEditionChoices({type:'console',catalogId:'ps4',versionId});
 expect(ps4('ps4-pro-2tb').map(e=>e.name)).toContain('500 Million Limited Edition');
 expect(ps4('ps4-pro-1tb').map(e=>e.name)).not.toContain('500 Million Limited Edition');
 const model={type:'console',catalogId:'ds-3ds',versionId:'new-3ds-xl'};
 const edition=hardwareEditionChoices(model).find(e=>e.name==='Hyrule Edition');
 expect(edition.image).toBeUndefined();
 expect(editionFromPhoto(edition)).not.toHaveProperty('photoId');
 expect(hardwareImageForEdition(model,editionFromPhoto(edition))).toBe('/images/consoles/new-3ds-xl.png');
 expect(hardwareEditionChoices({...model,versionId:'new-3ds'}).some(e=>e.name==='Hyrule Edition')).toBe(false);
});

test('all editions have a unique identity, traceable source and valid technical targets',()=>{
 expect(new Set([...photos,...variants].map(e=>e.id)).size).toBe(photos.length+variants.length);
 for(const edition of [...photos,...variants]){
  const model=HARDWARE_CATALOG.find(model=>model.id===edition.catalogId&&model.type===edition.type);
  expect(model).toBeTruthy();
  const versions=model.variants.flatMap(variant=>variant.versions.map(version=>version.id));
  expect(edition.versionIds.length).toBeGreaterThan(0);
  for(const version of edition.versionIds)expect(versions).toContain(version);
 }
 for(const variant of variants){
  expect(variant).not.toHaveProperty('image');
  expect(variant.source).toMatch(/^https:\/\//);
  expect(variant.credit).toBeTruthy();
 }
});

test('every precise console and controller has sourced finishes while ambiguous and custom families explain their scope',()=>{
 for(const model of HARDWARE_CATALOG.filter(model=>['console','controller'].includes(model.type)))for(const variant of model.variants)for(const version of variant.versions){
  const item={type:model.type,catalogId:model.id,versionId:version.id};
  expect(hardwareEditionChoices(item).length>0||!!hardwareEditionNote(item)).toBe(true);
 }
 const deck=hardwareEditionChoices({type:'console',catalogId:'steam-deck',versionId:'steam-deck-oled-1tb'});
 expect(deck.length).toBeGreaterThan(0);
});

test('new transparent photos save and resolve only on their exact model, including shared Mac chassis',()=>{
 for(const photo of photos.filter(photo=>photo.asset)){
  const item={type:photo.type,catalogId:photo.catalogId,versionId:photo.versionIds[0]};
  const edition=normalizeHardwareEdition(editionFromPhoto(photo));
  expect(edition.photoId).toBe(photo.id);
  expect(selectedHardwarePhoto(item,edition)?.image).toBe(photo.image);
  expect(selectedHardwarePhoto({...item,versionId:'another-model'},edition)).toBeNull();
  expect(selectedHardwarePhoto(item,{...edition,name:'Another edition'})).toBeNull();
 }
});

 test('the original Ally keeps its white chassis and legacy library images are corrected only for that exact error',()=>{
 const item={type:'console',catalogId:'rog-ally',versionId:'rog-ally-z1-extreme',image:'/images/consoles/rog-ally-x.png'};
 expect(hardwareImageForEdition(item)).toBe('/images/consoles/rog-ally.png');
 expect(hardwareDisplayImage(item)).toBe('/images/consoles/rog-ally.png');
 expect(hardwareDisplayImage({...item,image:'/my-personal-photo.png'})).toBe('/my-personal-photo.png');
 expect(hardwareDisplayImage({...item,versionId:'another'})).toBe('/images/consoles/rog-ally-x.png');
 });
