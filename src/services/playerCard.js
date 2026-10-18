import {getKnownGameCover} from './gameCovers';
export function playerCardContent(profile,games,level,options={}){
 const ids=(profile.identityGameIds||[]).map(String);
 return {name:profile.displayName||'Joueur Checkpoint',level,
   photo:options.photo!==false?profile.photoURL||'':'',
   platforms:options.platforms!==false?profile.platform||'':'',
   games:options.games!==false?ids.map(id=>games.find(g=>String(g.id)===id)).filter(Boolean).slice(0,3).map(g=>({name:g.name,cover:getKnownGameCover(g)||g.image||''})):[],
 };
}
function loadImage(url){
 if(!url||(!/^https:\/\//i.test(url)&&!/^data:image\/(png|jpeg|webp);base64,/i.test(url)&&!url.startsWith('/')))return Promise.resolve(null);
 return new Promise(resolve=>{const img=new Image();const timer=setTimeout(()=>resolve(null),5000);img.crossOrigin='anonymous';img.onload=()=>{clearTimeout(timer);resolve(img);};img.onerror=()=>{clearTimeout(timer);resolve(null);};img.src=url;});
}
function rounded(ctx,x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r);}
function fitText(ctx,text,width,size){ctx.font=`700 ${size}px sans-serif`;while(ctx.measureText(text).width>width&&size>24){size-=1;ctx.font=`700 ${size}px sans-serif`;}return size;}
function wrap(ctx,text,x,y,width,lineHeight,maxLines=2){const words=String(text).split(/\s+/);let line='',lines=0;for(let i=0;i<words.length;i++){const next=line?line+' '+words[i]:words[i];if(ctx.measureText(next).width>width&&line){ctx.fillText(lines===maxLines-1?line+'…':line,x,y+lines*lineHeight);lines++;if(lines===maxLines)return;line=words[i];}else line=next;}if(line)ctx.fillText(line,x,y+lines*lineHeight);}
export async function renderPlayerCard(content,accent='#d6b66f'){
 const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1350;
 const ctx=canvas.getContext('2d');if(!ctx)throw new Error('La création d’image est indisponible.');
 const [photo,...covers]=await Promise.all([loadImage(content.photo),...content.games.map(g=>loadImage(g.cover))]);
 const bg=ctx.createLinearGradient(0,0,1080,1350);bg.addColorStop(0,'#19212b');bg.addColorStop(1,'#05080b');ctx.fillStyle=bg;ctx.fillRect(0,0,1080,1350);
 try{ctx.strokeStyle=accent;}catch{ctx.strokeStyle='#d6b66f';}
 ctx.lineWidth=3;rounded(ctx,28,28,1024,1294,36);ctx.stroke();
 ctx.fillStyle=accent;ctx.font='700 34px sans-serif';ctx.fillText('CHECKPOINT',68,105);
 ctx.textAlign='right';ctx.font='600 28px sans-serif';ctx.fillText(`NIVEAU ${content.level}`,1012,105);ctx.textAlign='left';
 ctx.save();ctx.beginPath();ctx.arc(540,264,94,0,Math.PI*2);ctx.clip();ctx.fillStyle='#283644';ctx.fillRect(446,170,188,188);
 if(photo){const size=Math.min(photo.width,photo.height);ctx.drawImage(photo,(photo.width-size)/2,(photo.height-size)/2,size,size,446,170,188,188);}else{ctx.fillStyle=accent;ctx.font='700 70px sans-serif';ctx.textAlign='center';ctx.fillText(content.name.slice(0,1).toUpperCase(),540,290);}ctx.restore();
 ctx.textAlign='center';ctx.fillStyle='#f1f4f7';fitText(ctx,content.name,900,64);ctx.fillText(content.name,540,450);
 ctx.fillStyle=accent;ctx.font='400 24px sans-serif';wrap(ctx,content.platforms||'Mon univers de jeu',540,505,900,34,2);
 ctx.textAlign='left';ctx.font='600 24px sans-serif';ctx.fillStyle='#b9c6d0';ctx.fillText('MES JEUX FONDATEURS',68,622);
 for(let i=0;i<content.games.length;i++){
   const game=content.games[i],y=658+i*174;ctx.fillStyle='#ffffff09';rounded(ctx,64,y,952,150,20);ctx.fill();
   ctx.save();rounded(ctx,82,y+12,90,126,10);ctx.clip();ctx.fillStyle='#293644';ctx.fillRect(82,y+12,90,126);
   if(covers[i]){const image=covers[i];const ratio=Math.max(90/image.width,126/image.height);ctx.drawImage(image,82+(90-image.width*ratio)/2,y+12+(126-image.height*ratio)/2,image.width*ratio,image.height*ratio);}else{ctx.fillStyle=accent;ctx.textAlign='center';ctx.font='700 36px sans-serif';ctx.fillText(game.name.slice(0,1).toUpperCase(),127,y+88);}ctx.restore();
   ctx.fillStyle=accent;ctx.font='700 20px sans-serif';ctx.fillText(String(i+1).padStart(2,'0'),200,y+42);
   ctx.fillStyle='#f1f4f7';ctx.font='600 30px sans-serif';wrap(ctx,game.name,200,y+84,770,38,2);
 }
 if(!content.games.length){ctx.fillStyle='#b9c6d0';ctx.font='400 30px sans-serif';ctx.fillText('Chaque partie fait partie de mon histoire.',68,735);}
 ctx.fillStyle=accent;ctx.font='500 21px sans-serif';ctx.fillText('MON PARCOURS. MES JEUX. MON CHECKPOINT.',68,1255);
 return new Promise((resolve,reject)=>{try{canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('Image indisponible.')),'image/png');}catch{reject(new Error('Impossible de créer l’image. Réessaie sans photo.'));}});
}
