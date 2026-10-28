/**
 * WCAG 2.2 AA con axe-core en cada pantalla y cada fase, más tamaños de toque
 * (botón principal >= 64 px, mitad inferior) y movimiento reducido.
 */

import AxeBuilder from '@axe-core/playwright';
import { test, expect, openGame, startAndCount } from './fixtures.js';

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

/** @param {import('@playwright/test').Page} page */
async function expectNoViolations(page) {
  const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
}

test('inicio con 3 adultos', async ({ page }) => {
  await openGame(page, { adults: 3 });
  await expectNoViolations(page);
});

test('ronda: tarjeta, espera con varios adultos y premio', async ({ page }) => {
  await openGame(page, { adults: 3 });
  await page.getByRole('button', { name: 'Empezar' }).click();
  await expectNoViolations(page);
  await page.getByRole('button', { name: 'Contar' }).click();
  await page.clock.runFor(1500);
  await expectNoViolations(page);
  await page.getByRole('button', { name: /Papá/ }).click();
  await expectNoViolations(page);
});

test('nivel 3: elección y modelo', async ({ page }) => {
  await openGame(page, { level: 3 });
  await startAndCount(page);
  await page.getByRole('button', { name: '¡Me miró!' }).click();
  await page.getByRole('button', { name: 'Listo' }).click();
  await expectNoViolations(page);
  await page.locator('button.option').first().click();
  await expectNoViolations(page);
});

test('final, progreso y diálogo', async ({ page }) => {
  await openGame(page, { adults: 2 });
  await page.getByRole('button', { name: 'Empezar' }).click();
  await page.getByRole('button', { name: 'Terminar' }).click();
  await expectNoViolations(page);
  await page.getByRole('button', { name: 'Salir' }).click();
  await page.getByRole('button', { name: 'Ver progreso' }).click();
  await expectNoViolations(page);
  await page.getByRole('button', { name: 'Borrar datos' }).click();
  await expectNoViolations(page);
});

test('el botón principal mide >= 64 px y ocupa la mitad inferior', async ({ page }) => {
  await openGame(page);
  await page.getByRole('button', { name: 'Empezar' }).click();
  const box = await page.getByRole('button', { name: 'Contar' }).boundingBox();
  const viewport = page.viewportSize();
  expect(box).not.toBeNull();
  expect(box?.height ?? 0).toBeGreaterThanOrEqual(64);
  expect((box?.y ?? 0) + (box?.height ?? 0) / 2).toBeGreaterThan((viewport?.height ?? 0) / 2);
});

test('todos los controles táctiles miden al menos 44 px de alto', async ({ page }) => {
  await openGame(page, { adults: 3 });
  /** @param {import('@playwright/test').Locator} locator */
  async function heights(locator) {
    return locator.evaluateAll((elements) =>
      elements.filter((el) => el.getBoundingClientRect().height > 0).map((el) => el.getBoundingClientRect().height),
    );
  }
  for (const height of await heights(
    page.locator('#screen-home button, #screen-home input[type="text"], .toggle__pill'),
  )) {
    expect(height).toBeGreaterThanOrEqual(44);
  }
});

test('sin horizontal scroll a 360 px', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await openGame(page, { adults: 3 });
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});

test('sin animaciones continuas: ningún elemento anima en bucle', async ({ page }) => {
  await openGame(page);
  await page.getByRole('button', { name: 'Empezar' }).click();
  const infinite = await page.evaluate(
    () =>
      document.getAnimations().filter((animation) => animation.effect?.getComputedTiming().iterations === Infinity)
        .length,
  );
  expect(infinite).toBe(0);
});
