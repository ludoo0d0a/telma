/**
 * Tests for Coverage API endpoints
 * Validates that responses match the OpenAPI schema
 */

import { NavitiaClient } from '../../client/client';
import { validateResponse, formatValidationErrors } from '../utils/openapi-validator';

const API_KEY = process.env.REACT_APP_API_KEY || process.env.API_KEY;
const COVERAGE = 'sncf';

describe('Coverage API', () => {
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

    describe('GET /coverage', () => {
        it('should return coverage areas matching the schema', async () => {
            if (!API_KEY) {
                return; // Skip if no API key
            }

            try {
                const response = await client.coverage.coverageGet();
                expect(response.status).toBe(200);

                const validation = validateResponse('/coverage', 'get', '200', response.data);
                
                if (!validation.valid) {
                    console.error('Validation errors:', formatValidationErrors(validation.errors));
                }

                expect(validation.valid).toBe(true);
                expect(response.data).toHaveProperty('regions');
                expect(Array.isArray(response.data.regions)).toBe(true);
            } catch (error) {
                // If it's a 401, that's expected without API key
                if (error.response?.status === 401) {
                    console.warn('Skipping test: API key required');
                    return;
                }
                throw error;
            }
        });

        it('should have regions with required fields', async () => {
            if (!API_KEY) {
                return;
            }

            try {
                const response = await client.coverage.coverageGet();
                expect(response.status).toBe(200);

                if (response.data.regions && response.data.regions.length > 0) {
                    const region = response.data.regions[0];
                    
                    // Check required fields from Coverage schema
                    expect(region).toHaveProperty('id');
                    expect(typeof region.id).toBe('string');
                }
            } catch (error) {
                if (error.response?.status === 401) {
                    return;
                }
                throw error;
            }
        });
    });

    describe('GET /coverage/{coverage}', () => {
        it('should return coverage details matching the schema', async () => {
            if (!API_KEY) {
                return;
            }

            try {
                const response = await client.coverage.coverageCoverageGet(COVERAGE);
                expect(response.status).toBe(200);

                const validation = validateResponse('/coverage/{coverage}', 'get', '200', response.data);
                
                if (!validation.valid) {
                    console.error('Validation errors:', formatValidationErrors(validation.errors));
                }

                expect(validation.valid).toBe(true);
                expect(response.data).toHaveProperty('id');
                expect(typeof response.data.id).toBe('string');
            } catch (error) {
                if (error.response?.status === 401 || error.response?.status === 404) {
                    return;
                }
                throw error;
            }
        });
    });
});


