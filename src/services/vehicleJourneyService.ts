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
 * Returns the raw (decoded) ID for use in API calls
 * 
 * @param linkId - The link ID (can be a full URL, URL path, or plain ID)
 * @returns The raw vehicle journey ID (colon-separated keywords, e.g., vehicle_journey:SNCF:2025-12-19:88786)
 */
export const extractVehicleJourneyId = (linkId: string | undefined | null): string | null => {
    if (!linkId) return null;
    
    let extractedId: string | null = null;
    
    // If it's a full URL path, extract the ID part
    // Example: /coverage/sncf/vehicle_journeys/vehicle_journey:SNCF:... -> vehicle_journey:SNCF:...
    if (linkId.includes('/vehicle_journeys/')) {
        const parts = linkId.split('/vehicle_journeys/');
        if (parts.length > 1) {
            extractedId = parts[1].split('?')[0]; // Remove query parameters if any
        }
    }
    // If it's a full URL with http/https, extract the ID from the path
    else if (linkId.startsWith('http://') || linkId.startsWith('https://')) {
        const url = new URL(linkId);
        const pathParts = url.pathname.split('/vehicle_journeys/');
        if (pathParts.length > 1) {
            extractedId = pathParts[1].split('?')[0];
        }
    }
    // If it's just the ID, use it as is
    else {
        extractedId = linkId;
    }
    
    if (!extractedId) return null;
    
    // Decode the ID if it's URL-encoded (the API client will encode it again when making requests)
    // This ensures we always return the raw ID format (colon-separated keywords)
    try {
        // Check if it contains URL encoding (e.g., %3A for :)
        if (extractedId.includes('%')) {
            return decodeURIComponent(extractedId);
        }
    } catch (e) {
        // If decoding fails, return as-is (might be already decoded)
    }
    
    return extractedId;
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

