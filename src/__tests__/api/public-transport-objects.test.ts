/**
 * Tests for Public Transport Objects API endpoints
 * Validates that responses match the OpenAPI schema
 */

import { NavitiaClient } from '../../client/client';
import { validateResponse, formatValidationErrors } from '../utils/openapi-validator';

const API_KEY = process.env.VITE_API_KEY || process.env.API_KEY;
const COVERAGE = 'sncf';

describe('Public Transport Objects API', () => {
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

    describe('GET /coverage/{coverage}/lines', () => {
        it('should return lines matching the schema', async () => {
            if (!API_KEY) {
                return;
            }

            try {
                const response = await client.publicTransportObjects.coverageCoverageLinesGet(COVERAGE);
                
                expect(response.status).toBe(200);

                const validation = validateResponse(
                    '/coverage/{coverage}/lines',
                    'get',
                    '200',
                    response.data
                );
                
                if (!validation.valid) {
                    console.error('Validation errors:', formatValidationErrors(validation.errors));
                }

                expect(validation.valid).toBe(true);
                expect(response.data).toHaveProperty('lines');
                expect(Array.isArray(response.data.lines)).toBe(true);
            } catch (error) {
                if (error.response?.status === 401) {
                    return;
                }
                throw error;
            }
        });

        it('should have lines with required fields', async () => {
            if (!API_KEY) {
                return;
            }

            try {
                const response = await client.publicTransportObjects.coverageCoverageLinesGet(COVERAGE);
                
                expect(response.status).toBe(200);

                if (response.data.lines && response.data.lines.length > 0) {
                    const line = response.data.lines[0];
                    
                    // Check Line schema fields
                    expect(line).toHaveProperty('id');
                    expect(typeof line.id).toBe('string');
                    
                    expect(line).toHaveProperty('name');
                    expect(typeof line.name).toBe('string');
                }
            } catch (error) {
                if (error.response?.status === 401) {
                    return;
                }
                throw error;
            }
        });
    });

    describe('GET /coverage/{coverage}/stop_areas', () => {
        it('should return stop areas matching the schema', async () => {
            if (!API_KEY) {
                return;
            }

            try {
                const response = await client.publicTransportObjects.coverageCoverageStopAreasGet(COVERAGE);
                
                expect(response.status).toBe(200);

                const validation = validateResponse(
                    '/coverage/{coverage}/stop_areas',
                    'get',
                    '200',
                    response.data
                );
                
                if (!validation.valid) {
                    console.error('Validation errors:', formatValidationErrors(validation.errors));
                }

                expect(validation.valid).toBe(true);
                expect(response.data).toHaveProperty('stop_areas');
                expect(Array.isArray(response.data.stop_areas)).toBe(true);
            } catch (error) {
                if (error.response?.status === 401) {
                    return;
                }
                throw error;
            }
        });

        it('should have stop areas with required fields', async () => {
            if (!API_KEY) {
                return;
            }

            try {
                const response = await client.publicTransportObjects.coverageCoverageStopAreasGet(COVERAGE);
                
                expect(response.status).toBe(200);

                if (response.data.stop_areas && response.data.stop_areas.length > 0) {
                    const stopArea = response.data.stop_areas[0];
                    
                    // Check StopArea schema fields
                    expect(stopArea).toHaveProperty('id');
                    expect(typeof stopArea.id).toBe('string');
                    
                    expect(stopArea).toHaveProperty('name');
                    expect(typeof stopArea.name).toBe('string');
                }
            } catch (error) {
                if (error.response?.status === 401) {
                    return;
                }
                throw error;
            }
        });
    });

    describe('GET /coverage/{coverage}/pt_objects', () => {
        it('should return PT objects matching the schema', async () => {
            if (!API_KEY) {
                return;
            }

            try {
                const response = await client.publicTransportObjects.coverageCoveragePtObjectsGet(
                    COVERAGE,
                    'Paris',
                    10
                );
                
                expect(response.status).toBe(200);

                const validation = validateResponse(
                    '/coverage/{coverage}/pt_objects',
                    'get',
                    '200',
                    response.data
                );
                
                if (!validation.valid) {
                    console.error('Validation errors:', formatValidationErrors(validation.errors));
                }

                expect(validation.valid).toBe(true);
                expect(response.data).toHaveProperty('pt_objects');
                expect(Array.isArray(response.data.pt_objects)).toBe(true);
            } catch (error) {
                if (error.response?.status === 401 || error.response?.status === 400) {
                    return;
                }
                throw error;
            }
        });
    });
});


