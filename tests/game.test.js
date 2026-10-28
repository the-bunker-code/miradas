/**
 * Pruebas de game.js: el flujo de una ronda, las esperas y el cierre de la sesión.
 *
 * Aislamiento: audio.js y storage.js no se reemplazan; hablan con APIs del navegador
 * que aquí se simulan mínimamente:
 *   - speechSynthesis: un stub que anota cada frase (spoken) y termina enseguida.
 *   - localStorage: un Map en memoria (helpers.js).
 *   - AudioContext: no existe; audio.js ya lo trata como "sin sonido".
 * Los temporizadores y Date son simulados (mock.timers): las pruebas avanzan el reloj
 * a mano, sin esperar segundos reales.
 */

import { test, mock, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import { CONFIG } from '../js/config.js';
import { createMemoryStorage, seededRandom, useStorage } from './helpers.js';

/** @type {string[]} */
const spoken = [];

class FakeUtterance {
  /** @param {string} text */
  constructor(text) {
    this.text = text;
    /** @type {null | (() => void)} */
    this.onend = null;
    this.onerror = null;
  }
}
Object.defineProperty(globalThis, 'SpeechSynthesisUtterance', { value: FakeUtterance, configurable: true });
Object.defineProperty(globalThis, 'speechSynthesis', {
  configurable: true,
  value: {
    getVoices: () => [],
    addEventListener: () => {},
    cancel: () => {},
    /** @param {FakeUtterance} utterance */
    speak(utterance) {
      spoken.push(utterance.text);
      queueMicrotask(() => utterance.onend?.());
    },
  },
});

const restoreStorage = useStorage(createMemoryStorage());
const game = await import('../js/game.js');
const { state } = game;

/** Deja correr las promesas pendientes (los `await` de game.js). */
async function flush() {
  for (let i = 0; i < 20; i++) await Promise.resolve();
}

/**
 * Avanza el reloj simulado de a 100 ms, dejando correr las promesas entre pasos.
 * @param {number} ms
 */
async function advance(ms) {
  for (let elapsed = 0; elapsed < ms; elapsed += 100) {
    mock.timers.tick(100);
    await flush();
  }
}

/** Empieza una sesión y deja la primera ronda contada, esperando la mirada. */
async function startAndCount() {
  game.startSession();
  void game.countAndWait(); // no se espera: la promesa termina recién al pasar los 10 s
  await advance(CONFIG.round.countGapMs + 100);
  assert.equal(state.phase, 'waiting');
}

beforeEach(() => {
  mock.timers.enable({ apis: ['setTimeout', 'setInterval', 'Date'], now: 1_000_000 });
  spoken.length = 0;
  game.setRandom(seededRandom(5));
  game.chooseLevel(1);
  game.chooseAdults(1);
});

afterEach(() => {
  game.goHome();
  mock.timers.reset();
});

test('empezar muestra la primera tarjeta del nivel, sin estrellas', () => {
  game.startSession();
  assert.equal(state.screen, 'round');
  assert.equal(state.phase, 'card');
  assert.ok(state.cardId);
  assert.deepEqual(state.stars, [0, 0, 0]);
});

test('"Contar" dice uno… y dos…, y luego queda en silencio esperando', async () => {
  await startAndCount();
  assert.deepEqual(spoken, ['Uno…', 'dos…']);
});

test('"¡Me miró!" dice ¡Tres!, suma una estrella y guarda el tiempo hasta la mirada', async () => {
  await startAndCount();
  await advance(2500);
  game.looked(0);
  assert.equal(state.phase, 'looked');
  assert.deepEqual(state.stars, [1, 0, 0]);
  assert.equal(state.looks.length, 1);
  assert.ok(state.looks[0] >= 2.5 && state.looks[0] <= 2.7, `tiempo ${state.looks[0]}`);
  await flush();
  assert.equal(spoken.at(-1), '¡Tres!');
});

test('un segundo toque en "¡Me miró!" no suma otra estrella', async () => {
  await startAndCount();
  game.looked(0);
  game.looked(0);
  assert.deepEqual(state.stars, [1, 0, 0]);
  assert.equal(state.looks.length, 1);
});

test('si nadie toca en 10 s: ¡Tres!, siguiente tarjeta, sin estrella y sin registro de mirada', async () => {
  await startAndCount();
  const firstCard = state.cardId;
  await advance(CONFIG.round.lookWindowMs + 200);
  assert.equal(state.phase, 'card');
  assert.notEqual(state.cardId, firstCard);
  assert.deepEqual(state.stars, [0, 0, 0]);
  assert.deepEqual(state.looks, []);
  assert.equal(spoken.at(-1), '¡Tres!');
  // La niña nunca percibe un fracaso: no hay frase de error en nada de lo dicho.
  assert.ok(spoken.every((phrase) => !/error|inténtalo|mal/i.test(phrase)));
});

test('un toque tardío, justo después de pasar la ronda, no cuenta', async () => {
  await startAndCount();
  await advance(CONFIG.round.lookWindowMs + 200);
  game.looked(0);
  assert.deepEqual(state.stars, [0, 0, 0]);
});

test('con varios adultos, cada botón suma a su casilla y el total es del equipo', async () => {
  game.chooseAdults(3);
  await startAndCount();
  game.looked(2);
  assert.deepEqual(state.stars, [0, 0, 1]);
  game.next();
  void game.countAndWait();
  await advance(CONFIG.round.countGapMs + 100);
  game.looked(1);
  assert.deepEqual(state.stars, [0, 1, 1]);
});

test('un adulto que no juega no puede sumar', async () => {
  game.chooseAdults(2);
  await startAndCount();
  game.looked(2);
  assert.deepEqual(state.stars, [0, 0, 0]);
  assert.equal(state.phase, 'waiting');
});

test('las tarjetas no se repiten hasta agotar el nivel', async () => {
  game.startSession();
  const seen = [state.cardId];
  for (let i = 1; i < 6; i++) {
    state.phase = 'looked'; // atajo: saltamos el conteo, aquí solo se prueba el mazo
    game.next();
    seen.push(state.cardId);
  }
  assert.equal(new Set(seen).size, 6);
});

test('nivel 3: tras la mirada pide girar la pantalla; "Listo" muestra 2 opciones y la voz pregunta', async () => {
  game.chooseLevel(3);
  await startAndCount();
  game.looked(0);
  assert.equal(state.phase, 'turn');
  game.ready();
  assert.equal(state.phase, 'choose');
  assert.equal(state.options.length, 2);
  assert.ok(state.options.includes(state.cardId));
  await flush();
  assert.equal(spoken.at(-1), '¿Cómo está?');
});

test('nivel 3: elegir la correcta dice la palabra con alegría', async () => {
  game.chooseLevel(3);
  await startAndCount();
  game.looked(0);
  game.ready();
  const correct = state.cardId;
  game.chooseEmotion(correct);
  await flush();
  assert.equal(state.phase, 'modeled');
  assert.match(spoken.at(-1) ?? '', /^¡\p{L}+!$/u);
});

test('nivel 3: elegir la otra dice la palabra correcta como modelo, y la estrella ya estaba', async () => {
  game.chooseLevel(3);
  await startAndCount();
  game.looked(0);
  game.ready();
  const wrong = /** @type {string} */ (state.options.find((id) => id !== state.cardId));
  game.chooseEmotion(wrong);
  await flush();
  assert.match(spoken.at(-1) ?? '', /^Está /);
  assert.deepEqual(state.stars, [1, 0, 0]);
  assert.equal(state.phase, 'modeled');
});

test('nivel 3: una opción que no está en pantalla se ignora', async () => {
  game.chooseLevel(3);
  await startAndCount();
  game.looked(0);
  game.ready();
  const absent = ['happy', 'sad', 'surprised', 'angry'].find((id) => !state.options.includes(id)) ?? '';
  game.chooseEmotion(absent);
  assert.equal(state.phase, 'choose');
});

test('a los 4:30 la voz dice "Una más y terminamos", una sola vez', async () => {
  game.startSession();
  await advance(CONFIG.session.warnAtMs + 1000);
  assert.equal(spoken.filter((phrase) => phrase === 'Una más y terminamos').length, 1);
  await advance(5000);
  assert.equal(spoken.filter((phrase) => phrase === 'Una más y terminamos').length, 1);
});

test('entre rondas, a los 5 minutos la sesión termina y la voz dice el total', async () => {
  game.startSession();
  await advance(CONFIG.session.durationMs + 1000);
  assert.equal(state.screen, 'end');
  assert.equal(spoken.at(-1), 'Hicimos 0 estrellas');
});

test('con una ronda en curso a los 5 minutos, termina al cerrar esa ronda', async () => {
  game.startSession();
  await advance(CONFIG.session.durationMs - 4000); // faltan 4 s: la espera de la mirada cruzará los 5:00
  void game.countAndWait();
  await advance(CONFIG.round.countGapMs + 100);
  assert.equal(state.phase, 'waiting');
  await advance(4000);
  assert.equal(state.screen, 'round', 'la ronda en curso no se corta');
  game.looked(0);
  game.next();
  assert.equal(state.screen, 'end');
  assert.equal(spoken.at(-1), 'Hicimos 1 estrella');
});

test('al terminar se guarda la sesión con el promedio solo de rondas con mirada', async () => {
  await startAndCount();
  await advance(2000);
  game.looked(0);
  game.finishSession();
  const saved = state.sessions.at(-1);
  assert.equal(saved?.stars, 1);
  assert.equal(saved?.level, 1);
  assert.ok(saved?.avgLook !== null && /** @type {number} */ (saved?.avgLook) >= 2);
});

test('una sesión sin ninguna mirada guarda promedio null, no 0', () => {
  game.startSession();
  game.finishSession();
  assert.equal(state.sessions.at(-1)?.avgLook, null);
});

test('volver al inicio cancela las esperas pendientes', async () => {
  game.startSession();
  void game.countAndWait();
  await advance(300);
  game.goHome();
  await advance(CONFIG.round.lookWindowMs + 3000);
  assert.equal(state.screen, 'home');
  assert.deepEqual(state.stars, [0, 0, 0]);
});

test('borrar el progreso vacía la lista', () => {
  game.startSession();
  game.finishSession();
  assert.ok(state.sessions.length > 0);
  game.clearProgress();
  assert.deepEqual(state.sessions, []);
});

test('un nombre vacío vuelve al nombre por defecto', () => {
  game.setName(0, 'Ana');
  assert.equal(state.settings.names[0], 'Ana');
  game.setName(0, '   ');
  assert.equal(state.settings.names[0], 'Papá');
});

process.on('exit', restoreStorage);
