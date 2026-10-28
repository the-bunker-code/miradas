/**
 * Sin internet: después de una visita, el service worker abre el juego igual.
 */

import { test, expect } from './fixtures.js';

test.use({ serviceWorkers: 'allow' });

test('con el service worker activo, el juego abre y se juega sin internet', async ({ page, context }) => {
  await page.goto('/');
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload(); // la segunda carga ya pasa por el service worker
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });

  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('#screen-home')).toBeVisible();
  await page.getByRole('button', { name: 'Empezar' }).click();
  await expect(page.getByRole('button', { name: 'Contar' })).toBeVisible();
  await context.setOffline(false);
});
