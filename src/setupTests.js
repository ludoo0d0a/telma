/**
 * Vitest setup file
 * This file runs before all tests
 */

import '@testing-library/jest-dom';
import { beforeEach, expect } from 'vitest';
import { installHttpArtifactsRecorder } from './__tests__/utils/http-artifacts';
import { loadEnv } from 'vite';

// #region agent log
(globalThis.fetch ? globalThis.fetch('http://127.0.0.1:7242/ingest/9d3d7068-4952-4f99-89ae-6519e28eef00',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'src/setupTests.js:11',message:'vitest setup loaded',data:{typeofDescribe:typeof globalThis.describe,typeofIt:typeof globalThis.it,typeofExpect:typeof globalThis.expect,typeofVi:typeof globalThis.vi,hasAPI_KEY:Boolean(process.env.API_KEY),hasVITE_API_KEY:Boolean(process.env.VITE_API_KEY)},timestamp:Date.now(),sessionId:'debug-session',runId:'setup',hypothesisId:'H1'})}) : Promise.resolve()).catch(()=>{});
// #endregion

// Load .env for tests (so `API_KEY` can come from .env without manual export).
// We do NOT override already-present process.env values.
try {
  const mode = process.env.MODE || process.env.NODE_ENV || 'test';
  const envFromFiles = loadEnv(mode, process.cwd(), '');
  for (const [k, v] of Object.entries(envFromFiles)) {
    if (process.env[k] === undefined) process.env[k] = v;
  }

  // Bridge common naming so tests work with VITE_API_KEY from .env
  const srcKey = process.env.VITE_API_KEY || process.env.API_KEY || process.env.REACT_APP_API_KEY;
  if (!process.env.VITE_API_KEY && srcKey) process.env.VITE_API_KEY = srcKey;
  if (!process.env.API_KEY && srcKey) process.env.API_KEY = srcKey;
  if (!process.env.REACT_APP_API_KEY && srcKey) process.env.REACT_APP_API_KEY = srcKey;

  // #region agent log
  (globalThis.fetch ? globalThis.fetch('http://127.0.0.1:7242/ingest/9d3d7068-4952-4f99-89ae-6519e28eef00',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'src/setupTests.js:30',message:'env loaded for tests (presence only)',data:{mode,hasAPI_KEY:Boolean(process.env.API_KEY),hasREACT_APP_API_KEY:Boolean(process.env.REACT_APP_API_KEY),hasVITE_API_KEY:Boolean(process.env.VITE_API_KEY)},timestamp:Date.now(),sessionId:'debug-session',runId:'env',hypothesisId:'H5'})}) : Promise.resolve()).catch(()=>{});
  // #endregion
} catch (e) {
  // #region agent log
  (globalThis.fetch ? globalThis.fetch('http://127.0.0.1:7242/ingest/9d3d7068-4952-4f99-89ae-6519e28eef00',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'src/setupTests.js:34',message:'env load failed',data:{errorName:e?.name||'Error',errorMessage:String(e?.message||e).slice(0,300)},timestamp:Date.now(),sessionId:'debug-session',runId:'env',hypothesisId:'H6'})}) : Promise.resolve()).catch(()=>{});
  // #endregion
}

// Surface (and sanitize) any unhandled errors so we can identify the real culprit behind Vitest's DataCloneError.
if (!globalThis.__AGENT_ERR_HANDLERS_INSTALLED__) {
  globalThis.__AGENT_ERR_HANDLERS_INSTALLED__ = true;
  process.on('unhandledRejection', (reason) => {
    const r = reason || {};
    const data = {
      name: r?.name,
      message: r?.message ? String(r.message).slice(0, 300) : undefined,
      isAxiosError: Boolean(r?.isAxiosError),
      code: r?.code,
      status: r?.response?.status,
      method: r?.config?.method,
      url: r?.config?.url,
    };
    // #region agent log
    (globalThis.fetch ? globalThis.fetch('http://127.0.0.1:7242/ingest/9d3d7068-4952-4f99-89ae-6519e28eef00',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'src/setupTests.js:63',message:'unhandledRejection (sanitized)',data,timestamp:Date.now(),sessionId:'debug-session',runId:'unhandled',hypothesisId:'H10'})}) : Promise.resolve()).catch(()=>{});
    // #endregion
  });
  process.on('uncaughtException', (err) => {
    const e = err || {};
    const data = { name: e?.name, message: e?.message ? String(e.message).slice(0, 300) : undefined };
    // #region agent log
    (globalThis.fetch ? globalThis.fetch('http://127.0.0.1:7242/ingest/9d3d7068-4952-4f99-89ae-6519e28eef00',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'src/setupTests.js:73',message:'uncaughtException (sanitized)',data,timestamp:Date.now(),sessionId:'debug-session',runId:'unhandled',hypothesisId:'H11'})}) : Promise.resolve()).catch(()=>{});
    // #endregion
  });
}

beforeEach(() => {
  // Track current test name for per-request artifact metadata.
  const state = expect.getState?.() || {};
  globalThis.__VITEST_CURRENT_TEST__ = state.currentTestName || null;
});

installHttpArtifactsRecorder({ runId: 'api-artifacts-pre' });

