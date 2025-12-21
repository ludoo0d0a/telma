import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  webServer: {
    command: 'npm start',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    env: {
      PUBLIC_URL: '/telma/',
      VITE_MAPTILER_KEY: process.env.VITE_MAPTILER_KEY || 'GET_YOUR_OWN_KEY',
    },
  },
  use: {
    baseURL: 'http://localhost:3000/telma/',
    headless: true,
  },
});
