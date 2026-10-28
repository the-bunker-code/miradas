# Miradas

Juego tranquilo para niñas y niños de **3 a 5 años** que ayuda a buscar con la mirada la cara de un adulto, en ráfagas cortas y por iniciativa propia. Forma parte de la serie con _Matemáticas con Dados_ y _Memo Colores_. HTML, CSS y JavaScript sin framework.

## Para qué sirve (y para qué no)

El adulto cuenta «uno… dos…», se detiene, y cuando la niña lo mira dice «¡tres!» y le da un premio real (burbujas, cosquillas, una canción). Es la «pausa expectante».

- **La pantalla la ve y la toca el adulto.** Si fuera llamativa, la niña miraría el teléfono y no la cara. Por eso la ronda no tiene mascota ni animaciones, y casi todo le llega a la niña como **sonido**. La única excepción es la elección del nivel 3.
- **No mide ni premia cuánto aguanta mirando.** Forzar contacto visual sostenido estresa a muchos niños autistas. Se premia la mirada, no su duración.
- **Nunca hay fracaso:** sin sonido de error, sin cruces rojas, sin «inténtalo de nuevo», sin ganadores ni perdedores, sin la palabra «mírame».

## Cómo abrirlo

Usa módulos de JavaScript, y los navegadores **no los cargan desde `file://`** (doble clic sobre `index.html`): hace falta un servidor local. Si lo abres así, la página muestra un aviso.

```bash
npm install     # solo la primera vez (herramientas de desarrollo)
npm start       # imprime la dirección, p. ej. http://localhost:41133
```

El puerto se elige **al azar** en cada arranque, para no chocar con otros juegos abiertos. Si necesitas uno fijo: `PORT=3004 npm start`. Funciona sin internet y se puede instalar en la pantalla de inicio (service worker).

## Cómo se juega

1. **Inicio:** elige nivel (1, 2 o 3), cuántos adultos juegan (1 a 3, cada uno con un color y un nombre editable) y toca **Empezar**. La sesión dura 5 minutos.
2. **Ronda:** aparece una tarjeta. El adulto toca **Contar** y la voz dice «Uno… dos…». Luego hay silencio y aparece **¡Me miró!** (uno por adulto si son varios). Al tocarlo suena «¡Tres!», se suma **una estrella al equipo** y la pantalla dice qué hacer.
3. Si en **10 segundos** nadie toca, la voz dice «¡Tres!» igual y pasa a la siguiente tarjeta, sin estrella y sin ningún mensaje.
4. A los **4:30** la voz dice «Una más y terminamos». Al terminar la ronda en curso después de los 5:00 sale **¡Terminamos!** con el total del equipo (y lo que aportó cada adulto, en orden fijo, sin ganador). Un solo botón: **Salir**.
5. **Ver progreso:** sesiones guardadas (fecha, nivel, estrellas, tiempo promedio hasta la mirada) y un gráfico de barras.

| Nivel               | Qué hace el adulto                                            | Tarjetas                                               |
| ------------------- | ------------------------------------------------------------- | ------------------------------------------------------ |
| 1 · Junto a la cara | Pone el premio junto a su cara                                | Burbujas, canción, avión, bloque, aplausos, cosquillas |
| 2 · Muecas          | Hace una mueca mientras cuenta; espera a ver si imita         | Lengua, beso, ojos grandes, ojos cerrados, dientes     |
| 3 · ¿Cómo estoy?    | Pone una emoción; luego gira la pantalla y ella elige entre 2 | Feliz, triste, sorprendido, enojado                    |

En el nivel 3, si elige la otra opción la voz dice la palabra correcta como modelo («Está feliz»), con el mismo tono y **sin sonido de error**. La estrella se suma igual: lo que se premia es la mirada.

Cada ícono representa **siempre lo mismo** y no se reutiliza para otro concepto (lo comprueba `tests/assets.test.js`). Son íconos de [Lucide](https://lucide.dev) (ISC); cuatro caras (lengua, beso, dientes, sorprendido) no existen en Lucide y están dibujadas a mano con el mismo estilo.

## Cómo cambiar el juego: `CONFIG`

Todo lo ajustable está en `js/config.js`, en el objeto `CONFIG` de arriba. Los **textos** están aparte, en `js/copy.js`.

| Quiero…                                   | Cambio                                                                                                    |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Otra duración de sesión                   | `CONFIG.session.durationMs` (y `warnAtMs` para el aviso)                                                  |
| Más o menos tiempo para esperar la mirada | `CONFIG.round.lookWindowMs` (10 000 = 10 s)                                                               |
| Otra pausa entre «uno» y «dos»            | `CONFIG.round.countGapMs`                                                                                 |
| Agregar un premio                         | Una línea en `CONFIG.rewards` + su texto en `COPY.cards` + su ícono en `js/icons.js`                      |
| Agregar una mueca o una emoción           | Igual, en `CONFIG.faces` o `CONFIG.emotions` (las emociones también llevan su palabra en `COPY.emotions`) |
| Cuántas sesiones se guardan               | `CONFIG.maxSavedSessions`                                                                                 |
| Las frases de la voz                      | `COPY.voice` en `js/copy.js`                                                                              |

Ejemplo, premio nuevo «Abrazo»: añade `{ id: 'hug', icon: 'heart' }` a `CONFIG.rewards` (el ícono `heart` hay que copiarlo de Lucide a `ICON_PATHS` en `icons.js`, ver la cabecera de ese archivo) y `hug: { title: 'Abrazo', instruction: 'Dale un abrazo fuerte' }` a `COPY.cards`. Las pruebas avisan si falta algo.

## Cómo está hecho (para quien empieza)

```
index.html           pantallas (inicio, ronda, final, progreso) y el diálogo de borrar
css/styles.css       tokens de la serie en :root + estilos por sección
js/main.js           arranque y UN listener de clics (data-action → acción)
js/game.js           el estado y las acciones; después de cada cambio llama a render
js/render.js         dibuja la pantalla a partir del estado
js/rules.js          reglas puras: barajar, elegir tarjeta, promedios, reloj
js/config.js         CONFIG: tiempos, tarjetas, muecas, emociones
js/copy.js           todos los textos y frases de la voz
js/audio.js          voz (Web Speech) y tonos (Web Audio), sin archivos de sonido
js/storage.js        localStorage validado: ajustes y progreso
js/icons.js          íconos Lucide en SVG, sin CDN
js/dom.js            escapeHTML, variables CSS sin style="" y redibujo que cuida el foco
```

Flujo en una sola dirección: **toque → `main.js` → acción en `game.js` → cambia `state` → `render.js` dibuja.**

- **Configuración** (`config.js`, `copy.js`): solo datos. Nada de lógica.
- **Estado** (`game.js`): un objeto `state`. La **fase** de la ronda (`card`, `counting`, `waiting`, `looked`…) decide qué botones se ven y qué toques valen; así un doble toque no suma dos estrellas.
- **Esperas cancelables**: cada ronda anota un `roundId`; si el adulto toca «¡Me miró!» o sale, el número cambia y las esperas viejas se descartan solas.
- **Audio** (`audio.js`): la voz prefiere las del dispositivo (privacidad). Si no hay voz, el juego sigue y el texto grande se ve en pantalla. Los tonos duran menos de medio segundo y no hay tono de error.
- **Pantallas** (`render.js`, `index.html`): cada pantalla es una `<section hidden>`; solo una se ve y el foco pasa a ella al cambiar.
- **Registro** (`storage.js`): cada lectura y escritura va en `try/catch`; lo leído pasa por `normalizeSettings` / `normalizeSessions`. Si `localStorage` falla, el juego sigue sin guardar.

Más detalle: [ARCHITECTURE.md](ARCHITECTURE.md).

## Comandos

| Comando                 | Qué hace                                                                               |
| ----------------------- | -------------------------------------------------------------------------------------- |
| `npm start`             | Servidor local en un puerto al azar, con las cabeceras de `_headers`                   |
| `npm test`              | Pruebas unitarias (`node:test`, sin navegador)                                         |
| `npm run test:coverage` | Con cobertura mínima del 90 % en reglas, almacenamiento y estado                       |
| `npm run test:e2e`      | Recorridos en el navegador (Playwright + axe-core, 390×844 y 1366×900, puerto al azar) |
| `npm run check`         | Todo: lint, formato, tipos, sintaxis, HTML, cobertura y e2e                            |

La primera vez para e2e: `npx playwright install chromium`.

## Publicar

Es un sitio estático: sube la carpeta tal cual. **Cloudflare Pages o Netlify** leen `_headers` (CSP y demás cabeceras). **GitHub Pages** no permite cabeceras: la CSP viaja también en un `<meta>`, pero se pierden `frame-ancestors`, `Permissions-Policy` y el control de caché (ver [SECURITY.md](SECURITY.md)). `.nojekyll` ya está incluido.

## Service worker

`sw.js` guarda una copia para usar sin internet (primero la red, luego la caché). Al agregar un archivo a `js/`, agrégalo a `FILES` en `sw.js`, al `modulepreload` de `index.html` y sube `VERSION`; `tests/assets.test.js` lo comprueba. Para desactivarlo: quita el registro al final de `js/main.js` y publica; en cada dispositivo, Ajustes del navegador → Borrar datos del sitio.

## Privacidad y créditos

No se recoge nada: [PRIVACY.md](PRIVACY.md). Letra Fredoka (SIL OFL 1.1, `fonts/OFL.txt`); íconos Lucide (ISC). Licencia del código: MIT (`LICENSE`).
