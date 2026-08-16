# Crónicas de Valdoria — Héroe 2

Nuevo prototipo RPG independiente, creado desde cero como base para un futuro modo educativo.

## Objetivo

Un juego de acción y aventura estilo Zelda con texto sencillo en español A1, pero sin ejercicios educativos por ahora.

## Ejecutar

Abre `heroe2/index.html` directamente o sirve el repositorio:

```bash
python3 -m http.server 8000
```

Después visita `http://localhost:8000/heroe2/`.

## Controles

- WASD o flechas: mover.
- Espacio o clic: atacar.
- Shift: rodar.
- E o Enter: hablar.
- J: misión.
- I: inventario.
- M: mapa.
- Escape: cerrar panel.

## Contenido

- Mundo grande con cámara dinámica.
- Villa, bosque, río, puente y cripta.
- Casas y fortaleza creadas con tiles reales.
- NPC con diálogos A1.
- Combate, enemigos y jefe.
- Tres cristales coleccionables.
- Tienda, monedas, pociones e inventario.
- Mapa, diario y HUD.
- Guardado local.
- Partículas, iluminación, sacudida y sonidos Web Audio.

## Assets

El prototipo utiliza cuatro packs CC0 de Kenney:

- RPG Base.
- Tiny Town.
- Tiny Dungeon.
- Roguelike RPG Pack.

Los spritesheets optimizados y sus licencias originales están en `heroe2/assets/`.

## Estructura

- `index.html`: interfaz.
- `style.css`: presentación fullscreen.
- `game.js`: motor completo.
- `assets/`: spritesheets y licencias.

Este juego no comparte guardado ni lógica con el juego principal.
