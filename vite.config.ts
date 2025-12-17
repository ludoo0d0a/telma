import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// #region agent log
(globalThis.fetch ? globalThis.fetch('http://127.0.0.1:7242/ingest/9d3d7068-4952-4f99-89ae-6519e28eef00',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'vite.config.ts:5',message:'vite/vitest config evaluated',data:{hasGlobalFetch:typeof globalThis.fetch==='function'},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H2'})}) : Promise.resolve()).catch(()=>{});
// #endregion

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
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

