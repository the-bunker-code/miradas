/**
 * Recorridos completos: una ronda, el tiempo agotado, varios adultos, cada nivel,
 * el final y el progreso. El reloj es simulado.
 */

import { test, expect, openGame, spoken, startAndCount } from './fixtures.js';

test('nivel 1: una ronda con mirada, de Contar a Siguiente, toma menos de 15 s', async ({ page }) => {
  await openGame(page);
  await page.getByRole('button', { name: 'Empezar' }).click();
  const first = await page.locator('.stage__title').textContent();
  await expect(page.locator('#stars')).toHaveText('0');

  await page.getByRole('button', { name: 'Contar' }).click();
  await page.clock.runFor(1500);
  await expect(page.getByRole('button', { name: '¡Me miró!' })).toBeVisible();
  await page.clock.runFor(2000);
  await page.getByRole('button', { name: '¡Me miró!' }).click();

  await expect(page.locator('#stars')).toHaveText('1');
  await expect(page.locator('.stage__big')).toHaveText('Dale el premio');
  expect(await spoken(page)).toEqual(['Uno…', 'dos…', '¡Tres!']);

  await page.getByRole('button', { name: 'Siguiente' }).click();
  await expect(page.locator('.stage__title')).not.toHaveText(first ?? '');
});

test('si nadie toca en 10 s la ronda pasa sola: sin estrella y sin ningún mensaje', async ({ page }) => {
  await openGame(page);
  await startAndCount(page);
  const first = await page.locator('.stage__title').textContent();
  await page.clock.runFor(10_500);
  await expect(page.getByRole('button', { name: 'Contar' })).toBeVisible();
  await expect(page.locator('.stage__title')).not.toHaveText(first ?? '');
  await expect(page.locator('#stars')).toHaveText('0');
  expect(await spoken(page)).toEqual(['Uno…', 'dos…', '¡Tres!']);
  await expect(page.locator('#status')).not.toContainText(/error|inténtalo|perdiste/i);
});

test('con 3 adultos hay un botón por adulto con su nombre, y todos suman al equipo', async ({ page }) => {
  await openGame(page, { adults: 3 });
  await startAndCount(page);
  const buttons = page.locator('#action button');
  await expect(buttons).toHaveCount(3);
  await expect(buttons.nth(0)).toContainText('Papá');
  await expect(buttons.nth(1)).toContainText('Mamá');
  await expect(buttons.nth(2)).toContainText('Niñera');
  await buttons.nth(2).click();
  await expect(page.locator('#stars')).toHaveText('1');
});

test('el nombre de un adulto con HTML se muestra como texto, no se ejecuta', async ({ page }) => {
  await openGame(page, { adults: 2, names: ['<img src=x onerror=alert(1)>', 'Mamá', 'Niñera'] });
  await startAndCount(page);
  await expect(page.locator('#action img')).toHaveCount(0);
  await expect(page.locator('#action button').first()).toContainText('<img src=x onerror=a');
});

test('nivel 2: la instrucción tras la mirada pide esperar sin pedir nada', async ({ page }) => {
  await openGame(page, { level: 2 });
  await startAndCount(page);
  await page.getByRole('button', { name: '¡Me miró!' }).click();
  await expect(page.locator('.stage__big')).toHaveText('Espera a ver si te imita. No se lo pidas');
});

test('nivel 3: gira la pantalla, Listo, dos opciones; sin importar la elección la estrella ya está', async ({
  page,
}) => {
  await openGame(page, { level: 3 });
  await startAndCount(page);
  await page.getByRole('button', { name: '¡Me miró!' }).click();
  await expect(page.locator('.stage__big')).toHaveText('Gira la pantalla hacia ella');
  await page.getByRole('button', { name: 'Listo' }).click();

  await expect(page.locator('button.option')).toHaveCount(2);
  expect(await spoken(page)).toContain('¿Cómo está?');

  // Elegimos siempre la primera: si no es la correcta, la voz dice "Está …" como modelo.
  await page.locator('button.option').first().click();
  await expect(page.locator('#stars')).toHaveText('1');
  expect((await spoken(page)).at(-1)).toMatch(/^(¡\p{L}+!|Está \p{L}+)$/u);
  await expect(page.locator('.option.is-model')).toHaveCount(1); // solo se resalta la correcta; nada en rojo
  await expect(page.locator('button.option')).toHaveCount(0); // ya no se pueden tocar
  await expect(page.getByRole('button', { name: 'Siguiente' })).toBeVisible();
});

test('a los 4:30 la voz avisa, a los 5:00 termina y muestra el total del equipo sin ganador', async ({ page }) => {
  await openGame(page, { adults: 2 });
  await startAndCount(page);
  await page.getByRole('button', { name: /Papá/ }).click();
  await page.getByRole('button', { name: 'Siguiente' }).click();

  await page.clock.runFor(4.5 * 60_000);
  expect(await spoken(page)).toContain('Una más y terminamos');
  await page.clock.runFor(31_000);

  await expect(page.getByRole('heading', { name: '¡Terminamos!' })).toBeVisible();
  await expect(page.locator('.end__caption')).toHaveText('1 estrella del equipo');
  const items = page.locator('.end__item');
  await expect(items).toHaveCount(2);
  await expect(items.nth(0)).toContainText('Papá');
  await expect(items.nth(1)).toContainText('Mamá');
  expect((await spoken(page)).at(-1)).toBe('Hicimos 1 estrella');
  // Un solo botón, sin "jugar otra vez".
  await expect(page.locator('#screen-end button')).toHaveCount(1);
  await expect(page.getByRole('button', { name: 'Salir' })).toBeVisible();
  await expect(page.getByText(/otra vez|ganador|ganó/i)).toHaveCount(0);

  await page.getByRole('button', { name: 'Salir' }).click();
  await expect(page.locator('#screen-home')).toBeVisible();
});

test('"Terminar" cierra la sesión en cualquier momento y guarda el progreso', async ({ page }) => {
  await openGame(page);
  await startAndCount(page);
  await page.clock.runFor(2000);
  await page.getByRole('button', { name: '¡Me miró!' }).click();
  await page.getByRole('button', { name: 'Terminar' }).click();
  await expect(page.getByRole('heading', { name: '¡Terminamos!' })).toBeVisible();
  await page.getByRole('button', { name: 'Salir' }).click();

  await page.getByRole('button', { name: 'Ver progreso' }).click();
  await expect(page.locator('.session')).toHaveCount(1);
  await expect(page.locator('.session')).toContainText('Nivel 1');
  await expect(page.locator('.session')).toContainText(/\d(,\d)? s/);
  await expect(page.locator('.chart__bar')).toHaveCount(1);
});

test('borrar datos pide confirmación; cancelar conserva y confirmar borra', async ({ page }) => {
  await openGame(page);
  await page.getByRole('button', { name: 'Empezar' }).click();
  await page.getByRole('button', { name: 'Terminar' }).click();
  await page.getByRole('button', { name: 'Salir' }).click();
  await page.getByRole('button', { name: 'Ver progreso' }).click();
  await expect(page.locator('.session')).toHaveCount(1);

  await page.getByRole('button', { name: 'Borrar datos' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Cancelar' }).click();
  await expect(page.locator('.session')).toHaveCount(1);

  await page.getByRole('button', { name: 'Borrar datos' }).click();
  await page.getByRole('button', { name: 'Borrar', exact: true }).click();
  await expect(page.locator('.session')).toHaveCount(0);
  await expect(page.getByText('Aún no hay sesiones guardadas.')).toBeVisible();
});

test('el juego funciona aunque localStorage falle', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw new DOMException('denegado', 'SecurityError');
      },
    });
  });
  await page.clock.install();
  await page.goto('/');
  await page.getByRole('button', { name: 'Empezar' }).click();
  await page.getByRole('button', { name: 'Contar' }).click();
  await page.clock.runFor(1500);
  await page.getByRole('button', { name: '¡Me miró!' }).click();
  await expect(page.locator('#stars')).toHaveText('1');
});
