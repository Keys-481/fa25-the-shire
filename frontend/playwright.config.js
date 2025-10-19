// ESM config
import { defineConfig, devices } from '@playwright/test';

const FRONTEND_PORT = process.env.FRONTEND_PORT ? Number(process.env.FRONTEND_PORT) : 5173;
const BACKEND_PORT = process.env.BACKEND_PORT ? Number(process.env.BACKEND_PORT) : 3000;
const HOST = '127.0.0.1';
const BASE_URL = process.env.BASE_URL || `http://${HOST}:${FRONTEND_PORT}`;

export default defineConfig({
  testDir: './tests/e2e',
  retries: 0,
  timeout: 30_000,
  expect: { timeout: 5_000 },

  use: {
    baseURL: BASE_URL,
    headless: true,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
  },

  webServer: [
    {
      command: `npm run db:setup --prefix ../backend && npm start --prefix ../backend -- --port ${BACKEND_PORT} --host ${HOST}`,
      url: `http://${HOST}:${BACKEND_PORT}`,
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
    {
      command: `npm run dev -- --port ${FRONTEND_PORT} --host ${HOST}`,
      url: `http://${HOST}:${FRONTEND_PORT}`,
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
  ],

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    // { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    // { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});