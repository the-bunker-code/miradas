/**
 * Pruebas de las reglas puras. Sin DOM, sin audio: solo datos y azar con semilla.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { CARDS_BY_LEVEL, CONFIG } from '../js/config.js';
import {
  averageLook,
  drawCard,
  formatClock,
  pickOptions,
  remainingMs,
  secondsBetween,
  shuffle,
  teamStars,
} from '../js/rules.js';
import { seededRandom } from './helpers.js';

test('shuffle conserva los elementos y no cambia la lista original', () => {
  const list = [1, 2, 3, 4, 5];
  const result = shuffle(list, seededRandom(7));
  assert.deepEqual([...result].sort(), list);
  assert.deepEqual(list, [1, 2, 3, 4, 5]);
});

test('drawCard recorre todo el nivel sin repetir hasta agotarlo', () => {
  const ids = CARDS_BY_LEVEL[1].map((card) => card.id);
  const random = seededRandom(3);
  /** @type {string[]} */
  const seen = [];
  let deck = /** @type {string[]} */ ([]);
  for (let i = 0; i < ids.length; i++) {
    const next = drawCard(deck, ids, random, seen.at(-1) ?? null);
    seen.push(next.id);
    deck = next.deck;
  }
  assert.deepEqual([...seen].sort(), [...ids].sort());
  assert.equal(deck.length, 0);
});

test('drawCard, al rebarajar, no repite la última tarjeta seguida', () => {
  const ids = ['a', 'b', 'c'];
  for (let seed = 1; seed <= 50; seed++) {
    const { id } = drawCard([], ids, seededRandom(seed), 'a');
    assert.notEqual(id, 'a');
  }
});

test('drawCard funciona con un solo id', () => {
  assert.equal(drawCard([], ['solo'], seededRandom(1), 'solo').id, 'solo');
});

test('pickOptions devuelve la correcta y otra distinta, en cualquier orden', () => {
  const ids = CONFIG.emotions.map((card) => card.id);
  const orders = new Set();
  for (let seed = 1; seed <= 60; seed++) {
    const options = pickOptions('happy', ids, seededRandom(seed));
    assert.equal(options.length, CONFIG.choiceCount);
    assert.ok(options.includes('happy'));
    assert.notEqual(options[0], options[1]);
    orders.add(options.indexOf('happy'));
  }
  assert.equal(orders.size, 2, 'la correcta cae a veces a la izquierda y a veces a la derecha');
});

test('remainingMs nunca es negativo y formatClock redondea hacia arriba', () => {
  assert.equal(remainingMs(10, 100), 90);
  assert.equal(remainingMs(500, 100), 0);
  assert.equal(formatClock(300_000), '5:00');
  assert.equal(formatClock(270_000), '4:30');
  assert.equal(formatClock(269_001), '4:30');
  assert.equal(formatClock(1), '0:01');
  assert.equal(formatClock(0), '0:00');
  assert.equal(formatClock(-5), '0:00');
});

test('averageLook promedia con un decimal y devuelve null sin miradas', () => {
  assert.equal(averageLook([]), null);
  assert.equal(averageLook([2, 3, 4.1]), 3);
  assert.equal(averageLook([1.2]), 1.2);
  assert.equal(averageLook([0]), 0, 'cero segundos es un dato real, no "sin datos"');
});

test('teamStars suma las casillas y secondsBetween usa un decimal', () => {
  assert.equal(teamStars([2, 1, 0]), 3);
  assert.equal(secondsBetween(1000, 3460), 2.5);
  assert.equal(secondsBetween(5000, 1000), 0);
});
