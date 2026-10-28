# Privacidad

Miradas la usan niñas y niños pequeños, así que la regla es: **no se recoge nada**.

## Qué se guarda

En el `localStorage` del navegador de ese dispositivo, nada más:

| Clave                 | Contenido                                                                                                |
| --------------------- | -------------------------------------------------------------------------------------------------------- |
| `miradas:settings:v1` | Nivel, cuántos adultos juegan, **los nombres que escriba el adulto** (máx. 20 caracteres), voz y sonidos |
| `miradas:sessions:v1` | Por sesión: fecha, nivel, estrellas del equipo y tiempo promedio hasta la mirada (las últimas 60)        |

No se guarda el nombre ni la edad de la niña, ni qué adulto aportó cuántas estrellas, ni ningún identificador. Los nombres de los adultos son texto libre: escribe apodos si prefieres.

## Qué sale del dispositivo

**Nada.** El juego no hace peticiones a otros sitios: letra, íconos y sonidos (generados con un oscilador) están en el propio sitio. No hay analíticas, cookies, publicidad ni registros. `tests/e2e/smoke.spec.js` falla si aparece una petición externa y la CSP del sitio también las bloquea.

Una excepción que depende del dispositivo y no del juego: la **voz**. Usa la síntesis de voz del navegador y **prefiere siempre una voz instalada en el dispositivo**. Si no hay ninguna local en español, el navegador podría ofrecer una voz de red (p. ej. las «Google» de Chrome), que envía cada frase («Uno…», «Está feliz») a un servidor del proveedor. Las frases no contienen datos personales. Para evitarlo, apaga la **Voz** en el inicio o instala una voz en español en el sistema.

## Cómo borrar los datos

- **Progreso:** en la app, _Ver progreso_ → _Borrar datos_.
- **Todo:** ajustes del navegador → Privacidad → Borrar datos del sitio. Si instalaste el juego en la pantalla de inicio, esto también borra la copia sin internet.

## Fuentes y licencias

Fredoka (SIL OFL 1.1) y los íconos de Lucide (ISC) se sirven desde este mismo sitio.
