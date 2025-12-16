/**
 * Tests for Schedules API endpoints
 * Validates that responses match the OpenAPI schema
 */

import { NavitiaClient } from '../../client/client';
import { validateResponse, formatValidationErrors } from '../utils/openapi-validator';

const API_KEY = process.env.VITE_API_KEY || process.env.API_KEY;
const COVERAGE = 'sncf';

// Known stop area for testing
const PARIS_GARE_DU_NORD = 'stop_area:SNCF:87271007';

describe('Schedules API', () => {
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

    describe('GET /coverage/{coverage}/stop_schedules', () => {
        it('should return stop schedules matching the schema', async () => {
            if (!API_KEY) {
                return;
            }

            try {
                const filter = `stop_area.id=${PARIS_GARE_DU_NORD}`;
                const response = await client.schedules.coverageCoverageStopSchedulesGet(
                    COVERAGE,
                    filter,
                    undefined // datetime
                );
                
                expect(response.status).toBe(200);

                const validation = validateResponse(
                    '/coverage/{coverage}/stop_schedules',
                    'get',
                    '200',
                    response.data
                );
                
                if (!validation.valid) {
                    console.error('Validation errors:', formatValidationErrors(validation.errors));
                }

                expect(validation.valid).toBe(true);
                expect(response.data).toHaveProperty('stop_schedules');
                expect(Array.isArray(response.data.stop_schedules)).toBe(true);
            } catch (error) {
                if (error.response?.status === 401 || error.response?.status === 404) {
                    return;
                }
                throw error;
            }
        });

        it('should have stop schedules with required fields', async () => {
            if (!API_KEY) {
                return;
            }

            try {
                const filter = `stop_area.id=${PARIS_GARE_DU_NORD}`;
                const response = await client.schedules.coverageCoverageStopSchedulesGet(
                    COVERAGE,
                    filter
                );
                
                expect(response.status).toBe(200);

                if (response.data.stop_schedules && response.data.stop_schedules.length > 0) {
                    const schedule = response.data.stop_schedules[0];
                    
                    // Check StopSchedule schema fields
                    expect(schedule).toHaveProperty('stop_point');
                    expect(typeof schedule.stop_point).toBe('object');
                    
                    expect(schedule).toHaveProperty('date_times');
                    expect(Array.isArray(schedule.date_times)).toBe(true);
                }
            } catch (error) {
                if (error.response?.status === 401 || error.response?.status === 404) {
                    return;
                }
                throw error;
            }
        });
    });

    describe('GET /coverage/{coverage}/route_schedules', () => {
        it('should return route schedules matching the schema', async () => {
            if (!API_KEY) {
                return;
            }

            try {
                // First get a line to use in filter
                const linesResponse = await client.publicTransportObjects.coverageCoverageLinesGet(COVERAGE);
                
                if (linesResponse.data.lines && linesResponse.data.lines.length > 0) {
                    const lineId = linesResponse.data.lines[0].id;
                    const filter = `line.id=${lineId}`;
                    
                    const response = await client.schedules.coverageCoverageRouteSchedulesGet(
                        COVERAGE,
                        filter,
                        undefined
                    );
                    
                    expect(response.status).toBe(200);

                    const validation = validateResponse(
                        '/coverage/{coverage}/route_schedules',
                        'get',
                        '200',
                        response.data
                    );
                    
                    if (!validation.valid) {
                        console.error('Validation errors:', formatValidationErrors(validation.errors));
                    }

                    expect(validation.valid).toBe(true);
                    expect(response.data).toHaveProperty('route_schedules');
                    expect(Array.isArray(response.data.route_schedules)).toBe(true);
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


