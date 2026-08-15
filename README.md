# El Héroe de las Palabras

Un RPG educativo A1 para aprender español con ayuda en ruso. Construido con HTML5 Canvas, CSS y JavaScript puro, sin librerías ni recursos externos.

## Jugar

Abre `index.html` directamente en un navegador moderno. También se puede servir la carpeta con cualquier servidor estático:

```bash
python3 -m http.server 8000
```

Visita `http://localhost:8000`.

Para activar el **guardado en servidor y ranking global**, usa el servidor Node incluido:

```bash
npm start
```

No requiere instalar dependencias. El servidor escucha `PORT` (8000 por defecto) y guarda las partidas en `.server-data/players.json`. En producción conviene montar esa carpeta en un volumen persistente, o definir `VERBALIA_DATA_FILE=/ruta/persistente/players.json`. Un alojamiento puramente estático no puede compartir partidas entre jugadores; debe ejecutar `server.js`.

## Controles

| Acción | Tecla |
|---|---|
| Mover | WASD o flechas |
| Atacar | Espacio o clic izquierdo |
| Rodar | Shift |
| Hablar / interactuar | E o Enter |
| Magia | Q (E si no hay un NPC cerca) |
| Diccionario | D |
| Mochila | I |
| Misiones | J |
| Pausa | P |
| Traducción del diálogo | T |

## Incluye

- Nueve regiones jugables con paisajes únicos, nuevos NPC, enemigos parlantes y jefes.
- Diálogos A1 con palabras interactivas, ejemplos y traducción rusa.
- Diccionario de 10 temas y más de 50 palabras.
- Combate, esquiva, magia de palabras, maná, monedas y partículas.
- Misiones, inventario, tienda, pociones y mejora de espada.
- Creación de héroe y clasificación local por nombre y estadísticas.
- Guardado automático local y sincronización opcional con el servidor incluido.
- Ranking global compartido entre todos los jugadores conectados al mismo servidor.
- Tres etapas de tres regiones, con una prueba animada de seis preguntas al final de cada etapa.
- Diseño adaptable, efectos sonoros multicapa y nueve canciones dinámicas generadas con Web Audio API.
- Recompensas por aprender frases y monedas físicas que vuelan magnéticamente hacia el héroe.
- Globos de cómic A1 para los enemigos durante y después del combate.
- Escenarios pixel-art dibujados en Canvas con agua animada, vegetación, partículas, profundidad, clima regional y transiciones.
- Textos educativos revisados en español y ruso, con ejemplos naturales de nivel A1.
- Efectos de combate: sacudida, destello, pausa de impacto, daño flotante, estelas y polvo.
- Diálogos en un panel propio debajo del área de juego, sin cubrir el HUD ni la acción.

## Archivos

- `index.html`: interfaz, canvas y paneles accesibles.
- `style.css`: diseño adaptable y estética pixel-fantasy.
- `data.js`: vocabulario, regiones, diálogos y objetos.
- `main.js`: motor, renderizado, combate, menús y persistencia.

El contenido educativo está centralizado en `data.js` para facilitar futuras regiones y lecciones.
