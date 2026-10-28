/**
 * Que no se olvide un archivo y que se cumplan las reglas de la serie:
 *   - cada módulo de js/ está en el modulepreload de index.html y en FILES de sw.js;
 *   - cada tarjeta tiene texto, ícono y un ícono propio (un ícono = un concepto);
 *   - no hay emojis en el código (se usan íconos tipo Lucide);
 *   - ninguna frase pide mirar con la palabra "mírame".
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';

import { CARDS_BY_LEVEL, CONFIG } from '../js/config.js';
import { COPY } from '../js/copy.js';
import { icon } from '../js/icons.js';

const modules = readdirSync('js').filter((name) => name.endsWith('.js'));
const html = readFileSync('index.html', 'utf8');
const worker = readFileSync('sw.js', 'utf8');

test('cada módulo de js/ tiene su <link rel="modulepreload">', () => {
  for (const name of modules) assert.ok(html.includes(`href="js/${name}"`), `falta modulepreload de js/${name}`);
});

test('cada módulo de js/ está en FILES de sw.js', () => {
  for (const name of modules) assert.ok(worker.includes(`'js/${name}'`), `falta js/${name} en sw.js`);
});

test('todo lo que lista sw.js existe', () => {
  const listed = [...worker.matchAll(/^ {2}'([^']+)',$/gm)].map((match) => match[1]);
  assert.ok(listed.length > 10);
  for (const path of listed) assert.ok(existsSync(path === './' ? 'index.html' : path), `no existe ${path}`);
});

test('el manifiesto apunta a íconos que existen', () => {
  const manifest = JSON.parse(readFileSync('manifest.webmanifest', 'utf8'));
  for (const item of manifest.icons) assert.ok(existsSync(item.src), `no existe ${item.src}`);
});

test('cada tarjeta tiene texto y un ícono que existe', () => {
  for (const card of Object.values(CARDS_BY_LEVEL).flat()) {
    assert.ok(COPY.cards[/** @type {keyof typeof COPY.cards} */ (card.id)], `falta el texto de ${card.id}`);
    assert.doesNotThrow(() => icon(card.icon), `falta el ícono ${card.icon}`);
  }
  for (const emotion of CONFIG.emotions) {
    assert.ok(
      COPY.emotions[/** @type {keyof typeof COPY.emotions} */ (emotion.id)],
      `falta la palabra de ${emotion.id}`,
    );
  }
});

test('cada ícono representa un solo concepto: ninguno se repite entre tarjetas', () => {
  const icons = Object.values(CARDS_BY_LEVEL)
    .flat()
    .map((card) => card.icon);
  assert.equal(new Set(icons).size, icons.length);
  const ids = Object.values(CARDS_BY_LEVEL)
    .flat()
    .map((card) => card.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('el nivel 1 tiene 6 premios, el 2 tiene 5 muecas y el 3 tiene 4 emociones', () => {
  assert.equal(CARDS_BY_LEVEL[1].length, 6);
  assert.equal(CARDS_BY_LEVEL[2].length, 5);
  assert.equal(CARDS_BY_LEVEL[3].length, 4);
});

test('ni el código, ni el HTML, ni los textos usan emojis', () => {
  const emoji = /\p{Extended_Pictographic}/u;
  for (const name of modules) assert.ok(!emoji.test(readFileSync(`js/${name}`, 'utf8')), `emoji en js/${name}`);
  assert.ok(!emoji.test(html), 'emoji en index.html');
});

test('ninguna frase usa la palabra "mírame"', () => {
  const everything = JSON.stringify(COPY) + html;
  assert.ok(!/m[ií]rame/i.test(everything));
});
