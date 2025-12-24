import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  webServer: {
    command: 'vite --mode test',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    env: {
      VITE_MAPTILER_KEY: process.env.VITE_MAPTILER_KEY || 'GET_YOUR_OWN_KEY',
    },
  },
  use: {
    baseURL: 'http://localhost:3000/',
    headless: true,
  },
});
