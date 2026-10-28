/**
 * Solo teclado: una ronda completa sin ratón y sin perder el foco.
 */

import { test, expect, openGame } from './fixtures.js';

test('se puede jugar una ronda con Tab y Enter, y el foco nunca cae en <body>', async ({ page }) => {
  await openGame(page);
  await page.getByRole('button', { name: 'Empezar' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#screen-round')).toBeVisible();

  // Tras mostrar la pantalla el foco está en ella; un Tab llega al botón de Terminar y otro a Contar.
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Contar' })).toBeFocused();
  await page.keyboard.press('Enter');

  // "Contar" desaparece mientras se cuenta: al aparecer "¡Me miró!" recibe el foco solo.
  await page.clock.runFor(1500);
  await expect(page.getByRole('button', { name: '¡Me miró!' })).toBeFocused();
  await page.keyboard.press('Space');
  await expect(page.getByRole('button', { name: 'Siguiente' })).toBeFocused();
  await expect(page.locator('#stars')).toHaveText('1');
});

test('al cambiar de pantalla el foco pasa a la pantalla nueva', async ({ page }) => {
  await openGame(page);
  await page.getByRole('button', { name: 'Ver progreso' }).click();
  await expect(page.locator('#screen-progress')).toBeFocused();
  await page.getByRole('button', { name: 'Volver' }).click();
  await expect(page.locator('#screen-home')).toBeFocused();
});

test('el diálogo de borrar atrapa el foco y lo devuelve al cerrar', async ({ page }) => {
  await openGame(page);
  await page.getByRole('button', { name: 'Empezar' }).click();
  await page.getByRole('button', { name: 'Terminar' }).click();
  await page.getByRole('button', { name: 'Salir' }).click();
  await page.getByRole('button', { name: 'Ver progreso' }).click();
  const open = page.getByRole('button', { name: 'Borrar datos' });
  await open.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(open).toBeFocused();
});
