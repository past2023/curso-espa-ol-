/* El Héroe de las Palabras — motor Canvas sin dependencias */
(()=>{'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const canvas=$('#game'),ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;
const W=960,H=600,SAVE_KEY='verbalia_save_v2',RANK_KEY='verbalia_ranking_v2',data=GAME_DATA;
const keys={}, pressed=new Set(); let last=0, running=false, paused=false, modalOpen=false, dialogueOpen=false, sound=true, selectedColor='#52d6ff';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),rand=(a,b)=>a+Math.random()*(b-a);
const wordByEs=es=>data.words.find(w=>w.es.toLocaleLowerCase()===es.toLocaleLowerCase());
let state,player,entities=[],particles=[],projectiles=[],floatingTexts=[],afterImages=[],currentDialogue=null,dialogueIndex=0,nearEntity=null;
let screenShake=0,screenFlash=0,regionFade=0,hitStop=0;
const freshState=name=>({name:name||'Héroe',color:selectedColor,region:0,x:330,y:350,hp:100,maxHp:100,mana:60,maxMana:60,coins:8,xp:0,level:1,learned:[],inventory:[{id:'potion',qty:1}],kills:0,shadowKills:0,bosses:[],completed:[],quest:'meetOwl',questKills:0,sword:1,armor:0,playtime:0,started:Date.now()});
function save(show=false){if(!state)return;state.x=player.x;state.y=player.y;localStorage.setItem(SAVE_KEY,JSON.stringify(state));updateRanking();if(show)toast('Partida guardada · Игра сохранена','💾')}
function load(){try{return JSON.parse(localStorage.getItem(SAVE_KEY))}catch{return null}}
function updateRanking(){let rows=[];try{rows=JSON.parse(localStorage.getItem(RANK_KEY))||[]}catch{} const row={name:state.name,words:state.learned.length,coins:state.coins,level:state.level,score:state.learned.length*100+state.kills*20+state.coins+state.bosses.length*500,date:Date.now()};const old=rows.findIndex(r=>r.name===state.name);if(old>=0)rows[old]=row;else rows.push(row);rows.sort((a,b)=>b.score-a.score);localStorage.setItem(RANK_KEY,JSON.stringify(rows.slice(0,20)))}
class Player{constructor(){this.x=state.x;this.y=state.y;this.r=16;this.speed=170;this.dir={x:1,y:0};this.attacking=0;this.attackCd=0;this.dash=0;this.dashCd=0;this.hurt=0;this.walk=0;this.moving=false}
 update(dt){let dx=(keys.ArrowRight||keys.KeyD?1:0)-(keys.ArrowLeft||keys.KeyA?1:0),dy=(keys.ArrowDown||keys.KeyS?1:0)-(keys.ArrowUp||keys.KeyW?1:0);this.moving=!!(dx||dy);if(this.moving){let l=Math.hypot(dx,dy);dx/=l;dy/=l;this.dir={x:dx,y:dy};this.walk+=dt*11;if(Math.random()<dt*7)particles.push({x:this.x-dx*8,y:this.y+14,vx:rand(-10,10),vy:rand(-18,-5),life:.32,color:'#e6d09a',shape:'dust',size:3,rot:0})}let speed=this.speed*(this.dash>0?2.8:1);this.x=clamp(this.x+dx*speed*dt,12,W-12);this.y=clamp(this.y+dy*speed*dt,88,H-13);if(this.attackCd>0)this.attackCd-=dt;if(this.attacking>0)this.attacking-=dt;if(this.dash>0){this.dash-=dt;if(Math.random()<.55)afterImages.push({x:this.x,y:this.y,life:.22,color:state.color})}if(this.dashCd>0)this.dashCd-=dt;if(this.hurt>0)this.hurt-=dt;if(pressed.has('Space'))this.attack();if((pressed.has('ShiftLeft')||pressed.has('ShiftRight'))&&this.dashCd<=0){this.dash=.18;this.dashCd=1;burst(this.x,this.y,'#8ceaff',16,'dust');playFx('dash');screenShake=3}if(this.x<=13&&state.region>0){changeRegion(state.region-1,W-45,this.y)}else if(this.x>=W-13&&state.region<2){changeRegion(state.region+1,45,this.y)}}
 attack(){if(this.attackCd>0)return;this.attackCd=.38;this.attacking=.2;playFx('sword');const hx=this.x+this.dir.x*31,hy=this.y+this.dir.y*31;entities.filter(e=>e.type==='enemy'&&!e.dead&&Math.hypot(e.x-hx,e.y-hy)<37+e.r).forEach(e=>e.damage(22+state.sword*7,this.dir));burst(hx,hy,'#fff1a6',5)}
 damage(n){if(this.hurt>0||this.dash>0)return;let dmg=Math.max(1,n-state.armor*2);state.hp-=dmg;this.hurt=.8;burst(this.x,this.y,'#ff6577',18,'spark');screenShake=9;screenFlash=.16;floatingTexts.push({x:this.x,y:this.y-24,text:`-${dmg}`,color:'#ff8290',life:.9});playFx('hurt');if(state.hp<=0){state.hp=state.maxHp;state.coins=Math.max(0,state.coins-5);this.x=150;this.y=330;toast('Has despertado en el pueblo · Ты очнулся в деревне','💔');changeRegion(0,150,330)}updateHud()}
 draw(){
  ctx.save();ctx.translate(Math.round(this.x),Math.round(this.y));
  if(this.hurt>0&&Math.floor(this.hurt*12)%2)ctx.globalAlpha=.32;if(this.dash>0)ctx.globalAlpha=.55;
  const bob=this.moving?Math.round(Math.sin(this.walk)*2):0,step=this.moving?Math.round(Math.sin(this.walk)*3):0,face=this.dir.x<-.25?-1:1;
  // sombra, botas y capa
  ctx.fillStyle='#10131a55';ctx.beginPath();ctx.ellipse(2,15,18,8,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#4a3028';ctx.fillRect(-10,8+step,8,10);ctx.fillRect(3,8-step,8,10);ctx.fillStyle='#d18c43';ctx.fillRect(-11,14+step,9,4);ctx.fillRect(3,14-step,9,4);
  ctx.fillStyle='#26213f';ctx.beginPath();ctx.moveTo(-14,-5+bob);ctx.lineTo(14,-5+bob);ctx.lineTo(10,13+bob);ctx.lineTo(-12,12+bob);ctx.fill();
  // túnica con cinturón y amuleto
  ctx.fillStyle=state.color||'#52d6ff';ctx.fillRect(-11,-8+bob,22,19);ctx.fillStyle='#ffffff28';ctx.fillRect(-8,-6+bob,5,14);ctx.fillStyle='#4b3026';ctx.fillRect(-12,5+bob,24,4);ctx.fillStyle='#ffd95e';ctx.fillRect(-2,5+bob,5,5);
  // cabeza y cabello/capucha
  ctx.fillStyle='#f0bd91';ctx.fillRect(-9,-22+bob,18,15);ctx.fillStyle='#4e3034';ctx.fillRect(-10,-24+bob,20,7);ctx.fillRect(-11,-20+bob,4,9);ctx.fillRect(7,-20+bob,4,8);
  ctx.fillStyle='#22243b';ctx.fillRect(face>0?3:-6,-16+bob,3,3);ctx.fillStyle='#ef8d7b';ctx.fillRect(face>0?5:-7,-11+bob,3,2);
  // escudo trasero y espada animada
  ctx.fillStyle='#3b6f8a';ctx.fillRect(face>0?-17:11,-5+bob,6,15);ctx.fillStyle='#a9ecf2';ctx.fillRect(face>0?-16:12,-3+bob,2,8);
  if(this.attacking>0){const ang=Math.atan2(this.dir.y,this.dir.x),swing=(.2-this.attacking)/.2;ctx.rotate(ang-.8+swing*1.6);ctx.strokeStyle='#fff3a044';ctx.lineWidth=16;ctx.beginPath();ctx.arc(0,0,39,-.55,.45);ctx.stroke();ctx.strokeStyle='#3b2d2a';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(12,0);ctx.lineTo(27,0);ctx.stroke();ctx.strokeStyle='#f6f1cf';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(25,0);ctx.lineTo(49,0);ctx.stroke();ctx.strokeStyle='#8deaff';ctx.lineWidth=2;ctx.stroke();ctx.fillStyle='#ffd15d';ctx.fillRect(22,-7,5,14)}
  ctx.restore()
 }}
class Enemy{constructor(x,y,opt={}){Object.assign(this,{x,y,type:'enemy',r:15,hp:45,maxHp:45,speed:45,damageVal:10,color:'#62385e',name:'Sombra de Tinta',weak:'hola',boss:false,dead:false,hit:0,cool:0},opt)}
 update(dt){if(this.dead)return;this.hit=Math.max(0,this.hit-dt);this.cool-=dt;let d=dist(this,player);if(d<260&&d>this.r+player.r){this.x+=(player.x-this.x)/d*this.speed*dt;this.y+=(player.y-this.y)/d*this.speed*dt}if(d<this.r+player.r+4&&this.cool<=0){player.damage(this.damageVal);this.cool=1.1}if(this.boss&&Math.random()<dt*.8){let a=Math.atan2(player.y-this.y,player.x-this.x);projectiles.push({x:this.x,y:this.y,vx:Math.cos(a)*130,vy:Math.sin(a)*130,r:6,life:3,enemy:true,color:'#8c65a8',damage:8})}}
 damage(n,dir,magic=''){if(this.dead)return;if(magic&&magic===this.weak)n*=2;this.hp-=n;this.hit=.14;screenShake=this.boss?8:4;screenFlash=.09;hitStop=.035;floatingTexts.push({x:this.x,y:this.y-this.r,text:`-${Math.round(n)}`,color:magic?'#73efff':'#fff0a0',life:.75});playFx(magic?'magicHit':'hit');this.x+=(dir?.x||0)*12;this.y+=(dir?.y||0)*12;burst(this.x,this.y,magic?'#6deaff':'#ffbf64',7);if(this.hp<=0)this.die()}
 die(){this.dead=true;playFx(this.boss?'bossDown':'coin');screenShake=this.boss?14:5;if(this.boss)screenFlash=.3;let gain=this.boss?30:Math.floor(rand(3,8));state.coins+=gain;state.kills++;state.xp+=this.boss?80:15;for(let i=0;i<gain;i+=2)particles.push({x:this.x,y:this.y,vx:rand(-50,50),vy:rand(-90,-20),life:1,color:'#ffd34f',coin:true});if(!this.boss){
 state.shadowKills=(state.shadowKills||0)+1;
 state.questKills=Math.min(3,state.shadowKills);
 updateObjective();
 if(state.quest==='killShadows'&&state.shadowKills>=3)completeShadowQuest();
}if(this.boss){state.bosses.push(state.region);state.completed.push('boss');learnWord('luz');toast('¡Palabra Maestra: LUZ! · Главное слово: СВЕТ','💎')}levelCheck();updateHud();save()}
 draw(){if(this.dead)return;
  ctx.save();ctx.translate(Math.round(this.x),Math.round(this.y));if(this.hit)ctx.globalAlpha=.5;
  const bob=Math.sin(performance.now()/180+this.x)*2,rr=this.r;
  ctx.fillStyle='#11101d55';ctx.beginPath();ctx.ellipse(3,rr*.65,rr*.9,rr*.35,0,0,Math.PI*2);ctx.fill();
  // cuerpo de tinta con silueta ondulada
  ctx.fillStyle=this.color;ctx.beginPath();ctx.moveTo(-rr*.85,rr*.55);ctx.quadraticCurveTo(-rr,-rr*.2,-rr*.55,-rr*.7+bob);ctx.quadraticCurveTo(0,-rr*1.12+bob,rr*.55,-rr*.7+bob);ctx.quadraticCurveTo(rr,-rr*.15,rr*.85,rr*.55);ctx.lineTo(rr*.42,rr*.35);ctx.lineTo(rr*.12,rr*.68);ctx.lineTo(-rr*.25,rr*.38);ctx.lineTo(-rr*.55,rr*.65);ctx.closePath();ctx.fill();
  ctx.fillStyle='#a7689d55';ctx.beginPath();ctx.arc(-rr*.28,-rr*.35+bob,rr*.3,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#fff4c9';ctx.fillRect(-rr*.48,-rr*.3+bob,Math.max(4,rr*.28),Math.max(4,rr*.22));ctx.fillRect(rr*.2,-rr*.3+bob,Math.max(4,rr*.28),Math.max(4,rr*.22));ctx.fillStyle='#37203e';ctx.fillRect(-rr*.35,-rr*.26+bob,3,4);ctx.fillRect(rr*.28,-rr*.26+bob,3,4);
  if(this.boss){ctx.strokeStyle='#c690e9';ctx.lineWidth=4;ctx.setLineDash([7,5]);ctx.beginPath();ctx.arc(0,0,rr+7+Math.sin(performance.now()/220)*2,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='#bb8ae8';ctx.beginPath();ctx.moveTo(-rr*.6,-rr*.8);ctx.lineTo(-rr*.3,-rr*1.35);ctx.lineTo(0,-rr*.9);ctx.lineTo(rr*.35,-rr*1.4);ctx.lineTo(rr*.7,-rr*.75);ctx.fill()}
  ctx.restore();
  if(this.hp<this.maxHp&&!this.boss){ctx.fillStyle='#151324';ctx.fillRect(this.x-20,this.y-this.r-14,40,6);ctx.fillStyle='#ef5670';ctx.fillRect(this.x-19,this.y-this.r-13,38*this.hp/this.maxHp,4)}
 }}
class NPC{constructor(x,y,id,name,portrait,color='#e1a45f'){Object.assign(this,{x,y,id,name,portrait,color,type:'npc',r:17})}update(){}draw(){
 ctx.save();ctx.translate(Math.round(this.x),Math.round(this.y));const bob=Math.sin(performance.now()/420+this.x)*1.5;
 ctx.fillStyle='#11131b55';ctx.beginPath();ctx.ellipse(2,17,17,7,0,0,Math.PI*2);ctx.fill();
 if(this.id==='owl'){
  ctx.fillStyle='#654977';ctx.beginPath();ctx.ellipse(0,-3+bob,17,22,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#9c79ac';ctx.beginPath();ctx.ellipse(-10,-1+bob,8,15,-.3,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(10,-1+bob,8,15,.3,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#efe2ba';ctx.beginPath();ctx.arc(-6,-10+bob,7,0,Math.PI*2);ctx.arc(6,-10+bob,7,0,Math.PI*2);ctx.fill();ctx.fillStyle='#24213a';ctx.fillRect(-7,-12+bob,3,5);ctx.fillRect(5,-12+bob,3,5);ctx.fillStyle='#e6a542';ctx.beginPath();ctx.moveTo(-3,-5+bob);ctx.lineTo(3,-5+bob);ctx.lineTo(0,1+bob);ctx.fill();
  ctx.fillStyle='#d7b34f';ctx.fillRect(-14,13+bob,9,3);ctx.fillRect(5,13+bob,9,3);
 }else{
  ctx.fillStyle='#4b3029';ctx.fillRect(-10,8,8,10);ctx.fillRect(3,8,8,10);ctx.fillStyle=this.color;ctx.beginPath();ctx.moveTo(-14,-9+bob);ctx.lineTo(13,-9+bob);ctx.lineTo(16,12);ctx.lineTo(-16,12);ctx.fill();ctx.fillStyle='#f1bf96';ctx.fillRect(-9,-23+bob,18,15);ctx.fillStyle=this.id==='ana'?'#8b4a35':'#4c332f';ctx.fillRect(-10,-26+bob,20,7);ctx.fillRect(-11,-22+bob,5,9);ctx.fillStyle='#282238';ctx.fillRect(-5,-17+bob,3,3);ctx.fillRect(4,-17+bob,3,3);ctx.fillStyle='#fff3a0';ctx.fillRect(-3,-4+bob,6,7);
 }
 ctx.restore();
 ctx.font='bold 10px sans-serif';const tw=Math.max(58,ctx.measureText(this.name).width+16);ctx.fillStyle='#18152cdd';ctx.beginPath();ctx.roundRect(this.x-tw/2,this.y+25,tw,18,7);ctx.fill();ctx.fillStyle='#fff';ctx.textAlign='center';ctx.fillText(this.name,this.x,this.y+38);ctx.textAlign='left'
}}
function spawnRegion(){entities=[];projectiles=[];const r=state.region;if(r===0){entities.push(new NPC(430,235,'owl','Don Diccionario','🦉','#76518e'),new NPC(700,370,'shop','Señor Moneda','🧔','#ac653c'));entities.push(new Enemy(805,180),new Enemy(730,500),new Enemy(560,445))}if(r===1){entities.push(new NPC(170,200,'ana','Ana','👩','#d9788c'));entities.push(new Enemy(370,180),new Enemy(620,270,{weak:'uno'}),new Enemy(780,470,{weak:'dos'}),new Enemy(430,480))}if(r===2){entities.push(new NPC(180,370,'family','Pablo','👦','#4b82b4'));entities.push(new Enemy(470,190),new Enemy(710,170),new Enemy(720,420),new Enemy(520,360,{r:33,hp:220,maxHp:220,speed:32,damageVal:16,color:'#484157',name:'Guardián Gris',weak:'luz',boss:true}))}updateRegionUI()}
function changeRegion(n,x,y){state.region=n;player.x=x;player.y=y;state.x=x;state.y=y;regionFade=1;burst(x,y,'#fff0a0',22,'spark');spawnRegion();startMusic(n);playFx('region');toast(data.regions[n].name,data.regions[n].icon);save()}
function drawWorld(t){
 const r=data.regions[state.region],time=t*.001;
 // Suelo orgánico: mosaicos pequeños, briznas y motas deterministas.
 ctx.fillStyle=r.ground;ctx.fillRect(0,0,W,H);
 for(let y=80;y<H;y+=24)for(let x=0;x<W;x+=24){
  const n=((x*13+y*7+state.region*19)%37)/37;
  ctx.fillStyle=n>.62?r.tile:n<.18?r.edge+'55':r.ground;ctx.fillRect(x,y,24,24);
  if((x*5+y*3)%11<3){ctx.fillStyle=state.region===2?'#f1d58a55':'#d9f5a655';ctx.fillRect(x+5+(y%7),y+8,2,5);ctx.fillRect(x+8+(y%7),y+6,2,7)}
 }
 ctx.fillStyle=r.edge;ctx.fillRect(0,72,W,14);ctx.fillRect(0,H-10,W,10);
 // Caminos y elementos propios de cada zona.
 if(state.region===0){
  drawPath([[0,330],[360,330],[440,270],[680,330],[960,330]],58,'#c6a56b');
  drawPath([[450,330],[450,590]],42,'#b99762');
  drawPond(190,455,time);drawHouse(72,145,'#ba5149','#f0c56a');drawHouse(720,128,'#d18a3d','#ffe09a');
  drawFence(55,285,245);drawFence(690,280,230);
  [[300,155],[630,135],[900,160],[42,520],[335,540],[610,535],[900,520]].forEach(p=>drawTree(...p));
  [[310,395,0],[355,175,1],[650,430,2],[875,390,3],[550,150,1]].forEach(p=>drawFlowers(...p));
  drawSign(350,300,'PUEBLO');drawWell(565,200);
 }
 if(state.region===1){
  drawPath([[0,335],[250,335],[480,300],[710,350],[960,330]],62,'#806646');
  drawPond(810,170,time);
  [[35,120],[115,180],[220,105],[335,160],[470,115],[605,160],[715,105],[910,120],[55,530],[165,485],[290,555],[430,500],[585,545],[735,510],[900,535]].forEach(p=>drawTree(...p));
  [[275,190],[520,420],[860,390],[110,375]].forEach((p,i)=>drawRock(p[0],p[1],i%2));
  [[260,410,2],[500,180,0],[675,450,1],[865,260,3]].forEach(p=>drawFlowers(...p));
  drawBridge(760,190);drawSign(170,310,'1 · 2 · 3');
 }
 if(state.region===2){
  drawPath([[0,335],[260,335],[480,360],[700,330],[960,335]],64,'#a8845c');
  drawPath([[520,360],[520,235]],48,'#92704f');
  drawHouse(55,140,'#735692','#d9bc73');drawHouse(770,130,'#a44d52','#f1c16c');drawHouse(95,440,'#4e8093','#d7be7b');
  drawCastle(390,92);drawFence(40,400,245);drawFence(705,410,220);
  [[325,140],[710,145],[350,520],[690,520],[915,520]].forEach(p=>drawTree(...p));
  [[300,415,0],[735,250,3],[240,170,2],[840,430,1]].forEach(p=>drawFlowers(...p));
  drawSign(278,315,'FAMILIA');
 }
 // Polen y luciérnagas ambientales para dar vida al escenario.
 for(let i=0;i<9;i++){const fx=(i*137+Math.sin(time*.55+i)*24)%W,fy=105+(i*83)%440+Math.cos(time*.8+i)*7;ctx.globalAlpha=.25+.35*(.5+.5*Math.sin(time*2+i));pxCircle(fx,fy,2,state.region===1?'#baff83':'#fff0a0')}ctx.globalAlpha=1;
 // Orden vertical para que los personajes se solapen de forma natural.
 const actors=[...entities.map(e=>({y:e.y,draw:()=>e.draw()})),{y:player.y,draw:()=>player.draw()}].sort((a,b)=>a.y-b.y);
 afterImages.forEach(drawAfterImage);actors.forEach(a=>a.draw());projectiles.forEach(drawProjectile);particles.forEach(drawParticle);floatingTexts.forEach(drawFloatingText);
 if(nearEntity){ctx.strokeStyle='#ffe476';ctx.lineWidth=3;ctx.setLineDash([5,4]);ctx.beginPath();ctx.arc(nearEntity.x,nearEntity.y,nearEntity.r+10+Math.sin(t/180)*2,0,Math.PI*2);ctx.stroke();ctx.setLineDash([])}
 // Viñeta suave que concentra la mirada en el juego.
 const glow=ctx.createRadialGradient(W/2,H/2,210,W/2,H/2,620);glow.addColorStop(0,'#0000');glow.addColorStop(1,'#09081755');ctx.fillStyle=glow;ctx.fillRect(0,72,W,H-72);
 if(state.region>0)drawExit(12,330,'‹');if(state.region<2)drawExit(948,330,'›');
}
function pxCircle(x,y,r,c){ctx.fillStyle=c;ctx.beginPath();ctx.arc(Math.round(x),Math.round(y),r,0,Math.PI*2);ctx.fill()}
function drawPath(points,width,color){ctx.save();ctx.strokeStyle='#55443144';ctx.lineWidth=width+8;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.stroke();ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();ctx.setLineDash([3,18]);ctx.strokeStyle='#ead29a55';ctx.lineWidth=3;ctx.stroke();ctx.restore()}
function drawTree(x,y){
 ctx.fillStyle='#17251c55';ctx.beginPath();ctx.ellipse(x+7,y+19,31,12,0,0,Math.PI*2);ctx.fill();
 ctx.fillStyle='#5a3b28';ctx.fillRect(x-7,y-3,14,34);ctx.fillStyle='#805335';ctx.fillRect(x-4,y,5,29);
 pxCircle(x+1,y-9,31,'#153e2b');pxCircle(x-18,y-12,23,'#1f5735');pxCircle(x+18,y-17,23,'#286943');pxCircle(x-4,y-30,24,'#34784a');
 pxCircle(x-12,y-33,8,'#52a05b');ctx.fillStyle='#8bd56d';ctx.fillRect(x+8,y-36,5,5);ctx.fillRect(x-28,y-17,4,4);
}
function drawHouse(x,y,wall,roof){
 ctx.fillStyle='#18231c55';ctx.fillRect(x+9,y+74,132,17);ctx.fillStyle='#684a35';ctx.fillRect(x,y,136,84);
 ctx.fillStyle=wall;ctx.fillRect(x+5,y+7,126,73);for(let i=0;i<5;i++){ctx.fillStyle=i%2?'#ffffff0c':'#0000000c';ctx.fillRect(x+5+i*25,y+7,25,73)}
 ctx.fillStyle='#4a2d2a';ctx.beginPath();ctx.moveTo(x-14,y+7);ctx.lineTo(x+68,y-54);ctx.lineTo(x+150,y+7);ctx.closePath();ctx.fill();
 ctx.fillStyle=roof;ctx.beginPath();ctx.moveTo(x-8,y);ctx.lineTo(x+68,y-47);ctx.lineTo(x+144,y);ctx.closePath();ctx.fill();
 ctx.strokeStyle='#fff1b344';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(x+2,y-1);ctx.lineTo(x+68,y-40);ctx.lineTo(x+134,y-1);ctx.stroke();
 ctx.fillStyle='#30283a';ctx.fillRect(x+54,y+39,30,42);ctx.fillStyle='#9a603b';ctx.fillRect(x+58,y+43,22,38);pxCircle(x+75,y+62,2,'#ffd75a');
 drawWindow(x+17,y+25);drawWindow(x+99,y+25);ctx.fillStyle='#f4db93';ctx.fillRect(x+42,y+10,52,9);
}
function drawWindow(x,y){ctx.fillStyle='#493a55';ctx.fillRect(x-3,y-3,27,25);ctx.fillStyle='#8fe4e3';ctx.fillRect(x,y,21,19);ctx.fillStyle='#d8ffff';ctx.fillRect(x+3,y+2,5,12);ctx.fillStyle='#493a55';ctx.fillRect(x+10,y,3,19)}
function drawPond(x,y,t){
 ctx.fillStyle='#315b58';ctx.beginPath();ctx.ellipse(x,y,92,51,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#3b9da2';ctx.beginPath();ctx.ellipse(x,y-3,84,43,0,0,Math.PI*2);ctx.fill();
 ctx.strokeStyle='#9ce4cb88';ctx.lineWidth=2;for(let i=0;i<4;i++){let yy=y-22+i*14,off=Math.sin(t*1.8+i)*8;ctx.beginPath();ctx.moveTo(x-45+off,yy);ctx.quadraticCurveTo(x,yy+5,x+35+off,yy);ctx.stroke()}
 pxCircle(x-30,y+2,9,'#4f8f54');pxCircle(x+42,y-15,7,'#5da65d');ctx.fillStyle='#f0d75d';ctx.fillRect(x-32,y-2,4,4)
}
function drawFlowers(x,y,kind=0){const colors=['#fff2a3','#f28cb8','#a5dcff','#d9a8ff'];for(let i=0;i<5;i++){let ox=(i*17%31)-15,oy=(i*11%23)-10;ctx.fillStyle='#2f733d';ctx.fillRect(x+ox,y+oy,2,8);pxCircle(x+ox,y+oy,4,colors[kind]);pxCircle(x+ox,y+oy,1,'#fff3a1')}}
function drawRock(x,y,big=0){ctx.fillStyle='#17231d55';ctx.beginPath();ctx.ellipse(x+5,y+10,24+big*8,9,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#65716d';ctx.beginPath();ctx.moveTo(x-19-big*5,y+5);ctx.lineTo(x-11,y-15-big*5);ctx.lineTo(x+13,y-19);ctx.lineTo(x+24+big*5,y+8);ctx.closePath();ctx.fill();ctx.fillStyle='#a8b0a2';ctx.beginPath();ctx.moveTo(x-10,y-12);ctx.lineTo(x+10,y-16);ctx.lineTo(x+2,y-5);ctx.closePath();ctx.fill()}
function drawFence(x,y,w){ctx.fillStyle='#563c2c';ctx.fillRect(x,y,w,7);ctx.fillRect(x,y+18,w,6);for(let i=0;i<=w;i+=28){ctx.fillStyle='#9b7146';ctx.fillRect(x+i,y-9,8,40);ctx.fillStyle='#c69b5b';ctx.fillRect(x+i+2,y-8,3,31)}}
function drawSign(x,y,text){ctx.fillStyle='#473125';ctx.fillRect(x-3,y,7,32);ctx.fillStyle='#9a6b3f';ctx.fillRect(x-38,y-19,77,25);ctx.fillStyle='#e7bd6e';ctx.fillRect(x-34,y-16,69,18);ctx.fillStyle='#473125';ctx.font='bold 10px monospace';ctx.textAlign='center';ctx.fillText(text,x,y-4);ctx.textAlign='left'}
function drawWell(x,y){ctx.fillStyle='#37303d55';ctx.beginPath();ctx.ellipse(x+5,y+18,34,13,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#8c8c82';ctx.fillRect(x-28,y,56,20);ctx.fillStyle='#c6c0a5';ctx.fillRect(x-25,y,50,7);ctx.fillStyle='#29283a';ctx.beginPath();ctx.ellipse(x,y,24,8,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#704b32';ctx.fillRect(x-31,y-31,5,38);ctx.fillRect(x+26,y-31,5,38);ctx.fillRect(x-31,y-31,62,5)}
function drawBridge(x,y){ctx.fillStyle='#463728';ctx.fillRect(x-48,y-30,96,60);for(let i=-44;i<48;i+=13){ctx.fillStyle=i%2?'#a97748':'#bd8952';ctx.fillRect(x+i,y-27,11,54);ctx.fillStyle='#e3b87555';ctx.fillRect(x+i+2,y-24,2,47)}ctx.fillStyle='#5a3a28';ctx.fillRect(x-50,y-31,100,5);ctx.fillRect(x-50,y+26,100,5)}
function drawCastle(x,y){ctx.fillStyle='#24203266';ctx.fillRect(x+12,y+147,264,25);ctx.fillStyle='#625b72';ctx.fillRect(x,y+28,260,145);ctx.fillStyle='#777084';for(let xx=0;xx<260;xx+=34)for(let yy=35;yy<160;yy+=24)ctx.fillRect(x+xx+(yy%48?0:12),y+yy,28,18);ctx.fillStyle='#4b465a';ctx.fillRect(x-18,y,64,173);ctx.fillRect(x+214,y,64,173);for(let xx of [-18,0,22,214,236,258])ctx.fillRect(x+xx,y-15,20,25);ctx.fillStyle='#282337';ctx.beginPath();ctx.arc(x+130,y+145,32,Math.PI,0);ctx.fill();ctx.fillRect(x+98,y+145,64,28);ctx.fillStyle='#81d7dd';ctx.fillRect(x+9,y+60,14,29);ctx.fillRect(x+237,y+60,14,29);ctx.fillStyle='#a33555';ctx.fillRect(x+53,y+5,5,57);ctx.beginPath();ctx.moveTo(x+58,y+8);ctx.lineTo(x+95,y+19);ctx.lineTo(x+58,y+32);ctx.fill()}
function drawExit(x,y,char){ctx.fillStyle='#17142acc';ctx.beginPath();ctx.arc(x,y,18,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ffe48a';ctx.font='bold 29px sans-serif';ctx.textAlign='center';ctx.fillText(char,x,y+10);ctx.textAlign='left'}
function burst(x,y,color,n,shape='square'){
 for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,sp=rand(35,125);particles.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-rand(5,35),life:rand(.35,.85),maxLife:.85,color,shape,size:rand(2,6),rot:rand(0,6)})}
}
function drawParticle(p){
 ctx.save();ctx.globalAlpha=clamp(p.life*2,0,1);ctx.fillStyle=p.color;ctx.translate(p.x,p.y);ctx.rotate(p.rot||0);
 if(p.coin){ctx.shadowColor='#ffd34f';ctx.shadowBlur=7;ctx.fillStyle='#ffd34f';ctx.beginPath();ctx.arc(0,0,5,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff0a0';ctx.fillRect(-1,-3,2,5)}
 else if(p.shape==='dust'){ctx.globalAlpha*=.45;ctx.beginPath();ctx.arc(0,0,p.size*1.5,0,Math.PI*2);ctx.fill()}
 else if(p.shape==='spark'){ctx.fillRect(-p.size*1.6,-1,p.size*3.2,2);ctx.fillRect(-1,-p.size*1.6,2,p.size*3.2)}
 else ctx.fillRect(-p.size/2,-p.size/2,p.size,p.size);
 ctx.restore()
}
function drawFloatingText(f){ctx.save();ctx.globalAlpha=clamp(f.life*2,0,1);ctx.font='900 15px monospace';ctx.textAlign='center';ctx.lineWidth=4;ctx.strokeStyle='#171326';ctx.strokeText(f.text,f.x,f.y);ctx.fillStyle=f.color;ctx.fillText(f.text,f.x,f.y);ctx.restore()}
function drawAfterImage(a){ctx.save();ctx.globalAlpha=clamp(a.life*1.5,0,.28);ctx.fillStyle=a.color;ctx.beginPath();ctx.ellipse(a.x,a.y-2,13,22,0,0,Math.PI*2);ctx.fill();ctx.restore()}
function drawProjectile(p){ctx.save();ctx.fillStyle=p.color;ctx.shadowColor=p.color;ctx.shadowBlur=16;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();ctx.globalAlpha=.45;ctx.beginPath();ctx.arc(p.x-p.vx*.035,p.y-p.vy*.035,p.r*.7,0,Math.PI*2);ctx.fill();ctx.restore()}
function update(dt){if(!running||paused||modalOpen||dialogueOpen)return;if(hitStop>0){hitStop-=dt;return}state.playtime+=dt;screenShake=Math.max(0,screenShake-dt*28);screenFlash=Math.max(0,screenFlash-dt);regionFade=Math.max(0,regionFade-dt*1.8);state.mana=clamp(state.mana+7*dt,0,state.maxMana);player.update(dt);entities.forEach(e=>e.update(dt));nearEntity=entities.filter(e=>e.type==='npc'&&dist(e,player)<65).sort((a,b)=>dist(a,player)-dist(b,player))[0]||null;$('#interact-hint').classList.toggle('hidden',!nearEntity);if(nearEntity)$('#interact-text').textContent=nearEntity.id==='shop'?'Hablar / Comprar':'Hablar';if(pressed.has('KeyE')||pressed.has('Enter'))nearEntity?interact(nearEntity):openMagic();if(pressed.has('KeyQ'))openMagic();updateProjectiles(dt);particles.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.97;p.vy+=90*dt;p.life-=dt;p.rot=(p.rot||0)+dt*4});particles=particles.filter(p=>p.life>0);afterImages.forEach(a=>a.life-=dt);afterImages=afterImages.filter(a=>a.life>0);floatingTexts.forEach(f=>{f.y-=28*dt;f.life-=dt});floatingTexts=floatingTexts.filter(f=>f.life>0);if(pressed.has('KeyD'))openModal('dictionary');if(pressed.has('KeyI'))openModal('inventory');if(pressed.has('KeyJ'))openModal('journal');if(pressed.has('KeyP'))togglePause();updateHud()}
function updateProjectiles(dt){projectiles.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;if(p.enemy&&dist(p,player)<p.r+player.r){player.damage(p.damage);p.life=0}else if(!p.enemy){entities.filter(e=>e.type==='enemy'&&!e.dead).forEach(e=>{if(dist(p,e)<p.r+e.r){e.damage(p.damage,{x:p.vx/220,y:p.vy/220},p.word);p.life=0}})}});projectiles=projectiles.filter(p=>p.life>0&&p.x>-20&&p.x<W+20&&p.y>60&&p.y<H+20)}
function loop(t){let dt=Math.min(.033,(t-last)/1000||0);last=t;update(dt);ctx.fillStyle='#11101f';ctx.fillRect(0,0,W,H);ctx.save();if(screenShake>0)ctx.translate(rand(-screenShake,screenShake),rand(-screenShake,screenShake));drawWorld(t);ctx.restore();if(screenFlash>0){ctx.globalAlpha=clamp(screenFlash*5,0,.55);ctx.fillStyle='#fff1c7';ctx.fillRect(0,0,W,H);ctx.globalAlpha=1}if(regionFade>0){ctx.globalAlpha=clamp(regionFade,0,1);ctx.fillStyle='#121023';ctx.fillRect(0,0,W,H);ctx.globalAlpha=1}pressed.clear();requestAnimationFrame(loop)}
function interact(n){if(n.id==='shop'){startDialogue('shop',()=>openShop())}else{startDialogue(n.id);if(n.id==='owl'&&state.quest==='meetOwl'){
 if(!state.completed.includes('meetOwl'))state.completed.push('meetOwl');
 state.quest='killShadows';
 state.shadowKills=state.shadowKills||0;
 state.questKills=Math.min(3,state.shadowKills);
 if(state.shadowKills>=3)completeShadowQuest();
 else { updateObjective(); save(); }
}}}
function startDialogue(id,after=null){playFx('talk');currentDialogue={lines:data.dialogues[id],after};dialogueIndex=0;dialogueOpen=true;showDialogueLine();$('#dialogue').classList.remove('hidden');requestAnimationFrame(()=>$('#dialogue').scrollIntoView({behavior:'smooth',block:'nearest'}))}
function showDialogueLine(){const l=currentDialogue.lines[dialogueIndex];$('#speaker').textContent=l.speaker;$('#speaker-portrait').textContent=l.portrait;$('#dialogue-ru').textContent=l.ru;$('#dialogue-ru').classList.add('hidden');let html=escapeHtml(l.text);l.keys.sort((a,b)=>b.length-a.length).forEach(k=>{const w=wordByEs(k);if(w){learnWord(k);const re=new RegExp(escapeRegex(k),'i');html=html.replace(re,m=>`<span class="key-word" data-word="${w.id}">${m}</span>`)}});$('#dialogue-text').innerHTML=html;bindWordTips();updateHud();save()}
function nextDialogue(){if(!currentDialogue)return;if(++dialogueIndex<currentDialogue.lines.length){playFx('talk');showDialogueLine();}else{let cb=currentDialogue.after;$('#dialogue').classList.add('hidden');$('#word-tip').classList.add('hidden');dialogueOpen=false;currentDialogue=null;if(cb)cb();updateObjective()}}
function learnWord(es){const w=wordByEs(es);if(w&&!state.learned.includes(w.id)){state.learned.push(w.id);toast(`Nueva palabra: ${w.es} — ${w.ru}`,w.icon);playFx('learn')}}
function bindWordTips(){$$('.key-word').forEach(el=>{const show=()=>{const w=data.words.find(x=>x.id===el.dataset.word),box=el.getBoundingClientRect(),tip=$('#word-tip');tip.innerHTML=`<strong>${w.icon} ${w.es}</strong><b> — ${w.ru}</b><small>${w.example}</small>`;tip.style.left=`${clamp(box.left,10,innerWidth-250)}px`;tip.style.top=`${Math.max(10,box.top-95)}px`;tip.classList.remove('hidden')};el.onmouseenter=show;el.onclick=show;el.onmouseleave=()=>$('#word-tip').classList.add('hidden')})}
function cast(word){if(state.mana<15)return toast('No tienes maná · Недостаточно маны','💧');state.mana-=15;let speed=260;projectiles.push({x:player.x+player.dir.x*22,y:player.y+player.dir.y*22,vx:player.dir.x*speed,vy:player.dir.y*speed,r:9,life:2,enemy:false,color:word.es==='fuego'?'#ff7a3d':'#62e8ff',damage:25,word:word.es});burst(player.x,player.y,'#80f4ff',18,'spark');screenShake=4;playFx('cast');closeModal();updateHud()}
function completeShadowQuest(){
 if(!state.completed.includes('killShadows'))state.completed.push('killShadows');
 state.quest='boss';
 state.questKills=3;
 playFx('quest');
 toast('¡Misión completada! Viaja a la Aldea de la Familia.','📜');
 updateObjective();
 save();
}
function levelCheck(){let need=state.level*60;if(state.xp>=need){state.xp-=need;state.level++;state.maxHp+=10;state.hp=state.maxHp;state.maxMana+=5;toast(`¡Nivel ${state.level}! · Уровень ${state.level}`,'⭐')}}
function openModal(kind){if(!running&&!['help','ranking'].includes(kind))return;playFx('menu');modalOpen=true;paused=false;$('#pause').classList.add('hidden');$('#modal-backdrop').classList.remove('hidden');const m={dictionary:['COLECCIÓN DE PALABRAS','Mi Diccionario'],inventory:['EQUIPO Y OBJETOS','Mi Mochila'],journal:['AVENTURAS DE VERBALIA','Mis Misiones'],ranking:['HÉROES DE VERBALIA','Clasificación'],help:['GUÍA DEL AVENTURERO','Cómo jugar'],magic:['PODER DE LAS PALABRAS','Magia de palabras']}[kind];$('#modal-kicker').textContent=m[0];$('#modal-title').textContent=m[1];renderModal(kind)}
function closeModal(){modalOpen=false;$('#modal-backdrop').classList.add('hidden')}
function renderModal(kind){const c=$('#modal-content');if(kind==='dictionary'){let active=data.themes.find(t=>t.words.some(w=>state.learned.includes(w.id)))?.id||'saludos';const render=id=>{c.innerHTML=`<div class="tabs">${data.themes.map(t=>`<button data-theme="${t.id}" class="${id===t.id?'active':''}">${t.icon} ${t.name}</button>`).join('')}</div><div class="word-grid">${data.themes.find(t=>t.id===id).words.map(w=>state.learned.includes(w.id)?`<article class="word-card"><span class="emoji">${w.icon}</span><div><strong>${w.es}</strong><b>${w.ru}</b><p>${w.example}</p></div></article>`:`<article class="word-card locked"><span class="emoji">🔒</span><div><strong>???</strong><b>Не открыто</b><p>Descubre esta palabra en Verbalia.</p></div></article>`).join('')}</div>`;$$('[data-theme]').forEach(b=>b.onclick=()=>render(b.dataset.theme))};render(active)}
if(kind==='inventory')c.innerHTML=`<div class="inventory-grid">${state.inventory.length?state.inventory.map(i=>{let d=data.items[i.id];return `<article class="item"><div class="emoji">${d.icon}</div><strong>${d.name}</strong><p>${d.ru}</p><b>× ${i.qty}</b>${i.id==='potion'?'<button data-use="potion">Usar</button>':''}</article>`}).join(''):'<p>Tu mochila está vacía. · Твой рюкзак пуст.</p>'}</div>`,$$('[data-use]').forEach(b=>b.onclick=usePotion);
if(kind==='journal'){let quests=[['meetOwl','Habla con Don Diccionario','Поговори с Доном Словарём'],['killShadows','Derrota 3 Sombras de Tinta',`Победи 3 Чернильные Тени (${state.questKills}/3)`],['boss','Derrota al Guardián Gris','Победи Серого Стража']];c.innerHTML=quests.map((q,i)=>`<article class="quest ${state.completed.includes(q[0])?'done':''}"><h3>${state.completed.includes(q[0])?'✓':state.quest===q[0]?'◆':'○'} ${q[1]}</h3><p>${q[2]}</p><small>${state.completed.includes(q[0])?'Completada':state.quest===q[0]?'Misión actual':'Bloqueada'}</small></article>`).join('')}
if(kind==='ranking'){let rows=[];try{rows=JSON.parse(localStorage.getItem(RANK_KEY))||[]}catch{};c.innerHTML=`<div class="ranking-row"><b>#</b><b>Héroe</b><b>Nivel</b><b>Palabras</b><b>Puntos</b></div>${rows.map((r,i)=>`<div class="ranking-row ${r.name===state?.name?'me':''}"><b>${i<3?['🥇','🥈','🥉'][i]:i+1}</b><strong>${escapeHtml(r.name)}</strong><span>${r.level}</span><span>${r.words}</span><span>${r.score}</span></div>`).join('')||'<p>Aún no hay héroes. · Героев пока нет.</p>'}`}
if(kind==='help')c.innerHTML=`<div class="help-grid"><div>Mover · Двигаться <kbd>WASD / ↑↓←→</kbd></div><div>Atacar · Атака <kbd>ESPACIO / CLIC</kbd></div><div>Hablar · Говорить <kbd>E / ENTER</kbd></div><div>Rodar · Рывок <kbd>SHIFT</kbd></div><div>Diccionario · Словарь <kbd>D</kbd></div><div>Mochila · Рюкзак <kbd>I</kbd></div><div>Misiones · Задания <kbd>J</kbd></div><div>Magia · Магия <kbd>Q</kbd></div><div>Pausa · Пауза <kbd>P</kbd></div><div>Traducción · Перевод <kbd>T</kbd></div></div><p>Acércate a las personas y pulsa E. Las palabras doradas muestran su traducción rusa.</p>`;
if(kind==='magic'){let magic=data.words.filter(w=>['hola','uno','dos','fuego','agua','luz'].includes(w.es)&&state.learned.includes(w.id));c.innerHTML=`<p>Elige una palabra (15 maná). · Выбери слово (15 маны).</p><div class="magic-list">${magic.map(w=>`<button class="magic-button" data-spell="${w.id}" ${state.mana<15?'disabled':''}><strong>${w.icon} ${w.es}</strong>${w.ru}</button>`).join('')||'<p>Aprende una palabra mágica primero.</p>'}</div>`;$$('[data-spell]').forEach(b=>b.onclick=()=>cast(data.words.find(w=>w.id===b.dataset.spell)))} }
function openMagic(){openModal('magic')}
function openShop(){openModal('inventory');$('#modal-kicker').textContent='TIENDA · МАГАЗИН';$('#modal-title').textContent='El Rincón de Moneda';let c=$('#modal-content');c.innerHTML=`<p>Tienes 🪙 <b>${state.coins}</b></p><div class="shop-grid">${Object.entries(data.items).map(([id,i])=>`<article class="shop-item"><h3>${i.icon} ${i.name}</h3><p>${i.ru}</p><button data-buy="${id}" ${state.coins<i.price?'disabled':''}>🪙 ${i.price}</button></article>`).join('')}</div>`;$$('[data-buy]').forEach(b=>b.onclick=()=>buy(b.dataset.buy))}
function buy(id){let item=data.items[id];if(state.coins<item.price)return;state.coins-=item.price;if(id==='sword')state.sword++;else if(id==='hint'){let locked=data.words.find(w=>!state.learned.includes(w.id));if(locked)learnWord(locked.es)}else{let inv=state.inventory.find(i=>i.id===id);inv?inv.qty++:state.inventory.push({id,qty:1})}toast(`${item.name} comprado`,item.icon);save();openShop();updateHud()}
function usePotion(){let inv=state.inventory.find(i=>i.id==='potion');if(!inv||!inv.qty)return;inv.qty--;state.hp=clamp(state.hp+45,0,state.maxHp);if(!inv.qty)state.inventory=state.inventory.filter(i=>i.qty);save();closeModal();toast('Vida recuperada · Здоровье восстановлено','❤️');updateHud()}
function updateHud(){$('#hud-name').textContent=state.name;$('#level-label').textContent=`Nv. ${state.level}`;$('#hp-fill').style.width=`${state.hp/state.maxHp*100}%`;$('#hp-text').textContent=`${Math.ceil(state.hp)} / ${state.maxHp}`;$('#mana-fill').style.width=`${state.mana/state.maxMana*100}%`;$('#mana-text').textContent=`${Math.floor(state.mana)} / ${state.maxMana}`;$('#coin-count').textContent=state.coins;$('#word-count').textContent=state.learned.length;let boss=entities.find(e=>e.boss&&!e.dead);$('#boss-bar').classList.toggle('hidden',!boss);if(boss){$('#boss-name').textContent=boss.name;$('#boss-fill').style.width=`${boss.hp/boss.maxHp*100}%`}}
function updateRegionUI(){let r=data.regions[state.region];$('#region-name').textContent=r.name;$('#region-theme').textContent=r.theme;$('.region-icon').textContent=r.icon;updateObjective()}
function updateObjective(){let text=state.quest==='meetOwl'?'Habla con Don Diccionario':state.quest==='killShadows'?`Derrota Sombras (${state.questKills}/3)`:state.quest==='boss'?'Viaja a la Aldea y derrota al Guardián':'Explora Verbalia';$('#objective-text').textContent=text}
function toast(text,icon='✨'){let e=document.createElement('div');e.className='toast';e.textContent=`${icon} ${text}`;$('#toast-zone').append(e);setTimeout(()=>e.remove(),3100)}
function togglePause(){if(!running||modalOpen||dialogueOpen)return;paused=!paused;$('#pause').classList.toggle('hidden',!paused);if(paused)stopMusic();else startMusic(state.region)}
function startGame(saved=false){state=saved?load():freshState($('#hero-name').value.trim());if(!state)return;state.mana=state.mana??60;
 state.shadowKills=state.shadowKills??Math.max(state.questKills||0,state.quest==='killShadows'?Math.min(state.kills||0,3):0);
 state.questKills=Math.min(3,state.shadowKills);
 player=new Player;spawnRegion();running=true;regionFade=1;startMusic(state.region);
 if(state.quest==='killShadows'&&state.shadowKills>=3)completeShadowQuest();$('#welcome').classList.add('hidden');$('#hud').classList.remove('hidden');$('#objective').classList.remove('hidden');$('#game-nav').classList.remove('hidden');updateHud();save();toast(`¡Bienvenido, ${state.name}! · Добро пожаловать!`,'🦉')}
function escapeHtml(s){return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}function escapeRegex(s){return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}
let audioCtx,musicTimer=null,musicStep=0,musicRegion=-1;
const SONGS=[
 {tempo:270,lead:[64,67,71,67,69,72,71,67,64,67,71,76,74,71,67,null],bass:[48,null,null,null,45,null,null,null,41,null,null,null,43,null,null,null]},
 {tempo:235,lead:[57,60,64,60,55,59,62,59,57,60,64,69,67,64,60,null],bass:[41,null,41,null,43,null,43,null,38,null,38,null,40,null,40,null]},
 {tempo:300,lead:[62,65,69,67,62,65,72,69,60,64,67,64,59,62,67,null],bass:[38,null,null,null,41,null,null,null,36,null,null,null,43,null,null,null]}
];
function ensureAudio(){try{audioCtx??=new (window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume();return audioCtx}catch{return null}}
function tone(freq,dur=.12,type='sine',vol=.035,when=0,slide=0){const ac=ensureAudio();if(!ac||!sound)return;const o=ac.createOscillator(),g=ac.createGain(),t=ac.currentTime+when;o.type=type;o.frequency.setValueAtTime(freq,t);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(30,freq+slide),t+dur);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g).connect(ac.destination);o.start(t);o.stop(t+dur+.02)}
function noise(dur=.08,vol=.025){const ac=ensureAudio();if(!ac||!sound)return;const len=Math.floor(ac.sampleRate*dur),buf=ac.createBuffer(1,len,ac.sampleRate),arr=buf.getChannelData(0);for(let i=0;i<len;i++)arr[i]=(Math.random()*2-1)*(1-i/len);const src=ac.createBufferSource(),filter=ac.createBiquadFilter(),g=ac.createGain();src.buffer=buf;filter.type='bandpass';filter.frequency.value=900;g.gain.value=vol;src.connect(filter).connect(g).connect(ac.destination);src.start()}
function playFx(name){if(!sound)return;const fx={
 sword:()=>{noise(.07,.035);tone(230,.1,'sawtooth',.025,0,500);tone(520,.07,'triangle',.018,.035,-180)},
 hit:()=>{noise(.1,.05);tone(110,.11,'square',.025,0,-55)},
 magicHit:()=>{tone(720,.16,'sine',.035,0,-320);tone(980,.12,'triangle',.02,.025,-450)},
 hurt:()=>{noise(.14,.045);tone(145,.2,'sawtooth',.03,0,-70)},
 dash:()=>{noise(.11,.025);tone(340,.14,'sine',.022,0,350)},
 coin:()=>{tone(880,.08,'square',.022);tone(1320,.12,'square',.018,.07)},
 talk:()=>{tone(420,.055,'square',.012);tone(510,.05,'square',.009,.05)},
 menu:()=>{tone(660,.06,'triangle',.012);tone(880,.07,'triangle',.01,.045)},
 quest:()=>{[392,523,659,784].forEach((f,i)=>tone(f,.18,'triangle',.018,i*.08))},
 learn:()=>{[523,659,784,1047].forEach((f,i)=>tone(f,.22,'triangle',.025,i*.07))},
 cast:()=>{[330,440,660].forEach((f,i)=>tone(f,.2,'sine',.025,i*.025,180))},
 region:()=>{[392,523,659].forEach((f,i)=>tone(f,.35,'triangle',.02,i*.1))},
 bossDown:()=>{noise(.3,.055);[220,174,130,98].forEach((f,i)=>tone(f,.42,'sawtooth',.025,i*.11,-30))}
 };(fx[name]||fx.hit)()}
function midi(n){return 440*Math.pow(2,(n-69)/12)}
function startMusic(region=state?.region||0){if(!sound)return;ensureAudio();stopMusic();musicRegion=region;musicStep=0;const song=SONGS[region%SONGS.length];const tick=()=>{if(!sound||musicRegion!==region)return;let i=musicStep%song.lead.length,n=song.lead[i],b=song.bass[i];if(n)tone(midi(n),song.tempo/1000*.82,'triangle',.012);if(b)tone(midi(b),song.tempo/1000*3.3,'sine',.014);if(i%4===2&&n)tone(midi(n-12),song.tempo/1000*.45,'sine',.006);musicStep++};tick();musicTimer=setInterval(tick,song.tempo)}
function stopMusic(){if(musicTimer){clearInterval(musicTimer);musicTimer=null}}
// Entradas y botones
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopMusic();else if(sound&&running&&!paused)startMusic(state.region)});
addEventListener('keydown',e=>{if(!keys[e.code])pressed.add(e.code);keys[e.code]=true;if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();if(dialogueOpen&&(e.code==='Enter'||e.code==='KeyE'||e.code==='Space')){e.preventDefault();nextDialogue()}if(dialogueOpen&&e.code==='KeyT')$('#dialogue-ru').classList.toggle('hidden');if(e.code==='Escape'){if(modalOpen)closeModal();else if(paused)togglePause()}});addEventListener('keyup',e=>keys[e.code]=false);canvas.addEventListener('mousedown',()=>{if(running&&!paused&&!modalOpen&&!dialogueOpen)player.attack()});
$('#dialogue-next').onclick=nextDialogue;$('#translate-line').onclick=()=>$('#dialogue-ru').classList.toggle('hidden');$('#modal-close').onclick=closeModal;$('#modal-backdrop').onclick=e=>{if(e.target.id==='modal-backdrop')closeModal()};$('#start-btn').onclick=()=>{if(!$('#hero-name').value.trim()){toast('Escribe tu nombre · Напиши своё имя','✏️');$('#hero-name').focus();return}startGame(false)};$('#continue-btn').onclick=()=>startGame(true);$$('.hero-option').forEach(b=>b.onclick=()=>{$$('.hero-option').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');selectedColor=b.dataset.color});$$('[data-open]').forEach(b=>b.onclick=()=>openModal(b.dataset.open));$$('[data-action]').forEach(b=>b.onclick=()=>{if(b.dataset.action==='resume')togglePause();if(b.dataset.action==='save')save(true);if(b.dataset.action==='magic')openMagic()});$('#sound-btn').onclick=()=>{sound=!sound;$('#sound-btn').textContent=sound?'♫':'×';$('#sound-btn').title=sound?'Música y sonidos activados':'Sonido desactivado';if(sound){ensureAudio();if(running)startMusic(state.region);playFx('region')}else stopMusic()};
if(load()){$('#continue-btn').classList.remove('hidden');$('#continue-btn').textContent=`CONTINUAR COMO ${load().name.toUpperCase()}`}
// Fondo animado aun antes de iniciar
state=freshState('Héroe');player=new Player;spawnRegion();requestAnimationFrame(loop);
})();
