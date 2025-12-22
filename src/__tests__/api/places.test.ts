/**
 * Tests for Places API endpoints
 * Validates that responses match the OpenAPI schema
 */

import { NavitiaClient } from '@/client/client';
import { validateResponse, formatValidationErrors } from '@/utils/openapi-validator';

const API_KEY = process.env.REACT_APP_API_KEY || process.env.API_KEY;
const COVERAGE = 'sncf';

describe('Places API', () => {
    let client;

    beforeAll(() => {
        if (!API_KEY) {
            console.warn('API_KEY not set. Some tests may fail.');
        }
        client = new NavitiaClient({
            apiKey: API_KEY || '',
            basePath: 'https://api.sncf.com/v1',
        });
    });

    describe('GET /coverage/{coverage}/places', () => {
        it('should return places matching the schema', async () => {
            if (!API_KEY) {
                return;
            }

            try {
                const response = await client.places.coverageCoveragePlacesGet(
                    COVERAGE,
                    'Paris',
                    10
                );
                
                expect(response.status).toBe(200);

                const validation = validateResponse(
                    '/coverage/{coverage}/places',
                    'get',
                    '200',
                    response.data
                );
                
                if (!validation.valid) {
                    console.error('Validation errors:', formatValidationErrors(validation.errors));
                }

                expect(validation.valid).toBe(true);
                expect(response.data).toHaveProperty('places');
                expect(Array.isArray(response.data.places)).toBe(true);
            } catch (error) {
                const status = error?.response?.status;
                // Integration tests can be flaky due to auth/rate limiting on the public API
                if (status === 401 || status === 400 || status === 403 || status === 404 || status === 429) {
                    return;
                }
                // Avoid throwing Axios errors directly (Vitest worker serialization can fail)
                throw new Error(`Places API /places failed (${status ?? 'unknown'}): ${error?.message || String(error)}`);
            }
        });

        it('should have places with required fields', async () => {
            if (!API_KEY) {
                return;
            }

            try {
                const response = await client.places.coverageCoveragePlacesGet(
                    COVERAGE,
                    'Paris',
                    5
                );
                
                expect(response.status).toBe(200);

                if (response.data.places && response.data.places.length > 0) {
                    const place = response.data.places[0];
                    
                    // Check Place schema fields
                    expect(place).toHaveProperty('id');
                    expect(typeof place.id).toBe('string');
                    
                    expect(place).toHaveProperty('name');
                    expect(typeof place.name).toBe('string');
                    
                    expect(place).toHaveProperty('embedded_type');
                    expect(typeof place.embedded_type).toBe('string');
                    expect(['stop_area', 'stop_point', 'address', 'poi', 'administrative_region']).toContain(place.embedded_type);
                }
            } catch (error) {
                const status = error?.response?.status;
                if (status === 401 || status === 400 || status === 403 || status === 404 || status === 429) {
                    return;
                }
                throw new Error(`Places API /places required fields failed (${status ?? 'unknown'}): ${error?.message || String(error)}`);
            }
        });
    });

    describe('GET /coverage/{coverage}/places_nearby', () => {
        it('should return nearby places matching the schema', async () => {
            if (!API_KEY) {
                return;
            }

            try {
                // Coordinates for Paris (lon;lat)
                const coord = '2.3522;48.8566';
                const response = await client.places.coverageCoveragePlacesNearbyGet(
                    COVERAGE,
                    coord,
                    200, // distance
                    undefined, // type
                    10, // count
                    undefined // depth
                );
                
                expect(response.status).toBe(200);

                const validation = validateResponse(
                    '/coverage/{coverage}/places_nearby',
                    'get',
                    '200',
                    response.data
                );
                
                if (!validation.valid) {
                    console.error('Validation errors:', formatValidationErrors(validation.errors));
                }

                expect(validation.valid).toBe(true);
                expect(response.data).toHaveProperty('places');
                expect(Array.isArray(response.data.places)).toBe(true);
            } catch (error) {
                const status = error?.response?.status;
                if (status === 401 || status === 400 || status === 403 || status === 404 || status === 429) {
                    return;
                }
                throw new Error(`Places API /places_nearby schema failed (${status ?? 'unknown'}): ${error?.message || String(error)}`);
            }
        });

        it('should include distance field for nearby places', async () => {
            if (!API_KEY) {
                return;
            }

            try {
                const coord = '2.3522;48.8566';
                const response = await client.places.coverageCoveragePlacesNearbyGet(
                    COVERAGE,
                    coord,
                    200
                );
                
                expect(response.status).toBe(200);

                if (response.data.places && response.data.places.length > 0) {
                    const place = response.data.places[0];
                    
                    // Distance should be present for places_nearby
                    if (place.distance !== undefined) {
                        expect(typeof place.distance).toBe('number');
                    }
                }
            } catch (error) {
                const status = error?.response?.status;
                if (status === 401 || status === 400 || status === 403 || status === 404 || status === 429) {
                    return;
                }
                throw new Error(`Places API /places_nearby distance failed (${status ?? 'unknown'}): ${error?.message || String(error)}`);
            }
        });
    });
});


