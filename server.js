/* Servidor opcional sin dependencias: archivos del juego + guardado global persistente. */
'use strict';
const http=require('http');
const fs=require('fs');
const path=require('path');
const crypto=require('crypto');
const ROOT=__dirname;
const PORT=Number(process.env.PORT)||8000;
const DATA_FILE=process.env.VERBALIA_DATA_FILE||path.join(ROOT,'.server-data','players.json');
const MIME={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.ico':'image/x-icon'};
let db={players:{},updatedAt:null};
try{db=JSON.parse(fs.readFileSync(DATA_FILE,'utf8'));if(!db.players)db.players={}}catch{}
function persist(){fs.mkdirSync(path.dirname(DATA_FILE),{recursive:true});db.updatedAt=new Date().toISOString();const tmp=`${DATA_FILE}.${process.pid}.tmp`;fs.writeFileSync(tmp,JSON.stringify(db,null,2));fs.renameSync(tmp,DATA_FILE)}
function json(res,status,value){const body=JSON.stringify(value);res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Content-Length':Buffer.byteLength(body),'Cache-Control':'no-store'});res.end(body);return true}
function safeId(id){return typeof id==='string'&&/^[a-zA-Z0-9-]{8,100}$/.test(id)}
function cleanState(input){if(!input||typeof input!=='object'||Array.isArray(input))return null;const state=JSON.parse(JSON.stringify(input));state.name=String(state.name||'Héroe').replace(/[<>]/g,'').trim().slice(0,14)||'Héroe';for(const k of ['coins','level','xp','kills'])state[k]=Math.max(0,Math.min(1e7,Number(state[k])||0));for(const k of ['learned','inventory','completed','bosses','testsPassed','rewardedDialogues'])if(!Array.isArray(state[k]))state[k]=[];return state}
function ranking(){return Object.values(db.players).map(p=>{const s=p.state||{};const words=s.learned?.length||0,bosses=s.bosses?.length||0,tests=s.testsPassed?.length||0;return {name:s.name||'Héroe',level:s.level||1,words,coins:s.coins||0,score:words*100+(s.kills||0)*20+(s.coins||0)+bosses*500+tests*750,updatedAt:p.updatedAt}}).sort((a,b)=>b.score-a.score||String(a.name).localeCompare(String(b.name))).slice(0,50)}
function api(req,res,url){
 if(req.method==='GET'&&url.pathname==='/api/health')return json(res,200,{ok:true,players:Object.keys(db.players).length});
 if(req.method==='GET'&&url.pathname==='/api/ranking')return json(res,200,{ranking:ranking()});
 if(req.method==='GET'&&url.pathname.startsWith('/api/save/')){const id=decodeURIComponent(url.pathname.slice(10));if(!safeId(id))return json(res,400,{error:'Identificador inválido'});const player=db.players[id];return player?json(res,200,{state:player.state,updatedAt:player.updatedAt}):json(res,404,{error:'Partida no encontrada'})}
 if(req.method==='POST'&&url.pathname==='/api/save'){let raw='';req.on('data',chunk=>{raw+=chunk;if(raw.length>1_000_000)req.destroy()});req.on('end',()=>{try{const body=JSON.parse(raw),id=body.playerId,state=cleanState(body.state);if(!safeId(id)||!state)return json(res,400,{error:'Datos inválidos'});db.players[id]={state,updatedAt:new Date().toISOString(),signature:crypto.createHash('sha256').update(id+state.name).digest('hex').slice(0,12)};persist();json(res,200,{ok:true})}catch{json(res,400,{error:'JSON inválido'})}});return true}
 return false
}
const server=http.createServer((req,res)=>{const url=new URL(req.url,'http://localhost');if(url.pathname.startsWith('/api/')){if(!api(req,res,url))json(res,404,{error:'Ruta no encontrada'});return}let decoded;try{decoded=decodeURIComponent(url.pathname)}catch{return res.writeHead(400).end('Bad request')}if(decoded.split('/').some(p=>p.startsWith('.')))return res.writeHead(403).end('Forbidden');let rel=decoded==='/'?'index.html':decoded.replace(/^\/+/,''),file=path.resolve(ROOT,rel);if(!file.startsWith(ROOT+path.sep))return res.writeHead(403).end('Forbidden');fs.stat(file,(err,stat)=>{if(err||!stat.isFile())return res.writeHead(404).end('Not found');res.writeHead(200,{'Content-Type':MIME[path.extname(file).toLowerCase()]||'application/octet-stream','Cache-Control':path.extname(file)==='.html'?'no-cache':'public, max-age=3600'});fs.createReadStream(file).pipe(res)})});
server.listen(PORT,'0.0.0.0',()=>console.log(`Verbalia disponible en http://0.0.0.0:${PORT}`));
