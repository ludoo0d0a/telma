/**
 * Vitest setup file
 * This file runs before all tests
 */

import '@testing-library/jest-dom';
import { beforeEach, expect } from 'vitest';
import { installHttpArtifactsRecorder } from './__tests__/utils/http-artifacts';
import { loadEnv } from 'vite';

// Load .env for tests (so `API_KEY` can come from .env without manual export).
// We do NOT override already-present process.env values.
try {
  const mode = process.env.MODE || process.env.NODE_ENV || 'test';
  const envFromFiles = loadEnv(mode, process.cwd(), '');
  for (const [k, v] of Object.entries(envFromFiles)) {
    if (process.env[k] === undefined) process.env[k] = v;
  }

  // Bridge common naming so tests (which read API_KEY/REACT_APP_API_KEY) also work with Vite-style VITE_API_KEY.
  if (!process.env.API_KEY && process.env.VITE_API_KEY) process.env.API_KEY = process.env.VITE_API_KEY;
  if (!process.env.REACT_APP_API_KEY && process.env.VITE_API_KEY) process.env.REACT_APP_API_KEY = process.env.VITE_API_KEY;
} catch (e) {
}

beforeEach(() => {
  // Track current test name for per-request artifact metadata.
  const state = expect.getState?.() || {};
  globalThis.__VITEST_CURRENT_TEST__ = state.currentTestName || null;
});

installHttpArtifactsRecorder({ runId: 'api-artifacts-pre' });

