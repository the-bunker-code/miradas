// Recorridos reales en el navegador. Ejecutar con: npm run test:e2e
// El servidor es scripts/serve.js, que aplica las cabeceras de _headers (CSP incluida).
import { defineConfig, devices } from '@playwright/test';

// Puerto al azar en cada corrida. Playwright vuelve a cargar este archivo en cada worker,
// así que el primero lo guarda en el entorno y los demás lo heredan.
process.env.PW_PORT ??= String(20000 + Math.floor(Math.random() * 30000));
const PORT = Number(process.env.PW_PORT);

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 90_000,
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    // El service worker se prueba aparte (offline.spec.js); en el resto no debe interferir.
    serviceWorkers: 'block',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'celular-390x844',
      use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 }, hasTouch: true },
    },
    { name: 'escritorio-1366x900', use: { ...devices['Desktop Chrome'], viewport: { width: 1366, height: 900 } } },
  ],
  webServer: {
    command: 'node scripts/serve.js',
    env: { PORT: String(PORT) },
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
  },
});
