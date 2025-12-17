# API Schema Validation Tests

This directory contains comprehensive tests that validate API responses against the OpenAPI specification.

## Overview

These tests ensure that:
1. All API responses match the schemas defined in `public/openapi.json`
2. Required fields are present in responses
3. Field types match the schema definitions
4. Response structures are correct

## Setup

1. Install dependencies (already done):
```bash
npm install
```

2. Set your API key:
```bash
export VITE_API_KEY=your-api-key-here
# OR
export API_KEY=your-api-key-here
```

## Running Tests

Run all API validation tests:
```bash
npm test
```

Run a specific test file:
```bash
npm test -- coverage.test.js
npm test -- journeys.test.js
npm test -- places.test.js
```

Run tests in watch mode:
```bash
npm test -- --watch
```

## Test Structure

### Test Files

- `api/coverage.test.js` - Tests for coverage endpoints
- `api/journeys.test.js` - Tests for journey planning endpoints
- `api/places.test.js` - Tests for place search endpoints
- `api/departures-arrivals.test.js` - Tests for departures and arrivals
- `api/schedules.test.js` - Tests for schedule endpoints
- `api/transport-modes.test.js` - Tests for transport mode endpoints
- `api/public-transport-objects.test.js` - Tests for PT objects endpoints
- `api/reports.test.js` - Tests for reports endpoints

### Utilities

- `utils/openapi-validator.js` - Schema validation utility that:
  - Converts OpenAPI 3.0 schemas to JSON Schema format
  - Validates API responses against schemas
  - Provides detailed error messages

## How It Works

1. **Schema Conversion**: The validator converts OpenAPI 3.0 schemas to JSON Schema format using AJV
2. **Response Validation**: Each test makes an actual API call and validates the response
3. **Error Reporting**: Validation errors are formatted and displayed with field paths and error messages

## Example Test Output

When a test fails, you'll see:
- Which fields are missing or incorrect
- What types were expected vs. received
- The full path to the problematic field

Example:
```
Validation errors:
  - /departures/0/stop_point/id: must be string
  - /departures/0/stop_date_time: must have required property 'date_time'
```

## Notes

- Tests will skip if no API key is provided (they won't fail)
- Some tests may fail if the API returns unexpected data structures
- All tests handle 401 (unauthorized) and 404 (not found) errors gracefully
- Tests use real API endpoints, so they require network access

## Adding New Tests

To add tests for a new endpoint:

1. Create a new test file in `api/` or add to an existing one
2. Import the validator utilities:
```javascript
import { validateResponse, formatValidationErrors } from '../utils/openapi-validator';
```

3. Make the API call and validate:
```javascript
const response = await client.api.endpointMethod(...params);
const validation = validateResponse('/path', 'get', '200', response.data);
expect(validation.valid).toBe(true);
```

4. Add specific field checks as needed:
```javascript
expect(response.data).toHaveProperty('expectedField');
expect(typeof response.data.expectedField).toBe('string');
```

