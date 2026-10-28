/**
 * rules.js — Reglas puras del juego: no tocan el DOM, el audio ni el almacenamiento.
 * El azar entra por el parámetro `random` (una función que devuelve 0 ≤ n < 1),
 * así las pruebas usan una semilla y el resultado es siempre el mismo.
 */

/**
 * Baraja una copia de la lista (Fisher-Yates).
 * @template T
 * @param {readonly T[]} list
 * @param {() => number} random
 * @returns {T[]}
 */
export function shuffle(list, random) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Saca la próxima tarjeta sin repetir hasta agotar la lista. Cuando se acaba,
 * baraja de nuevo, cuidando que la primera no sea la misma que la última.
 * @param {readonly string[]} deck  Ids que faltan por salir.
 * @param {readonly string[]} allIds  Todos los ids del nivel.
 * @param {() => number} random
 * @param {string | null} [lastId]  Última tarjeta mostrada.
 * @returns {{ id: string, deck: string[] }}
 */
export function drawCard(deck, allIds, random, lastId = null) {
  let pool = [...deck];
  if (pool.length === 0) {
    pool = shuffle(allIds, random);
    if (allIds.length > 1 && pool[0] === lastId) pool.push(/** @type {string} */ (pool.shift()));
  }
  const id = /** @type {string} */ (pool.shift());
  return { id, deck: pool };
}

/**
 * Opciones del nivel 3: la correcta y otra distinta al azar, en orden al azar.
 * @param {string} correctId
 * @param {readonly string[]} emotionIds
 * @param {() => number} random
 * @returns {string[]}
 */
export function pickOptions(correctId, emotionIds, random) {
  const others = emotionIds.filter((id) => id !== correctId);
  const other = others[Math.floor(random() * others.length)];
  return shuffle([correctId, other], random);
}

/**
 * Milisegundos que faltan, nunca negativos.
 * @param {number} elapsedMs
 * @param {number} durationMs
 */
export function remainingMs(elapsedMs, durationMs) {
  return Math.max(0, durationMs - elapsedMs);
}

/**
 * "4:30" a partir de milisegundos (redondea hacia arriba: 0:00 solo cuando se acabó).
 * @param {number} ms
 */
export function formatClock(ms) {
  const totalSeconds = Math.ceil(Math.max(0, ms) / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

/**
 * Promedio de los segundos hasta la mirada. Solo cuentan rondas con mirada;
 * sin ninguna devuelve null (no 0: cero significaría "miró al instante").
 * @param {readonly number[]} looks
 * @returns {number | null}
 */
export function averageLook(looks) {
  if (looks.length === 0) return null;
  const sum = looks.reduce((total, value) => total + value, 0);
  return Math.round((sum / looks.length) * 10) / 10;
}

/**
 * Estrellas totales del equipo.
 * @param {readonly number[]} starsByAdult
 */
export function teamStars(starsByAdult) {
  return starsByAdult.reduce((total, value) => total + value, 0);
}

/**
 * Segundos entre dos instantes, con un decimal.
 * @param {number} fromMs
 * @param {number} toMs
 */
export function secondsBetween(fromMs, toMs) {
  return Math.round(Math.max(0, toMs - fromMs) / 100) / 10;
}
