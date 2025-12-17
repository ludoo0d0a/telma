/**
 * Tests for Journeys API endpoints
 * Validates that responses match the OpenAPI schema
 */

import { NavitiaClient } from '../../client/client';
import { validateResponse, formatValidationErrors } from '../utils/openapi-validator';

const API_KEY = process.env.REACT_APP_API_KEY || process.env.API_KEY;
const COVERAGE = 'sncf';

// Known stop areas for testing
const PARIS_GARE_DU_NORD = 'stop_area:SNCF:87271007';
const PARIS_GARE_DE_LYON = 'stop_area:SNCF:87686006';

const BETTEMBOURG = 'stop_area:SNCF:82006030';
const METZ = 'stop_area:SNCF:87192039';

const location_from = BETTEMBOURG;
const location_to = METZ;

describe('Journeys API', () => {
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

    describe('GET /coverage/{coverage}/journeys', () => {
        it('should return journeys matching the schema', async () => {
            if (!API_KEY) {
                return;
            }

            try {
                const response = await client.journeys.coverageCoverageJourneysGet(
                    COVERAGE,
                    location_from,
                    location_to
                );
                
                expect(response.status).toBe(200);

                const validation = validateResponse(
                    '/coverage/{coverage}/journeys',
                    'get',
                    '200',
                    response.data
                );
                
                if (!validation.valid) {
                    console.error('Validation errors:', formatValidationErrors(validation.errors));
                    console.error('Response data:', JSON.stringify(response.data, null, 2));
                }

                expect(validation.valid).toBe(true);
                expect(response.data).toHaveProperty('journeys');
                expect(Array.isArray(response.data.journeys)).toBe(true);
            } catch (error) {
                if (error.response?.status === 401 || error.response?.status === 404) {
                    return;
                }
                throw error;
            }
        });

        it('should have journeys with required fields', async () => {
            if (!API_KEY) {
                return;
            }

            try {
                const response = await client.journeys.coverageCoverageJourneysGet(
                    COVERAGE,
                    location_from,
                    location_to
                );
                
                expect(response.status).toBe(200);

                if (response.data.journeys && response.data.journeys.length > 0) {
                    const journey = response.data.journeys[0];
                    
                    // Check JourneyItem schema fields
                    expect(journey).toHaveProperty('departure_date_time');
                    expect(typeof journey.departure_date_time).toBe('string');
                    
                    expect(journey).toHaveProperty('arrival_date_time');
                    expect(typeof journey.arrival_date_time).toBe('string');
                    
                    expect(journey).toHaveProperty('sections');
                    expect(Array.isArray(journey.sections)).toBe(true);
                    
                    // Check durations if present
                    if (journey.durations) {
                        expect(typeof journey.durations).toBe('object');
                        if (journey.durations.total !== undefined) {
                            expect(typeof journey.durations.total).toBe('number');
                        }
                    }
                }
            } catch (error) {
                if (error.response?.status === 401 || error.response?.status === 404) {
                    return;
                }
                throw error;
            }
        });

        it('should validate journey sections structure', async () => {
            if (!API_KEY) {
                return;
            }

            try {
                const response = await client.journeys.coverageCoverageJourneysGet(
                    COVERAGE,
                    location_from,
                    location_to
                );
                
                expect(response.status).toBe(200);

                if (response.data.journeys && response.data.journeys.length > 0) {
                    const journey = response.data.journeys[0];
                    
                    if (journey.sections && journey.sections.length > 0) {
                        const section = journey.sections[0];
                        
                        // Check Section schema fields
                        expect(section).toHaveProperty('type');
                        expect(typeof section.type).toBe('string');
                        
                        expect(section).toHaveProperty('from');
                        expect(typeof section.from).toBe('object');
                        
                        expect(section).toHaveProperty('to');
                        expect(typeof section.to).toBe('object');
                    }
                }
            } catch (error) {
                if (error.response?.status === 401 || error.response?.status === 404) {
                    return;
                }
                throw error;
            }
        });

        it('should validate journey-with-disruptions.json fixture against OpenAPI schema', () => {
            // Load the fixture file
            const fs = require('fs');
            const path = require('path');
            const fixturePath = path.join(__dirname, '../../../test-artifacts/api/2025-12-15/journey-with-disruptions.json');
            
            if (!fs.existsSync(fixturePath)) {
                console.warn(`Fixture not found at ${fixturePath}, skipping test`);
                return;
            }

            const fixtureData = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

            // Validate against OpenAPI schema
            const validation = validateResponse(
                '/coverage/{coverage}/journeys',
                'get',
                '200',
                fixtureData
            );

            if (!validation.valid) {
                console.error('Validation errors:', formatValidationErrors(validation.errors));
                // Log first few errors in detail
                if (validation.errors && validation.errors.length > 0) {
                    console.error('First validation error:', JSON.stringify(validation.errors[0], null, 2));
                }
            }

            expect(validation.valid).toBe(true);
            
            // Additional assertions to ensure disruptions are properly structured
            if (fixtureData.disruptions && fixtureData.disruptions.length > 0) {
                const disruption = fixtureData.disruptions[0];
                
                // Verify disruption has expected fields
                expect(disruption).toHaveProperty('id');
                expect(disruption).toHaveProperty('severity');
                
                // Verify severity is an object (not a string)
                if (disruption.severity) {
                    expect(typeof disruption.severity).toBe('object');
                    expect(disruption.severity).toHaveProperty('name');
                    expect(disruption.severity).toHaveProperty('effect');
                }
                
                // Verify impacted_objects structure if present
                if (disruption.impacted_objects && disruption.impacted_objects.length > 0) {
                    const impact = disruption.impacted_objects[0];
                    if (impact.pt_object) {
                        expect(impact.pt_object).toHaveProperty('id');
                        expect(impact.pt_object).toHaveProperty('embedded_type');
                    }
                    if (impact.impacted_stops && impact.impacted_stops.length > 0) {
                        const stop = impact.impacted_stops[0];
                        expect(stop).toHaveProperty('stop_point');
                    }
                }
            }
        });
    });
});


