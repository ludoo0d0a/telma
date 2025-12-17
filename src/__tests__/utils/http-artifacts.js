import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import axios from 'axios';

function truthy(v) {
  if (v === undefined || v === null) return false;
  const s = String(v).trim().toLowerCase();
  return s !== '' && s !== '0' && s !== 'false' && s !== 'no' && s !== 'off';
}

function nowIsoCompact() {
  // 2025-12-16T22:39:48.123Z -> 20251216T223948.123Z
  return new Date().toISOString().replace(/[-:]/g, '').replace('.000Z', 'Z');
}

function safePart(s, maxLen = 80) {
  return String(s ?? 'unknown')
    .replace(/https?:\/\//g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, maxLen) || 'unknown';
}

function redactHeaders(headers) {
  if (!headers || typeof headers !== 'object') return headers;
  const out = {};
  for (const [k, v] of Object.entries(headers)) {
    const key = String(k).toLowerCase();
    if (key.includes('authorization') || key.includes('api-key') || key.includes('apikey') || key.includes('token')) {
      out[k] = '[REDACTED]';
      continue;
    }
    out[k] = v;
  }
  return out;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function getArtifactsDir() {
  const root = process.env.API_TEST_ARTIFACTS_DIR
    ? path.resolve(process.cwd(), process.env.API_TEST_ARTIFACTS_DIR)
    : path.resolve(process.cwd(), 'test-artifacts', 'api');
  const dateDir = new Date().toISOString().slice(0, 10);
  return path.join(root, dateDir);
}

function getCurrentTestNameSafe() {
  // Set in src/setupTests.js (per worker)
  return globalThis.__VITEST_CURRENT_TEST__ ? String(globalThis.__VITEST_CURRENT_TEST__) : null;
}

function writeJsonArtifact(dir, fileName, payload) {
  ensureDir(dir);
  const filePath = path.join(dir, fileName);
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2) + '\n', 'utf8');
  return filePath;
}

export function installHttpArtifactsRecorder({ runId = 'api-artifacts-pre' } = {}) {
  const apiKeyPresent = Boolean(process.env.VITE_API_KEY || process.env.API_KEY || process.env.VITE_API_KEY);
  const explicit = process.env.API_TEST_RECORD;
  const enabled = explicit === '0' ? false : (explicit ? truthy(explicit) : apiKeyPresent);
  const mode = (process.env.API_TEST_RECORD_MODE || 'all').toLowerCase(); // all | fail
  const artifactsDir = getArtifactsDir();

  if (!enabled) return { enabled, mode, artifactsDir };

  const attach = (instance) => {
    if (!instance || instance.__apiArtifactsAttached) return;
    Object.defineProperty(instance, '__apiArtifactsAttached', { value: true, enumerable: false });

    instance.interceptors.request.use((config) => {
      const id = crypto.randomBytes(6).toString('hex');
      config.__apiArtifactsMeta = {
        id,
        startedAt: Date.now(),
        testName: getCurrentTestNameSafe(),
      };
      return config;
    });

    instance.interceptors.response.use(
      (response) => {
        const meta = response?.config?.__apiArtifactsMeta || {};
        const durationMs = meta.startedAt ? Date.now() - meta.startedAt : undefined;
        const testName = meta.testName || getCurrentTestNameSafe() || 'unknown_test';

        if (mode !== 'fail') {
          const method = safePart(response?.config?.method || 'GET', 10);
          const url = safePart(response?.config?.baseURL ? `${response.config.baseURL}${response.config.url}` : response?.config?.url, 120);
          const stamp = nowIsoCompact();
          const fileName = `${stamp}_${method}_${url}_${safePart(testName, 60)}_${meta.id || 'noid'}.json`;

          try {
            const filePath = writeJsonArtifact(artifactsDir, fileName, {
              meta: {
                savedAt: new Date().toISOString(),
                durationMs,
                testName,
              },
              request: {
                method: response?.config?.method,
                baseURL: response?.config?.baseURL,
                url: response?.config?.url,
                params: response?.config?.params,
                data: response?.config?.data,
                headers: redactHeaders(response?.config?.headers),
              },
              response: {
                status: response?.status,
                statusText: response?.statusText,
                headers: redactHeaders(response?.headers),
                data: response?.data,
              },
            });
          } catch (e) {
          }
        }
        return response;
      },
      (error) => {
        const response = error?.response;
        const config = error?.config;
        const meta = config?.__apiArtifactsMeta || {};
        const durationMs = meta.startedAt ? Date.now() - meta.startedAt : undefined;
        const testName = meta.testName || getCurrentTestNameSafe() || 'unknown_test';

        if (mode !== 'all') {
          const method = safePart(config?.method || 'GET', 10);
          const url = safePart(config?.baseURL ? `${config.baseURL}${config.url}` : config?.url, 120);
          const stamp = nowIsoCompact();
          const fileName = `${stamp}_${method}_${url}_${safePart(testName, 60)}_${meta.id || 'noid'}_ERROR.json`;

          try {
            const filePath = writeJsonArtifact(artifactsDir, fileName, {
              meta: {
                savedAt: new Date().toISOString(),
                durationMs,
                testName,
              },
              request: {
                method: config?.method,
                baseURL: config?.baseURL,
                url: config?.url,
                params: config?.params,
                data: config?.data,
                headers: redactHeaders(config?.headers),
              },
              error: {
                name: error?.name,
                message: error?.message,
                code: error?.code,
              },
              response: response
                ? {
                    status: response?.status,
                    statusText: response?.statusText,
                    headers: redactHeaders(response?.headers),
                    data: response?.data,
                  }
                : null,
            });
          } catch (e) {
          }
        }
        return Promise.reject(error);
      }
    );
  };

  // Attach to default axios instance, and patch axios.create for any new instances.
  attach(axios);
  if (typeof axios.create === 'function') {
    const originalCreate = axios.create.bind(axios);
    axios.create = (...args) => {
      const instance = originalCreate(...args);
      attach(instance);
      return instance;
    };
  }

  return { enabled, mode, artifactsDir };
}


