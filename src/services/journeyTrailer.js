import {trailerSelection} from './experiences';
import {resolveGameCover} from './gameCovers';
export function trailerScenes(games,selectedIds,founderIds=[],level=1){
 const selected=new Set(selectedIds.map(String)),founders=new Set(founderIds.map(String));
 return [{kind:'intro',title:'Chaque joueur a son histoire.',duration:2.4},...selectedIds.map(id=>games.find(g=>String(g.id)===String(id))).filter(g=>g&&selected.has(String(g.id))&&g.status!=='wishlist').slice(0,5).map(game=>({kind:'game',game,title:game.name,kicker:founders.has(String(game.id))?'UN JEU FONDATEUR':game.favorite?'UN COUP DE CŒUR':'UNE PARTIE DE MON HISTOIRE',duration:3.2})),{kind:'outro',title:'La suite reste à jouer.',level,duration:3}];
}
export function trailerDuration(scenes){return scenes.reduce((sum,scene)=>sum+scene.duration,0);}
export async function trailerArtwork(scenes,resolveCover=resolveGameCover){
 const images=new Map();
 await Promise.all(scenes.filter(scene=>scene.game).map(async scene=>{
  let source;try{source=await resolveCover(scene.game);}catch{return;}
  if(!source)return;
  await new Promise(resolve=>{
   const img=new Image();img.crossOrigin='anonymous';
   const finish=()=>{clearTimeout(timer);img.onload=null;img.onerror=null;resolve();};
   const timer=setTimeout(()=>{img.src='';finish();},5000);
   img.onload=()=>{images.set(String(scene.game.id),img);finish();};img.onerror=finish;img.src=source;
  });
 }));
 return images;
}
function lines(ctx,text,width,size=48){ctx.font=`700 ${size}px sans-serif`;const words=String(text).split(/\s+/),result=[];let line='';for(const word of words){if(ctx.measureText(line+' '+word).width>width&&line){result.push(line);line=word;}else line=line?line+' '+word:word;}if(line)result.push(line);return result.slice(0,4);}
function drawMark(ctx,x,y,size,time){
 if(typeof Path2D==='undefined'){ctx.fillStyle='#dfc98f';ctx.font='700 240px serif';ctx.fillText('C',360,y+size);return;}
 ctx.save();ctx.translate(x,y);ctx.scale(size/120,size/120);
 const metal=ctx.createLinearGradient(18,10,98,116);[['#fff0bf',0],['#ddbd76',.24],['#b58a3e',.49],['#f1d89b',.7],['#b28a43',1]].forEach(([color,at])=>metal.addColorStop(at,color));
 ctx.fillStyle=metal;ctx.fill(new Path2D('m60 8 36 21-9 15-27-16-31 18v36l31 18 27-16 9 15-36 21-49-28V36Z'));ctx.fillStyle='#84602599';ctx.fill(new Path2D('m11 36 5 3v50l-5 3Z'));ctx.fillStyle='#fff0bf';ctx.fill(new Path2D('m96 50 14 14-14 14-14-14Z'));ctx.strokeStyle='#fff2c288';ctx.lineWidth=.8;ctx.stroke(new Path2D('m94 29-34-20-48 28v54l48 28 34-20M29 81V46l31-18 26 15'));ctx.restore();
}
export function drawTrailerFrame(ctx,scenes,time,images,name='Mon parcours'){
 const w=720,h=1280;ctx.clearRect(0,0,w,h);ctx.fillStyle='#050608';ctx.fillRect(0,0,w,h);let start=0,scene=scenes.at(-1);for(const item of scenes){if(time<start+item.duration){scene=item;break;}start+=item.duration;}const t=Math.max(0,Math.min(1,(time-start)/scene.duration));
 const glow=ctx.createRadialGradient(360,360,0,360,360,650);glow.addColorStop(0,'#a98b4828');glow.addColorStop(1,'#00000000');ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);
 ctx.strokeStyle='#d3b77855';ctx.lineWidth=1;ctx.strokeRect(28,28,w-56,h-56);for(let i=0;i<34;i++){const x=(i*137.7)%w,y=((i*89.1-time*13)%h+h)%h;ctx.fillStyle=`rgba(226,201,140,${.12+(i%5)*.04})`;ctx.fillRect(x,y,1.5,1.5);}
 ctx.fillStyle='#dcc58c';ctx.textAlign='center';ctx.font='700 27px sans-serif';ctx.fillText('C H E C K P O I N T',360,100);
 ctx.save();ctx.globalAlpha=Math.min(1,t*6,(1-t)*7);ctx.translate(0,(1-Math.min(1,t*4))*24);
 if(scene.kind==='game'){const img=images.get(String(scene.game.id));if(img){const box={x:130,y:205,w:460,h:600},scale=Math.min(box.w/img.width,box.h/img.height)*(1+t*.035),dw=img.width*scale,dh=img.height*scale;ctx.save();ctx.beginPath();ctx.rect(box.x,box.y,box.w,box.h);ctx.clip();ctx.drawImage(img,360-dw/2,505-dh/2,dw,dh);ctx.restore();}else{drawMark(ctx,235,345,250,time);}ctx.fillStyle='#cdb477';ctx.font='600 21px sans-serif';ctx.fillText(scene.kicker,360,865);ctx.fillStyle='#f5f1e5';lines(ctx,scene.title,590,44).forEach((line,i)=>ctx.fillText(line,360,935+i*54,600));}
 else{ctx.shadowBlur=35;ctx.shadowColor='#c5a35355';drawMark(ctx,220,300,280,time);ctx.shadowBlur=0;ctx.fillStyle='#f5f1e5';lines(ctx,scene.title,570,52).forEach((line,i)=>ctx.fillText(line,360,745+i*65,600));if(scene.kind==='outro'){ctx.fillStyle='#cdb477';ctx.font='500 28px sans-serif';ctx.fillText(`NIVEAU ${scene.level}`,360,960);}}
 ctx.restore();ctx.fillStyle='#b4b0a6';ctx.font='400 23px sans-serif';const safe=String(name).slice(0,45);ctx.fillText(safe,360,1150,600);ctx.fillStyle='#7c7669';ctx.font='400 17px sans-serif';ctx.fillText('MON PARCOURS. MES JEUX. MON CHECKPOINT.',360,1200);ctx.fillStyle='#e5c984';ctx.fillRect(50,1240,620*Math.min(1,time/trailerDuration(scenes)),2);
}
export function recorderMime(Recorder=window.MediaRecorder){return ['video/mp4','video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'].find(type=>Recorder?.isTypeSupported?.(type))||'';}
export async function recordJourney({canvas,scenes,images,name,signal,onProgress=()=>{},sound=false}){
 if(!canvas.captureStream||!window.MediaRecorder)throw new Error('L’export vidéo n’est pas disponible dans ce navigateur.');
 const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Aperçu vidéo indisponible.');canvas.width=720;canvas.height=1280;drawTrailerFrame(ctx,scenes,0,images,name);
 const stream=canvas.captureStream(24),mime=recorderMime(),chunks=[];let audio=null,frame=null,timer=null,recorder;
 const cleanup=()=>{cancelAnimationFrame(frame);clearTimeout(timer);stream.getTracks().forEach(track=>track.stop());if(audio)audio.close().catch(()=>{});};
 try{if(sound){const Audio=window.AudioContext||window.webkitAudioContext;if(Audio){audio=new Audio();await new Promise((resolve,reject)=>{const limit=setTimeout(()=>reject(new Error('Audio indisponible. Désactive l’ambiance sonore puis réessaie.')),4000);audio.resume().then(()=>{clearTimeout(limit);resolve();},error=>{clearTimeout(limit);reject(error);});});const destination=audio.createMediaStreamDestination();destination.stream.getAudioTracks().forEach(track=>stream.addTrack(track));const notes=[130.81,196,261.63,329.63,392];for(let i=0;i<Math.ceil(trailerDuration(scenes)/.75);i++){const osc=audio.createOscillator(),gain=audio.createGain(),when=audio.currentTime+i*.75;osc.type='sine';osc.frequency.value=notes[i%notes.length];gain.gain.setValueAtTime(0,when);gain.gain.linearRampToValueAtTime(.055,when+.05);gain.gain.exponentialRampToValueAtTime(.001,when+.65);osc.connect(gain);gain.connect(destination);osc.start(when);osc.stop(when+.7);}}}
 recorder=new window.MediaRecorder(stream,{...(mime?{mimeType:mime}:{}),videoBitsPerSecond:2500000});
 return await new Promise((resolve,reject)=>{let ended=false;const finish=(error)=>{if(ended)return;ended=true;signal?.removeEventListener('abort',abort);cleanup();if(error)reject(error);else{const blob=new Blob(chunks,{type:recorder.mimeType||mime||'video/webm'});blob.size?resolve(blob):reject(new Error('La vidéo est vide. Réessaie.'));}};const abort=()=>{if(recorder.state!=='inactive')recorder.stop();finish(new DOMException('Export annulé','AbortError'));};recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};recorder.onerror=()=>finish(new Error('L’enregistrement vidéo a échoué.'));recorder.onstop=()=>finish();signal?.addEventListener('abort',abort,{once:true});if(signal?.aborted){abort();return;}const started=performance.now(),duration=trailerDuration(scenes);recorder.start(250);const tick=now=>{const elapsed=(now-started)/1000;drawTrailerFrame(ctx,scenes,Math.min(elapsed,duration-.01),images,name);onProgress(Math.min(100,Math.round(elapsed/duration*100)));if(elapsed>=duration){recorder.stop();return;}frame=requestAnimationFrame(tick);};frame=requestAnimationFrame(tick);timer=setTimeout(()=>{if(recorder.state!=='inactive')recorder.stop();finish(new Error('Export interrompu. Garde cet onglet au premier plan puis réessaie.'));},(duration+15)*1000);});
 }catch(error){cleanup();throw error;}
}
export {trailerSelection};
