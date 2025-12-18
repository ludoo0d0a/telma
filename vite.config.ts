/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';

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
        icons: [
          {
            src: 'favicons/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'favicons/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'favicons/pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          }
        ],
      },
    }),
  ],
  base: process.env.PUBLIC_URL || '/telma/',
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

