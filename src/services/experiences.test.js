import {normalizeExperiences,dueCapsules,journeySnapshot,trailerSelection} from './experiences';
import {tonightCandidates} from './tonight';
import {couchControl,couchIndex} from './couchControls';
import {trailerScenes,trailerArtwork,drawTrailerFrame,recorderMime,recordJourney} from './journeyTrailer';
const capsule={id:'one',title:'Ma prédiction',targetDate:'2026-10-19',createdAt:'2026-10-01T10:00:00Z',snapshot:{games:4,finished:2,level:3}};
test('capsules normalize privately, reject impossible dates and become due on the chosen local day',()=>{
 const value=normalizeExperiences({capsules:[capsule,{...capsule,id:'invalid',targetDate:'2026-02-31'},capsule,{...capsule,id:'later',targetDate:'2026-10-20'},{...capsule,id:'opened',openedAt:'2026-10-19T10:00:00Z'}]});expect(value.capsules).toHaveLength(3);expect(dueCapsules(value,new Date(2026,9,19,23)).map(c=>c.id)).toEqual(['one']);expect(journeySnapshot([{status:'wishlist'},{status:'collection',completed:true}],4)).toEqual({games:1,finished:1,level:4});
});
test('tonight intersects every visible profile and distinguishes confirmed capacity from unknown metadata',()=>{
 const games=[{id:'a',name:'Together',rating:8,platformNames:['PC']},{id:'b',name:'Hidden',platformNames:['PC']}],profiles=[{visibility:'public',identityGames:[{name:'Together',platforms:['PC'],rating:9}]},{visibility:'public',favoriteGames:[{name:'Together',platforms:['PC'],rating:8}]}];
 expect(tonightCandidates(games,profiles,{players:4})[0].confirmed).toBe(false);const verified={a:{kind:'coop',labels:['Coopération'],capacity:{online:4,local:2}}};expect(tonightCandidates(games,profiles,{players:4,location:'online',verified})[0].confirmed).toBe(true);expect(tonightCandidates(games,profiles,{players:4,location:'local',verified})).toEqual([]);expect(tonightCandidates(games,[profiles[0],{visibility:'prive'}])).toEqual([]);expect(tonightCandidates(games,[{...profiles[0],publicSections:{identityGames:false}}])).toEqual([]);
});
test('gamepad navigation accepts standard mappings only, honours dead zones and stays inside the visible grid',()=>{
 expect(couchControl({mapping:'',buttons:[{pressed:true}]})).toBeNull();expect(couchControl({mapping:'standard',axes:[.2,0],buttons:[]})).toBeNull();expect(couchControl({mapping:'standard',axes:[.7,0],buttons:[]})).toBe('right');expect(couchControl({mapping:'standard',buttons:[{pressed:true}]})).toBe('open');expect(couchIndex(0,'left',8)).toBe(0);expect(couchIndex(7,'down',8,4)).toBe(7);
});
test('trailer selects only chosen owned games in selection order and never includes private notes',()=>{
 const games=[{id:'a',name:'First',review:'secret',progressNote:'secret'},{id:'b',name:'Founder',favorite:true},{id:'w',name:'Wish',status:'wishlist'}];expect(trailerSelection(games,['b'])[0].id).toBe('b');const scenes=trailerScenes(games,['b','a','w'],['b'],4);expect(scenes.filter(s=>s.game).map(s=>s.title)).toEqual(['Founder','First']);
 const texts=[];const gradient={addColorStop:()=>{}};const ctx=new Proxy({fillText:text=>texts.push(String(text)),measureText:text=>({width:text.length*12}),createRadialGradient:()=>gradient},{get:(target,key)=>target[key]||(()=>{})});drawTrailerFrame(ctx,scenes,3,new Map(),'Player');expect(texts.join(' ')).not.toContain('secret');expect(texts.join(' ')).toContain('Founder');
});
test('video export chooses a supported format and fails explicitly without browser recording support',async()=>{
 expect(recorderMime({isTypeSupported:type=>type==='video/mp4'})).toBe('video/mp4');await expect(recordJourney({canvas:{},scenes:[],images:new Map()})).rejects.toThrow('export vidéo');
});

test('an aborted video export releases capture tracks and does not return a partial file',async()=>{
 const original=window.MediaRecorder,stop=jest.fn(),gradient={addColorStop:()=>{}};class Recorder{constructor(){this.state='inactive';}static isTypeSupported(){return true;}}window.MediaRecorder=Recorder;
 const ctx=new Proxy({createRadialGradient:()=>gradient,measureText:()=>({width:10})},{get:(target,key)=>target[key]||(()=>{})}),canvas={getContext:()=>ctx,captureStream:()=>({getTracks:()=>[{stop}]})},controller=new AbortController();controller.abort();try{await expect(recordJourney({canvas,scenes:[{kind:'intro',title:'Test',duration:2}],images:new Map(),signal:controller.signal})).rejects.toMatchObject({name:'AbortError'});expect(stop).toHaveBeenCalled();}finally{window.MediaRecorder=original;}
});


test('trailer resolves box covers for legacy games and never falls back to gameplay images',async()=>{
 const OriginalImage=global.Image,loaded=[];
 global.Image=class {set src(value){loaded.push(value);Promise.resolve().then(()=>this.onload?.());}};
 const games=[{id:'a',name:'Legacy',image:'https://media.rawg.io/gameplay.jpg'},{id:'b',name:'Missing',image:'https://media.rawg.io/other.jpg'}];
 const resolve=jest.fn(async game=>game.id==='a'?'https://images.igdb.com/igdb/image/upload/t_cover_big/box.jpg':'');
 try{const images=await trailerArtwork(games.map(game=>({game})),resolve);expect(images.has('a')).toBe(true);expect(images.has('b')).toBe(false);expect(loaded).toEqual(['https://images.igdb.com/igdb/image/upload/t_cover_big/box.jpg']);expect(resolve).toHaveBeenCalledWith(games[0]);}finally{global.Image=OriginalImage;}
});
