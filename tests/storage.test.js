/**
 * Pruebas de storage.js: lo que viene de localStorage nunca se confía, y el juego
 * debe funcionar aunque localStorage falle.
 */

import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  SESSIONS_KEY,
  SETTINGS_KEY,
  appendSession,
  clearSessions,
  cleanName,
  defaultSettings,
  loadSessions,
  loadSettings,
  normalizeSessions,
  normalizeSettings,
  saveSettings,
} from '../js/storage.js';
import { createMemoryStorage, useStorage } from './helpers.js';

/** @type {(() => void) | undefined} */
let restore;
afterEach(() => restore?.());

test('sin datos devuelve los ajustes por defecto', () => {
  assert.deepEqual(normalizeSettings(null), defaultSettings());
  assert.deepEqual(normalizeSettings('texto'), defaultSettings());
  assert.deepEqual(normalizeSettings([]), defaultSettings());
});

test('descarta valores fuera de las listas y completa lo que falta', () => {
  const result = normalizeSettings({ level: 9, adults: '2', voice: 'sí', sound: false, names: ['Ana'] });
  assert.equal(result.level, 1);
  assert.equal(result.adults, 1);
  assert.equal(result.voice, true);
  assert.equal(result.sound, false);
  assert.deepEqual(result.names, ['Ana', 'Mamá', 'Niñera']);
});

test('ajustes v1 reales de un dispositivo se leen igual', () => {
  const stored = { level: 3, adults: 2, names: ['Luis', 'Marta', 'Niñera'], voice: false, sound: true };
  assert.deepEqual(normalizeSettings(stored), stored);
});

test('ignora claves peligrosas (__proto__, constructor)', () => {
  const raw = JSON.parse('{"__proto__":{"polluted":true},"constructor":{"x":1},"level":2}');
  const result = normalizeSettings(raw);
  assert.equal(result.level, 2);
  assert.equal(/** @type {any} */ ({}).polluted, undefined);
  assert.deepEqual(Object.keys(result).sort(), ['adults', 'level', 'names', 'sound', 'voice']);
});

test('cleanName recorta, limita el largo y quita caracteres de control', () => {
  assert.equal(cleanName('  Ana  ', 'x'), 'Ana');
  assert.equal(cleanName('', 'Papá'), 'Papá');
  assert.equal(cleanName('   ', 'Papá'), 'Papá');
  assert.equal(cleanName(42, 'Papá'), 'Papá');
  assert.equal(cleanName('a\u0000b\nc', 'x'), 'abc');
  assert.equal(cleanName('x'.repeat(50), 'y').length, 20);
});

test('un nombre con HTML se guarda como texto (se escapa al dibujar, ver dom.js)', () => {
  assert.equal(cleanName('<img src=x onerror=alert(1)>', 'x'), '<img src=x onerror=a');
});

test('guarda y vuelve a leer ajustes', () => {
  restore = useStorage(createMemoryStorage());
  const settings = { ...defaultSettings(), level: /** @type {const} */ (2), adults: /** @type {const} */ (3) };
  saveSettings(settings);
  assert.deepEqual(loadSettings(), settings);
});

test('JSON roto en localStorage vuelve a los valores por defecto', () => {
  const storage = createMemoryStorage();
  storage.setItem(SETTINGS_KEY, '{no es json');
  storage.setItem(SESSIONS_KEY, '[[[');
  restore = useStorage(storage);
  assert.deepEqual(loadSettings(), defaultSettings());
  assert.deepEqual(loadSessions(), []);
});

test('si localStorage falla, nada lanza error', () => {
  restore = useStorage(createMemoryStorage({ failing: true }));
  assert.deepEqual(loadSettings(), defaultSettings());
  assert.doesNotThrow(() => saveSettings(defaultSettings()));
  assert.doesNotThrow(() => clearSessions());
  assert.equal(appendSession({ date: '2026-10-24T10:00:00.000Z', level: 1, stars: 2, avgLook: 1.5 }).length, 1);
});

test('normalizeSessions descarta entradas rotas y conserva las válidas', () => {
  const good = { date: '2026-10-24T10:00:00.000Z', level: 2, stars: 4, avgLook: 2.3 };
  const result = normalizeSessions([
    good,
    null,
    'texto',
    { ...good, date: 'ayer' },
    { ...good, level: 7 },
    { ...good, stars: -1 },
    { ...good, stars: 1.5 },
    { ...good, avgLook: 'rápido' },
  ]);
  assert.equal(result.length, 2);
  assert.deepEqual(result[0], good);
  assert.equal(result[1].avgLook, null, 'un promedio inválido pasa a "sin dato", la sesión se conserva');
  assert.deepEqual(normalizeSessions({ no: 'lista' }), []);
});

test('el progreso guarda como máximo las sesiones más recientes', () => {
  restore = useStorage(createMemoryStorage());
  for (let i = 0; i < 70; i++) appendSession({ date: '2026-10-24T10:00:00.000Z', level: 1, stars: i, avgLook: null });
  const sessions = loadSessions();
  assert.equal(sessions.length, 60);
  assert.equal(sessions.at(-1)?.stars, 69);
});

test('clearSessions borra el progreso pero no los ajustes', () => {
  restore = useStorage(createMemoryStorage());
  saveSettings({ ...defaultSettings(), level: 3 });
  appendSession({ date: '2026-10-24T10:00:00.000Z', level: 1, stars: 1, avgLook: null });
  clearSessions();
  assert.deepEqual(loadSessions(), []);
  assert.equal(loadSettings().level, 3);
});
