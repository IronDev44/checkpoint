// Native graphic composition: original vector logo + actual application captures.
// Run with NODE_PATH pointing at the bundled Codex node dependencies if needed.
const fs=require('node:fs'),path=require('node:path');
const {createCanvas,loadImage,GlobalFonts,SvgExportFlag,convertSVGTextToPath}=require('@napi-rs/canvas');
const sharp=require('sharp');
const root=__dirname,out=path.join(root,'exports'),assets=path.join(root,'assets');
GlobalFonts.registerFromPath(path.join(assets,'orbitron.woff2'),'Orbitron');
GlobalFonts.registerFromPath('C:/Windows/Fonts/segoeui.ttf','Checkpoint Sans');
GlobalFonts.registerFromPath('C:/Windows/Fonts/segoeuib.ttf','Checkpoint Bold');
const ink='#f2efe8',gold='#d5b675',muted='#a5a29b';
let mark,library,hardware;
const g=(c,x1,y1,x2,y2,stops)=>{const fill=c.createLinearGradient(x1,y1,x2,y2);stops.forEach(([at,color])=>fill.addColorStop(at,color));return fill;};
const metal=(c,y=0,h=900)=>g(c,0,y,250,y+h,[[0,'#fff2ce'],[.23,'#d9bb7b'],[.47,'#9e7838'],[.72,'#e7ce95'],[1,'#bc9858']]);
function text(c,value,x,y,size=28,color=ink,family='Checkpoint Sans',align='left'){
 c.font=`${size}px "${family}"`;c.fillStyle=color;c.textAlign=align;c.fillText(value,x,y);c.textAlign='left';
}
function spaced(c,value,x,y,size=18,spacing=3,color=gold,align='left'){
 c.font=`${size}px "Checkpoint Sans"`;let w=[...value].reduce((n,ch)=>n+c.measureText(ch).width+spacing,0)-spacing;
 if(align==='center')x-=w/2;if(align==='right')x-=w;
 c.fillStyle=color;for(const ch of value){c.fillText(ch,x,y);x+=c.measureText(ch).width+spacing;}
}
function line(c,x1,y1,x2,y2,color='#d5b67555',width=1){c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();}
function rounded(c,x,y,w,h,r,fill,stroke){c.beginPath();c.roundRect(x,y,w,h,r);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=1.5;c.stroke();}}
function backdrop(c,w,h,focus=.65){
 c.fillStyle='#090a0c';c.fillRect(0,0,w,h);
 const glow=c.createRadialGradient(w*.65,h*focus,0,w*.65,h*focus,w*.85);glow.addColorStop(0,'#44341955');glow.addColorStop(.55,'#211c1415');glow.addColorStop(1,'#090a0c00');c.fillStyle=glow;c.fillRect(0,0,w,h);
 // Architectural lines echo the original gateway without introducing another logo.
 c.save();c.translate(w*.78,h*.72);c.rotate(-.35);c.strokeStyle='#d5b67512';c.lineWidth=1;
 for(let i=0;i<3;i++){const n=460+i*72;c.strokeRect(-n/2,-n/2,n,n);}c.restore();
 line(c,72,0,72,44,'#c3a15f77');line(c,w-72,h-44,w-72,h,'#c3a15f77');
}
function brand(c,y=90,w=1080){c.drawImage(mark,70,y-36,45,48);text(c,'CHECKPOINT',129,y,32,ink,'Orbitron');line(c,72,y+33,w-72,y+33,'#d5b67542');}
function footer(c,h,tag='TON HISTOIRE VIDÉOLUDIQUE'){const y=h>1500?h-230:h-70;spaced(c,tag,74,y,15,2.5,muted);text(c,'checkpoint-eka.pages.dev',1008,y,22,gold,'Checkpoint Sans','right');}
function phone(c,image,x,y,w,angle=0){
 const ratio=image.height/(image.width-(image===library?0:15)),h=w*ratio;
 c.save();c.translate(x+w/2,y+h/2);c.rotate(angle*Math.PI/180);c.translate(-w/2,-h/2);
 c.shadowColor='#000000c0';c.shadowBlur=48;c.shadowOffsetY=30;rounded(c,-9,-9,w+18,h+18,40,'#17181a');c.shadowColor='transparent';
 rounded(c,-9,-9,w+18,h+18,40,g(c,0,0,w,h,[[0,'#9c855a'],[.1,'#242528'],[.55,'#151619'],[1,'#726043']]),'#d6b67c88');
 c.save();c.beginPath();c.roundRect(0,0,w,h,32);c.clip();
 // Clip within a device frame; retain the screenshot's original UI and colours.
 c.drawImage(image,0,0,image.width-(image===library?0:15),image.height,0,0,w,h);
 c.restore();line(c,24,-7,w-24,-7,'#f8e4b980');c.restore();return h;
}
function title(c,first,second,y,size=82){text(c,first,72,y,size,ink,'Checkpoint Bold');text(c,second,72,y+size*1.13,size,metal(c,y,200),'Checkpoint Bold');}
function feature(c,title,detail,x,y,index){text(c,'0'+index,x,y,18,gold);line(c,x,y+15,x+280,y+15,'#d5b67544');text(c,title,x,y+58,29,ink,'Checkpoint Bold');(Array.isArray(detail)?detail:[detail]).forEach((value,i)=>text(c,value,x,y+92+i*32,23,muted));}
function ad(c,kind,story){
 const h=story?1920:1350;backdrop(c,1080,h);brand(c,story?190:100);
 const ty=story?360:238;
 if(kind==='presentation'){
  title(c,'Toute ta vie','de joueur.',ty,88);
  text(c,'Tes jeux, ton matériel et ceux qui les partagent.',74,ty+174,30,muted);
  phone(c,library,155,story?650:485,story?365:310,-5);
  phone(c,hardware,605,story?775:545,story?345:295,5);
  spaced(c,'COLLECTION · PROFIL · MATÉRIEL · SOCIAL',74,story?1610:1210,17,1.8,gold);
  text(c,'Et toujours de nouvelles découvertes.',74,story?1660:1250,27,ink);
 }else if(kind==='collection'){
  title(c,'Toute ta collection.','Au même endroit.',ty,76);
  text(c,'Tes jeux, tes notes, tes envies.',74,ty+162,30,muted);
  phone(c,library,560,story?720:440,story?416:354,3);
  const fy=story?910:610;feature(c,'Retrouve tes jeux','Collection et wishlist',74,fy,1);
  feature(c,'Garde ton avis','Notes et coups de cœur',74,fy+188,2);
  feature(c,'Organise tes jeux','Listes personnelles et favoris',74,fy+376,3);
 }else if(kind==='materiel'){
  title(c,'Tout ton matériel.','Une seule collection.',ty,76);
  text(c,'Une place pour chaque pièce de ta collection.',74,ty+162,30,muted);
  phone(c,hardware,574,story?710:450,story?380:340,3);
  const fy=story?850:585;
  feature(c,'Tout ton équipement',['Consoles, manettes et VR','Claviers, souris, écrans et TV','Casques et enceintes'],74,fy,1);
  feature(c,'Coloris et éditions','Éditions standard et collector',74,fy+188,2);
  feature(c,'Possédés ou recherchés','Ta collection et ta wishlist',74,fy+376,3);
 }else{
  title(c,'Bien plus qu’une','liste de jeux.',ty,80);
  text(c,'Un espace pour toutes tes envies de joueur.',74,ty+164,30,muted);
  const entries=[
   ['Ta bibliothèque',['Collection, wishlist, listes.','Tes notes et tes favoris.']],
   ['Ton profil',['Ton parcours, tes badges','et tes jeux marquants.']],
   ['Ton matériel',['Consoles et périphériques,','audio, écrans et VR.']],
   ['Tes amis',['Profils, recommandations,','sondages et défis entre amis.']],
   ['Tes découvertes',['Recherche, sorties, actualités','et bons plans.']],
   ['Tes rendez-vous',['Quiz, sélections et souvenirs.','Des duels dans l’Arène aussi.']]
  ];
  const top=story?705:530,step=story?285:226;
  entries.forEach(([label,details],i)=>{
   const x=74+(i%2)*486,y=top+Math.floor(i/2)*step;
   spaced(c,'0'+(i+1),x,y,17,2,gold);
   line(c,x,y+22,x+440,y+22,'#d5b67555');
   text(c,label,x,y+76,33,ink,'Checkpoint Bold');
   details.forEach((detail,j)=>text(c,detail,x,y+122+j*34,25,muted));
  });
  if(story)text(c,'Tes jeux. Ton parcours. Ton Checkpoint.',74,1650,30,gold);
 }
 footer(c,h,kind==='presentation'?'TON ESPACE GAMING':'TES JEUX. TON PARCOURS.');
}
function identity(c,w,h){
 backdrop(c,w,h,.48);const story=h>1500,square=w===h;
 const center=w/2,top=story?490:square?150:165,sz=story?390:square?340:340;
 const halo=c.createRadialGradient(center,top+sz*.55,20,center,top+sz*.55,sz);halo.addColorStop(0,'#8f6a2626');halo.addColorStop(1,'#00000000');c.fillStyle=halo;c.fillRect(0,0,w,h);
 c.drawImage(mark,center-sz/2,top,sz,sz*128/120);
 const wordY=top+sz*128/120+(story?145:110),font=w>1400?105:75;
 text(c,'CHECKPOINT',center,wordY,font,ink,'Orbitron','center');
 const lineY=wordY+55;line(c,center-260,lineY,center+260,lineY,'#c5a26477');
 text(c,'Tes jeux. Ton parcours. Ton Checkpoint.',center,lineY+70,w>1400?38:29,gold,'Checkpoint Sans','center');
 spaced(c,'JEUX · MATÉRIEL · PARTAGE',center,story?1640:square?940:955,17,3,muted,'center');
}
function transparent(c){
 c.drawImage(mark,30,28,275,293);text(c,'CHECKPOINT',365,170,112,ink,'Orbitron');
 line(c,368,212,1710,212,'#c5a26477');text(c,'Tes jeux. Ton parcours. Ton Checkpoint.',370,285,44,gold);
}
async function write(name,w,h,draw,svg=true){
 const canvas=createCanvas(w,h);draw(canvas.getContext('2d'));fs.writeFileSync(path.join(out,name+'.png'),canvas.toBuffer('image/png'));
 if(svg){const vector=createCanvas(w,h,SvgExportFlag.ConvertTextToPaths);draw(vector.getContext('2d'));fs.writeFileSync(path.join(out,name+'.svg'),vector.getContent());}
 return canvas;
}
async function main(){
 fs.mkdirSync(out,{recursive:true});const capture=path.join(root,'captures');fs.mkdirSync(capture,{recursive:true});
 fs.copyFileSync('C:/Users/bodyj/.codex/codex-remote-attachments/01a0f423-7d72-74b0-b63b-e40ee4714309/D4CA0ACF-A0E0-41F3-8AE7-E4F46CDE9B91/1-Photo-1.jpg',path.join(capture,'bibliotheque-originale.jpg'));
 const markPng=await sharp(path.join(assets,'checkpoint-mark.svg'),{density:1200}).resize(1920,2048).png().toBuffer();
 mark=await loadImage(markPng);library=await loadImage(path.join(capture,'bibliotheque-originale.jpg'));
 hardware=await loadImage(path.resolve(root,'../../.account-backups/hardware-collection-flat-mobile.png'));
 fs.copyFileSync(path.resolve(root,'../../.account-backups/hardware-collection-flat-mobile.png'),path.join(capture,'materiel-original.png'));
 const previews=[];
 for(const [index,kind] of ['presentation','collection','materiel','univers'].entries()){
  const name=`0${index+1}-${kind}`;previews.push(await write(`${name}-publication`,1080,1350,c=>ad(c,kind,false)));
  await write(`${name}-story`,1080,1920,c=>ad(c,kind,true));
 }
 previews.push(await write('05-logo-slogan-carre',1080,1080,c=>identity(c,1080,1080)));
 await write('05-logo-slogan-story',1080,1920,c=>identity(c,1080,1920));
 await write('05-logo-slogan-banniere',1920,1080,c=>identity(c,1920,1080));
 await write('06-logo-slogan-transparent',1800,380,transparent);
 const originalMark=fs.readFileSync(path.join(assets,'checkpoint-mark.svg'),'utf8').replace('width="100%" height="100%"','x="30" y="28" width="275" height="293"');
 const vectorLockup=`<svg xmlns="http://www.w3.org/2000/svg" width="1800" height="380" viewBox="0 0 1800 380">${originalMark}<text x="365" y="170" font-family="Orbitron" font-size="112" fill="${ink}">CHECKPOINT</text><path d="M368 212H1710" stroke="#c5a264" stroke-opacity=".47"/><text x="370" y="285" font-family="Checkpoint Sans" font-size="44" fill="${gold}">Tes jeux. Ton parcours. Ton Checkpoint.</text></svg>`;
 fs.writeFileSync(path.join(out,'06-logo-slogan-transparent.svg'),convertSVGTextToPath(vectorLockup));
 await write('07-symbole-transparent',1024,1024,c=>c.drawImage(mark,32,0,960,1024));
 const sheet=createCanvas(1800,760),s=sheet.getContext('2d');s.fillStyle='#151619';s.fillRect(0,0,1800,760);
 text(s,'CHECKPOINT / TOUT UN UNIVERS GAMING',42,62,24,ink,'Checkpoint Bold');
 previews.forEach((canvas,i)=>{const x=32+i*354;s.drawImage(canvas,x,102,330,canvas.height/canvas.width*330);text(s,['Toute l’app','Bibliothèque','Matériel','Les fonctionnalités','Logo & signature'][i],x,575,22,ink,'Checkpoint Bold');});
 text(s,'Publications · Stories · Bannières · Logos transparents',42,655,24,gold);
 text(s,'Logo original. Captures réelles. Textes composés, sans génération d’interface.',42,704,21,muted);
 fs.writeFileSync(path.join(root,'apercu-collection.png'),sheet.toBuffer('image/png'));
 console.log('13 compositions PNG + sources SVG exported, plus overview.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
