const fs=require('node:fs'),path=require('node:path');
const file=path.join(__dirname,'render.cjs');let s=fs.readFileSync(file,'utf8');
s=s.replace('let mark,library,arena;','let mark,library,arena,hardware;');
s=s.replaceAll("image===arena?15:0","image===library?0:15");
const start=s.indexOf('function ad('),end=s.indexOf('function identity(');
s=s.slice(0,start)+`function ad(c,kind,story){
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
`+s.slice(end);
s=s.replaceAll('COLLECTION · SOUVENIRS · CHAMPIONS','JEUX · MATÉRIEL · PARTAGE');
s=s.replace(" const previews=[];"," hardware=await loadImage(path.resolve(root,'../../.account-backups/hardware-collection-flat-mobile.png'));\n fs.copyFileSync(path.resolve(root,'../../.account-backups/hardware-collection-flat-mobile.png'),path.join(capture,'materiel-original.png'));\n const previews=[];");
s=s.replace("['presentation','collection','arena'].entries()","['presentation','collection','materiel','univers'].entries()");
s=s.replaceAll('04-logo-slogan','05-logo-slogan').replaceAll('05-logo-slogan-transparent','06-logo-slogan-transparent').replaceAll('06-symbole-transparent','07-symbole-transparent');
s=s.replace('createCanvas(1440,760)','createCanvas(1800,760)').replace('fillRect(0,0,1440,760)','fillRect(0,0,1800,760)');
s=s.replace('CHECKPOINT / PREMIÈRE COLLECTION','CHECKPOINT / TOUT UN UNIVERS GAMING');
s=s.replace("['Présentation','Collection','L’Arène','Logo & signature']","['Toute l’app','Bibliothèque','Matériel','Les fonctionnalités','Logo & signature']");
s=s.replace('11 compositions PNG','13 compositions PNG');
fs.writeFileSync(file,s);
