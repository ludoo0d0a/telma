/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';

// Get base URL from environment variable, defaulting to root
const BASE_URL = process.env.PUBLIC_URL || '/';
// Ensure base URL ends with / for consistency
const BASE_PATH = BASE_URL.endsWith('/') ? BASE_URL : `${BASE_URL}/`;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        maximumFileSizeToCacheInBytes: 3000000
      },
      includeAssets: ['favicons/favicon.ico', 'favicons/apple-touch-icon.png', 'favicons/pwa-maskable-512x512.png'],
      manifest: {
        name: 'SNCF API Explorer',
        short_name: 'SNCF API',
        description: 'An explorer for the SNCF API',
        theme_color: '#ffffff',
        start_url: BASE_URL === '/' ? '/' : BASE_PATH.slice(0, -1), // Remove trailing slash for start_url
        scope: BASE_URL === '/' ? '/' : BASE_PATH.slice(0, -1), // Ensure scope matches start_url
        icons: [
          {
            src: `${BASE_PATH}favicons/pwa-192x192.png`,
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: `${BASE_PATH}favicons/pwa-512x512.png`,
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: `${BASE_PATH}favicons/pwa-maskable-512x512.png`,
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          }
        ],
      },
    }),
  ],
  base: BASE_URL,
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  publicDir: 'public',
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/setupTests.js'],
    testTimeout: 30000,
    hookTimeout: 30000,
  },
});

