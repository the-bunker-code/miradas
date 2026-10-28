/**
 * game.js — Estado de la sesión y las acciones del adulto.
 * Único módulo que modifica `state`. Después de cada cambio llama a notify() y
 * render.js vuelve a dibujar. Las esperas (await wait()) se cancelan con `roundId`:
 * cada tarea guarda el suyo y revisa isStale(id) al despertar.
 *
 * Fases de una ronda (state.phase), que también funcionan como candado de toques:
 *   card      tarjeta a la vista, botón "Contar"
 *   counting  la voz dice "uno… dos…"
 *   waiting   silencio; botón(es) "¡Me miró!" durante CONFIG.round.lookWindowMs
 *   missed    pasó el tiempo: "¡tres!" y siguiente tarjeta (sin mensaje alguno)
 *   looked    nivel 1 y 2, mirada registrada: instrucción del premio
 *   turn      nivel 3: "Gira la pantalla hacia ella"
 *   choose    nivel 3: dos opciones
 *   modeled   nivel 3: la voz dijo la palabra; botón "Siguiente"
 */

import { configureAudio, playCheerTone, playCountTone, say, stopSpeaking, unlockAudio } from './audio.js';
import { CARDS_BY_LEVEL, CONFIG } from './config.js';
import { COPY } from './copy.js';
import { averageLook, drawCard, pickOptions, secondsBetween, teamStars } from './rules.js';
import { appendSession, clearSessions, cleanName, loadSessions, loadSettings, saveSettings } from './storage.js';

/** @typedef {'card'|'counting'|'waiting'|'missed'|'looked'|'turn'|'choose'|'modeled'} Phase */
/** @typedef {'home'|'round'|'end'|'progress'} Screen */

/**
 * @typedef {Object} GameState
 * @property {Screen} screen
 * @property {import('./storage.js').Settings} settings
 * @property {import('./storage.js').SavedSession[]} sessions  Progreso guardado.
 * @property {Phase} phase
 * @property {string} cardId
 * @property {string[]} deck  Tarjetas que faltan por salir en este nivel.
 * @property {string[]} options  Nivel 3: ids de las dos opciones.
 * @property {string | null} chosenId  Nivel 3: lo que eligió la niña.
 * @property {number[]} stars  Estrellas por adulto (siempre 3 casillas).
 * @property {number[]} looks  Segundos hasta la mirada, solo de rondas con mirada.
 * @property {number} elapsedMs
 * @property {boolean} timeUp  Ya pasaron los 5 minutos: termina al cerrar la ronda.
 */

/** @type {GameState} */
export const state = {
  screen: 'home',
  settings: loadSettings(),
  sessions: loadSessions(),
  phase: 'card',
  cardId: '',
  deck: [],
  options: [],
  chosenId: null,
  stars: [0, 0, 0],
  looks: [],
  elapsedMs: 0,
  timeUp: false,
};

// --- Piezas internas -------------------------------------------------------

/** @type {Array<() => void>} */
const listeners = [];
let roundId = 0;
let startedAt = 0;
let waitStartedAt = 0;
/** @type {ReturnType<typeof setInterval> | undefined} */
let clockTimer;
let warnSpoken = false;
let lastSpeech = Promise.resolve();
let random = Math.random;

/** Cambia el generador de azar (las pruebas pasan uno con semilla). @param {() => number} fn */
export function setRandom(fn) {
  random = fn;
}

/** @param {() => void} listener */
export function onChange(listener) {
  listeners.push(listener);
}

function notify() {
  for (const listener of listeners) listener();
  maybeAnnounceLastRound();
}

/** @param {number} ms */
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
/** @param {number} id */
const isStale = (id) => id !== roundId;

/** Dice una frase y recuerda cuándo termina, para no cortar la anterior con el aviso. @param {string} text */
function speak(text) {
  lastSpeech = say(text);
  return lastSpeech;
}

/** Puede mantenerse en la lista de ids de un nivel. */
function levelCardIds() {
  return CARDS_BY_LEVEL[state.settings.level].map((card) => card.id);
}

/** Siguiente tarjeta del nivel, sin repetir hasta agotar la lista. */
function drawNext() {
  const ids = levelCardIds();
  const next = drawCard(state.deck, ids, random, state.cardId || null);
  state.cardId = next.id;
  state.deck = next.deck;
  state.options = [];
  state.chosenId = null;
  state.phase = 'card';
}

function stopClock() {
  clearInterval(clockTimer);
  clockTimer = undefined;
}

// --- Ajustes (pantalla de inicio) ------------------------------------------

function persistSettings() {
  saveSettings(state.settings);
  configureAudio(state.settings);
}

/** @param {import('./config.js').LevelId} level */
export function chooseLevel(level) {
  state.settings.level = level;
  persistSettings();
  notify();
}

/** @param {import('./config.js').AdultCount} adults */
export function chooseAdults(adults) {
  state.settings.adults = adults;
  persistSettings();
  notify();
}

/**
 * Guarda el nombre de un adulto. No llama a notify(): quien escribe tiene el cursor
 * en el campo y un redibujo se lo quitaría.
 * @param {number} index
 * @param {string} value
 */
export function setName(index, value) {
  if (index < 0 || index >= state.settings.names.length) return;
  state.settings.names[index] = cleanName(value, COPY.defaultNames[index]);
  persistSettings();
}

/** @param {'voice'|'sound'} key @param {boolean} on */
export function setToggle(key, on) {
  state.settings[key] = on;
  persistSettings();
  notify();
}

// --- Sesión ----------------------------------------------------------------

/** Empieza una sesión de 5 minutos. Se llama desde un toque: desbloquea el audio. */
export function startSession() {
  unlockAudio();
  configureAudio(state.settings);
  roundId++;
  stopClock();
  state.stars = [0, 0, 0];
  state.looks = [];
  state.deck = [];
  state.cardId = '';
  state.elapsedMs = 0;
  state.timeUp = false;
  warnSpoken = false;
  startedAt = Date.now();
  clockTimer = setInterval(tick, 1000);
  drawNext();
  state.screen = 'round';
  notify();
}

function tick() {
  state.elapsedMs = Date.now() - startedAt;
  if (state.elapsedMs >= CONFIG.session.durationMs) {
    state.timeUp = true;
    // Entre rondas se cierra ya; con una ronda en curso se espera a que termine.
    if (state.phase === 'card') {
      finishSession();
      return;
    }
  }
  notify();
}

/**
 * A los 4:30 la voz dice "Una más y terminamos", pero solo cuando no hay una frase
 * o un silencio de espera de por medio (no queremos cortar el "tres").
 */
async function maybeAnnounceLastRound() {
  if (state.screen !== 'round' || warnSpoken || state.elapsedMs < CONFIG.session.warnAtMs) return;
  if (!['card', 'looked', 'modeled'].includes(state.phase)) return;
  warnSpoken = true;
  const id = roundId;
  await lastSpeech;
  if (isStale(id) || !['card', 'looked', 'modeled'].includes(state.phase)) {
    warnSpoken = false; // la ronda cambió mientras tanto: se intenta en el próximo momento tranquilo
    return;
  }
  speak(COPY.voice.lastOne);
}

/** Cierra la sesión: guarda el progreso, muestra el final y la voz dice el total. */
export function finishSession() {
  roundId++;
  stopClock();
  const total = teamStars(state.stars);
  state.sessions = appendSession({
    date: new Date().toISOString(),
    level: state.settings.level,
    stars: total,
    avgLook: averageLook(state.looks),
  });
  state.screen = 'end';
  notify();
  speak(COPY.voice.total(total));
}

/** Vuelve al inicio (desde el final o el progreso). */
export function goHome() {
  roundId++;
  stopClock();
  stopSpeaking();
  state.screen = 'home';
  notify();
}

export function showProgress() {
  state.sessions = loadSessions();
  state.screen = 'progress';
  notify();
}

export function clearProgress() {
  clearSessions();
  state.sessions = [];
  notify();
}

// --- Ronda -----------------------------------------------------------------

/** Pasa a la tarjeta siguiente, o al final si ya se acabó el tiempo. */
function advance() {
  if (state.timeUp) {
    finishSession();
    return;
  }
  drawNext();
  notify();
}

/** "Contar": uno… dos… y luego silencio esperando la mirada. */
export async function countAndWait() {
  if (state.screen !== 'round' || state.phase !== 'card') return;
  const id = ++roundId;
  state.phase = 'counting';
  notify();

  playCountTone();
  await Promise.all([speak(COPY.voice.one), wait(CONFIG.round.countGapMs)]);
  if (isStale(id)) return;
  playCountTone();
  await speak(COPY.voice.two);
  if (isStale(id)) return;

  waitStartedAt = Date.now();
  state.phase = 'waiting';
  notify();

  await wait(CONFIG.round.lookWindowMs);
  if (isStale(id)) return;

  // Nadie tocó el botón: "¡Tres!" igual y a la siguiente tarjeta, sin estrella y sin mensaje.
  state.phase = 'missed';
  notify();
  playCheerTone();
  await speak(COPY.voice.three);
  if (isStale(id)) return;
  advance();
}

/**
 * Un adulto toca "¡Me miró!": suma una estrella al equipo (a su casilla) y registra el tiempo.
 * @param {number} adultIndex
 */
export function looked(adultIndex) {
  if (state.phase !== 'waiting' || adultIndex < 0 || adultIndex >= state.settings.adults) return;
  roundId++; // cancela el temporizador de los 10 s
  state.stars[adultIndex]++;
  state.looks.push(secondsBetween(waitStartedAt, Date.now()));
  state.phase = state.settings.level === 3 ? 'turn' : 'looked';
  notify();
  playCheerTone();
  speak(COPY.voice.three);
}

/** Nivel 3, "Listo": aparecen las dos opciones y la voz pregunta. */
export function ready() {
  if (state.phase !== 'turn') return;
  state.options = pickOptions(
    state.cardId,
    CONFIG.emotions.map((card) => card.id),
    random,
  );
  state.phase = 'choose';
  notify();
  speak(COPY.voice.howIs);
}

/**
 * Nivel 3: la niña elige. Acierte o no, la estrella ya se sumó con la mirada;
 * la voz solo dice la palabra correcta, con el mismo tono y sin sonido de error.
 * @param {string} emotionId
 */
export function chooseEmotion(emotionId) {
  if (state.phase !== 'choose' || !state.options.includes(emotionId)) return;
  state.chosenId = emotionId;
  state.phase = 'modeled';
  const emotion = COPY.emotions[/** @type {keyof typeof COPY.emotions} */ (state.cardId)];
  notify();
  if (emotionId === state.cardId) {
    playCheerTone();
    speak(emotion.cheer);
  } else {
    speak(emotion.model);
  }
}

/** "Siguiente", cuando la ronda ya tuvo su mirada. */
export function next() {
  if (state.phase !== 'looked' && state.phase !== 'modeled') return;
  advance();
}
