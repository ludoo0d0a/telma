/**
 * Vitest setup file
 * This file runs before all tests
 */

import React from 'react';
import '@testing-library/jest-dom';
import { beforeEach, expect, vi } from 'vitest';
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

  // Bridge common naming so tests work with VITE_API_KEY from .env
  const srcKey = process.env.VITE_API_KEY || process.env.API_KEY || process.env.REACT_APP_API_KEY;
  if (!process.env.VITE_API_KEY && srcKey) process.env.VITE_API_KEY = srcKey;
  if (!process.env.API_KEY && srcKey) process.env.API_KEY = srcKey;
  if (!process.env.REACT_APP_API_KEY && srcKey) process.env.REACT_APP_API_KEY = srcKey;
} catch (e) {
  // Error loading env
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
  });
  process.on('uncaughtException', (err) => {
    const e = err || {};
    const data = { name: e?.name, message: e?.message ? String(e.message).slice(0, 300) : undefined };
  });
}

beforeEach(() => {
  // Track current test name for per-request artifact metadata.
  const state = expect.getState?.() || {};
  globalThis.__VITEST_CURRENT_TEST__ = state.currentTestName || null;
});

installHttpArtifactsRecorder({ runId: 'api-artifacts-pre' });

// Mock the @react-oauth/google library to prevent errors in tests
vi.mock('@react-oauth/google', () => ({
  GoogleOAuthProvider: ({ children }) => children,
  GoogleLogin: () => <button>Login with Google</button>,
  useGoogleLogin: () => () => {
    // Mock function that does nothing when called
    console.log('Mock useGoogleLogin called');
  },
}));
