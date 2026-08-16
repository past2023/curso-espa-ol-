/* Validación rápida para evitar que el contenido educativo pierda palabras o traducciones. */
'use strict';
global.window=global;
require('./data.js');
const errors=[];
const ids=new Set();
for(const theme of GAME_DATA.themes){
  if(!theme.name||!theme.id)errors.push('Tema sin nombre o id');
  for(const word of theme.words){
    if(ids.has(word.id))errors.push(`Id repetido: ${word.id}`);ids.add(word.id);
    if(!word.es||!word.ru||!word.example)errors.push(`Entrada incompleta: ${word.id}`);
    if(!/[.!?]$/.test(word.example))errors.push(`Ejemplo sin puntuación final: ${word.id}`);
  }
}
for(const [id,lines] of Object.entries(GAME_DATA.dialogues))for(const [index,line] of lines.entries()){
  if(!line.text||!line.ru)errors.push(`Diálogo sin traducción: ${id}[${index}]`);
  for(const key of line.keys){
    if(!line.text.toLocaleLowerCase('es').includes(key.toLocaleLowerCase('es')))errors.push(`La clave «${key}» no aparece en ${id}[${index}]`);
    if(!GAME_DATA.words.some(w=>w.es.toLocaleLowerCase('es')===key.toLocaleLowerCase('es')))errors.push(`La clave «${key}» no está en el diccionario`);
  }
}
for(const region of GAME_DATA.regions)if(!region.name||!region.quest||!region.ru)errors.push(`Región incompleta: ${region.id}`);
// Comprueba además que el motor no invoque diálogos ni debilidades inexistentes.
const source=require('fs').readFileSync(require('path').join(__dirname,'main.js'),'utf8');
const npcIds=[...source.matchAll(/npc\([^\n]*?'([^']+)'\s*,\s*'[^']+'\s*,\s*'[^']+'/g)].map(m=>m[1]);
for(const id of new Set(npcIds))if(!GAME_DATA.dialogues[id])errors.push(`NPC sin diálogo: ${id}`);
const weaknesses=[...source.matchAll(/weak:'([^']+)'/g)].map(m=>m[1]);
for(const word of new Set(weaknesses))if(!GAME_DATA.words.some(w=>w.es===word))errors.push(`Debilidad fuera del diccionario: ${word}`);
const songs=(source.match(/tempo:/g)||[]).length;if(songs<GAME_DATA.regions.length)errors.push(`Faltan canciones: ${songs}/${GAME_DATA.regions.length}`);
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
console.log(`Contenido validado: ${GAME_DATA.words.length} palabras, ${Object.values(GAME_DATA.dialogues).flat().length} diálogos y ${GAME_DATA.regions.length} regiones.`);
