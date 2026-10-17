// Authored procedural scenery: no photographs, generated plates, franchise
// insignia, character models or remote assets. Coordinates belong to Checkpoint.
export const INSPIRED_WORLDS = new Set(["halo","portal","godwar","outlaw","assassin","future","jurassic"]);
const TAU=Math.PI*2;
const noise=n=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v);};
const palette={halo:["#06141d","#29484b","#07161c"],portal:["#15212c","#52616a","#111c26"],godwar:["#101f30","#67838d","#0d1d29"],outlaw:["#421619","#c1603b","#250d13"],assassin:["#152731","#d0a379","#15222c"],future:["#081325","#244d67","#0a101d"],jurassic:["#061714","#345247","#071410"]};
function gradient(c,x,y,x2,y2,stops){const g=c.createLinearGradient(x,y,x2,y2);stops.forEach(([p,col])=>g.addColorStop(p,col));return g;}
function poly(c,points,fill,stroke,width=1){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));if(fill)c.closePath();if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
function ellipse(c,x,y,rx,ry,color){c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fillStyle=color;c.fill();}
function box(c,x,y,w,h,color){c.fillStyle=color;c.fillRect(x,y,w,h);}
function stroke(c,points,color,width=1){poly(c,points,null,color,width);}
function glow(c,x,y,r,color){const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,"#00000000");ellipse(c,x,y,r,r,g);}
function ridge(c,y,amp,seed,color){const p=[[-70,1400],[-70,y]];for(let i=0;i<=24;i++)p.push([i*46-50,y-amp*(.25+noise(seed+i)*.75)]);p.push([1100,1400]);poly(c,p,color);}
function pine(c,x,y,h,color){box(c,x-2,y-h,4,h,color);poly(c,[[x,y-h],[x-h*.17,y-h*.66],[x-h*.08,y-h*.67],[x-h*.24,y-h*.38],[x-h*.12,y-h*.4],[x-h*.32,y],[x+h*.32,y],[x+h*.12,y-h*.4],[x+h*.24,y-h*.38],[x+h*.08,y-h*.67],[x+h*.17,y-h*.66]],color);}
function stars(c,count){for(let i=0;i<count;i++)ellipse(c,noise(i)*1000,noise(i+91)*620,.6+noise(i+42)*1.5,.6+noise(i+42)*1.5,`rgba(210,233,232,${.18+noise(i+17)*.5})`);}
function sky(c,motif){const colors=palette[motif]||palette.halo;box(c,-2000,-2000,5000,5000,gradient(c,0,0,0,1400,[[0,colors[0]],[.54,colors[1]],[1,colors[2]]]));}

function orbital(c,light){
  stars(c,light?35:95);glow(c,700,370,400,"#8bb8a622");
  c.beginPath();c.moveTo(-250,1050);c.bezierCurveTo(-200,-260,1200,-440,1290,990);c.strokeStyle="#193640";c.lineWidth=122;c.stroke();
  c.strokeStyle=gradient(c,0,0,1000,1000,[[0,"#c8c2a0"],[.5,"#7c9990"],[1,"#264d52"]]);c.lineWidth=57;c.stroke();
  c.strokeStyle="#d2e6cf77";c.lineWidth=5;c.stroke();
  for(let i=0;i<(light?8:24);i++){const a=3.35+i*.093,x=520+600*Math.cos(a),y=770+770*Math.sin(a);stroke(c,[[x,y],[x+23*Math.cos(a),y+23*Math.sin(a)]],"#193c3f66",3);}
  ellipse(c,767,220,38,38,"#bfd6cc77");ellipse(c,779,214,34,34,"#2e5257");
  ridge(c,830,230,3,"#38575a");ridge(c,930,225,71,"#1d3e43");ridge(c,1120,200,12,"#10282e");
  for(let i=0;i<(light?8:24);i++)pine(c,i*48-30,1000+noise(i)*130,40+noise(i+8)*100,"#102d31");
  // A weathered signal monument; deliberately no suit or military insignia.
  poly(c,[[171,1070],[192,702],[252,655],[276,1053]],gradient(c,180,720,280,1020,[[0,"#59756f"],[1,"#142f34"]]),"#78988b66",2);
  poly(c,[[203,758],[213,734],[220,1000],[209,1010]],"#a7ddc5");stroke(c,[[172,1070],[315,1090],[374,1150]],"#94b9a329",2);
}

function laboratory(c,light){
  box(c,0,90,1000,830,gradient(c,0,70,0,940,[[0,"#839399"],[1,"#374953"]]));
  poly(c,[[0,100],[285,255],[285,825],[0,1040]],"#263943");poly(c,[[1000,100],[765,255],[765,825],[1000,1040]],"#4e6068");
  for(let i=0;i<6;i++){stroke(c,[[0,110+i*150],[285,260+i*112]],"#90a3aa35",2);stroke(c,[[1000,110+i*150],[765,260+i*112]],"#c4d0d02b",2);}
  for(let i=0;i<5;i++)stroke(c,[[285+i*120,255],[285+i*120,825]],"#263f4b44",2);
  for(let i=0;i<6;i++)stroke(c,[[285,255+i*112],[765,255+i*112]],"#263f4b44",2);
  poly(c,[[0,1040],[285,825],[765,825],[1000,1040],[1000,1400],[0,1400]],"#263c46");
  for(let i=0;i<10;i++)stroke(c,[[500,825],[i*180-300,1400]],"#adccd62a",2);
  for(let i=0;i<6;i++)stroke(c,[[0,865+i*i*17],[1000,865+i*i*17]],"#adccd629",2);
  box(c,372,359,290,466,"#172c37");box(c,391,378,252,447,gradient(c,390,380,640,825,[[0,"#293d46"],[.48,"#1a2f38"],[.5,"#91bcc2"],[.52,"#1a2f38"],[1,"#304750"]]));
  // Offset rectangular spatial windows, rather than Aperture's oval portals.
  box(c,26,350,156,345,"#192c37");box(c,36,360,136,325,"#6cb9d1");box(c,42,366,124,313,"#0c2d3d");
  box(c,817,410,146,315,"#172d37");box(c,826,419,128,297,"#d7ad73");box(c,832,425,116,285,"#3e302b");
  box(c,310,267,421,8,"#d5ebdf");glow(c,520,270,260,"#d0f9e71c");
  if(!light)for(let i=0;i<8;i++){box(c,332+i*45,783,18,3,i<5?"#a3d5cb":"#4f7377");}
  poly(c,[[80,1090],[250,1032],[380,1067],[215,1143]],"#647980");poly(c,[[80,1090],[215,1143],[215,1176],[80,1122]],"#314951");
}

function nordic(c,light){
  glow(c,735,300,390,"#b1ccd33b");
  ridge(c,735,400,91,"#718791");ridge(c,800,380,41,"#4f6d7b");
  for(let i=0;i<7;i++){const x=90+i*150,y=365+noise(i+23)*150;poly(c,[[x-50,y+110],[x,y],[x+73,y+134],[x+12,y+72],[x-3,y+91],[x-15,y+64]],"#ccd8d8aa");}
  poly(c,[[318,710],[671,710],[970,1260],[25,1260]],gradient(c,0,710,0,1260,[[0,"#7497a0"],[.3,"#395f70"],[1,"#162f40"]]));
  for(let i=0;i<(light?20:65);i++){const y=760+i*7,x=200+noise(i+7)*520;stroke(c,[[x,y],[x+20+noise(i)*160,y]],"#c2dfe422",1);}
  poly(c,[[0,790],[240,722],[375,877],[287,1006],[0,1180]],"#233d4a");poly(c,[[1000,750],[785,720],[680,855],[777,978],[1000,1160]],"#1e3846");
  for(let i=0;i<(light?14:35);i++){const x=noise(i+81)*330,y=815+noise(i+5)*370;pine(c,x,y,95+noise(i)*180,"#172f3b");pine(c,1000-x,y-30,70+noise(i+3)*150,"#1d3945");}
  poly(c,[[152,1080],[161,812],[217,752],[268,819],[262,1090]],gradient(c,160,790,260,1080,[[0,"#687d80"],[1,"#263d47"]]),"#a6b6b044",2);
  // Original angular carvings, not the franchise's Omega or Leviathan axe.
  stroke(c,[[202,829],[232,852],[192,884],[231,913],[197,951],[224,980]],"#a8c6c0",3);
  poly(c,[[519,963],[659,963],[637,991],[554,993]],"#273339","#9c9d863b",2);stroke(c,[[591,867],[591,974]],"#6c6d5b",5);
  poly(c,[[599,869],[646,927],[599,940]],"#a14c46");
}

function western(c,light){
  box(c,-2000,-2000,5000,5000,gradient(c,0,0,0,1400,[[0,"#541c28"],[.3,"#bb5439"],[.65,"#d49361"],[1,"#2d101a"]]));
  ellipse(c,705,349,158,158,gradient(c,0,190,0,510,[[0,"#f4d196"],[1,"#e6ac69"]]));
  for(let i=0;i<12;i++)ellipse(c,noise(i)*1100,130+i*34,120+noise(i+5)*250,4+noise(i+22)*10,"#542b3430");
  poly(c,[[-10,850],[80,803],[108,600],[182,574],[239,581],[270,779],[357,813],[389,880],[650,980],[1000,1400],[-10,1400]],"#783c32");
  poly(c,[[1000,884],[925,802],[901,543],[823,531],[799,575],[763,794],[668,853],[604,932],[350,1400],[1000,1400]],"#914c37");
  for(let i=0;i<(light?6:18);i++){const x=120+noise(i)*125;stroke(c,[[x,620],[x+5,720],[x+noise(i+20)*25,805]],"#d18e5733",1.5);}
  ridge(c,1030,135,52,"#68312f");ridge(c,1200,90,8,"#3b1d25");
  // A railway disappearing into the mesas gives this western its own story.
  stroke(c,[[492,886],[195,1400]],"#d4ac7e66",4);stroke(c,[[516,886],[785,1400]],"#d4ac7e66",4);
  for(let i=0;i<10;i++){const k=(i+1)/10,y=886+490*k*k;stroke(c,[[492-300*k*k,y],[516+268*k*k,y]],"#1b1722",6*k);}
  c.lineCap="round";stroke(c,[[153,1110],[153,930]],"#32252a",16);stroke(c,[[152,1018],[115,995],[115,958]],"#32252a",12);stroke(c,[[153,990],[190,971],[190,940]],"#32252a",11);c.lineCap="butt";
  for(let i=0;i<(light?10:28);i++){const x=noise(i+7)*1000,y=1120+noise(i)*170;stroke(c,[[x-12,y],[x,y-25],[x,y],[x+14,y-16]],"#4c2b2d",2);}
}

function dome(c,x,y,w){
  box(c,x-w*.42,y,w*.84,w*.72,"#9c8e79");
  c.beginPath();c.moveTo(x-w*.52,y);c.bezierCurveTo(x-w*.53,y-w*.58,x-w*.2,y-w*.86,x,y-w*.92);c.bezierCurveTo(x+w*.2,y-w*.86,x+w*.53,y-w*.58,x+w*.52,y);c.closePath();c.fillStyle=gradient(c,x-w*.5,0,x+w*.5,0,[[0,"#704c43"],[.5,"#b28164"],[1,"#543b3d"]]);c.fill();
  for(let i=-2;i<=2;i++)stroke(c,[[x+i*w*.17,y],[x+i*w*.09,y-w*.65],[x,y-w*.92]],"#e3b98e55",2);
  box(c,x-w*.1,y-w*.99,w*.2,w*.1,"#d6bea0");box(c,x-w*.035,y-w*1.2,w*.07,w*.23,"#b7aa8d");
  for(let i=0;i<5;i++){box(c,x-w*.32+i*w*.14,y+w*.15,w*.06,w*.22,"#4f5350");}
}
function renaissance(c,light){
  glow(c,238,290,310,"#ebd6b156");ellipse(c,238,290,42,42,"#f3d9a6");
  ridge(c,700,250,15,"#8b8b8188");ridge(c,760,170,34,"#6f777455");
  for(let row=0;row<3;row++){for(let i=0;i<(light?11:18);i++){const x=i*(light?105:65)-70+(row%2)*30,w=40+noise(i+row)*45,y=740+row*95-noise(i+row*11)*70,h=70+noise(i+13)*120;
    box(c,x,y-h,w,h,["#8c8c7c","#657575","#40565f"][row]);poly(c,[[x-6,y-h],[x+w*.5,y-h-24],[x+w+7,y-h]],row===2?"#6e4a43":"#94745d");
    if(!light||row===2)for(let j=0;j<3;j++){box(c,x+9+j*12,y-h+22,5,12,"#243b4855");}}
  }
  dome(c,671,610,217);box(c,811,531,48,269,"#8d8b77");poly(c,[[801,531],[835,465],[870,531]],"#70594d");
  // A new roofline, without a hooded character or Creed insignia.
  poly(c,[[-100,1050],[290,842],[500,1003],[500,1400],[-100,1400]],gradient(c,0,850,500,1400,[[0,"#765b4b"],[1,"#142934"]]));
  stroke(c,[[-80,1046],[290,838],[508,999]],"#d1ad8066",7);
  for(let i=0;i<10;i++)stroke(c,[[-80,1090+i*32],[290,880+i*33],[508,1043+i*32]],"#c09b6b22",2);
  for(let i=0;i<12;i++)stroke(c,[[i*42-60,1030-i*17],[i*42-70,1410]],"#171f2c3b",2);
  box(c,194,908,9,180,"#273947");
}

function cityBlock(c,x,y,w,h,lit){box(c,x,y,w,h,"#142635");for(let row=0;row<6;row++)for(let col=0;col<3;col++)box(c,x+10+col*18,y+18+row*24,6,10,noise(row*19+col+x)>.5?lit:"#25424d");}
function temporal(c,light){
  stars(c,light?20:50);glow(c,680,420,360,"#7fc2d32b");
  for(let i=0;i<9;i++){const h=130+noise(i)*190;cityBlock(c,i*128-70,830-h,85,h,"#d1a97699");}
  // Original stepped clock tower, not Hill Valley's courthouse or a DeLorean.
  box(c,367,398,270,420,gradient(c,365,0,640,0,[[0,"#536775"],[.5,"#83918e"],[1,"#2d465b"]]));
  box(c,401,288,202,120,"#607888");box(c,429,241,145,52,"#779298");box(c,454,217,95,25,"#8da4a4");
  for(let i=0;i<4;i++)box(c,386+i*66,600,13,207,"#1c3549");
  ellipse(c,502,434,94,94,"#c8b28a");ellipse(c,502,434,83,83,"#172f43");
  for(let i=0;i<12;i++){const a=i*TAU/12;stroke(c,[[502+Math.sin(a)*69,434-Math.cos(a)*69],[502+Math.sin(a)*77,434-Math.cos(a)*77]],"#c4d8d2",3);}
  poly(c,[[0,881],[500,797],[1000,881],[1000,1400],[0,1400]],gradient(c,0,810,0,1400,[[0,"#2b4859"],[1,"#080f20"]]));
  for(let i=0;i<(light?7:20);i++){const y=875+i*17,x=noise(i)*1000;stroke(c,[[x,y],[x+35+noise(i+7)*65,y]],i%2?"#9ad3d52c":"#dcb88228",2);}
  stroke(c,[[490,854],[55,1400]],"#6dcedb55",4);stroke(c,[[515,854],[967,1400]],"#e2b37f55",4);
}

function fern(c,x,y,size,turn,color,light){
  c.save();c.translate(x,y);c.rotate(turn);stroke(c,[[0,0],[size*.12,-size*.52],[0,-size]],color,3);
  const count=light?6:12;for(let i=0;i<count;i++){const k=i/count,py=-size*k,w=Math.sin(k*Math.PI)*size*.29;poly(c,[[size*.04,py],[w,py-size*.18],[w*.77,py-size*.02],[0,py+size*.06]],color);poly(c,[[0,py],[-w,py-size*.16],[-w*.8,py],[0,py+size*.06]],color);}
  c.restore();
}
function reserve(c,light){
  glow(c,580,430,480,"#a1b49430");
  for(let layer=0;layer<3;layer++){ridge(c,620+layer*170,120,19+layer*4,["#3e6050","#274f40","#173c32"][layer]);for(let i=0;i<(light?9:20);i++){const x=i*(light?140:65)-80,y=720+layer*90+noise(i+layer*9)*80,treeHeight=240+noise(i+3)*190,color=["#34584a","#234b3b","#163d30"][layer];box(c,x,y-treeHeight,7+noise(i)*8,treeHeight+40,["#2c4b40","#1b3e34","#13332b"][layer]);ellipse(c,x-20,y-treeHeight,50+noise(i+7)*50,70+noise(i+8)*85,color);ellipse(c,x+15,y-treeHeight+50,55+noise(i+18)*45,60+noise(i+2)*70,color);}}
  // A distant, original sauropod silhouette, partly concealed by the entrance.
  c.save();c.globalAlpha=.48;ellipse(c,646,759,84,34,"#1a3c32");
  c.beginPath();c.moveTo(677,752);c.bezierCurveTo(687,640,610,486,638,355);c.bezierCurveTo(643,332,667,333,680,343);c.lineTo(670,361);c.bezierCurveTo(643,448,717,646,705,764);c.closePath();c.fillStyle="#1a3c32";c.fill();
  stroke(c,[[589,766],[540,774],[503,754]],"#1a3c32",10);stroke(c,[[616,778],[606,838]],"#1a3c32",16);stroke(c,[[685,777],[694,838]],"#1a3c32",16);c.restore();
  poly(c,[[405,842],[595,842],[910,1400],[48,1400]],gradient(c,0,840,0,1400,[[0,"#526550"],[1,"#0b231d"]]));
  // Bespoke straight canopy and stone/steel entrance. No film gate typography.
  poly(c,[[137,417],[330,356],[720,356],[866,403],[827,432],[330,397],[159,452]],"#253e35","#788e6355",3);
  box(c,187,425,84,667,gradient(c,180,0,280,0,[[0,"#354e3f"],[.5,"#6f7a55"],[1,"#263d32"]]));
  box(c,729,425,84,667,gradient(c,720,0,820,0,[[0,"#263d32"],[.5,"#6f7a55"],[1,"#354e3f"]]));
  for(let i=0;i<12;i++){stroke(c,[[187,453+i*51],[271,453+i*51]],"#a8aa7433",2);stroke(c,[[729,453+i*51],[813,453+i*51]],"#a8aa7433",2);}
  poly(c,[[270,427],[730,427],[730,513],[270,513]],"#2b4539","#a5ad7344",2);
  c.strokeStyle="#c0cb91";c.lineWidth=3;c.beginPath();c.moveTo(500,490);c.bezierCurveTo(458,474,472,444,510,449);c.bezierCurveTo(525,468,518,484,500,490);c.stroke();stroke(c,[[489,501],[511,451]],"#c0cb91",2);
  for(const x of [229,771]){glow(c,x,638,100,"#eab87440");box(c,x-18,605,36,64,"#132a24");box(c,x-12,612,24,48,gradient(c,0,615,0,660,[[0,"#eed5a0"],[1,"#be8750"]]));stroke(c,[[x-18,600],[x,583],[x+18,600]],"#344337",4);}
  fern(c,82,1130,490,-.43,"#0b2d25",light);fern(c,954,1170,525,.5,"#0a3025",light);
}

function layout(w,h){const wide=w/h>1.1&&w>=600;const boxWidth=wide?w*.51:w,boxHeight=wide?h*.88:Math.min(h*.59,w*1.3);const scale=wide?Math.min(boxWidth/1000,boxHeight/1200):w/1000;return {x:(boxWidth-1000*scale)/2,y:wide?h*.03:h*.075,scale};}
function stage(c,w,h,draw){const l=layout(w,h);c.save();c.translate(l.x,l.y);c.scale(l.scale,l.scale);draw();c.restore();}
const painters={halo:orbital,portal:laboratory,godwar:nordic,outlaw:western,assassin:renaissance,future:temporal,jurassic:reserve};

export function getInspiredWorldBudget(width,height,{light=false,dpr=1}={}){
  const ratio=Math.min(Math.max(1,Number(dpr)||1),light?1:1.5);
  return {pixelRatio:Math.min(ratio,Math.sqrt(2200000/Math.max(1,width*height))),fps:light?12:24,particles:light?5:24};
}

export function paintInspiredBackdrop(c,w,h,motif,light){
  const colors=palette[motif]||palette.halo;box(c,0,0,w,h,gradient(c,0,0,0,h,[[0,colors[0]],[.4,colors[1]],[.78,colors[2]],[1,colors[2]]]));
  stage(c,w,h,()=>{c.save();c.beginPath();c.rect(-2500,-2000,6000,6000);c.clip();sky(c,motif);painters[motif]?.(c,light);c.restore();});
}

function gates(c,t){const opening=.55*(1-Math.exp(-t*.55)),panelWidth=222*(1-opening);for(const side of [-1,1]){c.save();c.translate(side<0?276:724,527);c.scale(side<0?1:-1,1);poly(c,[[0,0],[panelWidth,12],[panelWidth,510],[0,553]],gradient(c,0,0,panelWidth,0,[[0,"#324e3b"],[.5,"#536345"],[1,"#203a30"]]),"#8b987255",3);for(let i=0;i<7;i++)stroke(c,[[panelWidth*i/7,8],[panelWidth*i/7,535]],"#152d2599",3);stroke(c,[[0,470],[panelWidth,50],[panelWidth,77],[0,497]],"#a2a67a77",7);c.restore();}}

export function paintInspiredMotion(c,w,h,motif,t,budget,light){
  stage(c,w,h,()=>{
    if(motif==="halo"){
      const x=480+Math.sin(t*.18)*55;glow(c,x,435,160,"#8edbdb15");stroke(c,[[x-85,435],[x+85,435]],"#b5dbcc55",1);ellipse(c,noise(12)*600+300,260,2,2,"#e4e9c0");
      for(let i=0;i<3;i++)ellipse(c,600+i*11+t*4%60,765-i*2,2,1,"#9bddc5aa");
    }
    if(motif==="portal"){
      for(const [x,y,col] of [[46,366,"#8fe9f0"],[836,425,"#f6ca8e"]])for(let i=0;i<(light?3:8);i++){const k=(i/8+t*.12)%1;stroke(c,[[x+8,y+k*277],[x+107,y+k*277]],col+"44",1);}
      const open=1-Math.exp(-t*.7);box(c,508-open*55,378,7,440,"#d7eee233");
      for(let i=0;i<6;i++)box(c,350+i*57,842,22,4,i<Math.min(6,t*1.6)?"#d4e6c6":"#57797c");
    }
    if(motif==="godwar"){
      c.save();c.globalAlpha=.16;c.beginPath();c.moveTo(-40,190);c.bezierCurveTo(200,80+Math.sin(t*.2)*90,550,280,1050,55);c.strokeStyle="#b7ddc6";c.lineWidth=20;c.stroke();c.restore();
      for(let i=0;i<(light?6:16);i++){const y=830+i*13;stroke(c,[[395+i*2+Math.sin(t+i)*4,y],[520+i*3+Math.sin(t+i)*4,y]],"#b0ced01c",1);}
      c.beginPath();c.moveTo(213,801);c.bezierCurveTo(271,813+Math.sin(t)*5,248,855,281,877);c.lineTo(265,874);c.bezierCurveTo(228,842,251,823,211,813);c.closePath();c.fillStyle="#af6252";c.fill();
    }
    if(motif==="outlaw"){
      for(let i=0;i<3;i++){const x=(t*9+i*380)%1500-250;ellipse(c,x,951+i*52,200,12+i*3,"#e2b77c0d");}
      for(let i=0;i<4;i++){const x=370+i*36+t*5,y=440+Math.sin(t*.8+i)*8;stroke(c,[[x-7,y],[x,y-3-Math.sin(t*2+i)*4],[x+7,y]],"#542e31",2);}
    }
    if(motif==="assassin"){
      const x=310+Math.sin(t*.19)*210,y=390+Math.cos(t*.24)*50,flap=Math.sin(t*1.5)*12;
      c.beginPath();c.moveTo(x-37,y+flap);c.quadraticCurveTo(x-14,y-13,x,y);c.quadraticCurveTo(x+14,y-13,x+37,y+flap);c.strokeStyle="#172b35";c.lineWidth=5;c.stroke();
      poly(c,[[204,910],[252+Math.sin(t)*6,920],[243+Math.cos(t*.8)*5,989],[202,976]],"#ad655388");
    }
    if(motif==="future"){
      for(const [angle,length,width] of [[-t*.7,60,4],[-t*.085,43,6]])stroke(c,[[502,434],[502+Math.sin(angle)*length,434-Math.cos(angle)*length]],"#e1d5b1",width);
      for(let i=0;i<(light?2:7);i++){const k=(t*.18+i/7)%1,y=850+k*k*480,x=500+Math.sin(i*2)*k*290;stroke(c,[[x,y],[x+45*k,y]],i%2?"#e9b87c99":"#8bc8da88",3*k);}
      c.save();c.globalAlpha=.18+.07*Math.sin(t*.8);stroke(c,[[810,70],[757,173],[788,219],[727,310],[747,349],[688,420]],"#b9e8ef",3);c.restore();
    }
    if(motif==="jurassic"){
      gates(c,t);fern(c,2,1250,570,-.65+Math.sin(t*.5)*.025,"#061f1c",light);fern(c,1006,1260,530,.58+Math.sin(t*.43)*.03,"#08251e",light);
      for(let i=0;i<3;i++)ellipse(c,390+i*180+Math.sin(t*.2+i)*50,1000+i*38,180,20,"#a0b59a09");
    }
    c.save();for(let i=0;i<budget.particles;i++){
      const x=(noise(i+27)*1100+t*(motif==="outlaw"?11:3))%1100-50,y=(noise(i+82)*1100+t*(motif==="godwar"?20:motif==="jurassic"?170:-7)+1400)%1400;
      if(motif==="jurassic")stroke(c,[[x,y],[x-4,y+30]],"#b3d0bd33",1);
      else ellipse(c,x,y,motif==="godwar"?1.8:1.1,motif==="godwar"?1.8:1.1,motif==="outlaw"?"#f6ce8c55":"#d7e2ca55");
    }c.restore();
  });
}
