# End-to-End (E2E) Tests

This directory contains Playwright end-to-end tests that test the application from a user's perspective in a real browser environment.

## Overview

E2E tests are **completely separate** from unit tests:

- **Unit Tests** (`src/__tests__/`): Run with Vitest, test individual components and functions
- **E2E Tests** (`e2e/`): Run with Playwright, test full user workflows in a browser

## Running E2E Tests

### Run all e2e tests:
```bash
npm run test:e2e
```

### Run e2e tests with local environment variables:
```bash
npm run test:e2e:local
```
This will load variables from `.env.test.local` before running the tests.

### Run e2e tests in UI mode (interactive):
```bash
npm run test:e2e:ui
```

### Debug e2e tests:
```bash
npm run test:e2e:debug
```

### Run all tests (unit + e2e):
```bash
npm run test:all
```

## Test Structure

E2E tests are located in the `e2e/` directory and follow the naming pattern `*.spec.ts`.

### Current Tests

- `location.spec.ts` - Tests location detection and map functionality

## Configuration

E2E tests are configured in `playwright.config.ts`:

- Test directory: `./e2e`
- Base URL: `http://localhost:3000/`
- The web server is automatically started before tests run
- Screenshots are saved on test failures
- Traces are saved on first retry

## Environment Variables

When running `test:e2e:local`, environment variables are loaded from `.env.test.local`. 

The Playwright web server will use these environment variables. Make sure your `.env.test.local` file includes any necessary keys (e.g., `VITE_MAPTILER_KEY`, `VITE_API_KEY`).

## Notes

- E2E tests are excluded from Vitest runs (configured in `vite.config.ts`)
- E2E tests require a browser to run (Chromium, Firefox, or WebKit)
- Test results and screenshots are saved to `test-results/` directory
- HTML reports are saved to `playwright-report/` directory

