// The same immutable calendar is copied to the Worker by prebuild.
export const RENDEZVOUS_START = '2026-10-19T00:00:00.000Z';
const day=86400000;
const game=name=>({id:name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''),name});
const selection=(title,names)=>({title,options:names.map(game)});
export const SELECTION_THEMES=[
 selection('Le monde où tu aimerais te perdre',['The Legend of Zelda: Breath of the Wild','Red Dead Redemption 2','The Elder Scrolls V: Skyrim','Elden Ring']),
 selection('La bande-son qui reste en tête',['Final Fantasy VII','NieR: Automata','Persona 5','Undertale']),
 selection('Une ville inoubliable',['BioShock','Cyberpunk 2077','Batman: Arkham City','Yakuza 0']),
 selection('L’aventure PlayStation 2 qui te marque',['Shadow of the Colossus','Metal Gear Solid 3: Snake Eater','Final Fantasy X','God of War II']),
 selection('Un duo que tu n’oublies pas',['The Last of Us','Ratchet & Clank','It Takes Two','Portal 2']),
 selection('L’ambiance qui te captive',['Silent Hill 2','Dead Space','Resident Evil 2 (2019)','Alien: Isolation']),
 selection('Le plaisir de prendre le volant',['Forza Horizon 5','Mario Kart 8 Deluxe','Burnout 3: Takedown','Gran Turismo 4']),
 selection('Une histoire qui te reste',['Mass Effect 2','Disco Elysium','Life is Strange','What Remains of Edith Finch']),
 selection('L’envie de repartir explorer',['Outer Wilds','Subnautica','Hollow Knight','Metroid Prime']),
 selection('Un univers visuel singulier',['Cuphead','Okami','Journey','Gris']),
 selection('Une aventure à partager',['Stardew Valley','Minecraft','Sea of Thieves','Overcooked! 2']),
 selection('Les premiers pas sur Xbox',['Halo: Combat Evolved','Fable','Project Gotham Racing','Jet Set Radio Future']),
 selection('La plateforme qui donne le sourire',['Super Mario Odyssey','Rayman Legends','Celeste','Astro Bot']),
 selection('Un voyage dans l’espace',['Mass Effect','Star Wars: Knights of the Old Republic','No Man’s Sky','Returnal']),
 selection('Le souvenir d’une portable',['Pokemon Version Or','The Legend of Zelda: Link’s Awakening','Monster Hunter Freedom Unite','Professor Layton and the Curious Village']),
 selection('L’énergie de l’arcade',['Sonic Adventure','Crazy Taxi','Street Fighter III: 3rd Strike','Tony Hawk’s Pro Skater 2']),
];
export function mondayUTC(now=new Date()) {const d=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate()));d.setUTCDate(d.getUTCDate()-((d.getUTCDay()+6)%7));return d;}
export function weeklySelection(start) {
 const date=mondayUTC(new Date(start)),index=Math.floor((date.getTime()-Date.parse(RENDEZVOUS_START))/(7*day));
 if(index<0)return null;
 const theme=SELECTION_THEMES[index%16];
 return {id:`week-${date.toISOString().slice(0,10)}`,kind:'weekly',month:date.toISOString().slice(0,7),title:theme.title,options:theme.options,startsAt:date.toISOString(),endsAt:new Date(date.getTime()+7*day).toISOString()};
}
export function selectionCalendar(now=new Date()) {
 const current=mondayUTC(now),rounds=[];
 for(let i=0;i<18;i++){const item=weeklySelection(new Date(current.getTime()-i*7*day));if(item)rounds.push(item);}
 return rounds;
}
export function monthlyFinal(previousMonth,rounds,totals) {
 const [year,month]=previousMonth.split('-').map(Number),start=mondayUTC(new Date(Date.UTC(year,month,7)));
 const options=new Map();
 rounds.filter(round=>round.month===previousMonth&&Date.parse(round.endsAt)<=start.getTime()).forEach(round=>{
  const counts=round.options.map(option=>totals[round.id]?.[option.id]||0),best=Math.max(0,...counts);
  if(best>0)round.options.forEach((option,index)=>{if(counts[index]===best)options.set(option.id,option);});
 });
 return {id:`final-${previousMonth}`,kind:'final',month:previousMonth,title:`Finale de ${new Date(Date.UTC(year,month-1,1)).toLocaleDateString('fr-FR',{month:'long',year:'numeric',timeZone:'UTC'})}`,options:[...options.values()],startsAt:start.toISOString(),endsAt:new Date(start.getTime()+7*day).toISOString()};
}
export const EXPEDITIONS=[
 {id:'ps2-chronicle',title:'Chroniques PlayStation 2',opensAt:'2026-10-19',stamp:'Archiviste PlayStation',intro:'En 2000, la PS2 arrive au Japon, puis en Amérique du Nord et en Europe. Elle accueille aussi les films sur DVD.',source:'https://www.playstation.com/ja-jp/playstation-history/2000-ps2-psp/',questions:[{title:'La PS2 débute au Japon en quelle année ?',options:['1998','1999','2000','2001'],answer:2,explanation:'La sortie japonaise a lieu le 4 mars 2000.'},{title:'Quel support vidéo la PS2 peut-elle lire ?',options:['VHS','DVD vidéo','Blu-ray','HD DVD'],answer:1,explanation:'La PS2 peut aussi servir de lecteur DVD vidéo.'}],taste:selection('Quelle aventure PS2 retiens-tu ?',SELECTION_THEMES[3].options.map(g=>g.name))},
 {id:'nintendo-pocket',title:'Nintendo, les aventures de poche',opensAt:'2026-11-02',stamp:'Voyageur de poche',intro:'La Game Boy ouvre son histoire en 1989. En 2004, Nintendo lance une autre famille portable : la Nintendo DS.',source:'https://www.nintendo.co.jp/corporate/en/history/index.html',questions:[{title:'La première Game Boy est lancée en…',options:['1989','1992','1995','1998'],answer:0,explanation:'Nintendo situe le lancement de la Game Boy en 1989.'},{title:'Quelle portable Nintendo est lancée en 2004 ?',options:['Game Boy Advance','Nintendo DS','Nintendo 3DS','Nintendo Switch'],answer:1,explanation:'La DS est lancée en 2004 ; la 3DS arrivera en 2011.'}],taste:selection('Quelle aventure portable choisis-tu ?',SELECTION_THEMES[14].options.map(g=>g.name))},
 {id:'xbox-beginning',title:'Les débuts de Xbox',opensAt:'2026-11-16',stamp:'Témoin du lancement',intro:'Le 15 novembre 2001, la Xbox arrive dans les magasins d’Amérique du Nord. Halo figure dans son catalogue de lancement.',source:'https://news.microsoft.com/source/2001/11/15/xbox-erupts-on-the-scene',questions:[{title:'Dans quelle région la Xbox débute-t-elle le 15 novembre 2001 ?',options:['Europe','Japon','Amérique du Nord','Australie'],answer:2,explanation:'Le communiqué de lancement annonce sa disponibilité en Amérique du Nord.'},{title:'Quel jeu fait partie du lancement de la Xbox ?',options:['Halo: Combat Evolved','Halo 2','Gears of War','Fable II'],answer:0,explanation:'Halo est présent au lancement de la première Xbox.'}],taste:selection('Quel souvenir Xbox retiens-tu ?',SELECTION_THEMES[11].options.map(g=>g.name))},
 {id:'sega-last-console',title:'Le dernier pari de Sega',opensAt:'2026-12-01',stamp:'Passager du Dreamcast',intro:'La Dreamcast sort au Japon le 27 novembre 1998. Sega la présente dans ses archives comme sa dernière console de salon.',source:'https://www.sega.jp/history/hard/dreamcast/',questions:[{title:'La Dreamcast arrive au Japon en quelle année ?',options:['1996','1998','2000','2002'],answer:1,explanation:'La sortie japonaise date du 27 novembre 1998.'},{title:'Quelle console est la dernière console de salon de Sega ?',options:['Mega Drive','Saturn','Dreamcast','Game Gear'],answer:2,explanation:'La Dreamcast est la dernière console de salon de Sega.'}],taste:selection('Quelle énergie arcade préfères-tu ?',SELECTION_THEMES[15].options.map(g=>g.name))},
];
export const CHALLENGE_QUESTIONS=['Ton jeu préféré','La meilleure bande-son','Le monde le plus marquant','Les visuels les plus marquants','L’histoire qui te reste','La meilleure ambiance'];
