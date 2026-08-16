# Guía para futuros agentes — El Héroe de las Palabras

> Documento de continuidad técnica y creativa. Léelo antes de modificar el proyecto.

## 1. Resumen del proyecto

**El Héroe de las Palabras** es un RPG educativo de acción, ejecutado en el navegador, para estudiantes rusohablantes de español A1.

- Motor: HTML5 Canvas 2D.
- Código: JavaScript ES6+ sin librerías externas.
- Interfaz: HTML y CSS superpuestos dentro del marco del juego.
- Idiomas: español principal y traducciones rusas.
- Persistencia local: `localStorage`.
- Persistencia compartida opcional: servidor Node incluido.
- Ranking: local y global.
- Arte actual: **100 % procedural**, dibujado con Canvas.
- Resolución lógica: `960 × 600`.
- Regiones actuales: 12.
- Etapas actuales: 4, con 3 regiones por etapa.
- Vocabulario actual: 67 palabras distribuidas en 12 temas.
- Diálogos actuales: 32.

### Preferencia visual vigente

El usuario probó una integración de sprites PNG de Kenney y pidió revertirla porque se veía peor. La decisión actual es:

- Mantener el mundo completamente procedural.
- No volver a integrar sprites PNG sin aprobación explícita.
- Mejorar terrenos, agua, vegetación, edificios, personajes y efectos mediante Canvas.
- Mantener la GUI actual, que el usuario considera suficientemente buena.

La integración PNG fue revertida en el commit `11b5059`.

---

## 2. Archivos principales

### `index.html`

Contiene:

- Canvas `#game`.
- HUD superior integrado dentro del escenario.
- Botones de ayuda, ranking y sonido en la esquina superior derecha.
- Barra inferior de diccionario, mochila, misiones, magia y controles.
- Panel de diálogo que sustituye a la barra inferior.
- Pantalla de bienvenida y creación del héroe.
- Modal compartido para todos los menús.

La antigua cabecera exterior con el título del juego fue eliminada por petición del usuario.

### `style.css`

Contiene toda la presentación y animaciones HTML.

Notas importantes:

- El archivo ha crecido mediante varias capas de reglas y overrides al final.
- Antes de cambiar una regla, buscar todas sus apariciones.
- Las reglas finales tienen prioridad y representan el diseño vigente.
- El juego ocupa el máximo espacio posible en Safari y Chrome conservando relación `16:10`.
- Se usa `100dvh` con fallback para navegadores antiguos.
- Existe soporte para `prefers-reduced-motion`.

### `data.js`

Fuente central del contenido educativo:

- Temas.
- Palabras españolas.
- Traducciones rusas.
- Ejemplos.
- Regiones.
- Misiones regionales.
- Diálogos.
- Objetos de tienda.

No dispersar nuevo contenido educativo por `main.js` si puede vivir en `data.js`.

### `main.js`

Motor completo del juego:

- Estado.
- Renderizado.
- Jugador.
- Enemigos.
- NPC.
- Combate.
- Magia.
- Partículas.
- Mundo.
- Diálogos.
- Tests.
- Inventario.
- Tiendas.
- Ranking.
- Guardado.
- Música y efectos sonoros.

### `server.js`

Servidor Node sin dependencias:

- Sirve los archivos estáticos.
- Guarda partidas.
- Expone ranking global.
- Persiste datos en `.server-data/players.json`.

### `validate-content.js`

Valida:

- Entradas de diccionario.
- Traducciones.
- Puntuación de ejemplos.
- Palabras clave de diálogos.
- NPC sin diálogo.
- Debilidades enemigas inexistentes.
- Cantidad de canciones frente a regiones.

### `README.md`

Guía pública del proyecto y comandos de ejecución.

---

## 3. Ejecución y comprobación

### Juego estático

Puede abrirse `index.html` directamente, aunque el ranking global necesita servidor.

### Servidor completo

```bash
npm start
```

Por defecto:

```text
http://localhost:8000
```

Variables opcionales:

```bash
PORT=8080
VERBALIA_DATA_FILE=/ruta/persistente/players.json
npm start
```

### Validación obligatoria

Antes de terminar cualquier cambio:

```bash
npm run check
git diff --check
```

El resultado actual esperado incluye:

```text
Contenido validado: 67 palabras, 32 diálogos y 12 regiones.
```

---

## 4. Diseño actual de la GUI

Toda la GUI principal vive dentro de `#stage`.

### Parte superior

- `#hud`
  - `.hud-left`: nombre, nivel, vida y maná.
  - `.hud-center`: etapa, región y tema.
  - `.hud-right`: monedas y palabras.
- `.stage-actions`
  - Ayuda.
  - Ranking.
  - Sonido.
- `#objective`: misión actual.
- `#toast-zone`: mensajes temporales.

### Parte inferior

`#game-nav` contiene:

- Diccionario.
- Mochila.
- Misiones.
- Magia.
- Ayuda de controles.

### Diálogos

Cuando comienza un diálogo:

1. `#game-nav` recibe la clase `hidden`.
2. `#dialogue` aparece en el mismo espacio inferior.
3. Al finalizar, el diálogo se oculta.
4. `#game-nav` reaparece.

No volver a crear un bloque separado `E · Hablar`; fue eliminado expresamente por el usuario.

### Textos seguros

Los títulos de región y globos usan ajuste dinámico de fuente con `fittedCanvasFont()`.

El CSS también protege:

- Nombres largos de región.
- Temas.
- Notificaciones.
- Diálogos.
- Ranking.
- Tarjetas del diccionario.

No reemplazar este sistema por tamaños fijos sin comprobar los títulos largos.

---

## 5. Mundo y renderizado

### Coordenadas

Constantes:

```js
W = 960
H = 600
```

El jugador se limita verticalmente para no quedar detrás del HUD ni de la barra inferior.

### Bucle

`loop(t)`:

1. Calcula `dt`.
2. Ejecuta `update(dt)`.
3. Aplica sacudida.
4. Llama a `drawWorld(t)`.
5. Aplica destellos, transición y viñeta de vida crítica.
6. Solicita el siguiente frame.

### Orden de dibujo

En términos generales:

1. Terreno.
2. Texturas procedurales.
3. Caminos.
4. Agua y estructuras.
5. Decoración.
6. Actores ordenados por coordenada Y.
7. Monedas.
8. Proyectiles.
9. Partículas.
10. Textos flotantes.
11. Globos de enemigos.
12. Atmósfera.
13. Viñeta.
14. Salidas y título regional.

### Arte procedural

Funciones relevantes:

- `drawTerrainDetails()`
- `drawPath()`
- `drawTree()`
- `drawHouse()`
- `drawWindow()`
- `drawPond()`
- `drawRock()`
- `drawFence()`
- `drawBridge()`
- `drawCastle()`
- `drawDarkCastle()`
- `drawTower()`
- `drawMarket()`
- `drawCrystalLibrary()`
- `drawAtmosphere()`

El usuario quiere continuar mejorando especialmente:

- Terrenos.
- Casas.
- Castillos.
- Tiendas físicas.
- Agua y lagunas.
- Árboles y rocas.

La dirección correcta es añadir capas, variaciones deterministas, luces, sombras y animaciones procedurales; no sprites PNG.

---

## 6. Regiones y etapas

### Etapa 1

1. Pueblo de los Saludos.
2. Bosque de los Números.
3. Aldea de la Familia.

### Etapa 2

4. Valle de la Comida.
5. Bosque de los Animales.
6. Montaña de la Ropa.

### Etapa 3

7. Ciudad de las Casas.
8. Isla del Tiempo.
9. Laberinto de Direcciones.

### Etapa 4

10. Fortaleza de los Verbos.
11. Jardín de las Emociones.
12. Biblioteca de Cristal.

Cada etapa termina con un test.

Puertas actuales en `attemptRegionTransition()`:

- Región 3 requiere test 0.
- Región 6 requiere test 1.
- Región 9 requiere test 2.

El test final, test 3, se activa al derrotar a Olvido en la región 11 (índice cero).

---

## 7. Cómo añadir una región

Para agregar una región nueva hay que actualizar, como mínimo:

1. `data.js`
   - Tema de vocabulario si corresponde.
   - Región.
   - Misión española.
   - Traducción rusa.
   - Diálogos.
2. `spawnRegion()`
   - NPC.
   - Enemigos.
   - Jefe.
   - Debilidad.
3. `drawWorld()`
   - Rama visual para la región.
4. `SONGS`
   - Una canción nueva.
5. Magia
   - Si una debilidad debe ser lanzable, añadir la palabra a la lista de `renderModal('magic')`.
6. Tests
   - Mantener grupos coherentes de tres temas por etapa.
7. Validación
   - Ejecutar `npm run check`.

No añadir una debilidad que el jugador no pueda aprender antes del jefe.

---

## 8. Jugador y combate

### Controles

- WASD o flechas: mover.
- Espacio o clic: atacar.
- Shift: esquivar.
- E o Enter: hablar/interactuar.
- Q: magia.
- D: diccionario.
- I: mochila.
- J: misiones.
- P: pausa.
- T: traducción completa del diálogo.

### Jugador

Clase `Player`:

- Movimiento normalizado.
- Dirección.
- Ataque con hitbox frontal.
- Esquiva con invulnerabilidad.
- Daño y recuperación.
- Polvo al caminar.
- Estelas de esquiva.
- Aura con maná alto.

### Enemigos

Clase `Enemy`:

- Persiguen al jugador.
- Daño por contacto.
- Jefes lanzan proyectiles.
- Debilidades de palabras.
- Globos bilingües.
- Recompensas y monedas.
- Efectos de impacto.

### Efectos de combate

- Pausa breve de impacto.
- Sacudida.
- Destello.
- Números de daño.
- Partículas.
- Proyectiles con estela.
- Viñeta roja con poca vida.

---

## 9. Magia de palabras

El menú de magia solo muestra palabras aprendidas y autorizadas.

Ejemplos actuales:

- `fuego`
- `agua`
- `luz`
- `sol`
- `abrir`
- `hablar`
- `arriba`
- `calma`
- `feliz`
- `libro`
- `palabra`
- `cristal`

Cuando se añade un jefe:

- Su debilidad debe existir en `GAME_DATA.words`.
- Algún NPC anterior debe enseñar esa palabra.
- La palabra debe estar permitida en el menú de magia.

---

## 10. Diálogos y aprendizaje

Los diálogos viven en `GAME_DATA.dialogues`.

Formato:

```js
{
  speaker: 'Nombre',
  portrait: 'N',
  text: 'Frase en español.',
  ru: 'Перевод на русский.',
  keys: ['palabra']
}
```

### Resaltado seguro

Usar siempre `highlightDialogue()`.

Antes se reemplazaban palabras dentro de HTML ya generado. La palabra `dos` llegó a modificar el identificador `saludos_0`, causando símbolos rotos en el diálogo de Ana. El sistema actual procesa el texto original y escapa cada segmento.

No volver al reemplazo secuencial de HTML.

### Recompensas

- Cada frase nueva entrega dos monedas.
- La recompensa se registra en `rewardedDialogues`.
- Las monedas vuelan magnéticamente hacia el héroe.
- Una frase no puede explotarse de forma infinita.

### Coherencia jugable

Los NPC importantes dan pistas reales sobre debilidades:

- Agua contra el Caballero del Horno.
- Fuego contra el Rey de las Bestias y el Gigante de Hielo.
- Abrir contra el Señor de la Torre.
- Sol contra el Rey de la Tormenta.
- Arriba contra el Minotauro.
- Hablar contra el Caballero del Silencio.
- Calma contra el Guardián Triste.
- Luz contra Olvido.

No escribir instrucciones sobre lugares u objetivos que no existan visual o mecánicamente.

---

## 11. Diccionario

Contiene 12 temas:

1. Saludos.
2. Números y colores.
3. Familia.
4. Comida.
5. Animales.
6. Ropa y cuerpo.
7. La casa.
8. Tiempo.
9. Lugares.
10. Verbos.
11. Emociones.
12. La aventura.

Las pestañas usan una cuadrícula adaptable para evitar textos recortados.

Cada entrada incluye:

- Español.
- Ruso.
- Icono.
- Ejemplo A1.
- Estado descubierto o bloqueado.

---

## 12. Tests de etapa

Cada test tiene:

- 10 preguntas.
- Aprobación con 8 respuestas correctas.
- Preguntas español → ruso.
- Preguntas ruso → español.
- Vocabulario de tres temas.
- Escena Canvas animada con héroe y enemigos.
- Recompensa de 20 monedas.
- Persistencia en `testsPassed`.

Funciones:

- `quizQuestions()`
- `openStageQuiz()`
- `renderQuiz()`
- `animateQuizBattle()`
- `answerQuiz()`
- `finishQuiz()`

---

## 13. Tiendas e inventario

Hay ocho tiendas distribuidas entre las etapas.

Las tiendas incluyen:

- Comerciante propio.
- Diálogo.
- Puesto procedural visible.
- Etiqueta flotante `TIENDA`.
- Interfaz profesional.
- Animación de monedas gastadas.
- Sonido de compra.
- Guardado automático.

Objetos:

- Poción de vida.
- Agua mágica.
- Espada brillante.
- Pista de palabra.

Las posiciones de tienda deben comprobarse para no superponerse a lagunas, castillos o árboles. Ya se corrigió una tienda que aparecía sobre la laguna del Bosque de los Números.

---

## 14. Audio

El audio se genera con Web Audio API, sin archivos externos.

- 12 canciones, una por región.
- Efectos multicapa.
- Pasos.
- Espada.
- Impactos.
- Magia.
- Monedas.
- Compras.
- Tests.
- Jefes.

Funciones:

- `ensureAudio()`
- `tone()`
- `noise()`
- `playFx()`
- `startMusic()`
- `stopMusic()`

La música se pausa al ocultar la pestaña o pausar el juego.

---

## 15. Guardado y ranking

### Estado local

Clave:

```text
verbalia_save_v2
```

Ranking local:

```text
verbalia_ranking_v2
```

Identificador de jugador:

```text
verbalia_player_id
```

### Estado persistido

Incluye, entre otros:

- Nombre.
- Color.
- Región y posición.
- Vida y maná.
- Monedas.
- Nivel y experiencia.
- Palabras aprendidas.
- Inventario.
- Enemigos derrotados.
- Jefes.
- Misiones.
- Tests.
- Frases recompensadas.
- Tiempo de juego.

Al introducir un campo nuevo, añadir una migración defensiva en `startGame()`:

```js
state.nuevoCampo ??= valorInicial;
```

### API

- `GET /api/health`
- `GET /api/ranking`
- `GET /api/save/:playerId`
- `POST /api/save`

El servidor recalcula la puntuación del ranking.

---

## 16. Estado visual y restricciones importantes

### Lo que funciona bien y debe conservarse

- GUI integrada dentro del marco del juego.
- Barra inferior reemplazada por diálogo durante conversaciones.
- Pantalla completa proporcional.
- Textos ajustados dinámicamente.
- Tienda animada.
- Tests con escena visual.
- Efectos de combate.
- Música procedural.
- Contenido bilingüe.

### Evitar

- No añadir una cabecera exterior con el título; fue eliminada.
- No añadir un bloque separado `E · Hablar`.
- No poner diálogos fuera del escenario.
- No dejar el menú inferior visible durante diálogos.
- No integrar nuevamente los packs PNG de Kenney sin aprobación.
- No usar librerías externas.
- No depender de `fetch()` para cargar JSON local; el juego debe abrirse directamente.
- No romper el resaltado seguro de palabras.
- No añadir instrucciones narrativas que no correspondan al mapa o a una mecánica real.

---

## 17. Checklist antes de entregar cambios

1. Probar sintaxis:

```bash
npm run check
```

2. Verificar espacios y conflictos:

```bash
git diff --check
```

3. Revisar visualmente:

- HUD dentro del escenario.
- Botones superiores.
- Barra inferior.
- Diálogo sustituyendo la barra.
- Títulos regionales largos.
- Diccionario en escritorio y móvil.
- Tiendas sin superposición.
- Jefes y globos.
- Test de etapa.

4. Revisar contenido:

- Español A1 natural.
- Traducción rusa correcta.
- Palabras clave presentes literalmente en el texto.
- Debilidad enseñada y lanzable.
- Misión coherente con el mapa.

5. Confirmar que no quedan archivos generados grandes o temporales.

---

## 18. Prioridades recomendadas para próximos agentes

1. Continuar refinando el arte procedural del mundo.
2. Añadir más variantes de suelo para evitar repetición.
3. Mejorar siluetas procedurales del héroe y NPC sin usar PNG.
4. Añadir más patrones de ataque a jefes.
5. Crear colisiones reales con edificios, agua y muros.
6. Añadir interiores procedurales de tiendas y castillos.
7. Mejorar la progresión de misiones regionales.
8. Añadir revisión pedagógica adicional de vocabulario ruso-español.
9. Probar partidas completas y balance de economía.
10. Añadir tests automatizados de estado, combate y guardado.

Mantener siempre como prioridad que aprender español sea parte de la aventura, no un menú separado del juego.

---

## 19. Prototipo independiente `heroe2/`

El repositorio contiene también **Crónicas de Valdoria**, un segundo RPG creado desde cero dentro de `heroe2/`.

- Es independiente del juego educativo principal.
- Es una base de RPG normal estilo Zelda.
- Usa texto sencillo en español A1, pero todavía no incorpora ejercicios educativos.
- Usa spritesheets CC0 reales de Kenney: RPG Base, Tiny Town, Tiny Dungeon y Roguelike RPG Pack.
- Tiene mundo amplio con cámara, villa, río, bosque, cripta, NPC, tienda, tres cristales, jefe, inventario, mapa y guardado local.
- Su entrada es `heroe2/index.html`.
- Su lógica está en `heroe2/game.js`.
- Su documentación específica está en `heroe2/README.md`.
- No comparte estado, assets ni claves de guardado con el juego principal.

La preferencia de arte procedural indicada en este documento se aplica al juego educativo principal. `heroe2/` fue solicitado expresamente como experimento separado basado en assets PNG.
