# Arquitectura y decisiones

Sin framework, sin bundler, sin TypeScript compilado en el sitio publicado. Las herramientas (ESLint, Prettier, `tsc --noEmit` sobre JSDoc, Playwright, axe-core) son solo `devDependencies`. Misma base que `Memo Colores` y `Matemáticas con Dados`.

```
toque → main.js (data-action) → game.js (acción) → state → notify() → render.js
                                   ├── rules.js    reglas puras (sin DOM ni audio)
                                   ├── audio.js    voz y tonos
                                   └── storage.js  ajustes y progreso validados
```

## Decisiones propias de este juego

**La pantalla es del adulto: misma línea gráfica, ronda sin adornos que se muevan.** El inicio y el final usan la línea de la serie (cielo, colinas, mascota, botones gruesos, tarjetas de color con disco blanco). En la ronda no hay mascota ni animaciones; cada nivel tiene su color (coral, azul, rosa, los tres temas de Memo Colores) y el tiempo restante va discreto en gris. Un botón principal de 64 px o más en la mitad inferior. La única parte pensada para la niña es la elección del nivel 3 (dos opciones grandes, un ícono y una palabra cada una). La mascota del inicio se mece 3 veces y descansa, como en Memo Colores.

**Sin sonido de error, sin mensaje de fallo.** Si pasan 10 s sin toque, la fase `missed` dice «¡Tres!» con el mismo efecto alegre y pasa sola a la siguiente tarjeta. En el nivel 3 la opción «incorrecta» solo cambia la frase de la voz («Está feliz»), con el mismo tono, y la correcta se resalta en verde claro; la otra no se marca. La estrella ya se sumó al tocar «¡Me miró!».

**No se mide la mirada sostenida.** El único tiempo que se guarda es el que pasa entre el «dos» y el toque, y solo de las rondas con mirada. Una sesión sin miradas guarda `null`, no `0` (cero significaría «miró al instante»).

**Fases como candado de toques.** `looked()` solo vale en `waiting`, `chooseEmotion()` solo en `choose`, `next()` solo en `looked`/`modeled`. Doble toque o un toque tardío no cambian nada.

**Esperas cancelables (`roundId`).** `countAndWait()` es un `async` con `await wait()`. Tocar «¡Me miró!», «Terminar» o volver al inicio sube `roundId`; la espera vieja revisa `isStale(id)` al despertar y se retira.

**El aviso de los 4:30 no corta la voz.** `maybeAnnounceLastRound()` espera a que termine la frase en curso (`lastSpeech`) y solo habla en fases tranquilas (`card`, `looked`, `modeled`), nunca durante «uno… dos…» ni durante la espera. Si la ronda cambió mientras tanto, lo intenta en el próximo momento tranquilo.

**La sesión termina al cerrar la ronda en curso.** Al llegar a los 5:00, si hay una ronda empezada (`counting`…`modeled`) se deja terminar; entre rondas (`card`) se cierra de inmediato.

**Un ícono = un concepto.** Lucide para lo que existe; cuatro caras dibujadas a mano (`face-*`) para lo que no. `tests/assets.test.js` comprueba que ningún ícono ni id se repite, que no hay emojis en el código y que ninguna frase dice «mírame».

**Nombres de adultos = texto no confiable.** Recortados al guardar y escapados al dibujar. El campo no redibuja mientras se escribe (`setName` no llama a `notify`) para no perder el cursor.

**Servidor local con puerto al azar.** `scripts/serve.js` usa el puerto `0` (el sistema elige uno libre); `playwright.config.js` elige uno al azar por corrida y lo comparte con los workers por `PW_PORT`. Solo Lighthouse CI usa el 3000 fijo, porque su URL va en `lighthouserc.json`.
