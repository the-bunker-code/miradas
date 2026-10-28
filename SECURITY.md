# Seguridad

## Modelo de amenazas

Sitio estático, sin servidor ni cuentas. Lo único que una persona escribe son hasta tres **nombres de adultos**; todo lo demás se elige de listas cerradas.

| Amenaza                                    | Cómo se mitiga                                                                                                                                                                                              |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Inyección de HTML/JS (XSS) por los nombres | Se recortan y limitan al guardarse (`cleanName`, `storage.js`) y **siempre** pasan por `escapeHTML()` (`dom.js`) antes de llegar a `innerHTML`. Prueba e2e: un nombre `<img onerror>` se ve como texto.     |
| Datos corruptos en `localStorage`          | `normalizeSettings()` y `normalizeSessions()` aceptan solo valores de listas cerradas, ignoran `__proto__`/`constructor` y vuelven a los valores por defecto si el JSON está roto. `tests/storage.test.js`. |
| Recursos de terceros                       | Ninguno: cero peticiones externas, sin CDN.                                                                                                                                                                 |
| Clickjacking                               | `frame-ancestors 'none'` y `X-Frame-Options: DENY` desde `_headers` (no disponibles en GitHub Pages).                                                                                                       |
| Dependencias vulnerables                   | Ninguna llega al sitio: las `devDependencies` solo corren en desarrollo.                                                                                                                                    |
| Secretos                                   | No hay (`.gitignore` excluye `.env`).                                                                                                                                                                       |

## Content Security Policy

Igual que en el resto de la serie, en `_headers` y repetida en `<meta http-equiv>` para GitHub Pages: `default-src 'self'`; `script-src 'self'` y `style-src 'self'` **sin `'unsafe-inline'`** (los valores dinámicos, como la altura de las barras, se ponen con `element.style.setProperty` vía `data-vars`); `object-src 'none'`; `base-uri 'none'`; `form-action 'none'` (el diálogo de borrar usa `method="dialog"`, que no envía nada); `frame-ancestors 'none'` y `upgrade-insecure-requests` solo como cabecera.

Otras cabeceras: `nosniff`, `Referrer-Policy: no-referrer`, `Permissions-Policy` (cámara, micrófono, geolocalización y más, desactivados), `Cross-Origin-Opener-Policy` y `Resource-Policy: same-origin`. Caché: HTML, CSS, JS y `sw.js` con `no-cache`; la letra, versionada, un año.

## Limitaciones de GitHub Pages

No permite cabeceras propias. Con la CSP en `<meta>` se conserva casi todo, pero **se pierde**: `frame-ancestors`/`X-Frame-Options`, `Permissions-Policy`, COOP/CORP y el control de caché. Cloudflare Pages o Netlify leen `_headers` completo.

## Service worker

`sw.js` atiende solo GET del mismo origen, «primero la red». No intercepta otros orígenes.

## Reportar un problema

Abre un _issue_ en el repositorio o escribe a los autores (ver `package.json`).
