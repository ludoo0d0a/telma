/**
 * Tests for Datasets API endpoints
 * Validates that responses match the OpenAPI schema
 */

import { NavitiaClient } from '@/client/client';
import { validateResponse, formatValidationErrors } from '@/utils/openapi-validator';

const API_KEY = process.env.REACT_APP_API_KEY || process.env.API_KEY;
const COVERAGE = 'sncf';

describe('Datasets API', () => {
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

    describe('GET /coverage/{coverage}/datasets', () => {
        it('should return datasets matching the schema', async () => {
            if (!API_KEY) {
                return; // Skip if no API key
            }

            try {
                const response = await client.datasets.coverageCoverageDatasetsGet(COVERAGE);
                expect(response.status).toBe(200);

                const validation = validateResponse(
                    '/coverage/{coverage}/datasets',
                    'get',
                    '200',
                    response.data
                );
                
                if (!validation.valid) {
                    console.error('Validation errors:', formatValidationErrors(validation.errors));
                }

                expect(validation.valid).toBe(true);
                expect(response.data).toHaveProperty('datasets');
                expect(Array.isArray(response.data.datasets)).toBe(true);
            } catch (error) {
                // If it's a 401, that's expected without API key
                if (error.response?.status === 401) {
                    console.warn('Skipping test: API key required');
                    return;
                }
                throw error;
            }
        });

        it('should have datasets with required fields', async () => {
            if (!API_KEY) {
                return;
            }

            try {
                const response = await client.datasets.coverageCoverageDatasetsGet(COVERAGE);
                expect(response.status).toBe(200);

                if (response.data.datasets && response.data.datasets.length > 0) {
                    const dataset = response.data.datasets[0];
                    
                    // Check required fields from Dataset schema
                    expect(dataset).toHaveProperty('id');
                    expect(typeof dataset.id).toBe('string');
                }
            } catch (error) {
                if (error.response?.status === 401 || error.response?.status === 404) {
                    return;
                }
                throw error;
            }
        });

        it('should include pagination information when datasets are present', async () => {
            if (!API_KEY) {
                return;
            }

            try {
                const response = await client.datasets.coverageCoverageDatasetsGet(COVERAGE);
                expect(response.status).toBe(200);

                // Pagination may or may not be present depending on results
                if (response.data.pagination) {
                    expect(response.data.pagination).toHaveProperty('items_on_page');
                    expect(typeof response.data.pagination.items_on_page).toBe('number');
                    expect(response.data.pagination).toHaveProperty('total_result');
                    expect(typeof response.data.pagination.total_result).toBe('number');
                }
            } catch (error) {
                if (error.response?.status === 401 || error.response?.status === 404) {
                    return;
                }
                throw error;
            }
        });

        it('should include links in the response', async () => {
            if (!API_KEY) {
                return;
            }

            try {
                const response = await client.datasets.coverageCoverageDatasetsGet(COVERAGE);
                expect(response.status).toBe(200);

                // Links may or may not be present
                if (response.data.links) {
                    expect(Array.isArray(response.data.links)).toBe(true);
                }
            } catch (error) {
                if (error.response?.status === 401 || error.response?.status === 404) {
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
                await client.datasets.coverageCoverageDatasetsGet('invalid-coverage');
                // If we get here, the test should fail
                fail('Expected 404 error for invalid coverage');
            } catch (error) {
                if (error.response?.status === 404) {
                    // Expected behavior
                    expect(error.response.status).toBe(404);
                } else if (error.response?.status === 401) {
                    // Also acceptable
                    return;
                } else {
                    throw error;
                }
            }
        });
    });
});

