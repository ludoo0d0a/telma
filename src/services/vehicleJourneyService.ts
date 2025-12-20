/**
 * Vehicle Journey Service
 * 
 * Service for handling vehicle journey operations including ID extraction and fetching
 */

import type { AxiosPromise } from 'axios';
import type { VehicleJourneysResponse } from '../client/models';
import { getClient, DEFAULT_COVERAGE } from './navitiaApi';

/**
 * Extract vehicle journey ID from a link object or string
 * Handles both full URLs and plain IDs
 */
export const extractVehicleJourneyId = (linkId: string | undefined | null): string | null => {
    if (!linkId) return null;
    
    // If it's a full URL path, extract the ID part
    // Example: /coverage/sncf/vehicle_journeys/vehicle_journey:SNCF:... -> vehicle_journey:SNCF:...
    if (linkId.includes('/vehicle_journeys/')) {
        const parts = linkId.split('/vehicle_journeys/');
        if (parts.length > 1) {
            return parts[1].split('?')[0]; // Remove query parameters if any
        }
    }
    
    // If it's a full URL with http/https, extract the ID from the path
    if (linkId.startsWith('http://') || linkId.startsWith('https://')) {
        const url = new URL(linkId);
        const pathParts = url.pathname.split('/vehicle_journeys/');
        if (pathParts.length > 1) {
            return pathParts[1].split('?')[0];
        }
    }
    
    // If it's just the ID, return it as is
    return linkId;
};

/**
 * Get vehicle journey details
 * @param vehicleJourneyId - The vehicle journey ID
 * @param coverage - Coverage area (default: 'sncf')
 * @param depth - Depth level for nested objects (default: 2 to get stop_times)
 */
export const getVehicleJourney = (
    vehicleJourneyId: string,
    coverage: string = DEFAULT_COVERAGE,
    depth: number = 2
): AxiosPromise<VehicleJourneysResponse> => {
    // Add depth parameter to get stop_times and other nested data
    const options = {
        params: {
            depth: depth
        }
    };
    return getClient().publicTransportObjects.coverageCoverageVehicleJourneysIdGet(coverage, vehicleJourneyId, options);
};

