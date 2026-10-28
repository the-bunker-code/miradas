/**
 * Base común de los recorridos con Playwright.
 *
 * - La voz se reemplaza por un stub que anota cada frase en window.__spoken y
 *   termina enseguida. Así las pruebas pueden revisar qué dijo la app.
 * - Cualquier error o advertencia en la consola (incluidas las violaciones de
 *   la CSP) hace fallar la prueba.
 */

import { test as base, expect } from '@playwright/test';

export const SETTINGS_KEY = 'miradas:settings:v1';
export const SESSIONS_KEY = 'miradas:sessions:v1';

export const test = base.extend({
  page: async ({ page }, use) => {
    /** @type {string[]} */
    const consoleProblems = [];
    page.on('console', (message) => {
      // Este aviso lo escribe Playwright cuando bloquea el service worker (ver playwright.config.js).
      if (message.text() === 'Service Worker registration blocked by Playwright') return;
      if (message.type() === 'error' || message.type() === 'warning') consoleProblems.push(message.text());
    });
    page.on('pageerror', (error) => consoleProblems.push(error.message));

    await page.addInitScript(() => {
      const spoken = /** @type {string[]} */ ([]);
      Object.defineProperty(window, '__spoken', { value: spoken });
      Object.defineProperty(window, 'speechSynthesis', {
        configurable: true,
        value: {
          getVoices: () => [],
          addEventListener: () => {},
          cancel: () => {},
          /** @param {SpeechSynthesisUtterance} utterance */
          speak(utterance) {
            spoken.push(utterance.text);
            setTimeout(() => utterance.onend?.(/** @type {any} */ ({})), 30);
          },
        },
      });
    });

    await use(page);
    expect(consoleProblems, 'consola sin errores ni advertencias').toEqual([]);
  },
});

export { expect };

/**
 * Abre el juego con el reloj simulado (page.clock) para que 5 minutos tarden milisegundos.
 * @param {import('@playwright/test').Page} page
 * @param {Partial<Record<string, unknown>>} [settings]
 */
export async function openGame(page, settings = {}) {
  await page.addInitScript(
    ([key, value]) => {
      if (!localStorage.getItem(key)) localStorage.setItem(key, value);
    },
    [SETTINGS_KEY, JSON.stringify(settings)],
  );
  await page.clock.install();
  await page.goto('/');
  await expect(page.locator('#screen-home')).toBeVisible();
}

/**
 * Lo que dijo la voz hasta ahora.
 * @param {import('@playwright/test').Page} page
 * @returns {Promise<string[]>}
 */
export function spoken(page) {
  return page.evaluate(() => /** @type {string[]} */ (/** @type {any} */ (window).__spoken).slice());
}

/**
 * Toca "Empezar" y "Contar", y avanza el reloj hasta que aparece la espera de la mirada.
 * @param {import('@playwright/test').Page} page
 */
export async function startAndCount(page) {
  await page.getByRole('button', { name: 'Empezar' }).click();
  await page.getByRole('button', { name: 'Contar' }).click();
  await page.clock.runFor(1500);
  await expect(page.locator('#round-phase')).toHaveAttribute('data-phase', 'waiting');
}
