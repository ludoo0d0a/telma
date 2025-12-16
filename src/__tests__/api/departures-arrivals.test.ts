/**
 * Tests for Departures and Arrivals API endpoints
 * Validates that responses match the OpenAPI schema
 */

import { NavitiaClient } from '../../client/client';
import { validateResponse, formatValidationErrors } from '../utils/openapi-validator';

const API_KEY = process.env.VITE_API_KEY || process.env.API_KEY;
const COVERAGE = 'sncf';

// Known stop area for testing
const PARIS_GARE_DU_NORD = 'stop_area:SNCF:87271007';

describe('Departures and Arrivals API', () => {
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

    describe('GET /coverage/{coverage}/stop_areas/{id}/departures', () => {
        it('should return departures matching the schema', async () => {
            if (!API_KEY) {
                return;
            }

            try {
                const response = await client.departures.coverageCoverageStopAreasIdDeparturesGet(
                    COVERAGE,
                    PARIS_GARE_DU_NORD,
                    undefined, // datetime
                    10, // count
                    undefined // depth
                );
                
                expect(response.status).toBe(200);

                const validation = validateResponse(
                    '/coverage/{coverage}/stop_areas/{id}/departures',
                    'get',
                    '200',
                    response.data
                );
                
                if (!validation.valid) {
                    console.error('Validation errors:', formatValidationErrors(validation.errors));
                }

                expect(validation.valid).toBe(true);
                expect(response.data).toHaveProperty('departures');
                expect(Array.isArray(response.data.departures)).toBe(true);
            } catch (error) {
                if (error.response?.status === 401 || error.response?.status === 404) {
                    return;
                }
                throw error;
            }
        });

        it('should have departures with required fields', async () => {
            if (!API_KEY) {
                return;
            }

            try {
                const response = await client.departures.coverageCoverageStopAreasIdDeparturesGet(
                    COVERAGE,
                    PARIS_GARE_DU_NORD,
                    undefined,
                    5
                );
                
                expect(response.status).toBe(200);

                if (response.data.departures && response.data.departures.length > 0) {
                    const departure = response.data.departures[0];
                    
                    // Check Departure schema fields
                    expect(departure).toHaveProperty('stop_point');
                    expect(typeof departure.stop_point).toBe('object');
                    
                    expect(departure).toHaveProperty('stop_date_time');
                    expect(typeof departure.stop_date_time).toBe('object');
                    
                    if (departure.display_informations) {
                        expect(typeof departure.display_informations).toBe('object');
                    }
                }
            } catch (error) {
                if (error.response?.status === 401 || error.response?.status === 404) {
                    return;
                }
                throw error;
            }
        });

        it('should validate stop_date_time structure', async () => {
            if (!API_KEY) {
                return;
            }

            try {
                const response = await client.departures.coverageCoverageStopAreasIdDeparturesGet(
                    COVERAGE,
                    PARIS_GARE_DU_NORD,
                    undefined,
                    5
                );
                
                expect(response.status).toBe(200);

                if (response.data.departures && response.data.departures.length > 0) {
                    const departure = response.data.departures[0];
                    
                    if (departure.stop_date_time) {
                        // Check DateTime schema
                        expect(departure.stop_date_time).toHaveProperty('date_time');
                        expect(typeof departure.stop_date_time.date_time).toBe('string');
                    }
                }
            } catch (error) {
                if (error.response?.status === 401 || error.response?.status === 404) {
                    return;
                }
                throw error;
            }
        });
    });

    describe('GET /coverage/{coverage}/stop_areas/{id}/arrivals', () => {
        it('should return arrivals matching the schema', async () => {
            if (!API_KEY) {
                return;
            }

            try {
                const response = await client.arrivals.coverageCoverageStopAreasIdArrivalsGet(
                    COVERAGE,
                    PARIS_GARE_DU_NORD,
                    undefined, // datetime
                    10, // count
                    undefined // depth
                );
                
                expect(response.status).toBe(200);

                const validation = validateResponse(
                    '/coverage/{coverage}/stop_areas/{id}/arrivals',
                    'get',
                    '200',
                    response.data
                );
                
                if (!validation.valid) {
                    console.error('Validation errors:', formatValidationErrors(validation.errors));
                }

                expect(validation.valid).toBe(true);
                expect(response.data).toHaveProperty('arrivals');
                expect(Array.isArray(response.data.arrivals)).toBe(true);
            } catch (error) {
                if (error.response?.status === 401 || error.response?.status === 404) {
                    return;
                }
                throw error;
            }
        });

        it('should have arrivals with required fields', async () => {
            if (!API_KEY) {
                return;
            }

            try {
                const response = await client.arrivals.coverageCoverageStopAreasIdArrivalsGet(
                    COVERAGE,
                    PARIS_GARE_DU_NORD,
                    undefined,
                    5
                );
                
                expect(response.status).toBe(200);

                if (response.data.arrivals && response.data.arrivals.length > 0) {
                    const arrival = response.data.arrivals[0];
                    
                    // Check Arrival schema fields
                    expect(arrival).toHaveProperty('stop_point');
                    expect(typeof arrival.stop_point).toBe('object');
                    
                    expect(arrival).toHaveProperty('stop_date_time');
                    expect(typeof arrival.stop_date_time).toBe('object');
                }
            } catch (error) {
                if (error.response?.status === 401 || error.response?.status === 404) {
                    return;
                }
                throw error;
            }
        });
    });
});


