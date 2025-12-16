# API Schema Validation Testing

This project includes comprehensive tests to validate that all API responses match the OpenAPI specification defined in `public/openapi.json`.

## Quick Start

1. **Set your API key:**
   ```bash
   export REACT_APP_API_KEY=your-api-key-here
   ```

2. **Run tests:**
   ```bash
   npm test
   ```

## What Gets Tested

The test suite validates:

- ✅ **Response Structure**: All responses match the OpenAPI schema definitions
- ✅ **Required Fields**: All required fields are present in responses
- ✅ **Field Types**: All field types match the schema (string, number, object, array, etc.)
- ✅ **Nested Objects**: Complex nested structures are validated recursively
- ✅ **Arrays**: Array items are validated against their item schemas
- ✅ **Enums**: Enum values match the allowed values in the schema

## Test Coverage

Tests are organized by API endpoint groups:

| Test File | Endpoints Tested |
|-----------|------------------|
| `coverage.test.js` | `/coverage`, `/coverage/{coverage}` |
| `journeys.test.js` | `/coverage/{coverage}/journeys` |
| `places.test.js` | `/coverage/{coverage}/places`, `/coverage/{coverage}/places_nearby` |
| `departures-arrivals.test.js` | `/coverage/{coverage}/stop_areas/{id}/departures`, `/coverage/{coverage}/stop_areas/{id}/arrivals` |
| `schedules.test.js` | `/coverage/{coverage}/stop_schedules`, `/coverage/{coverage}/route_schedules` |
| `transport-modes.test.js` | `/coverage/{coverage}/commercial_modes`, `/coverage/{coverage}/physical_modes` |
| `public-transport-objects.test.js` | `/coverage/{coverage}/lines`, `/coverage/{coverage}/stop_areas`, `/coverage/{coverage}/pt_objects` |
| `reports.test.js` | `/coverage/{coverage}/traffic_reports`, `/coverage/{coverage}/line_reports` |

## How Validation Works

1. **Schema Conversion**: OpenAPI 3.0 schemas are converted to JSON Schema format
2. **AJV Validation**: The AJV library validates responses against JSON Schema
3. **Error Reporting**: Detailed error messages show exactly what's wrong

## Example Test

```javascript
it('should return journeys matching the schema', async () => {
    const response = await client.journeys.coverageCoverageJourneysGet(
        'sncf',
        'stop_area:SNCF:87271007',
        'stop_area:SNCF:87686006'
    );
    
    const validation = validateResponse(
        '/coverage/{coverage}/journeys',
        'get',
        '200',
        response.data
    );
    
    expect(validation.valid).toBe(true);
});
```

## Understanding Test Failures

When a test fails, you'll see output like:

```
Validation errors:
  - /journeys/0/sections/0/from: must have required property 'id'
  - /journeys/0/departure_date_time: must match pattern "^\\d{8}T\\d{6}$"
  - /departures/0/stop_point/coord/lat: must be number
```

This tells you:
- **Path**: Where in the response the error is (using JSON pointer notation)
- **Error**: What's wrong (missing field, wrong type, pattern mismatch, etc.)

## Fixing Schema Mismatches

If tests reveal that the API response doesn't match the OpenAPI spec:

1. **Check if the API changed**: The actual API might have changed
2. **Update the OpenAPI spec**: Update `public/openapi.json` to match reality
3. **Regenerate client**: Run `npm run generate-client` after updating the spec

## Running Specific Tests

```bash
# Run only coverage tests
npm test -- coverage.test.js

# Run only journeys tests
npm test -- journeys.test.js

# Run tests matching a pattern
npm test -- --testNamePattern="should return"
```

## Continuous Integration

These tests are designed to run in CI/CD pipelines:

- Tests gracefully handle missing API keys
- Tests skip when API is unavailable
- Clear error messages help identify issues quickly

## Adding New Tests

See `src/__tests__/README.md` for detailed instructions on adding new tests.

## Troubleshooting

**Tests skip automatically:**
- If `REACT_APP_API_KEY` or `API_KEY` is not set
- If API returns 401 (unauthorized)
- If API returns 404 (not found)

**Tests may fail if:**
- API response structure changed
- OpenAPI spec is outdated
- Network issues occur

**To debug:**
- Check the console output for validation errors
- Look at the response data logged in test failures
- Verify your API key is valid

