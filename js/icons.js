/**
 * icons.js — Íconos de Lucide (https://lucide.dev, licencia ISC), sin CDN.
 * Los trazos son los oficiales de lucide-static; copiamos solo los que usa el juego.
 * Los cuatro `face-*` NO existen en Lucide (lengua, beso, dientes, sorprendido):
 * están dibujados a mano con el mismo estilo (círculo de 20, trazo de 2, extremos redondos).
 * Para agregar uno de Lucide: copia el interior de icons/<nombre>.svg y pégalo en ICON_PATHS.
 *
 * Un ícono = un concepto. No reutilices el mismo ícono para dos tarjetas distintas.
 */

/** @type {Record<string, string>} */
const ICON_PATHS = {
  'bubbles':
    '<path d="M7.001 15.085A1.5 1.5 0 0 1 9 16.5"/> <circle cx="18.5" cy="8.5" r="3.5"/> <circle cx="7.5" cy="16.5" r="5.5"/> <circle cx="7.5" cy="4.5" r="2.5"/>',
  'music':
    '<path d="M21 16V3a1 1 0 0 0-1.28-.96l-10 2.917a1 1 0 0 0-.72.96V19"/> <circle cx="18" cy="16" r="3"/> <circle cx="6" cy="19" r="3"/>',
  'plane':
    '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>',
  'toy-brick':
    '<rect width="18" height="12" x="3" y="8" rx="1"/> <path d="M10 8V5c0-.6-.4-1-1-1H6a1 1 0 0 0-1 1v3"/> <path d="M19 8V5c0-.6-.4-1-1-1h-3a1 1 0 0 0-1 1v3"/>',
  'party-popper':
    '<path d="M5.8 11.3 2 22l10.7-3.79"/> <path d="M4 3h.01"/> <path d="M22 8h.01"/> <path d="M15 2h.01"/> <path d="M22 20h.01"/> <path d="m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10"/> <path d="m22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11c-.11.7-.72 1.22-1.43 1.22H17"/> <path d="m11 2 .33.82c.34.86-.2 1.82-1.11 1.98C9.52 4.9 9 5.52 9 6.23V7"/> <path d="M11 13c1.93 1.93 2.83 4.17 2 5-.83.83-3.07-.07-5-2-1.93-1.93-2.83-4.17-2-5 .83-.83 3.07.07 5 2Z"/>',
  'feather':
    '<path d="M14.086 18.412A2 2 0 0112.67 19H5v-7.672a2 2 0 01.586-1.414L11.75 3.75a6 6 0 118.49 8.49z"/> <path d="M16 8 2 22"/> <path d="M17.488 15H9"/>',
  'eye':
    '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/> <circle cx="12" cy="12" r="3"/>',
  'eye-closed':
    '<path d="m15 18-.722-3.25"/> <path d="M2 8a10.645 10.645 0 0 0 20 0"/> <path d="m20 15-1.726-2.05"/> <path d="m4 15 1.726-2.05"/> <path d="m9 18 .722-3.25"/>',
  'smile':
    '<path d="M15 10V9"/> <path d="M16.472 15a6 6 0 01-8.943 0"/> <path d="M9 10V9"/> <circle cx="12" cy="12" r="10"/>',
  'frown': '<path d="M15 10V9"/> <path d="M9 10V9"/> <path d="M9 16a5 5 0 016 0"/> <circle cx="12" cy="12" r="10"/>',
  'angry':
    '<path d="M15 12v-1.584"/> <path d="M17 10a5 5 0 00-3 1"/> <path d="M7 10a5 5 0 013 1"/> <path d="M9 12v-1.584"/> <path d="M9 17a5 5 0 016.001 0"/> <circle cx="12" cy="12" r="10"/>',
  'star':
    '<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>',
  'clock': '<circle cx="12" cy="12" r="10"/> <path d="M12 6v6l4 2"/>',
  'x': '<path d="M18 6 6 18"/> <path d="m6 6 12 12"/>',
  'check': '<path d="M20 6 9 17l-5-5"/>',
  'play': '<path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z"/>',
  'arrow-right': '<path d="M5 12h14"/> <path d="m12 5 7 7-7 7"/>',
  'chart-column': '<path d="M3 3v16a2 2 0 0 0 2 2h16"/> <path d="M18 17V9"/> <path d="M13 17V5"/> <path d="M8 17v-3"/>',
  'trash-2':
    '<path d="M10 11v6"/> <path d="M14 11v6"/> <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/> <path d="M3 6h18"/> <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  'users':
    '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/> <path d="M16 3.128a4 4 0 0 1 0 7.744"/> <path d="M22 21v-2a4 4 0 0 0-3-3.87"/> <circle cx="9" cy="7" r="4"/>',
  'volume-2':
    '<path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/> <path d="M16 9a5 5 0 0 1 0 6"/> <path d="M19.364 18.364a9 9 0 0 0 0-12.728"/>',
  'signal-low': '<path d="M2 20h.01"/> <path d="M7 20v-4"/>',
  'signal-medium': '<path d="M2 20h.01"/> <path d="M7 20v-4"/> <path d="M12 20v-8"/>',
  'signal-high': '<path d="M2 20h.01"/> <path d="M7 20v-4"/> <path d="M12 20v-8"/> <path d="M17 20V8"/>',
  'face-tongue':
    '<circle cx="12" cy="12" r="10"/> <path d="M9 10V9"/> <path d="M15 10V9"/> <path d="M8 14h8"/> <path d="M10.5 14v3a1.5 1.5 0 0 0 3 0v-3"/>',
  'face-kiss':
    '<circle cx="12" cy="12" r="10"/> <path d="M7.5 10a1.5 1.5 0 0 1 3 0"/> <path d="M13.5 10a1.5 1.5 0 0 1 3 0"/> <circle cx="12" cy="15.5" r="1.2"/>',
  'face-teeth':
    '<circle cx="12" cy="12" r="10"/> <path d="M9 10V9"/> <path d="M15 10V9"/> <rect x="7" y="13" width="10" height="4" rx="2"/> <path d="M12 13v4"/>',
  'face-surprised':
    '<circle cx="12" cy="12" r="10"/> <path d="M9 10V9"/> <path d="M15 10V9"/> <path d="M7.5 6.5h3"/> <path d="M13.5 6.5h3"/> <circle cx="12" cy="16" r="3"/>',
};

/**
 * Devuelve el SVG de un ícono como texto.
 * Sin `label` es decorativo (aria-hidden); con `label` tiene significado propio.
 * @param {string} name
 * @param {{ size?: number, strokeWidth?: number, label?: string, className?: string, fill?: string }} [options]
 */
export function icon(name, { size = 24, strokeWidth = 2.5, label = '', className = '', fill = 'none' } = {}) {
  const paths = ICON_PATHS[name];
  if (!paths) throw new Error(`Ícono desconocido: ${name}`);
  const a11y = label ? `role="img" aria-label="${label}"` : 'aria-hidden="true"';
  return `<svg class="icon ${className}" ${a11y} width="${size}" height="${size}" viewBox="0 0 24 24" fill="${fill}" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
}

/**
 * Reemplaza cada <span data-icon="nombre"> del HTML fijo por su SVG.
 * Acepta data-size y data-stroke opcionales.
 * @param {ParentNode} root
 */
export function hydrateIcons(root = document) {
  /** @type {NodeListOf<HTMLElement>} */ (root.querySelectorAll('[data-icon]')).forEach((el) => {
    const size = Number(el.dataset.size) || 24;
    const strokeWidth = Number(el.dataset.stroke) || 2.5;
    el.innerHTML = icon(el.dataset.icon ?? '', { size, strokeWidth });
  });
}
