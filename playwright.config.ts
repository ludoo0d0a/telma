import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000/',
    headless: true,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'vite --mode test',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    env: {
      VITE_MAPTILER_KEY: process.env.VITE_MAPTILER_KEY || 'GET_YOUR_OWN_KEY',
    },
  },
  outputDir: 'test-results',
});
