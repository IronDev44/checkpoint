export function activityDate(value){
 if(!value)return null;
 try{const date=value.toDate?value.toDate():new Date(typeof value==='object'&&(value.seconds!=null||value._seconds!=null)?(value.seconds??value._seconds)*1000:value);return Number.isFinite(date.getTime())?date:null;}catch{return null;}
}
export function monthKey(date=new Date()){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}`;}
export function monthlyRecap(games=[],key=monthKey()){
 const [year,month]=key.split('-').map(Number),start=new Date(year,month-1,1),end=new Date(year,month,1);
 const inside=value=>{const date=activityDate(value);return date&&date>=start&&date<end;};
 const owned=games.filter(g=>g.status!=='wishlist');
 const finished=g=>g.completed===true||g.progressStatus==='completed'||['terminé','termine','finished','completed'].includes(g.status);
 return {key,label:start.toLocaleDateString('fr-FR',{month:'long',year:'numeric'}),added:owned.filter(g=>inside(g.collectionAddedAt||g.createdAt)),completed:owned.filter(g=>finished(g)&&inside(g.completedAt)),favorites:owned.filter(g=>g.favorite&&inside(g.favoriteAt)),undatedCompleted:owned.filter(g=>finished(g)&&!activityDate(g.completedAt)).length};
}
export function stampGameMilestones(before,patch,now=new Date().toISOString()){
 const next={...before,...patch},result={...patch};
 const completed=g=>g.completed===true||g.progressStatus==='completed'||['terminé','termine','finished','completed'].includes(g.status);
 if(!Object.hasOwn(patch,'completedAt')&&completed(next)!==completed(before))result.completedAt=completed(next)?now:null;
 if(!Object.hasOwn(patch,'favoriteAt')&&Boolean(next.favorite)!==Boolean(before.favorite))result.favoriteAt=next.favorite?now:null;
 if(!Object.hasOwn(patch,'collectionAddedAt')&&before.status==='wishlist'&&next.status!=='wishlist')result.collectionAddedAt=now;
 return result;
}
export function recapMonths(games=[],now=new Date()){
 const keys=new Set(Array.from({length:12},(_,i)=>monthKey(new Date(now.getFullYear(),now.getMonth()-i,1))));
 games.forEach(g=>['createdAt','completedAt','favoriteAt','collectionAddedAt'].forEach(field=>{const date=activityDate(g[field]);if(date&&date.getFullYear()>=2000&&date<=now)keys.add(monthKey(date));}));return [...keys].sort().reverse();
}
export async function renderMonthlyRecap(recap){
 const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1350;const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Création d’image indisponible.');
 const gradient=ctx.createLinearGradient(0,0,1080,1350);gradient.addColorStop(0,'#1e2428');gradient.addColorStop(.5,'#0c1014');gradient.addColorStop(1,'#020405');ctx.fillStyle=gradient;ctx.fillRect(0,0,1080,1350);
 ctx.strokeStyle='#cdb374';ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(36,36,1008,1278,32);ctx.stroke();ctx.fillStyle='#d8be82';ctx.font='700 36px sans-serif';ctx.fillText('CHECKPOINT',90,130);ctx.fillStyle='#f3f1e9';ctx.font='700 64px sans-serif';ctx.fillText('Mon mois de jeu',90,250);ctx.font='400 42px sans-serif';ctx.fillStyle='#cdb374';ctx.fillText(recap.label,90,320);
 const rows=[[recap.added.length,'ENTRÉES DANS MA BIBLIOTHÈQUE'],[recap.completed.length,'JEUX TERMINÉS'],[recap.favorites.length,'NOUVEAUX COUPS DE CŒUR']];
 rows.forEach(([count,label],i)=>{const y=425+i*190;ctx.fillStyle='#ffffff08';ctx.beginPath();ctx.roundRect(76,y,928,160,20);ctx.fill();ctx.fillStyle='#e8d39e';ctx.font='700 78px sans-serif';ctx.fillText(String(count),108,y+102);ctx.fillStyle='#e4e7e8';ctx.font='600 24px sans-serif';ctx.fillText(label,280,y+90);});
 ctx.fillStyle='#e4e7e8';ctx.font='600 30px sans-serif';const highlight=recap.favorites[0]||recap.completed[0];if(highlight){ctx.fillText('LE JEU QUE JE RETIENS',90,1095);let size=42;do{ctx.font=`700 ${size--}px sans-serif`;}while(ctx.measureText(highlight.name).width>890&&size>18);const text=ctx.measureText(highlight.name).width>890?highlight.name.slice(0,70)+'…':highlight.name;ctx.fillStyle='#d8be82';ctx.fillText(text,90,1160);}
 ctx.fillStyle='#aeb8bf';ctx.font='400 23px sans-serif';ctx.fillText('Mon parcours. Mes jeux. Mon Checkpoint.',90,1260);
 return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('Image indisponible.')),'image/png'));
}
