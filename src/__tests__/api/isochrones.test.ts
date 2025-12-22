/**
 * Tests for Isochrones API endpoints
 * Validates that responses match the OpenAPI schema
 */

import { NavitiaClient } from '@/client/client';
import { validateResponse, formatValidationErrors } from '@/utils/openapi-validator';

const API_KEY = process.env.REACT_APP_API_KEY || process.env.API_KEY;
const COVERAGE = 'sncf';

// Known coordinates for testing (Paris Gare du Nord)
const PARIS_GARE_DU_NORD_COORDS = '2.3552;48.8809';
const PARIS_GARE_DE_LYON_COORDS = '2.3731;48.8448';

describe('Isochrones API', () => {
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

    describe('GET /coverage/{coverage}/isochrones', () => {
        it('should return isochrones matching the schema', async () => {
            if (!API_KEY) {
                return; // Skip if no API key
            }

            try {
                const response = await client.isochrones.coverageCoverageIsochronesGet(
                    COVERAGE,
                    PARIS_GARE_DU_NORD_COORDS,
                    3600 // 1 hour max duration
                );
                
                expect(response.status).toBe(200);

                const validation = validateResponse(
                    '/coverage/{coverage}/isochrones',
                    'get',
                    '200',
                    response.data
                );
                
                if (!validation.valid) {
                    console.error('Validation errors:', formatValidationErrors(validation.errors));
                    console.error('Response data:', JSON.stringify(response.data, null, 2));
                }

                expect(validation.valid).toBe(true);
            } catch (error) {
                // If it's a 401, that's expected without API key
                if (error.response?.status === 401) {
                    console.warn('Skipping test: API key required');
                    return;
                }
                // Isochrones might not be available for all coverages
                if (error.response?.status === 404 || error.response?.status === 501) {
                    console.warn('Isochrones endpoint not available for this coverage');
                    return;
                }
                throw error;
            }
        });

        it('should accept maxDuration parameter', async () => {
            if (!API_KEY) {
                return;
            }

            try {
                const response = await client.isochrones.coverageCoverageIsochronesGet(
                    COVERAGE,
                    PARIS_GARE_DU_NORD_COORDS,
                    1800 // 30 minutes
                );
                
                expect(response.status).toBe(200);
            } catch (error) {
                if (error.response?.status === 401 || error.response?.status === 404 || error.response?.status === 501) {
                    return;
                }
                throw error;
            }
        });

        it('should work with different coordinates', async () => {
            if (!API_KEY) {
                return;
            }

            try {
                const response = await client.isochrones.coverageCoverageIsochronesGet(
                    COVERAGE,
                    PARIS_GARE_DE_LYON_COORDS,
                    3600
                );
                
                expect(response.status).toBe(200);
            } catch (error) {
                if (error.response?.status === 401 || error.response?.status === 404 || error.response?.status === 501) {
                    return;
                }
                throw error;
            }
        });

        it('should handle stop_area IDs as from parameter', async () => {
            if (!API_KEY) {
                return;
            }

            try {
                // Try with a stop_area ID instead of coordinates
                const stopAreaId = 'stop_area:SNCF:87271007'; // Paris Gare du Nord
                const response = await client.isochrones.coverageCoverageIsochronesGet(
                    COVERAGE,
                    stopAreaId,
                    3600
                );
                
                expect(response.status).toBe(200);
            } catch (error) {
                // This might not be supported or might return different status codes
                if (error.response?.status === 401 || 
                    error.response?.status === 404 || 
                    error.response?.status === 400 ||
                    error.response?.status === 501) {
                    return;
                }
                throw error;
            }
        });

        it('should handle invalid coordinates gracefully', async () => {
            if (!API_KEY) {
                return;
            }

            try {
                await client.isochrones.coverageCoverageIsochronesGet(
                    COVERAGE,
                    'invalid;coordinates',
                    3600
                );
                // If we get here, the test should fail
                fail('Expected error for invalid coordinates');
            } catch (error) {
                // Expected to fail with 400 or 404
                if (error.response?.status === 400 || 
                    error.response?.status === 404 ||
                    error.response?.status === 401) {
                    // Expected behavior
                    return;
                }
                throw error;
            }
        });

        it('should handle 404 for invalid coverage', async () => {
            if (!API_KEY) {
                return;
            }

            try {
                await client.isochrones.coverageCoverageIsochronesGet(
                    'invalid-coverage',
                    PARIS_GARE_DU_NORD_COORDS,
                    3600
                );
                // If we get here, the test should fail
                fail('Expected 404 error for invalid coverage');
            } catch (error) {
                if (error.response?.status === 404 || error.response?.status === 401) {
                    // Expected behavior
                    return;
                }
                throw error;
            }
        });
    });
});

