// @ts-check
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: process.env.BASE_URL || `http://127.0.0.1:${process.env.FRONTEND_PORT || 5173}`,
    trace: 'on-first-retry',
  },
});