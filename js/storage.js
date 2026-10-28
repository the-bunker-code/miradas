/**
 * storage.js — Ajustes y progreso en localStorage.
 * localStorage puede fallar (modo privado, lleno, datos viejos). Toda lectura y
 * escritura va en try/catch y todo lo que se lee pasa por una función normalize*
 * antes de usarse: nada guardado se confía.
 */

import { ADULT_COUNTS, CONFIG, LEVEL_IDS } from './config.js';
import { COPY } from './copy.js';

export const SETTINGS_KEY = 'miradas:settings:v1';
export const SESSIONS_KEY = 'miradas:sessions:v1';

/**
 * @typedef {Object} Settings
 * @property {import('./config.js').LevelId} level
 * @property {import('./config.js').AdultCount} adults  Cuántos adultos juegan.
 * @property {string[]} names  Un nombre por adulto (siempre 3; se usan los primeros `adults`).
 * @property {boolean} voice
 * @property {boolean} sound
 */

/**
 * @typedef {Object} SavedSession
 * @property {string} date  ISO 8601.
 * @property {import('./config.js').LevelId} level
 * @property {number} stars
 * @property {number | null} avgLook  Segundos; null si ninguna ronda tuvo mirada.
 */

/** @returns {Settings} */
export function defaultSettings() {
  return { level: 1, adults: 1, names: [...COPY.defaultNames], voice: true, sound: true };
}

/**
 * Un nombre escrito por una persona: recorta, quita caracteres de control y limita el largo.
 * Vacío vuelve al nombre por defecto.
 * @param {unknown} value
 * @param {string} fallback
 */
export function cleanName(value, fallback) {
  if (typeof value !== 'string') return fallback;
  // Fuera caracteres de control (códigos 0-31 y 127): saltos de línea, nulos, etc.
  const printable = Array.from(value).filter((char) => {
    const code = char.charCodeAt(0);
    return code > 31 && code !== 127;
  });
  const text = printable.join('').trim().slice(0, CONFIG.adults.nameMaxLength);
  return text || fallback;
}

/**
 * Ajustes válidos: descarta lo inválido y completa lo que falte.
 * @param {unknown} raw
 * @returns {Settings}
 */
export function normalizeSettings(raw) {
  const defaults = defaultSettings();
  const input = raw && typeof raw === 'object' ? /** @type {Record<string, unknown>} */ (raw) : {};
  const names = Array.isArray(input.names) ? input.names : [];
  return {
    level: LEVEL_IDS.includes(/** @type {any} */ (input.level)) ? /** @type {any} */ (input.level) : defaults.level,
    adults: ADULT_COUNTS.includes(/** @type {any} */ (input.adults))
      ? /** @type {any} */ (input.adults)
      : defaults.adults,
    names: defaults.names.map((fallback, index) => cleanName(names[index], fallback)),
    voice: typeof input.voice === 'boolean' ? input.voice : defaults.voice,
    sound: typeof input.sound === 'boolean' ? input.sound : defaults.sound,
  };
}

/**
 * Lista de sesiones válida: descarta entradas rotas y conserva las más recientes.
 * @param {unknown} raw
 * @returns {SavedSession[]}
 */
export function normalizeSessions(raw) {
  if (!Array.isArray(raw)) return [];
  /** @type {SavedSession[]} */
  const sessions = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const { date, level, stars, avgLook } = /** @type {Record<string, unknown>} */ (item);
    if (typeof date !== 'string' || Number.isNaN(Date.parse(date))) continue;
    if (!LEVEL_IDS.includes(/** @type {any} */ (level))) continue;
    if (!Number.isInteger(stars) || /** @type {number} */ (stars) < 0 || /** @type {number} */ (stars) > 999) continue;
    const look =
      typeof avgLook === 'number' && Number.isFinite(avgLook) && avgLook >= 0 && avgLook <= 60 ? avgLook : null;
    sessions.push({
      date,
      level: /** @type {any} */ (level),
      stars: /** @type {number} */ (stars),
      avgLook: look,
    });
  }
  return sessions.slice(-CONFIG.maxSavedSessions);
}

/**
 * @param {string} key
 * @returns {unknown}
 */
function readJSON(key) {
  try {
    const text = globalThis.localStorage?.getItem(key);
    return text ? JSON.parse(text) : null;
  } catch {
    return null; // sin almacenamiento o JSON roto: se usan los valores por defecto
  }
}

/**
 * @param {string} key
 * @param {unknown} value
 */
function writeJSON(key, value) {
  try {
    globalThis.localStorage?.setItem(key, JSON.stringify(value));
  } catch {
    // Si no se puede guardar, el juego sigue con los datos en memoria.
  }
}

/** @returns {Settings} */
export function loadSettings() {
  return normalizeSettings(readJSON(SETTINGS_KEY));
}

/** @param {Settings} settings */
export function saveSettings(settings) {
  writeJSON(SETTINGS_KEY, normalizeSettings(settings));
}

/** @returns {SavedSession[]} */
export function loadSessions() {
  return normalizeSessions(readJSON(SESSIONS_KEY));
}

/**
 * Agrega una sesión y devuelve la lista guardada.
 * @param {SavedSession} session
 * @returns {SavedSession[]}
 */
export function appendSession(session) {
  const sessions = normalizeSessions([...loadSessions(), session]);
  writeJSON(SESSIONS_KEY, sessions);
  return sessions;
}

/** Borra el progreso (no los ajustes). */
export function clearSessions() {
  try {
    globalThis.localStorage?.removeItem(SESSIONS_KEY);
  } catch {
    // Nada que borrar si no hay almacenamiento.
  }
}
