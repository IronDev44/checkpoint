import {hardwareEditionPhotos,hardwareImageForEdition,editionFromPhoto,selectedHardwarePhoto,hardwareDisplayImage} from './hardwareEditionPhotos';
import {normalizeHardwareEdition} from './hardwareEditions';
import photos from '../data/hardware/editionPhotos.json';
import fs from 'fs';
import path from 'path';
const pad={type:'controller',catalogId:'sony-controllers',versionId:'dualsense',image:'/legacy.png'};
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
 for(const photo of photos){
  expect(photo.source).toMatch(/^https:\/\/(www\.playstation\.com|www\.nintendo\.com|www\.xbox\.com|www\.8bitdo\.com|www\.turtlebeach\.com)\//);
  expect(fs.statSync(path.join(process.cwd(),'public',photo.image)).size).toBeGreaterThan(1000);
 }
 const oled={type:'console',catalogId:'switch',versionId:'switch-oled-64'};
 expect(hardwareEditionPhotos(oled).map(photo=>photo.id)).toEqual(expect.arrayContaining(['switch-oled-zelda','switch-oled-pokemon','switch-oled-splatoon','switch-oled-mariored']));
 expect(hardwareEditionPhotos({...oled,versionId:'switch-v1'})).toEqual([]);
});

 test('the original Ally keeps its white chassis and legacy library images are corrected only for that exact error',()=>{
 const item={type:'console',catalogId:'rog-ally',versionId:'rog-ally-z1-extreme',image:'/images/consoles/rog-ally-x.png'};
 expect(hardwareImageForEdition(item)).toBe('/images/consoles/rog-ally.png');
 expect(hardwareDisplayImage(item)).toBe('/images/consoles/rog-ally.png');
 expect(hardwareDisplayImage({...item,image:'/my-personal-photo.png'})).toBe('/my-personal-photo.png');
 expect(hardwareDisplayImage({...item,versionId:'another'})).toBe('/images/consoles/rog-ally-x.png');
 });
