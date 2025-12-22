/**
 * Tests for Reports API endpoints
 * Validates that responses match the OpenAPI schema
 */

import { NavitiaClient } from '../../client/client';
import { validateResponse, formatValidationErrors } from '@/utils/openapi-validator';

const API_KEY = process.env.VITE_API_KEY || process.env.API_KEY;
const COVERAGE = 'sncf';

describe('Reports API', () => {
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

    describe('GET /coverage/{coverage}/traffic_reports', () => {
        it('should return traffic reports matching the schema', async () => {
            if (!API_KEY) {
                return;
            }

            try {
                const response = await client.reports.coverageCoverageTrafficReportsGet(COVERAGE);
                
                expect(response.status).toBe(200);

                const validation = validateResponse(
                    '/coverage/{coverage}/traffic_reports',
                    'get',
                    '200',
                    response.data
                );
                
                if (!validation.valid) {
                    console.error('Validation errors:', formatValidationErrors(validation.errors));
                }

                expect(validation.valid).toBe(true);
                expect(response.data).toHaveProperty('traffic_reports');
                expect(Array.isArray(response.data.traffic_reports)).toBe(true);
            } catch (error) {
                if (error.response?.status === 401) {
                    return;
                }
                throw error;
            }
        });
    });

    describe('GET /coverage/{coverage}/line_reports', () => {
        it('should return line reports matching the schema', async () => {
            if (!API_KEY) {
                return;
            }

            try {
                // First get a line to use in filter
                const linesResponse = await client.publicTransportObjects.coverageCoverageLinesGet(COVERAGE);
                
                if (linesResponse.data.lines && linesResponse.data.lines.length > 0) {
                    const lineId = linesResponse.data.lines[0].id;
                    const filter = `line.id=${lineId}`;
                    
                    const response = await client.reports.coverageCoverageLineReportsGet(
                        COVERAGE,
                        filter
                    );
                    
                    expect(response.status).toBe(200);

                    const validation = validateResponse(
                        '/coverage/{coverage}/line_reports',
                        'get',
                        '200',
                        response.data
                    );
                    
                    if (!validation.valid) {
                        console.error('Validation errors:', formatValidationErrors(validation.errors));
                    }

                    expect(validation.valid).toBe(true);
                    expect(response.data).toHaveProperty('line_reports');
                    expect(Array.isArray(response.data.line_reports)).toBe(true);
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


