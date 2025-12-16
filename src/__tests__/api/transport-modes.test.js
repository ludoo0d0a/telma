/**
 * Tests for Transport Modes API endpoints
 * Validates that responses match the OpenAPI schema
 */

import { NavitiaClient } from '../../client/client';
import { validateResponse, formatValidationErrors } from '../utils/openapi-validator';

const API_KEY = process.env.VITE_API_KEY || process.env.API_KEY;
const COVERAGE = 'sncf';

describe('Transport Modes API', () => {
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

    describe('GET /coverage/{coverage}/commercial_modes', () => {
        it('should return commercial modes matching the schema', async () => {
            if (!API_KEY) {
                return;
            }

            try {
                const response = await client.transportModes.coverageCoverageCommercialModesGet(COVERAGE);
                
                expect(response.status).toBe(200);

                const validation = validateResponse(
                    '/coverage/{coverage}/commercial_modes',
                    'get',
                    '200',
                    response.data
                );
                
                if (!validation.valid) {
                    console.error('Validation errors:', formatValidationErrors(validation.errors));
                }

                expect(validation.valid).toBe(true);
                expect(response.data).toHaveProperty('commercial_modes');
                expect(Array.isArray(response.data.commercial_modes)).toBe(true);
            } catch (error) {
                if (error.response?.status === 401) {
                    return;
                }
                throw error;
            }
        });

        it('should have commercial modes with required fields', async () => {
            if (!API_KEY) {
                return;
            }

            try {
                const response = await client.transportModes.coverageCoverageCommercialModesGet(COVERAGE);
                
                expect(response.status).toBe(200);

                if (response.data.commercial_modes && response.data.commercial_modes.length > 0) {
                    const mode = response.data.commercial_modes[0];
                    
                    // Check CommercialMode schema fields
                    expect(mode).toHaveProperty('id');
                    expect(typeof mode.id).toBe('string');
                    
                    expect(mode).toHaveProperty('name');
                    expect(typeof mode.name).toBe('string');
                }
            } catch (error) {
                if (error.response?.status === 401) {
                    return;
                }
                throw error;
            }
        });
    });

    describe('GET /coverage/{coverage}/physical_modes', () => {
        it('should return physical modes matching the schema', async () => {
            if (!API_KEY) {
                return;
            }

            try {
                const response = await client.transportModes.coverageCoveragePhysicalModesGet(COVERAGE);
                
                expect(response.status).toBe(200);

                const validation = validateResponse(
                    '/coverage/{coverage}/physical_modes',
                    'get',
                    '200',
                    response.data
                );
                
                if (!validation.valid) {
                    console.error('Validation errors:', formatValidationErrors(validation.errors));
                }

                expect(validation.valid).toBe(true);
                expect(response.data).toHaveProperty('physical_modes');
                expect(Array.isArray(response.data.physical_modes)).toBe(true);
            } catch (error) {
                if (error.response?.status === 401) {
                    return;
                }
                throw error;
            }
        });

        it('should have physical modes with required fields', async () => {
            if (!API_KEY) {
                return;
            }

            try {
                const response = await client.transportModes.coverageCoveragePhysicalModesGet(COVERAGE);
                
                expect(response.status).toBe(200);

                if (response.data.physical_modes && response.data.physical_modes.length > 0) {
                    const mode = response.data.physical_modes[0];
                    
                    // Check PhysicalMode schema fields
                    expect(mode).toHaveProperty('id');
                    expect(typeof mode.id).toBe('string');
                    
                    expect(mode).toHaveProperty('name');
                    expect(typeof mode.name).toBe('string');
                }
            } catch (error) {
                if (error.response?.status === 401) {
                    return;
                }
                throw error;
            }
        });
    });
});

