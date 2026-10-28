/**
 * main.js — Punto de entrada. Conecta las piezas y escucha los toques.
 * Un solo listener en `document` busca el botón con `data-action` más cercano y
 * llama a su manejador en ACTIONS. Así no hay `onclick` en el HTML y los botones
 * que render.js crea de nuevo funcionan sin volver a registrar nada.
 */

import {
  chooseAdults,
  chooseEmotion,
  chooseLevel,
  clearProgress,
  countAndWait,
  finishSession,
  goHome,
  looked,
  next,
  onChange,
  ready,
  setName,
  setToggle,
  showProgress,
  startSession,
  state,
} from './game.js';
import { hydrateIcons } from './icons.js';
import { mascotSVG } from './mascot.js';
import { render } from './render.js';

/**
 * Cada acción recibe el elemento tocado y lee sus data-*. Esos valores los escribe
 * render.js a partir de config.js, por eso se tratan como ids válidos.
 * @type {Record<string, (el: HTMLElement) => void>}
 */
const ACTIONS = {
  'choose-level': (el) => chooseLevel(/** @type {import('./config.js').LevelId} */ (Number(el.dataset.level))),
  'choose-adults': (el) => chooseAdults(/** @type {import('./config.js').AdultCount} */ (Number(el.dataset.count))),
  'start': () => startSession(),
  'show-progress': () => showProgress(),
  'go-home': () => goHome(),
  'finish': () => finishSession(),
  'count': () => void countAndWait(),
  'looked': (el) => looked(Number(el.dataset.adult)),
  'ready': () => ready(),
  'choose-emotion': (el) => chooseEmotion(el.dataset.value ?? ''),
  'next': () => next(),
  'ask-clear': () => confirmDialog().showModal(),
};

function confirmDialog() {
  const dialog = document.getElementById('confirm-clear');
  if (!(dialog instanceof HTMLDialogElement)) throw new Error('Falta #confirm-clear en index.html');
  return dialog;
}

/** @param {MouseEvent} event */
function handleAction(event) {
  if (!(event.target instanceof Element)) return;
  const el = event.target.closest('[data-action]');
  if (!(el instanceof HTMLElement)) return;
  ACTIONS[el.dataset.action ?? '']?.(el);
}

/** Campos de la pantalla de inicio: nombres de los adultos y las dos casillas. @param {Event} event */
function handleChange(event) {
  const field = event.target;
  if (!(field instanceof HTMLInputElement)) return;
  if (field.dataset.adult !== undefined) setName(Number(field.dataset.adult), field.value);
  else if (field.id === 'setting-voice') setToggle('voice', field.checked);
  else if (field.id === 'setting-sound') setToggle('sound', field.checked);
}

// Todos los controles son <button>, que ya responden a Enter y Espacio con un "click".
document.addEventListener('click', handleAction);
document.addEventListener('change', handleChange);

function boot() {
  document.getElementById('boot-warning')?.remove();
  hydrateIcons();
  document.getElementById('home-mascot')?.insertAdjacentHTML('beforeend', mascotSVG('idle'));
  document.getElementById('end-mascot')?.insertAdjacentHTML('beforeend', mascotSVG('happy'));
  confirmDialog().addEventListener('close', () => {
    if (confirmDialog().returnValue === 'clear') clearProgress();
  });
  onChange(() => render(state));
  render(state);
}

boot();

// Offline (sw.js). Requiere contexto seguro; si falla, el juego solo pierde el modo offline.
if ('serviceWorker' in navigator && window.isSecureContext) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
