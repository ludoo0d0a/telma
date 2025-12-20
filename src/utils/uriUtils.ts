/**
 * URI Utilities
 * 
 * Shared functions for encoding and decoding IDs in URLs consistently
 * 
 * Strategy: IDs are colon-separated keywords (e.g., vehicle_journey:SNCF:2025-12-19:88786)
 * Encoding: Use encodeURIComponent to encode ':' as '%3A' for use in URL path parameters
 * Decoding: Use decodeURIComponent to decode '%3A' back to ':'
 */

/**
 * Encode an ID for use in URLs
 * Uses encodeURIComponent to encode special characters (especially ':' as '%3A')
 * IDs should be colon-separated keywords (e.g., vehicle_journey:SNCF:2025-12-19:88786)
 * 
 * @param id - The ID to encode (should be colon-separated keywords)
 * @param maxLength - Optional maximum length (ignored, kept for backward compatibility)
 * @returns URI-encoded ID (e.g., vehicle_journey%3ASNCF%3A2025-12-19%3A88786)
 */
export const encodeId = (id: string, maxLength?: number): string => {
    if (!id) return '';
    
    // Use encodeURIComponent to encode ':' as '%3A' and other special characters
    return encodeURIComponent(id);
};

/**
 * Decode an ID from a URL
 * Uses decodeURIComponent to decode '%3A' back to ':' and other special characters
 * 
 * @param encodedId - The encoded ID from the URL (e.g., vehicle_journey%3ASNCF%3A2025-12-19%3A88786)
 * @returns Decoded ID (e.g., vehicle_journey:SNCF:2025-12-19:88786)
 */
export const decodeId = (encodedId: string): string => {
    if (!encodedId) return '';
    
    try {
        return decodeURIComponent(encodedId);
    } catch (e) {
        // If decoding fails, return as-is (might be already decoded or invalid)
        return encodedId;
    }
};

/**
 * Encode a trip ID for use in URL path parameters
 * Trip IDs are typically in format: vehicleJourneyId_departureDateTime
 * 
 * @param tripKey - The trip key to encode (e.g., vehicle_journey:SNCF:2025-12-19:88786_20251219T123000)
 * @returns URI-encoded trip ID for use in URL paths
 */
export const encodeTripId = (tripKey: string): string => {
    return encodeId(tripKey);
};

/**
 * Decode a trip ID from URL path parameter
 * 
 * @param encodedTripId - The encoded trip ID from URL
 * @returns Decoded trip key
 */
export const decodeTripId = (encodedTripId: string): string => {
    return decodeId(encodedTripId);
};

/**
 * Encode a vehicle journey ID for use in URL path parameters
 * Vehicle journey IDs are colon-separated keywords (e.g., vehicle_journey:SNCF:2025-12-19:88786)
 * 
 * @param vehicleJourneyId - The vehicle journey ID to encode
 * @returns URI-encoded vehicle journey ID (e.g., vehicle_journey%3ASNCF%3A2025-12-19%3A88786)
 */
export const encodeVehicleJourneyId = (vehicleJourneyId: string): string => {
    return encodeId(vehicleJourneyId);
};

/**
 * Decode a vehicle journey ID from URL path parameter
 * 
 * @param encodedId - The encoded vehicle journey ID from URL
 * @returns Decoded vehicle journey ID (e.g., vehicle_journey:SNCF:2025-12-19:88786)
 */
export const decodeVehicleJourneyId = (encodedId: string): string => {
    return decodeId(encodedId);
};

