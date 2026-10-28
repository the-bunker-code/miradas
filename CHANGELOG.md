# Cambios

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).

## [1.0.0] — 2026-10-24

Primera versión.

### Agregado

- Niveles 1 (premios junto a la cara), 2 (muecas) y 3 (¿cómo estoy?), con 1 a 3 adultos de color y nombre propios.
- Sesión de 5 minutos con aviso a los 4:30, estrellas del equipo, pausa expectante de 10 s sin mensaje de fallo.
- Progreso guardado (fecha, nivel, estrellas, tiempo promedio hasta la mirada) con gráfico de barras y borrado con confirmación.
- Voz en español (prefiere voces del dispositivo) y tonos con Web Audio; funciona sin voz, sin sonido y sin `localStorage`.
- Sin internet y instalable (`sw.js`, `manifest.webmanifest`). CSP estricta (`_headers` y `<meta>`).
- Pruebas: unitarias (`node:test`) y recorridos en el navegador (Playwright + axe-core). Tipos con JSDoc, ESLint, Prettier, validación de HTML, CI y Lighthouse CI.
- Servidor local en puerto al azar.
