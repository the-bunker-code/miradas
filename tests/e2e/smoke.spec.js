/**
 * Humo: la página carga, no pide nada fuera del sitio y la CSP está activa.
 */

import { test, expect, openGame } from './fixtures.js';

test('abre en el inicio con título, niveles, adultos y Empezar', async ({ page }) => {
  await openGame(page);
  await expect(page).toHaveTitle('Miradas');
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  await expect(page.getByRole('heading', { level: 1, name: 'Miradas' })).toBeVisible();
  await expect(page.locator('#level-picker .choice')).toHaveCount(3);
  await expect(page.locator('#adult-picker .choice')).toHaveCount(3);
  await expect(page.getByRole('button', { name: 'Empezar' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Ver progreso' })).toBeVisible();
});

test('no pide nada a otros sitios y sirve la CSP estricta', async ({ page }) => {
  /** @type {string[]} */
  const external = [];
  const origin = new URL(test.info().project.use.baseURL ?? 'http://localhost').origin;
  page.on('request', (request) => {
    if (!request.url().startsWith(origin) && !request.url().startsWith('data:')) external.push(request.url());
  });
  const response = await page.goto('/');
  const csp = response?.headers()['content-security-policy'] ?? '';
  expect(csp).toContain("script-src 'self'");
  expect(csp).not.toContain('unsafe-inline');
  await expect(page.locator('#screen-home')).toBeVisible();
  expect(external).toEqual([]);
});

test('el inicio recuerda lo elegido al recargar', async ({ page }) => {
  await openGame(page);
  await page.locator('[data-action="choose-level"][data-level="3"]').click();
  await page.locator('[data-action="choose-adults"][data-count="2"]').click();
  await page.locator('#name-2').fill('Abuela');
  await page.locator('#name-2').blur();
  await page.reload();
  await expect(page.locator('[data-level="3"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-count="2"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#name-2')).toHaveValue('Abuela');
});
