# El Héroe de las Palabras

Un RPG educativo A1 para aprender español con ayuda en ruso. Construido con HTML5 Canvas, CSS y JavaScript puro, sin librerías ni recursos externos.

## Jugar

Abre `index.html` directamente en un navegador moderno. También se puede servir la carpeta con cualquier servidor estático:

```bash
python3 -m http.server 8000
```

Visita `http://localhost:8000`.

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

- Tres regiones jugables con ambientación, NPC, enemigos y jefe.
- Diálogos A1 con palabras interactivas, ejemplos y traducción rusa.
- Diccionario de 10 temas y más de 50 palabras.
- Combate, esquiva, magia de palabras, maná, monedas y partículas.
- Misiones, inventario, tienda, pociones y mejora de espada.
- Creación de héroe y clasificación local por nombre y estadísticas.
- Guardado automático de posición, progreso, palabras, objetos y jefes en `localStorage`.
- Diseño adaptable y sonidos generados con Web Audio API.

## Archivos

- `index.html`: interfaz, canvas y paneles accesibles.
- `style.css`: diseño adaptable y estética pixel-fantasy.
- `data.js`: vocabulario, regiones, diálogos y objetos.
- `main.js`: motor, renderizado, combate, menús y persistencia.

El contenido educativo está centralizado en `data.js` para facilitar futuras regiones y lecciones.
