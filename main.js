/* El Héroe de las Palabras — motor Canvas sin dependencias */
(()=>{'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const canvas=$('#game'),ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;
const W=960,H=600,SAVE_KEY='verbalia_save_v2',RANK_KEY='verbalia_ranking_v2',data=GAME_DATA;
const keys={}, pressed=new Set(); let last=0, running=false, paused=false, modalOpen=false, dialogueOpen=false, sound=true, selectedColor='#52d6ff';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),rand=(a,b)=>a+Math.random()*(b-a);
const wordByEs=es=>data.words.find(w=>w.es.toLocaleLowerCase()===es.toLocaleLowerCase());
const ENEMY_PHRASES=[
 {es:'¡Alto, héroe!',ru:'Стой, герой!'},{es:'¡Mi magia es fuerte!',ru:'Моя магия сильна!'},{es:'No tienes la palabra.',ru:'У тебя нет нужного слова.'},{es:'¡Este bosque es mío!',ru:'Этот лес мой!'},{es:'¡Fuera de mi camino!',ru:'Прочь с моей дороги!'}
];
const ENEMY_FINAL=[
 {es:'La luz es buena...',ru:'Свет прекрасен...'},{es:'Hoy ganas tú...',ru:'Сегодня ты победил...'},{es:'Adiós, héroe...',ru:'Прощай, герой...'},{es:'Tu palabra es fuerte...',ru:'Твоё слово сильное...'}
];
let state,player,entities=[],particles=[],projectiles=[],coinDrops=[],floatingTexts=[],combatBubbles=[],afterImages=[],currentDialogue=null,dialogueIndex=0,nearEntity=null,dialogueRewardPos=null;
let screenShake=0,screenFlash=0,regionFade=0,regionTitleTime=0,hitStop=0,currentQuiz=null,saveSyncTimer=null;
const freshState=name=>({name:name||'Héroe',color:selectedColor,region:0,x:330,y:350,hp:100,maxHp:100,mana:60,maxMana:60,coins:8,xp:0,level:1,learned:[],inventory:[{id:'potion',qty:1}],rewardedDialogues:[],testsPassed:[],kills:0,shadowKills:0,bosses:[],completed:[],quest:'meetOwl',questKills:0,sword:1,armor:0,playtime:0,started:Date.now()});
function playerId(){let id=localStorage.getItem('verbalia_player_id');if(!id){id=(crypto.randomUUID?.()||`hero-${Date.now()}-${Math.random().toString(36).slice(2)}`);localStorage.setItem('verbalia_player_id',id)}return id}
function syncServer(){if(!state||location.protocol==='file:')return;clearTimeout(saveSyncTimer);saveSyncTimer=setTimeout(()=>fetch('/api/save',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({playerId:playerId(),state}),keepalive:true}).catch(()=>{}),500)}
function save(show=false){if(!state)return;state.x=player.x;state.y=player.y;localStorage.setItem(SAVE_KEY,JSON.stringify(state));updateRanking();syncServer();if(show)toast('Partida guardada localmente y en el servidor · Игра сохранена локально и на сервере','💾')}
function load(){try{return JSON.parse(localStorage.getItem(SAVE_KEY))}catch{return null}}
async function loadServerSave(){if(location.protocol==='file:')return null;try{const r=await fetch(`/api/save/${encodeURIComponent(playerId())}`);if(!r.ok)return null;const d=await r.json();return d.state||null}catch{return null}}
function updateRanking(){let rows=[];try{rows=JSON.parse(localStorage.getItem(RANK_KEY))||[]}catch{} const row={name:state.name,words:state.learned.length,coins:state.coins,level:state.level,score:state.learned.length*100+state.kills*20+state.coins+state.bosses.length*500,date:Date.now()};const old=rows.findIndex(r=>r.name===state.name);if(old>=0)rows[old]=row;else rows.push(row);rows.sort((a,b)=>b.score-a.score);localStorage.setItem(RANK_KEY,JSON.stringify(rows.slice(0,20)))}
class Player{constructor(){this.x=state.x;this.y=state.y;this.r=16;this.speed=170;this.dir={x:1,y:0};this.attacking=0;this.attackCd=0;this.dash=0;this.dashCd=0;this.hurt=0;this.walk=0;this.stepTick=0;this.moving=false}
 update(dt){let dx=(keys.ArrowRight||keys.KeyD?1:0)-(keys.ArrowLeft||keys.KeyA?1:0),dy=(keys.ArrowDown||keys.KeyS?1:0)-(keys.ArrowUp||keys.KeyW?1:0);this.moving=!!(dx||dy);if(this.moving){let l=Math.hypot(dx,dy);dx/=l;dy/=l;this.dir={x:dx,y:dy};this.walk+=dt*11;const stepNow=Math.floor(this.walk/3);if(stepNow!==this.stepTick){this.stepTick=stepNow;playFx('step')}if(Math.random()<dt*7)particles.push({x:this.x-dx*8,y:this.y+14,vx:rand(-10,10),vy:rand(-18,-5),life:.32,color:'#e6d09a',shape:'dust',size:3,rot:0})}let speed=this.speed*(this.dash>0?2.8:1);this.x=clamp(this.x+dx*speed*dt,12,W-12);this.y=clamp(this.y+dy*speed*dt,88,H-13);if(this.attackCd>0)this.attackCd-=dt;if(this.attacking>0)this.attacking-=dt;if(this.dash>0){this.dash-=dt;if(Math.random()<.55)afterImages.push({x:this.x,y:this.y,life:.22,color:state.color})}if(this.dashCd>0)this.dashCd-=dt;if(this.hurt>0)this.hurt-=dt;if(pressed.has('Space'))this.attack();if((pressed.has('ShiftLeft')||pressed.has('ShiftRight'))&&this.dashCd<=0){this.dash=.18;this.dashCd=1;burst(this.x,this.y,'#8ceaff',16,'dust');playFx('dash');screenShake=3}if(this.x<=13&&state.region>0){changeRegion(state.region-1,W-45,this.y)}else if(this.x>=W-13&&state.region<data.regions.length-1){attemptRegionTransition(state.region+1,45,this.y)}}
 attack(){if(this.attackCd>0)return;this.attackCd=.38;this.attacking=.2;playFx('sword');const hx=this.x+this.dir.x*31,hy=this.y+this.dir.y*31;entities.filter(e=>e.type==='enemy'&&!e.dead&&Math.hypot(e.x-hx,e.y-hy)<37+e.r).forEach(e=>e.damage(22+state.sword*7,this.dir));burst(hx,hy,'#fff1a6',5)}
 damage(n){if(this.hurt>0||this.dash>0)return;let dmg=Math.max(1,n-state.armor*2);state.hp-=dmg;this.hurt=.8;burst(this.x,this.y,'#ff6577',18,'spark');screenShake=9;screenFlash=.16;floatingTexts.push({x:this.x,y:this.y-24,text:`-${dmg}`,color:'#ff8290',life:.9});playFx('hurt');if(state.hp<=0){state.hp=state.maxHp;state.coins=Math.max(0,state.coins-5);this.x=150;this.y=330;toast('Has vuelto al pueblo · Ты снова в деревне','💔');changeRegion(0,150,330)}updateHud()}
 draw(){
  ctx.save();ctx.translate(Math.round(this.x),Math.round(this.y));
  if(this.hurt>0&&Math.floor(this.hurt*12)%2)ctx.globalAlpha=.32;if(this.dash>0)ctx.globalAlpha=.55;
  const bob=this.moving?Math.round(Math.sin(this.walk)*2):0,step=this.moving?Math.round(Math.sin(this.walk)*3):0,face=this.dir.x<-.25?-1:1;
  if(state.mana/state.maxMana>.92){ctx.save();ctx.globalAlpha=.22+.08*Math.sin(performance.now()/180);ctx.strokeStyle='#8defff';ctx.lineWidth=2;ctx.setLineDash([4,7]);ctx.rotate(performance.now()/1300);ctx.beginPath();ctx.arc(0,0,25,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);for(let i=0;i<3;i++)pxCircle(Math.cos(i*2.1)*25,Math.sin(i*2.1)*25,2,'#d9fbff');ctx.restore()}
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
class Enemy{constructor(x,y,opt={}){Object.assign(this,{x,y,type:'enemy',r:15,hp:45,maxHp:45,speed:45,damageVal:10,color:'#62385e',name:'Sombra de Tinta',weak:'hola',boss:false,dead:false,hit:0,cool:0,talkCd:rand(1,3),castGlow:0},opt)}
 update(dt){if(this.dead)return;this.hit=Math.max(0,this.hit-dt);this.cool-=dt;this.talkCd-=dt;this.castGlow=Math.max(0,this.castGlow-dt);let d=dist(this,player);if(d<185&&this.talkCd<=0){enemySay(this,this.boss?{es:'¡Nadie abre mi puerta!',ru:'Никто не откроет мои ворота!'}:ENEMY_PHRASES[Math.floor(Math.random()*ENEMY_PHRASES.length)]);this.talkCd=rand(4.5,7.5)}if(d<260&&d>this.r+player.r){this.x+=(player.x-this.x)/d*this.speed*dt;this.y+=(player.y-this.y)/d*this.speed*dt}if(d<this.r+player.r+4&&this.cool<=0){player.damage(this.damageVal);this.cool=1.1}if(this.boss&&Math.random()<dt*.8){this.castGlow=.42;playFx('cast');let a=Math.atan2(player.y-this.y,player.x-this.x);projectiles.push({x:this.x,y:this.y,vx:Math.cos(a)*130,vy:Math.sin(a)*130,r:6,life:3,enemy:true,color:'#8c65a8',damage:8})}}
 damage(n,dir,magic=''){if(this.dead)return;if(magic&&magic===this.weak)n*=2;this.hp-=n;this.hit=.14;screenShake=this.boss?8:4;screenFlash=.09;hitStop=.035;floatingTexts.push({x:this.x,y:this.y-this.r,text:`-${Math.round(n)}`,color:magic?'#73efff':'#fff0a0',life:.75});playFx(magic?'magicHit':'hit');if(Math.random()<.38)enemySay(this,magic?{es:'¡Esa palabra quema!',ru:'Это слово обжигает!'}:{es:'¡Ay, mi armadura!',ru:'Ой, мои доспехи!'});this.x+=(dir?.x||0)*12;this.y+=(dir?.y||0)*12;burst(this.x,this.y,magic?'#6deaff':'#ffbf64',7);if(this.hp<=0)this.die()}
 die(){this.dead=true;enemySay(this,this.boss?{es:'Olvido está cerca...',ru:'Ольвидо уже близко...'}:ENEMY_FINAL[Math.floor(Math.random()*ENEMY_FINAL.length)],true);playFx(this.boss?'bossDown':'coin');screenShake=this.boss?14:5;if(this.boss)screenFlash=.3;let gain=this.boss?30:Math.floor(rand(3,8));spawnCoins(this.x,this.y,gain);state.kills++;state.xp+=this.boss?80:15;burst(this.x,this.y,'#ffd34f',Math.min(16,gain),'spark');if(!this.boss){
 state.shadowKills=(state.shadowKills||0)+1;
 state.questKills=Math.min(3,state.shadowKills);
 updateObjective();
 if(state.quest==='killShadows'&&state.shadowKills>=3)completeShadowQuest();
}if(this.boss){if(!state.bosses.includes(state.region))state.bosses.push(state.region);if(!state.completed.includes(`regionBoss_${state.region}`))state.completed.push(`regionBoss_${state.region}`);if(state.region===2){state.completed.push('boss');state.quest='explore'}learnWord('luz');toast('¡Palabra Maestra: LUZ! · Главное слово: СВЕТ','💎');if(state.region===8&&!state.testsPassed.includes(2))setTimeout(()=>openStageQuiz(2,()=>toast('¡Las nueve regiones están completas!','🏆')),1200)}levelCheck();updateHud();save()}
 draw(){if(this.dead)return;
  ctx.save();ctx.translate(Math.round(this.x),Math.round(this.y));if(this.hit)ctx.globalAlpha=.5;
  const bob=Math.sin(performance.now()/180+this.x)*2,rr=this.r;
  if(this.castGlow>0){ctx.save();ctx.globalAlpha=this.castGlow*1.8;ctx.strokeStyle='#e6b4ff';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,rr+16-this.castGlow*12,0,Math.PI*2);ctx.stroke();for(let i=0;i<6;i++)pxCircle(Math.cos(i*Math.PI/3)* (rr+10),Math.sin(i*Math.PI/3)*(rr+10),2,'#f2d0ff');ctx.restore()}
  ctx.fillStyle='#11101d55';ctx.beginPath();ctx.ellipse(3,rr*.65,rr*.9,rr*.35,0,0,Math.PI*2);ctx.fill();
  // cuerpo de tinta con silueta ondulada
  ctx.fillStyle=this.color;ctx.beginPath();ctx.moveTo(-rr*.85,rr*.55);ctx.quadraticCurveTo(-rr,-rr*.2,-rr*.55,-rr*.7+bob);ctx.quadraticCurveTo(0,-rr*1.12+bob,rr*.55,-rr*.7+bob);ctx.quadraticCurveTo(rr,-rr*.15,rr*.85,rr*.55);ctx.lineTo(rr*.42,rr*.35);ctx.lineTo(rr*.12,rr*.68);ctx.lineTo(-rr*.25,rr*.38);ctx.lineTo(-rr*.55,rr*.65);ctx.closePath();ctx.fill();
  ctx.fillStyle='#a7689d55';ctx.beginPath();ctx.arc(-rr*.28,-rr*.35+bob,rr*.3,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#fff4c9';ctx.fillRect(-rr*.48,-rr*.3+bob,Math.max(4,rr*.28),Math.max(4,rr*.22));ctx.fillRect(rr*.2,-rr*.3+bob,Math.max(4,rr*.28),Math.max(4,rr*.22));ctx.fillStyle='#37203e';ctx.fillRect(-rr*.35,-rr*.26+bob,3,4);ctx.fillRect(rr*.28,-rr*.26+bob,3,4);
  // Siluetas por familia: cada enemigo se reconoce antes de leer su nombre.
  if(/Duende/.test(this.name)){ctx.fillStyle='#7f9270';ctx.beginPath();ctx.moveTo(-rr*.7,-rr*.42);ctx.lineTo(-rr*1.35,-rr*.7);ctx.lineTo(-rr*.72,-rr*.05);ctx.fill();ctx.beginPath();ctx.moveTo(rr*.7,-rr*.42);ctx.lineTo(rr*1.35,-rr*.7);ctx.lineTo(rr*.72,-rr*.05);ctx.fill()}
  if(/Lobo|Bestias/.test(this.name)){ctx.fillStyle=this.color;ctx.beginPath();ctx.moveTo(-rr*.7,-rr*.65);ctx.lineTo(-rr*.55,-rr*1.35);ctx.lineTo(-rr*.1,-rr*.8);ctx.moveTo(rr*.7,-rr*.65);ctx.lineTo(rr*.55,-rr*1.35);ctx.lineTo(rr*.1,-rr*.8);ctx.fill();ctx.fillStyle='#e8d66b';pxCircle(-rr*.34,-rr*.25+bob,2,'#e8d66b');pxCircle(rr*.34,-rr*.25+bob,2,'#e8d66b')}
  if(/Armadura|Caballero|Guardián/.test(this.name)){ctx.strokeStyle='#aeb8ba';ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,-rr*.35+bob,rr*.72,Math.PI,Math.PI*2);ctx.stroke();ctx.fillStyle='#8e999c';ctx.fillRect(-rr*.72,-rr*.35+bob,rr*1.44,4)}
  if(/Nube|Tormenta|Gota/.test(this.name)){ctx.globalAlpha*=.8;pxCircle(-rr*.7,0,rr*.45,'#7894a4');pxCircle(rr*.7,1,rr*.5,'#6f899b');ctx.strokeStyle='#9edcf0';ctx.lineWidth=2;for(let i=-1;i<2;i++){ctx.beginPath();ctx.moveTo(i*rr*.5,rr*.65);ctx.lineTo(i*rr*.5-4,rr*1.05);ctx.stroke()}}
  if(/Gárgola/.test(this.name)){ctx.fillStyle='#777083';ctx.beginPath();ctx.moveTo(-rr*.65,-2);ctx.lineTo(-rr*1.45,-rr*.65);ctx.lineTo(-rr*1.2,rr*.45);ctx.fill();ctx.beginPath();ctx.moveTo(rr*.65,-2);ctx.lineTo(rr*1.45,-rr*.65);ctx.lineTo(rr*1.2,rr*.45);ctx.fill()}
  if(/Gigante|Minotauro/.test(this.name)){ctx.fillStyle='#e4cf9d';ctx.beginPath();ctx.moveTo(-rr*.45,-rr*.75);ctx.quadraticCurveTo(-rr*1.2,-rr*1.25,-rr*1.25,-rr*.55);ctx.lineTo(-rr*.9,-rr*.8);ctx.fill();ctx.beginPath();ctx.moveTo(rr*.45,-rr*.75);ctx.quadraticCurveTo(rr*1.2,-rr*1.25,rr*1.25,-rr*.55);ctx.lineTo(rr*.9,-rr*.8);ctx.fill()}
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
  ctx.fillStyle='#4b3029';ctx.fillRect(-10,8,8,10);ctx.fillRect(3,8,8,10);ctx.fillStyle=this.color;ctx.beginPath();ctx.moveTo(-14,-9+bob);ctx.lineTo(13,-9+bob);ctx.lineTo(16,12);ctx.lineTo(-16,12);ctx.fill();ctx.fillStyle='#f1bf96';ctx.fillRect(-9,-23+bob,18,15);ctx.fillStyle=['ana','anaBrave'].includes(this.id)?'#8b4a35':'#4c332f';ctx.fillRect(-10,-26+bob,20,7);ctx.fillRect(-11,-22+bob,5,9);ctx.fillStyle='#282238';ctx.fillRect(-5,-17+bob,3,3);ctx.fillRect(4,-17+bob,3,3);ctx.fillStyle='#fff3a0';ctx.fillRect(-5,-5+bob,10,9);ctx.fillStyle='#3a2c43';ctx.font='bold 7px monospace';ctx.textAlign='center';ctx.fillText(this.portrait,0,2+bob);ctx.textAlign='left';
  // Accesorios que dan una silueta única a cada oficio medieval.
  if(['cook','baker'].includes(this.id)){ctx.fillStyle='#f4eed7';pxCircle(-5,-29+bob,7,'#f4eed7');pxCircle(4,-31+bob,8,'#f4eed7');ctx.fillRect(-10,-29+bob,20,6)}
  if(['mage','seer'].includes(this.id)){ctx.fillStyle=this.id==='mage'?'#554078':'#c88745';ctx.beginPath();ctx.moveTo(-13,-25+bob);ctx.lineTo(3,-48+bob);ctx.lineTo(13,-25+bob);ctx.fill();ctx.fillRect(-15,-27+bob,30,4);pxCircle(5,-37+bob,2,'#ffe777')}
  if(['ranger','druid'].includes(this.id)){ctx.fillStyle='#315b3b';ctx.beginPath();ctx.moveTo(-14,-25+bob);ctx.lineTo(0,-37+bob);ctx.lineTo(14,-25+bob);ctx.fill();ctx.fillStyle='#78ad57';ctx.fillRect(6,-34+bob,10,4)}
  if(this.id==='knight'){ctx.fillStyle='#b9c4c6';ctx.fillRect(-12,-29+bob,24,10);ctx.fillStyle='#5d6870';ctx.fillRect(-10,-20+bob,20,4);ctx.fillStyle='#d24f57';ctx.fillRect(0,-39+bob,4,11)}
  if(this.id==='sailor'){ctx.fillStyle='#e9e3c9';ctx.fillRect(-12,-29+bob,24,6);ctx.fillStyle='#386d8d';ctx.fillRect(-8,-34+bob,16,6)}
  if(this.id==='tailor'){ctx.strokeStyle='#e7c86a';ctx.lineWidth=2;ctx.beginPath();ctx.arc(13,-2+bob,6,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#d8d0b4';ctx.fillRect(11,-9+bob,2,15)}
 }
 ctx.restore();
 ctx.font='bold 10px sans-serif';const tw=Math.max(58,ctx.measureText(this.name).width+16);ctx.fillStyle='#18152cdd';ctx.beginPath();ctx.roundRect(this.x-tw/2,this.y+25,tw,18,7);ctx.fill();ctx.fillStyle='#fff';ctx.textAlign='center';ctx.fillText(this.name,this.x,this.y+38);ctx.textAlign='left'
}}
function spawnRegion(){
 entities=[];projectiles=[];const r=state.region;
 const foe=(x,y,opt={})=>{if(!(opt.boss&&state.bosses.includes(r)))entities.push(new Enemy(x,y,opt))};
 const npc=(x,y,id,name,mark,color)=>entities.push(new NPC(x,y,id,name,mark,color));
 if(r===0){npc(430,235,'owl','Don Diccionario','D','#76518e');npc(700,370,'shop','Señor Moneda','M','#ac653c');foe(805,180);foe(730,500);foe(560,445)}
 if(r===1){npc(170,200,'ana','Ana','A','#d9788c');npc(825,250,'shop','Mercader Real','M','#a86b3d');foe(370,180);foe(620,270,{weak:'uno'});foe(780,470,{weak:'dos'});foe(430,480)}
 if(r===2){npc(180,370,'family','Pablo','P','#4b82b4');npc(785,360,'anaBrave','Ana la Valiente','A','#c9637e');foe(470,190);foe(710,170);foe(720,420);foe(520,360,{r:33,hp:220,maxHp:220,speed:32,damageVal:16,color:'#484157',name:'Guardián Gris',weak:'luz',boss:true})}
 if(r===3){npc(190,205,'cook','Doña Canela','C','#b95b4c');npc(720,390,'baker','Maese Trigo','T','#cf8e3e');foe(390,190,{color:'#6e4936',name:'Duende Hambriento',weak:'fuego'});foe(610,470,{color:'#754b38',name:'Duende Hambriento',weak:'pan'});foe(820,190,{color:'#6b3e46',name:'Sombra de Sal'});foe(505,275,{r:29,hp:175,maxHp:175,color:'#9a523b',name:'Caballero del Horno',weak:'agua',boss:true})}
 if(r===4){npc(165,310,'ranger','Luna','L','#477c64');npc(760,180,'druid','Roble','R','#5b7041');foe(360,180,{color:'#315f4b',name:'Lobo de Tinta',speed:62});foe(570,450,{color:'#3e674b',name:'Lobo de Tinta',speed:62});foe(820,420,{color:'#465c3d',name:'Espíritu Salvaje',weak:'luz'});foe(610,210,{r:30,hp:190,maxHp:190,color:'#244c3c',name:'Rey de las Bestias',weak:'fuego',boss:true})}
 if(r===5){npc(175,420,'tailor','Maese Hilo','H','#6b5a8f');npc(770,380,'knight','Dama Alba','D','#6c83a0');foe(350,200,{color:'#5f6c77',name:'Armadura Vacía'});foe(600,470,{color:'#566878',name:'Armadura Vacía'});foe(790,170,{color:'#647480',name:'Viento Frío',weak:'fuego'});foe(520,205,{r:31,hp:205,maxHp:205,color:'#465561',name:'Gigante de Hielo',weak:'fuego',boss:true})}
 if(r===6){npc(175,205,'architect','Maese Piedra','P','#8a704c');npc(780,410,'innkeeper','Doña Cama','C','#a35b63');foe(360,430,{color:'#68556e',name:'Gárgola'});foe(650,185,{color:'#625266',name:'Gárgola'});foe(825,250,{color:'#4e465e',name:'Llave Oscura',weak:'luz'});foe(510,340,{r:31,hp:220,maxHp:220,color:'#554a63',name:'Señor de la Torre',weak:'abrir',boss:true})}
 if(r===7){npc(170,400,'seer','Aurelia','S','#d89d4c');npc(760,200,'sailor','Capitán Brisa','B','#477fa0');foe(340,180,{color:'#456c83',name:'Nube Oscura',weak:'sol'});foe(600,460,{color:'#3f6c82',name:'Nube Oscura',weak:'luz'});foe(820,390,{color:'#416379',name:'Gota Encantada',weak:'fuego'});foe(515,230,{r:32,hp:230,maxHp:230,color:'#304f70',name:'Rey de la Tormenta',weak:'sol',boss:true})}
 if(r===8){npc(170,190,'guide','Sir Camino','G','#745a95');npc(780,430,'mage','Merlín','Ñ','#624b89');foe(350,420,{color:'#604d75',name:'Guardián Izquierdo',weak:'derecha'});foe(670,180,{color:'#57466c',name:'Guardián Derecho',weak:'izquierda'});foe(825,330,{color:'#493d61',name:'Eco Perdido',weak:'luz'});foe(520,300,{r:34,hp:250,maxHp:250,color:'#3d3355',name:'Minotauro de las Palabras',weak:'arriba',boss:true})}
 updateRegionUI()
}
function attemptRegionTransition(n,x,y){const gate={3:0,6:1}[n];state.testsPassed??=[];if(gate!==undefined&&!state.testsPassed.includes(gate)){player.x=W-40;openStageQuiz(gate,()=>changeRegion(n,x,y));return}changeRegion(n,x,y)}
function quizQuestions(stage){const themes=data.themes.slice(stage*3,stage*3+3),pool=themes.flatMap(t=>t.words),known=pool.filter(w=>state.learned.includes(w.id)),source=(known.length>=6?known:pool).sort(()=>Math.random()-.5).slice(0,6);return source.map((w,i)=>{const reverse=i%2===1,correct=reverse?w.es:w.ru,wrong=data.words.filter(x=>x.id!==w.id).sort(()=>Math.random()-.5).slice(0,3).map(x=>reverse?x.es:x.ru);return {prompt:reverse?`¿Cómo se dice «${w.ru}» en español?`:`¿Qué significa «${w.es}»?`,ru:reverse?'Как это сказать по-испански?':'Что означает это слово?',correct,answers:[correct,...wrong].sort(()=>Math.random()-.5),icon:w.icon}})}
function openStageQuiz(stage,onPass){modalOpen=true;currentQuiz={stage,onPass,questions:quizQuestions(stage),index:0,score:0,locked:false};$('#modal-backdrop').classList.remove('hidden');$('#modal-kicker').textContent=`PRUEBA DE LA ETAPA ${stage+1} · ИСПЫТАНИЕ`;$('#modal-title').textContent=['La Prueba del Búho','El Reto de la Torre','La Puerta de Olvido'][stage];renderQuiz()}
function renderQuiz(){const q=currentQuiz.questions[currentQuiz.index],c=$('#modal-content');c.innerHTML=`<div class="quiz-scene"><div class="quiz-hero" style="--hero:${state.color}"><span>⚔</span></div><div class="quiz-orb">${q.icon}</div><div class="quiz-owl">🦉</div></div><div class="quiz-progress">${currentQuiz.questions.map((_,i)=>`<i class="${i<currentQuiz.index?'done':i===currentQuiz.index?'active':''}"></i>`).join('')}</div><section class="quiz-card"><small>PREGUNTA ${currentQuiz.index+1} / ${currentQuiz.questions.length}</small><h3>${q.prompt}</h3><p>${q.ru}</p><div class="quiz-answers">${q.answers.map(a=>`<button data-quiz-answer="${escapeHtml(a)}">${escapeHtml(a)}</button>`).join('')}</div><div id="quiz-feedback"></div></section>`;$$('[data-quiz-answer]').forEach(b=>b.onclick=()=>answerQuiz(b,b.dataset.quizAnswer))}
function answerQuiz(button,answer){if(currentQuiz.locked)return;currentQuiz.locked=true;const q=currentQuiz.questions[currentQuiz.index],ok=answer===q.correct;button.classList.add(ok?'correct':'wrong');if(!ok)$$('[data-quiz-answer]').find(b=>b.dataset.quizAnswer===q.correct)?.classList.add('correct');$('#quiz-feedback').innerHTML=ok?'✨ ¡Muy bien! · Правильно!':`📖 La respuesta correcta es <b>${q.correct}</b> · Правильный ответ: <b>${q.correct}</b>`;playFx(ok?'learn':'hurt');if(ok){currentQuiz.score++;burst(player.x,player.y,'#ffe36a',14,'spark')}setTimeout(()=>{currentQuiz.index++;currentQuiz.locked=false;if(currentQuiz.index<currentQuiz.questions.length)renderQuiz();else finishQuiz()},900)}
function finishQuiz(){const pass=currentQuiz.score>=5,c=$('#modal-content'),q=currentQuiz;c.innerHTML=`<div class="quiz-result ${pass?'pass':'fail'}"><div class="result-hero">${pass?'🏆':'📚'}</div><h2>${pass?'¡Prueba superada!':'Casi, joven héroe'}</h2><p>${pass?`Has acertado ${q.score} de ${q.questions.length}. El camino hacia la nueva tierra está abierto.`:`Has acertado ${q.score} de ${q.questions.length}. Necesitas 5 respuestas correctas.`}</p><p>${pass?'Испытание пройдено. Новый путь открыт.':'Попробуй ещё раз. Нужно дать 5 правильных ответов.'}</p><button id="quiz-finish" class="primary">${pass?'CONTINUAR LA AVENTURA':'REPETIR LA PRUEBA'}</button></div>`;$('#quiz-finish').onclick=()=>{if(pass){if(!state.testsPassed.includes(q.stage))state.testsPassed.push(q.stage);state.coins+=20;save();closeModal();q.onPass?.()}else{currentQuiz.questions=quizQuestions(q.stage);currentQuiz.index=0;currentQuiz.score=0;renderQuiz()}}}
function changeRegion(n,x,y){state.region=n;player.x=x;player.y=y;state.x=x;state.y=y;regionFade=1;regionTitleTime=2.8;burst(x,y,'#fff0a0',22,'spark');spawnRegion();startMusic(n);playFx('region');toast(data.regions[n].name,data.regions[n].icon);save()}
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
  drawCastle(390,92);drawTorch(478,260,time);drawTorch(570,260,time);drawFence(40,400,245);drawFence(705,410,220);
  [[325,140],[710,145],[350,520],[690,520],[915,520]].forEach(p=>drawTree(...p));
  [[300,415,0],[735,250,3],[240,170,2],[840,430,1]].forEach(p=>drawFlowers(...p));
  drawSign(278,315,'FAMILIA');
 }
 if(state.region===3){
  drawPath([[0,330],[250,330],[480,300],[700,350],[960,330]],58,'#c59255');drawPond(835,470,time);
  drawHouse(75,135,'#c26a42','#f0c05c');drawHouse(725,120,'#c98b42','#e86f45');drawMarket(410,130,'#b74445');drawTorch(390,245,time);drawTorch(555,245,time);
  for(let i=0;i<5;i++)drawCrop(90+i*55,455,i%2?'#e3b94c':'#d8754f');[[340,150],[620,150],[365,510],[670,500]].forEach(p=>drawFruitTree(...p));drawSign(320,310,'PAN · QUESO');
 }
 if(state.region===4){
  drawPath([[0,330],[210,350],[430,300],[690,345],[960,320]],48,'#6d6043');drawPond(470,465,time);
  [[35,130],[130,155],[245,110],[360,145],[510,115],[650,145],[770,110],[910,155],[60,530],[200,500],[760,520],[900,485]].forEach(p=>drawAncientTree(...p));
  drawRuins(610,220);[[285,430,2],[700,440,1],[400,190,3]].forEach(p=>drawFlowers(...p));drawSign(245,315,'ANIMALES');
 }
 if(state.region===5){
  drawPath([[0,355],[245,340],[450,380],[680,320],[960,340]],52,'#756d63');drawMountains();drawTower(430,105,'#71818d');
  [[120,190],[280,490],[700,465],[850,170]].forEach((p,i)=>drawRock(p[0],p[1],1));[[350,245],[650,210],[820,430]].forEach(p=>drawIceCrystal(...p));drawSign(280,325,'MONTAÑA');
 }
 if(state.region===6){
  drawCobble();drawPath([[0,340],[960,340]],70,'#8d7b67');drawHouse(55,135,'#7d668e','#c48855');drawHouse(235,110,'#668395','#bd6a50');drawHouse(685,120,'#906b62','#d29a55');drawHouse(820,420,'#6d758c','#b65c51');
  drawTower(455,95,'#766d78');drawTorch(442,318,time);drawTorch(605,318,time);drawWell(375,435);drawMarket(650,430,'#557ca0');drawSign(180,315,'CIUDAD');
 }
 if(state.region===7){
  drawIslandWater(time);drawPath([[0,360],[220,350],[460,330],[710,355],[960,340]],46,'#d6bd79');drawPond(520,470,time);
  [[90,180],[250,490],[720,470],[880,180]].forEach(p=>drawPalm(...p));drawHouse(110,210,'#e0aa5f','#5d8ea1');drawLighthouse(760,115);drawWeather(time);drawSign(300,320,'HOY · SOL');
 }
 if(state.region===8){
  drawPath([[0,335],[200,335],[200,180],[440,180],[440,430],[690,430],[690,250],[960,250]],40,'#776787');
  drawHedges();drawRuins(420,250);drawTower(780,105,'#574b70');drawTorch(760,285,time);drawTorch(925,285,time);[[260,485],[590,155],[845,460]].forEach(p=>drawMagicCrystal(...p));drawSign(145,310,'DERECHA');
 }
 // Polen y luciérnagas ambientales para dar vida al escenario.
 for(let i=0;i<9;i++){const fx=(i*137+Math.sin(time*.55+i)*24)%W,fy=105+(i*83)%440+Math.cos(time*.8+i)*7;ctx.globalAlpha=.25+.35*(.5+.5*Math.sin(time*2+i));pxCircle(fx,fy,2,state.region===1?'#baff83':'#fff0a0')}ctx.globalAlpha=1;
 // Orden vertical para que los personajes se solapen de forma natural.
 const actors=[...entities.map(e=>({y:e.y,draw:()=>e.draw()})),{y:player.y,draw:()=>player.draw()}].sort((a,b)=>a.y-b.y);
 afterImages.forEach(drawAfterImage);actors.forEach(a=>a.draw());coinDrops.forEach(drawCoinDrop);projectiles.forEach(drawProjectile);particles.forEach(drawParticle);floatingTexts.forEach(drawFloatingText);combatBubbles.forEach(drawCombatBubble);drawAtmosphere(time);
 if(nearEntity){ctx.strokeStyle='#ffe476';ctx.lineWidth=3;ctx.setLineDash([5,4]);ctx.beginPath();ctx.arc(nearEntity.x,nearEntity.y,nearEntity.r+10+Math.sin(t/180)*2,0,Math.PI*2);ctx.stroke();ctx.setLineDash([])}
 // Viñeta suave que concentra la mirada en el juego.
 const glow=ctx.createRadialGradient(W/2,H/2,210,W/2,H/2,620);glow.addColorStop(0,'#0000');glow.addColorStop(1,'#09081755');ctx.fillStyle=glow;ctx.fillRect(0,72,W,H-72);
 if(state.region>0)drawExit(12,330,'‹');if(state.region<data.regions.length-1)drawExit(948,330,'›');if(regionTitleTime>0)drawRegionTitle();
}
function drawAtmosphere(t){
 ctx.save();const r=state.region;
 if(r===0||r===3){for(let i=0;i<8;i++){const x=(i*151+t*14)%1040-40,y=135+(i*67)%390+Math.sin(t+i)*12;ctx.globalAlpha=.38;ctx.fillStyle=i%2?'#fff1a0':'#f2a7c5';ctx.beginPath();ctx.ellipse(x,y,3,1.5,t+i,0,Math.PI*2);ctx.fill()}}
 if(r===1||r===4){for(let i=0;i<12;i++){const x=(i*89+t*18)%1030-30,y=95+(i*73+t*20)%500;ctx.globalAlpha=.26+.18*Math.sin(t+i);ctx.fillStyle=r===4?'#bdf57c':'#d2a85a';ctx.beginPath();ctx.ellipse(x,y,3,2,t+i,0,Math.PI*2);ctx.fill()}const ray=ctx.createLinearGradient(0,80,0,430);ray.addColorStop(0,'#fff6b322');ray.addColorStop(1,'#fff6b300');ctx.fillStyle=ray;ctx.beginPath();ctx.moveTo(110,80);ctx.lineTo(245,80);ctx.lineTo(390,510);ctx.lineTo(270,510);ctx.fill()}
 if(r===2||r===6){for(let i=0;i<7;i++){const x=(i*173+t*7)%1020,y=150+(i*91)%390;ctx.globalAlpha=.17;pxCircle(x,y,9+Math.sin(t+i)*3,'#f5d7a2')}}
 if(r===5){for(let i=0;i<38;i++){const x=(i*71+t*(20+i%4)*3)%1000-20,y=82+(i*113+t*(32+i%3)*4)%520;ctx.globalAlpha=.45+i%3*.12;pxCircle(x,y,i%3+1,'#f3ffff')}}
 if(r===7){for(let i=0;i<20;i++){const x=(i*97+t*28)%1010-20,y=95+(i*61+t*55)%470;ctx.globalAlpha=.23;ctx.strokeStyle='#c8f5ff';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-5,y+12);ctx.stroke()}const sun=ctx.createRadialGradient(840,115,5,840,115,100);sun.addColorStop(0,'#fff7bb55');sun.addColorStop(1,'#fff7bb00');ctx.fillStyle=sun;ctx.fillRect(720,80,240,210)}
 if(r===8){for(let i=0;i<16;i++){const x=40+(i*137)%900,y=110+(i*79)%430+Math.sin(t*1.6+i)*15;ctx.globalAlpha=.25+.3*(Math.sin(t*2+i)*.5+.5);ctx.shadowColor='#dfb0ff';ctx.shadowBlur=10;pxCircle(x,y,2+(i%2),'#e8c6ff')}ctx.shadowBlur=0}
 ctx.restore()
}
function drawRegionTitle(){const r=data.regions[state.region],a=Math.min(1,(2.8-regionTitleTime)*2,regionTitleTime*1.8);ctx.save();ctx.globalAlpha=clamp(a,0,1);const w=390,x=(W-w)/2,y=102;ctx.fillStyle='#131126dd';ctx.strokeStyle='#d6b45c';ctx.lineWidth=3;ctx.beginPath();ctx.roundRect(x,y,w,75,10);ctx.fill();ctx.stroke();ctx.fillStyle='#f6d777';ctx.font='900 12px monospace';ctx.textAlign='center';ctx.fillText(`ETAPA ${Math.floor(state.region/3)+1}  ◆  REGIÓN ${state.region+1}`,W/2,y+22);ctx.fillStyle='#fff8df';ctx.font='900 22px sans-serif';ctx.fillText(`${r.icon}  ${r.name}`,W/2,y+49);ctx.fillStyle='#aaa4bd';ctx.font='bold 11px sans-serif';ctx.fillText(r.theme,W/2,y+67);ctx.textAlign='left';ctx.restore()}
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
function drawCrop(x,y,color){for(let i=0;i<4;i++){ctx.fillStyle='#42733b';ctx.fillRect(x+i*9,y,3,24);pxCircle(x+i*9,y+2,5,color);pxCircle(x+i*9-3,y+8,4,color)}}
function drawFruitTree(x,y){drawTree(x,y);for(let i=0;i<5;i++)pxCircle(x-19+i*9,y-18+(i%2)*12,4,i%2?'#d94d45':'#f2c34e')}
function drawAncientTree(x,y){ctx.save();ctx.scale(1.18,1.18);drawTree(x/1.18,y/1.18);ctx.restore();ctx.fillStyle='#9ce884';ctx.fillRect(x-25,y+20,4,9);ctx.fillRect(x+20,y+17,4,12)}
function drawMarket(x,y,color){ctx.fillStyle='#60432e';ctx.fillRect(x,y,120,56);for(let i=0;i<5;i++){ctx.fillStyle=i%2?color:'#f3d58a';ctx.fillRect(x+i*24,y-20,24,25)}ctx.fillStyle='#362c35';ctx.fillRect(x+8,y+28,104,9);ctx.fillStyle='#f3cb58';ctx.beginPath();ctx.arc(x+25,y+23,6,0,7);ctx.arc(x+45,y+23,6,0,7);ctx.fill()}
function drawRuins(x,y){ctx.fillStyle='#404b47aa';ctx.fillRect(x-80,y+35,165,22);for(let i=0;i<4;i++){ctx.fillStyle='#7d8c78';ctx.fillRect(x-68+i*43,y-15+(i%2)*12,22,55);ctx.fillStyle='#a0a98e';ctx.fillRect(x-72+i*43,y-18+(i%2)*12,30,8)}ctx.fillStyle='#4c7053';ctx.fillRect(x-78,y+31,150,5)}
function drawMountains(){ctx.fillStyle='#52646d';ctx.beginPath();ctx.moveTo(0,245);ctx.lineTo(150,85);ctx.lineTo(300,245);ctx.lineTo(470,70);ctx.lineTo(670,245);ctx.lineTo(820,95);ctx.lineTo(960,235);ctx.lineTo(960,80);ctx.lineTo(0,80);ctx.fill();ctx.fillStyle='#dce9e7';for(const [x,y] of [[150,85],[470,70],[820,95]]){ctx.beginPath();ctx.moveTo(x-45,y+48);ctx.lineTo(x,y);ctx.lineTo(x+45,y+48);ctx.lineTo(x+14,y+36);ctx.lineTo(x,y+48);ctx.lineTo(x-12,y+32);ctx.fill()}}
function drawTower(x,y,color){ctx.fillStyle='#2d303b55';ctx.fillRect(x+8,y+125,128,20);ctx.fillStyle=color;ctx.fillRect(x,y,130,135);for(let i=0;i<5;i++)ctx.fillRect(x-6+i*32,y-16,25,25);ctx.fillStyle='#28283a';ctx.fillRect(x+48,y+84,34,51);ctx.fillStyle='#91d5df';ctx.fillRect(x+20,y+35,16,30);ctx.fillRect(x+94,y+35,16,30)}
function drawIceCrystal(x,y){ctx.fillStyle='#a5f2ff66';ctx.beginPath();ctx.moveTo(x,y-32);ctx.lineTo(x+14,y);ctx.lineTo(x,y+19);ctx.lineTo(x-13,y);ctx.fill();ctx.fillStyle='#e2fbff';ctx.beginPath();ctx.moveTo(x,y-26);ctx.lineTo(x+5,y-2);ctx.lineTo(x-3,y+8);ctx.fill()}
function drawMagicCrystal(x,y){ctx.shadowColor='#d8a8ff';ctx.shadowBlur=18;ctx.fillStyle='#bd82e5';ctx.beginPath();ctx.moveTo(x,y-24);ctx.lineTo(x+12,y);ctx.lineTo(x,y+20);ctx.lineTo(x-12,y);ctx.fill();ctx.shadowBlur=0}
function drawCobble(){for(let y=90;y<H;y+=30)for(let x=(y/30%2)*18;x<W;x+=40){ctx.strokeStyle='#4d49454a';ctx.strokeRect(x,y,37,27);ctx.fillStyle='#ffffff09';ctx.fillRect(x+4,y+4,18,3)}}
function drawPalm(x,y){ctx.strokeStyle='#765031';ctx.lineWidth=10;ctx.beginPath();ctx.moveTo(x,y+30);ctx.quadraticCurveTo(x-8,y,x,y-30);ctx.stroke();for(let i=0;i<6;i++){const a=i*Math.PI/3;ctx.strokeStyle='#3f8b50';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(x,y-30);ctx.lineTo(x+Math.cos(a)*35,y-30+Math.sin(a)*18);ctx.stroke()}pxCircle(x+7,y-23,5,'#7b4c2d')}
function drawLighthouse(x,y){ctx.fillStyle='#efe2c1';ctx.fillRect(x,y,70,145);for(let i=0;i<4;i++)ctx.fillRect(x,y+i*35,70,18);ctx.fillStyle='#b94f4b';ctx.fillRect(x,y+35,70,18);ctx.fillRect(x,y+105,70,18);ctx.fillStyle='#37404e';ctx.fillRect(x+15,y-18,40,30);ctx.fillStyle='#ffe57a';ctx.fillRect(x+20,y-12,30,17);ctx.fillStyle='#4c3a3a';ctx.beginPath();ctx.moveTo(x+4,y-18);ctx.lineTo(x+35,y-48);ctx.lineTo(x+66,y-18);ctx.fill()}
function drawIslandWater(t){ctx.fillStyle='#277c99';ctx.fillRect(0,80,W,35);ctx.fillRect(0,560,W,40);ctx.strokeStyle='#a8edf0';for(let i=0;i<12;i++){let x=i*90+Math.sin(t+i)*12;ctx.beginPath();ctx.moveTo(x,100);ctx.lineTo(x+35,100);ctx.moveTo(x,575);ctx.lineTo(x+35,575);ctx.stroke()}}
function drawWeather(t){ctx.globalAlpha=.65;for(let i=0;i<4;i++){let x=(i*270+t*12)%1100-70,y=110+i%2*45;pxCircle(x,y,22,'#e9f3ed');pxCircle(x+22,y+3,27,'#e9f3ed');pxCircle(x+45,y,19,'#e9f3ed')}ctx.globalAlpha=1}
function drawHedges(){ctx.fillStyle='#294b3e';for(let x=0;x<W;x+=80){ctx.fillRect(x,95,56,36);ctx.fillRect(x,520,56,36)}for(let y=150;y<500;y+=85){ctx.fillRect(300,y,45,62);ctx.fillRect(740,y,45,62)}ctx.fillStyle='#49805b';for(let x=7;x<W;x+=80)pxCircle(x+20,105,18,'#49805b')}
function drawTorch(x,y,t){ctx.save();ctx.fillStyle='#403026';ctx.fillRect(x-3,y,6,24);ctx.fillStyle='#8a623a';ctx.fillRect(x-7,y-2,14,5);const flicker=Math.sin(t*9+x)*3,glow=ctx.createRadialGradient(x,y-8,2,x,y-8,28+flicker);glow.addColorStop(0,'#fff4a088');glow.addColorStop(.35,'#ff9d3866');glow.addColorStop(1,'#ff6a1600');ctx.fillStyle=glow;ctx.beginPath();ctx.arc(x,y-8,30+flicker,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ff6b2e';ctx.beginPath();ctx.moveTo(x-7,y-4);ctx.quadraticCurveTo(x-9,y-15,x+flicker,y-24);ctx.quadraticCurveTo(x+9,y-14,x+6,y-4);ctx.fill();ctx.fillStyle='#ffe46a';ctx.beginPath();ctx.moveTo(x-3,y-5);ctx.quadraticCurveTo(x-3,y-13,x+1,y-17);ctx.quadraticCurveTo(x+4,y-10,x+3,y-5);ctx.fill();ctx.restore()}
function drawExit(x,y,char){ctx.fillStyle='#17142acc';ctx.beginPath();ctx.arc(x,y,18,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ffe48a';ctx.font='bold 29px sans-serif';ctx.textAlign='center';ctx.fillText(char,x,y+10);ctx.textAlign='left'}
function spawnCoins(x,y,amount,credited=false){for(let i=0;i<amount;i++)coinDrops.push({x,y,credited,vx:rand(-95,95),vy:rand(-145,-55),delay:rand(.25,.7),life:8,spin:rand(0,6)})}
function drawCoinDrop(c){ctx.save();ctx.translate(c.x,c.y);ctx.scale(Math.max(.18,Math.abs(Math.cos(c.spin))),1);ctx.shadowColor='#ffd34f';ctx.shadowBlur=10;ctx.fillStyle='#7c521f';ctx.beginPath();ctx.arc(0,0,7,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ffd34f';ctx.beginPath();ctx.arc(0,0,5.5,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff1a0';ctx.fillRect(-1,-3,2,5);ctx.restore()}
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
function enemySay(enemy,line,final=false){const text=typeof line==='string'?line:line.es,ru=typeof line==='string'?'':line.ru;combatBubbles=combatBubbles.filter(b=>b.owner!==enemy);combatBubbles.push({owner:enemy,x:enemy.x,y:enemy.y-enemy.r-14,text,ru,life:final?6:4.5,final})}
function drawCombatBubble(b){ctx.save();ctx.globalAlpha=clamp(b.life*2,0,1);ctx.font='bold 11px sans-serif';const tw=Math.max(ctx.measureText(b.text).width,b.ru?(b.ru.length*5.7):0),w=Math.min(230,Math.max(90,tw+20)),h=b.ru?43:29,x=clamp(b.x-w/2,8,W-w-8),y=b.y-h-5;ctx.fillStyle=b.final?'#fff3c8':'#f8f5e8';ctx.strokeStyle=b.final?'#d39c3c':'#312942';ctx.lineWidth=3;ctx.beginPath();ctx.roundRect(x,y,w,h,8);ctx.fill();ctx.stroke();ctx.fillStyle=b.final?'#7a3b2a':'#282239';ctx.textAlign='center';ctx.fillText(b.text,x+w/2,y+16);if(b.ru){ctx.fillStyle='#665d72';ctx.font='10px sans-serif';ctx.fillText(b.ru,x+w/2,y+31)}ctx.fillStyle=b.final?'#d39c3c':'#312942';ctx.beginPath();ctx.moveTo(b.x-5,y+h);ctx.lineTo(b.x,y+h+8);ctx.lineTo(b.x+6,y+h);ctx.fill();ctx.restore()}
function drawFloatingText(f){ctx.save();ctx.globalAlpha=clamp(f.life*2,0,1);ctx.font='900 15px monospace';ctx.textAlign='center';ctx.lineWidth=4;ctx.strokeStyle='#171326';ctx.strokeText(f.text,f.x,f.y);ctx.fillStyle=f.color;ctx.fillText(f.text,f.x,f.y);ctx.restore()}
function drawAfterImage(a){ctx.save();ctx.globalAlpha=clamp(a.life*1.5,0,.28);ctx.fillStyle=a.color;ctx.beginPath();ctx.ellipse(a.x,a.y-2,13,22,0,0,Math.PI*2);ctx.fill();ctx.restore()}
function drawProjectile(p){ctx.save();ctx.fillStyle=p.color;ctx.shadowColor=p.color;ctx.shadowBlur=16;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();ctx.globalAlpha=.45;ctx.beginPath();ctx.arc(p.x-p.vx*.035,p.y-p.vy*.035,p.r*.7,0,Math.PI*2);ctx.fill();ctx.restore()}
function updateCoins(dt){
 let collected=false;
 coinDrops.forEach(c=>{c.spin+=dt*10;c.life-=dt;if(c.delay>0){c.delay-=dt;c.vy+=240*dt;c.x+=c.vx*dt;c.y+=c.vy*dt;c.vx*=.94}else{const dx=player.x-c.x,dy=player.y-c.y,d=Math.max(1,Math.hypot(dx,dy)),pull=clamp(900/d,5,24);c.vx=(c.vx+dx/d*pull)*.9;c.vy=(c.vy+dy/d*pull)*.9;c.x+=c.vx*dt*5;c.y+=c.vy*dt*5;if(d<20){c.life=0;if(!c.credited){state.coins++;collected=true}playFx('coin');burst(player.x,player.y,'#ffd34f',4,'spark')}}});
 coinDrops=coinDrops.filter(c=>c.life>0);
 if(collected&&!coinDrops.some(c=>!c.credited))save();
}
function update(dt){if(!running||paused||modalOpen||dialogueOpen)return;if(hitStop>0){hitStop-=dt;return}state.playtime+=dt;screenShake=Math.max(0,screenShake-dt*28);screenFlash=Math.max(0,screenFlash-dt);regionFade=Math.max(0,regionFade-dt*1.8);regionTitleTime=Math.max(0,regionTitleTime-dt);state.mana=clamp(state.mana+7*dt,0,state.maxMana);player.update(dt);entities.forEach(e=>e.update(dt));nearEntity=entities.filter(e=>e.type==='npc'&&dist(e,player)<65).sort((a,b)=>dist(a,player)-dist(b,player))[0]||null;$('#interact-hint').classList.toggle('hidden',!nearEntity);if(nearEntity)$('#interact-text').textContent=nearEntity.id==='shop'?'Hablar / Comprar':'Hablar';if(pressed.has('KeyE')||pressed.has('Enter'))nearEntity?interact(nearEntity):openMagic();if(pressed.has('KeyQ'))openMagic();updateProjectiles(dt);updateCoins(dt);combatBubbles.forEach(b=>{b.life-=dt;if(b.owner&&!b.owner.dead){b.x=b.owner.x;b.y=b.owner.y-b.owner.r-14}else b.y-=4*dt});combatBubbles=combatBubbles.filter(b=>b.life>0);particles.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.97;p.vy+=90*dt;p.life-=dt;p.rot=(p.rot||0)+dt*4});particles=particles.filter(p=>p.life>0);afterImages.forEach(a=>a.life-=dt);afterImages=afterImages.filter(a=>a.life>0);floatingTexts.forEach(f=>{f.y-=28*dt;f.life-=dt});floatingTexts=floatingTexts.filter(f=>f.life>0);if(pressed.has('KeyD'))openModal('dictionary');if(pressed.has('KeyI'))openModal('inventory');if(pressed.has('KeyJ'))openModal('journal');if(pressed.has('KeyP'))togglePause();updateHud()}
function updateProjectiles(dt){projectiles.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;if(p.enemy&&dist(p,player)<p.r+player.r){player.damage(p.damage);p.life=0}else if(!p.enemy){entities.filter(e=>e.type==='enemy'&&!e.dead).forEach(e=>{if(dist(p,e)<p.r+e.r){e.damage(p.damage,{x:p.vx/220,y:p.vy/220},p.word);p.life=0}})}});projectiles=projectiles.filter(p=>p.life>0&&p.x>-20&&p.x<W+20&&p.y>60&&p.y<H+20)}
function loop(t){let dt=Math.min(.033,(t-last)/1000||0);last=t;update(dt);ctx.fillStyle='#11101f';ctx.fillRect(0,0,W,H);ctx.save();if(screenShake>0)ctx.translate(rand(-screenShake,screenShake),rand(-screenShake,screenShake));drawWorld(t);ctx.restore();if(screenFlash>0){ctx.globalAlpha=clamp(screenFlash*5,0,.55);ctx.fillStyle='#fff1c7';ctx.fillRect(0,0,W,H);ctx.globalAlpha=1}if(regionFade>0){ctx.globalAlpha=clamp(regionFade,0,1);ctx.fillStyle='#121023';ctx.fillRect(0,0,W,H);ctx.globalAlpha=1}if(running&&state.hp/state.maxHp<.3){const pulse=.12+.08*Math.sin(t/180),danger=ctx.createRadialGradient(W/2,H/2,220,W/2,H/2,600);danger.addColorStop(0,'#8b102000');danger.addColorStop(1,`rgba(150,12,35,${pulse})`);ctx.fillStyle=danger;ctx.fillRect(0,0,W,H)}pressed.clear();requestAnimationFrame(loop)}
function interact(n){if(n.id==='shop'){startDialogue('shop',()=>openShop())}else{startDialogue(n.id);if(n.id==='owl'&&state.quest==='meetOwl'){
 if(!state.completed.includes('meetOwl'))state.completed.push('meetOwl');
 state.quest='killShadows';
 state.shadowKills=state.shadowKills||0;
 state.questKills=Math.min(3,state.shadowKills);
 if(state.shadowKills>=3)completeShadowQuest();
 else { updateObjective(); save(); }
}}}
function startDialogue(id,after=null){playFx('talk');dialogueRewardPos=nearEntity?{x:nearEntity.x,y:nearEntity.y}:{x:player.x,y:player.y};currentDialogue={id,lines:data.dialogues[id],after};dialogueIndex=0;dialogueOpen=true;showDialogueLine();$('#dialogue').classList.remove('hidden');requestAnimationFrame(()=>$('#dialogue').scrollIntoView({behavior:'smooth',block:'nearest'}))}
function highlightDialogue(text,keys){
 const known=keys.map(key=>({key,word:wordByEs(key)})).filter(x=>x.word).sort((a,b)=>b.key.length-a.key.length);
 if(!known.length)return escapeHtml(text);
 const re=new RegExp(known.map(x=>escapeRegex(x.key)).join('|'),'giu');let html='',last=0,match;
 while((match=re.exec(text))){html+=escapeHtml(text.slice(last,match.index));const item=known.find(x=>x.key.toLocaleLowerCase('es')===match[0].toLocaleLowerCase('es'));html+=`<span class="key-word" data-word="${item.word.id}">${escapeHtml(match[0])}</span>`;last=match.index+match[0].length}
 return html+escapeHtml(text.slice(last))
}
function showDialogueLine(){const l=currentDialogue.lines[dialogueIndex];$('#speaker').textContent=l.speaker;$('#speaker-portrait').textContent=l.portrait;$('#dialogue-ru').textContent=l.ru;$('#dialogue-ru').classList.add('hidden');l.keys.forEach(k=>learnWord(k));$('#dialogue-text').innerHTML=highlightDialogue(l.text,l.keys);bindWordTips();state.rewardedDialogues??=[];const rewardKey=`${currentDialogue.id}_${dialogueIndex}`;if(!state.rewardedDialogues.includes(rewardKey)){state.rewardedDialogues.push(rewardKey);state.coins+=2;spawnCoins(dialogueRewardPos.x,dialogueRewardPos.y,2,true);toast('Frase aprendida: +2 monedas · Фраза выучена: +2 монеты','🪙')}updateHud();save()}
function nextDialogue(){if(!currentDialogue)return;if(++dialogueIndex<currentDialogue.lines.length){playFx('talk');showDialogueLine();}else{let cb=currentDialogue.after;$('#dialogue').classList.add('hidden');$('#word-tip').classList.add('hidden');dialogueOpen=false;currentDialogue=null;if(cb)cb();updateObjective()}}
function learnWord(es){const w=wordByEs(es);if(w&&!state.learned.includes(w.id)){state.learned.push(w.id);toast(`Nueva palabra: ${w.es} — ${w.ru}`,w.icon);playFx('learn')}}
function bindWordTips(){$$('.key-word').forEach(el=>{const show=()=>{const w=data.words.find(x=>x.id===el.dataset.word),box=el.getBoundingClientRect(),tip=$('#word-tip');tip.innerHTML=`<strong>${w.icon} ${w.es}</strong><b> — ${w.ru}</b><small>${w.example}</small>`;tip.style.left=`${clamp(box.left,10,innerWidth-250)}px`;tip.style.top=`${Math.max(10,box.top-95)}px`;tip.classList.remove('hidden')};el.onmouseenter=show;el.onclick=show;el.onmouseleave=()=>$('#word-tip').classList.add('hidden')})}
function cast(word){if(state.mana<15)return toast('No tienes maná · Недостаточно маны','💧');state.mana-=15;let speed=260;projectiles.push({x:player.x+player.dir.x*22,y:player.y+player.dir.y*22,vx:player.dir.x*speed,vy:player.dir.y*speed,r:9,life:2,enemy:false,color:word.es==='fuego'?'#ff7a3d':'#62e8ff',damage:25,word:word.es});burst(player.x,player.y,'#80f4ff',18,'spark');screenShake=4;playFx('cast');closeModal();updateHud()}
function completeShadowQuest(){
 if(!state.completed.includes('killShadows'))state.completed.push('killShadows');
 state.quest='boss';
 state.questKills=3;
 playFx('quest');
 toast('¡Misión completada! Viaja a la Aldea de la Familia. · Задание выполнено! Отправляйся в Деревню Семьи.','📜');
 updateObjective();
 save();
}
function levelCheck(){let need=state.level*60;if(state.xp>=need){state.xp-=need;state.level++;state.maxHp+=10;state.hp=state.maxHp;state.maxMana+=5;toast(`¡Nivel ${state.level}! · Уровень ${state.level}`,'⭐')}}
function openModal(kind){if(!running&&!['help','ranking'].includes(kind))return;playFx('menu');$('#modal').classList.remove('shop-mode');modalOpen=true;paused=false;$('#pause').classList.add('hidden');$('#modal-backdrop').classList.remove('hidden');const m={dictionary:['COLECCIÓN DE PALABRAS','Mi Diccionario'],inventory:['EQUIPO Y OBJETOS','Mi Mochila'],journal:['AVENTURAS DE VERBALIA','Mis Misiones'],ranking:['HÉROES DE VERBALIA','Clasificación'],help:['GUÍA DEL AVENTURERO','Cómo jugar'],magic:['PODER DE LAS PALABRAS','Magia de palabras']}[kind];$('#modal-kicker').textContent=m[0];$('#modal-title').textContent=m[1];renderModal(kind)}
function closeModal(){modalOpen=false;$('#modal-backdrop').classList.add('hidden')}
function renderModal(kind){const c=$('#modal-content');if(kind==='dictionary'){let active=data.themes.find(t=>t.words.some(w=>state.learned.includes(w.id)))?.id||'saludos';const render=id=>{c.innerHTML=`<div class="tabs">${data.themes.map(t=>`<button data-theme="${t.id}" class="${id===t.id?'active':''}">${t.icon} ${t.name}</button>`).join('')}</div><div class="word-grid">${data.themes.find(t=>t.id===id).words.map(w=>state.learned.includes(w.id)?`<article class="word-card"><span class="emoji">${w.icon}</span><div><strong>${w.es}</strong><b>${w.ru}</b><p>${w.example}</p></div></article>`:`<article class="word-card locked"><span class="emoji">🔒</span><div><strong>???</strong><b>Ещё не открыто</b><p>Descubre esta palabra en Verbalia. · Открой это слово в Вербалии.</p></div></article>`).join('')}</div>`;$$('[data-theme]').forEach(b=>b.onclick=()=>render(b.dataset.theme))};render(active)}
if(kind==='inventory')c.innerHTML=`<div class="inventory-grid">${state.inventory.length?state.inventory.map(i=>{let d=data.items[i.id];return `<article class="item"><div class="emoji">${d.icon}</div><strong>${d.name}</strong><p>${d.ru}</p><b>× ${i.qty}</b>${['potion','mana'].includes(i.id)?`<button data-use="${i.id}">Usar · Использовать</button>`:''}</article>`}).join(''):'<p>Tu mochila está vacía. · Твой рюкзак пуст.</p>'}</div>`,$$('[data-use]').forEach(b=>b.onclick=()=>useConsumable(b.dataset.use));
if(kind==='journal'){let quests=[['meetOwl','Habla con Don Diccionario','Поговори с Доном Словарём'],['killShadows','Derrota 3 Sombras de Tinta',`Победи 3 Чернильные Тени (${state.questKills}/3)`],['boss','Derrota al Guardián Gris','Победи Серого Стража'],...data.regions.slice(3).map(r=>[`regionBoss_${r.id}`,r.quest,r.ru])];c.innerHTML=quests.map(q=>{const done=state.completed.includes(q[0]),current=q[0]===`regionBoss_${state.region}`||state.quest===q[0];return `<article class="quest ${done?'done':''}"><h3>${done?'✓':current?'◆':'○'} ${q[1]}</h3><p>${q[2]}</p><small>${done?'Completada':current?'Misión de esta región':'Por descubrir'}</small></article>`}).join('')}
if(kind==='ranking'){let rows=[];try{rows=JSON.parse(localStorage.getItem(RANK_KEY))||[]}catch{};renderRanking(rows,'CLASIFICACIÓN LOCAL');if(location.protocol!=='file:')fetch('/api/ranking').then(r=>r.json()).then(d=>{if(modalOpen&&$('#modal-title').textContent==='Clasificación')renderRanking(d.ranking||[],'CLASIFICACIÓN GLOBAL · ОБЩИЙ РЕЙТИНГ')}).catch(()=>{})}
if(kind==='help')c.innerHTML=`<div class="help-grid"><div>Mover · Двигаться <kbd>WASD / ↑↓←→</kbd></div><div>Atacar · Атака <kbd>ESPACIO / CLIC</kbd></div><div>Hablar · Говорить <kbd>E / ENTER</kbd></div><div>Esquivar · Уклонение <kbd>SHIFT</kbd></div><div>Diccionario · Словарь <kbd>D</kbd></div><div>Mochila · Рюкзак <kbd>I</kbd></div><div>Misiones · Задания <kbd>J</kbd></div><div>Magia · Магия <kbd>Q</kbd></div><div>Pausa · Пауза <kbd>P</kbd></div><div>Traducción · Перевод <kbd>T</kbd></div></div><p>Acércate a las personas y pulsa E. Las palabras doradas muestran su traducción rusa.</p>`;
if(kind==='magic'){let magic=data.words.filter(w=>['hola','uno','dos','fuego','agua','luz'].includes(w.es)&&state.learned.includes(w.id));c.innerHTML=`<p>Elige una palabra (15 maná). · Выбери слово (15 маны).</p><div class="magic-list">${magic.map(w=>`<button class="magic-button" data-spell="${w.id}" ${state.mana<15?'disabled':''}><strong>${w.icon} ${w.es}</strong>${w.ru}</button>`).join('')||'<p>Aprende una palabra mágica primero.</p>'}</div>`;$$('[data-spell]').forEach(b=>b.onclick=()=>cast(data.words.find(w=>w.id===b.dataset.spell)))} }
function renderRanking(rows,label){const c=$('#modal-content');c.innerHTML=`<p class="ranking-source">🌐 ${label}</p><div class="ranking-row"><b>#</b><b>Héroe</b><b>Nivel</b><b>Palabras</b><b>Puntos</b></div>${rows.map((r,i)=>`<div class="ranking-row ${r.name===state?.name?'me':''}"><b>${i<3?['🥇','🥈','🥉'][i]:i+1}</b><strong>${escapeHtml(String(r.name||'Héroe'))}</strong><span>${Number(r.level)||1}</span><span>${Number(r.words)||0}</span><span>${Number(r.score)||0}</span></div>`).join('')||'<p>Aún no hay héroes. · Героев пока нет.</p>'}`}
function openMagic(){openModal('magic')}
function openShop(){openModal('inventory');$('#modal').classList.add('shop-mode');$('#modal-kicker').textContent='MERCADO DE VERBALIA · МАГАЗИН';$('#modal-title').textContent='El Rincón de Moneda';renderShop()}
function renderShop(){
 const c=$('#modal-content');
 c.innerHTML=`<section class="shop-welcome"><div class="shopkeeper-avatar"><span>🧔</span></div><div><small>SEÑOR MONEDA · ГОСПОДИН МОНЕТА</small><h3>«Todo héroe necesita buen equipo»</h3><p>Elige un objeto para tu aventura. · Выбери предмет для своего приключения.</p></div><div class="shop-wallet"><small>TUS MONEDAS</small><strong><span class="wallet-coin">●</span><b id="shop-balance">${state.coins}</b></strong></div></section><div class="shop-grid professional">${Object.entries(data.items).map(([id,item],index)=>{const inv=state.inventory.find(x=>x.id===id),owned=id==='sword'?`Nivel ${state.sword}`:inv?`En la mochila: ${inv.qty}`:id==='hint'?`${state.learned.length}/${data.words.length} palabras`:'No tienes este objeto',canBuy=state.coins>=item.price;return `<article class="shop-item shop-${id}" style="--delay:${index*70}ms"><div class="shop-rarity">${id==='sword'?'MEJORA':'OBJETO'}</div><div class="shop-icon"><span>${item.icon}</span><i></i></div><h3>${item.name}</h3><h4>${item.ru}</h4><p>${item.desc}</p><small>${item.descRu}</small><div class="shop-owned">◆ ${owned}</div><button class="buy-button" data-buy="${id}" ${canBuy?'':'disabled'}><span>${canBuy?'COMPRAR':'MONEDAS INSUFICIENTES'}</span><b>🪙 ${item.price}</b></button></article>`}).join('')}</div><footer class="shop-footer"><span>💡 Las palabras descubiertas permanecen en tu diccionario.</span><span>Покупки сохраняются автоматически.</span></footer>`;
 $$('[data-buy]').forEach(button=>button.onclick=()=>buy(button.dataset.buy,button))
}
function animateCoinSpend(button,from,to){
 const wallet=$('#shop-balance'),start=wallet?.getBoundingClientRect(),end=button.getBoundingClientRect();if(!start)return;const hudCoin=$('#coin-count')?.parentElement;hudCoin?.classList.add('coin-spending');setTimeout(()=>hudCoin?.classList.remove('coin-spending'),700);
 for(let i=0;i<Math.min(12,from-to);i++){const coin=document.createElement('i');coin.className='flying-spend-coin';coin.textContent='●';coin.style.left=`${start.left+start.width/2+rand(-8,8)}px`;coin.style.top=`${start.top+start.height/2+rand(-5,5)}px`;document.body.append(coin);const dx=end.left+end.width/2-start.left-start.width/2+rand(-16,16),dy=end.top+end.height/2-start.top-start.height/2+rand(-9,9);if(coin.animate){coin.animate([{transform:'translate(0,0) scale(1)',opacity:1},{transform:`translate(${dx*.55}px,${dy*.25-35}px) scale(1.2)`,opacity:1,offset:.55},{transform:`translate(${dx}px,${dy}px) scale(.25)`,opacity:0}],{duration:520+i*28,delay:i*22,easing:'cubic-bezier(.25,.75,.35,1)'}).onfinish=()=>coin.remove()}else setTimeout(()=>coin.remove(),700)}
 const started=performance.now(),duration=620;function count(now){const p=clamp((now-started)/duration,0,1),value=Math.round(from+(to-from)*(1-Math.pow(1-p,3)));$('#shop-balance')&&($('#shop-balance').textContent=value);$('#coin-count').textContent=value;if(p<1)requestAnimationFrame(count)}requestAnimationFrame(count);
 button.closest('.shop-item').classList.add('purchased');for(let i=0;i<7;i++){const spark=document.createElement('i');spark.className='shop-purchase-spark';const angle=i/7*Math.PI*2;spark.style.setProperty('--x',`${Math.cos(angle)*52}px`);spark.style.setProperty('--y',`${Math.sin(angle)*38}px`);button.append(spark);setTimeout(()=>spark.remove(),750)}
}
function buy(id,button){let item=data.items[id];if(state.coins<item.price){playFx('noCoins');button?.classList.add('denied');return}const oldCoins=state.coins;state.coins-=item.price;button.disabled=true;animateCoinSpend(button,oldCoins,state.coins);if(id==='sword')state.sword++;else if(id==='hint'){let locked=data.words.find(w=>!state.learned.includes(w.id));if(locked)learnWord(locked.es)}else{let inv=state.inventory.find(i=>i.id===id);inv?inv.qty++:state.inventory.push({id,qty:1})}playFx('buy');toast(`Compra realizada: ${item.name} · Покупка совершена`,item.icon);save();setTimeout(()=>{updateHud();if(modalOpen)renderShop()},760)}
function useConsumable(id){let inv=state.inventory.find(i=>i.id===id);if(!inv||!inv.qty)return;inv.qty--;if(id==='potion'){state.hp=clamp(state.hp+45,0,state.maxHp);toast('Vida recuperada · Здоровье восстановлено','❤️')}else{state.mana=clamp(state.mana+35,0,state.maxMana);toast('Maná recuperado · Мана восстановлена','💧')}if(!inv.qty)state.inventory=state.inventory.filter(i=>i.qty);playFx('learn');burst(player.x,player.y,id==='potion'?'#ff748b':'#6edfff',18,'spark');save();closeModal();updateHud()}
function updateHud(){$('#hud-name').textContent=state.name;$('#level-label').textContent=`Nv. ${state.level}`;$('#hp-fill').style.width=`${state.hp/state.maxHp*100}%`;$('#hp-text').textContent=`${Math.ceil(state.hp)} / ${state.maxHp}`;$('#mana-fill').style.width=`${state.mana/state.maxMana*100}%`;$('#mana-text').textContent=`${Math.floor(state.mana)} / ${state.maxMana}`;$('#coin-count').textContent=state.coins;$('#word-count').textContent=state.learned.length;let boss=entities.find(e=>e.boss&&!e.dead);$('#boss-bar').classList.toggle('hidden',!boss);if(boss){$('#boss-name').textContent=boss.name;$('#boss-fill').style.width=`${boss.hp/boss.maxHp*100}%`}}
function updateRegionUI(){let r=data.regions[state.region];$('#stage-progress').textContent=`ETAPA ${Math.floor(state.region/3)+1} · ${state.region+1}/9`;$('#region-name').textContent=r.name;$('#region-theme').textContent=r.theme;$('.region-icon').textContent=r.icon;updateObjective()}
function updateObjective(){let text=state.quest==='meetOwl'?'Habla con Don Diccionario':state.quest==='killShadows'?`Derrota a 3 Sombras de Tinta (${state.questKills}/3)`:state.quest==='boss'?'Viaja a la Aldea y derrota al Guardián':(data.regions[state.region]?.quest||'Explora Verbalia');$('#objective-text').textContent=text}
function toast(text,icon='✨'){let e=document.createElement('div');e.className='toast';e.textContent=`${icon} ${text}`;$('#toast-zone').append(e);setTimeout(()=>e.remove(),3100)}
function togglePause(){if(!running||modalOpen||dialogueOpen)return;paused=!paused;$('#pause').classList.toggle('hidden',!paused);if(paused)stopMusic();else startMusic(state.region)}
function startGame(saved=false){state=saved?load():freshState($('#hero-name').value.trim());if(!state)return;state.mana=state.mana??60;state.rewardedDialogues??=[];state.testsPassed??=[];
 state.shadowKills=state.shadowKills??Math.max(state.questKills||0,state.quest==='killShadows'?Math.min(state.kills||0,3):0);
 state.questKills=Math.min(3,state.shadowKills);
 player=new Player;spawnRegion();running=true;regionFade=1;regionTitleTime=2.8;startMusic(state.region);
 if(state.quest==='killShadows'&&state.shadowKills>=3)completeShadowQuest();$('#welcome').classList.add('hidden');$('#hud').classList.remove('hidden');$('#objective').classList.remove('hidden');$('#game-nav').classList.remove('hidden');updateHud();save();toast(`¡Bienvenido, ${state.name}! · Добро пожаловать!`,'🦉')}
function escapeHtml(s){return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}function escapeRegex(s){return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}
let audioCtx,musicTimer=null,musicStep=0,musicRegion=-1;
const SONGS=[
 {tempo:270,lead:[64,67,71,67,69,72,71,67,64,67,71,76,74,71,67,null],bass:[48,null,null,null,45,null,null,null,41,null,null,null,43,null,null,null]},
 {tempo:235,lead:[57,60,64,60,55,59,62,59,57,60,64,69,67,64,60,null],bass:[41,null,41,null,43,null,43,null,38,null,38,null,40,null,40,null]},
 {tempo:300,lead:[62,65,69,67,62,65,72,69,60,64,67,64,59,62,67,null],bass:[38,null,null,null,41,null,null,null,36,null,null,null,43,null,null,null]},
 {tempo:245,lead:[67,69,71,72,71,69,67,64,67,69,72,76,74,72,69,null],bass:[48,null,48,null,45,null,45,null,50,null,50,null,43,null,43,null]},
 {tempo:330,lead:[55,62,60,55,58,65,62,58,53,60,58,53,55,62,67,null],bass:[36,null,null,36,38,null,null,38,34,null,null,34,36,null,null,36]},
 {tempo:285,lead:[69,67,64,62,64,67,69,72,71,67,64,59,62,64,67,null],bass:[45,null,45,null,41,null,41,null,43,null,43,null,40,null,40,null]},
 {tempo:255,lead:[60,64,67,72,71,67,64,60,62,65,69,74,72,69,65,null],bass:[36,null,null,null,38,null,null,null,41,null,null,null,43,null,null,null]},
 {tempo:360,lead:[72,71,69,67,72,76,74,71,69,67,64,67,71,74,79,null],bass:[45,null,43,null,41,null,40,null,38,null,40,null,43,null,45,null]},
 {tempo:220,lead:[62,null,65,64,67,null,70,69,62,65,69,74,72,69,65,null],bass:[38,null,38,null,36,null,36,null,34,null,34,null,33,null,33,null]}
];
function ensureAudio(){try{audioCtx??=new (window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume();return audioCtx}catch{return null}}
function tone(freq,dur=.12,type='sine',vol=.035,when=0,slide=0){const ac=ensureAudio();if(!ac||!sound)return;const o=ac.createOscillator(),g=ac.createGain(),t=ac.currentTime+when;o.type=type;o.frequency.setValueAtTime(freq,t);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(30,freq+slide),t+dur);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g).connect(ac.destination);o.start(t);o.stop(t+dur+.02)}
function noise(dur=.08,vol=.025){const ac=ensureAudio();if(!ac||!sound)return;const len=Math.floor(ac.sampleRate*dur),buf=ac.createBuffer(1,len,ac.sampleRate),arr=buf.getChannelData(0);for(let i=0;i<len;i++)arr[i]=(Math.random()*2-1)*(1-i/len);const src=ac.createBufferSource(),filter=ac.createBiquadFilter(),g=ac.createGain();src.buffer=buf;filter.type='bandpass';filter.frequency.value=900;g.gain.value=vol;src.connect(filter).connect(g).connect(ac.destination);src.start()}
function playFx(name){if(!sound)return;const fx={
 step:()=>{noise(.025,.006);tone(state.region===5?170:95,.035,'triangle',.005)},
 sword:()=>{noise(.07,.035);tone(230,.1,'sawtooth',.025,0,500);tone(520,.07,'triangle',.018,.035,-180)},
 hit:()=>{noise(.1,.05);tone(110,.11,'square',.025,0,-55)},
 magicHit:()=>{tone(720,.16,'sine',.035,0,-320);tone(980,.12,'triangle',.02,.025,-450)},
 hurt:()=>{noise(.14,.045);tone(145,.2,'sawtooth',.03,0,-70)},
 dash:()=>{noise(.11,.025);tone(340,.14,'sine',.022,0,350)},
 coin:()=>{tone(880,.08,'square',.022);tone(1320,.12,'square',.018,.07)},
 buy:()=>{noise(.06,.012);[523,659,784,1047].forEach((f,i)=>tone(f,.2,'triangle',.023,i*.055));tone(1568,.28,'sine',.012,.2)},
 noCoins:()=>{tone(180,.12,'square',.02);tone(135,.2,'sawtooth',.018,.11)},
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
addEventListener('pagehide',()=>{if(state&&location.protocol!=='file:')navigator.sendBeacon?.('/api/save',new Blob([JSON.stringify({playerId:playerId(),state})],{type:'application/json'}))});
addEventListener('keydown',e=>{if(!keys[e.code])pressed.add(e.code);keys[e.code]=true;if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();if(dialogueOpen&&(e.code==='Enter'||e.code==='KeyE'||e.code==='Space')){e.preventDefault();nextDialogue()}if(dialogueOpen&&e.code==='KeyT')$('#dialogue-ru').classList.toggle('hidden');if(e.code==='Escape'){if(modalOpen)closeModal();else if(paused)togglePause()}});addEventListener('keyup',e=>keys[e.code]=false);canvas.addEventListener('mousedown',()=>{if(running&&!paused&&!modalOpen&&!dialogueOpen)player.attack()});
$('#dialogue-next').onclick=nextDialogue;$('#translate-line').onclick=()=>$('#dialogue-ru').classList.toggle('hidden');$('#modal-close').onclick=closeModal;$('#modal-backdrop').onclick=e=>{if(e.target.id==='modal-backdrop')closeModal()};$('#start-btn').onclick=()=>{if(!$('#hero-name').value.trim()){toast('Escribe tu nombre · Напиши своё имя','✏️');$('#hero-name').focus();return}startGame(false)};$('#continue-btn').onclick=()=>startGame(true);$$('.hero-option').forEach(b=>b.onclick=()=>{$$('.hero-option').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');selectedColor=b.dataset.color});$$('[data-open]').forEach(b=>b.onclick=()=>openModal(b.dataset.open));$$('[data-action]').forEach(b=>b.onclick=()=>{if(b.dataset.action==='resume')togglePause();if(b.dataset.action==='save')save(true);if(b.dataset.action==='magic')openMagic()});$('#sound-btn').onclick=()=>{sound=!sound;$('#sound-btn').textContent=sound?'♫':'×';$('#sound-btn').title=sound?'Música y sonidos activados':'Sonido desactivado';if(sound){ensureAudio();if(running)startMusic(state.region);playFx('region')}else stopMusic()};
if(load()){$('#continue-btn').classList.remove('hidden');$('#continue-btn').textContent=`CONTINUAR COMO ${load().name.toUpperCase()}`}
else loadServerSave().then(remote=>{if(remote){localStorage.setItem(SAVE_KEY,JSON.stringify(remote));$('#continue-btn').classList.remove('hidden');$('#continue-btn').textContent=`CONTINUAR COMO ${remote.name.toUpperCase()}`;toast('Partida recuperada del servidor · Игра загружена с сервера','☁️')}});
// Fondo animado aun antes de iniciar
state=freshState('Héroe');player=new Player;spawnRegion();requestAnimationFrame(loop);
})();
