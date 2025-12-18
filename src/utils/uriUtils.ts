/**
 * URI Utilities
 * 
 * Shared functions for encoding and decoding IDs in URLs consistently
 */

/**
 * Encode an ID for use in URLs
 * Uses base64 encoding with URL-safe characters (removes +/= and replaces with URL-safe alternatives)
 * 
 * @param id - The ID to encode
 * @param maxLength - Optional maximum length (default: no limit)
 * @returns URL-safe encoded ID
 */
export const encodeId = (id: string, maxLength?: number): string => {
    if (!id) return '';
    
    // Use base64 encoding and make it URL-safe
    const encoded = btoa(id)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
    
    // Truncate if maxLength is specified
    if (maxLength && encoded.length > maxLength) {
        return encoded.substring(0, maxLength);
    }
    
    return encoded;
};

/**
 * Decode an ID from a URL
 * Handles multiple formats:
 * - URL-safe base64 (new format with - and _ replacements)
 * - Old format (special chars removed, no replacements) - tries to decode with padding
 * - Regular base64
 * - URL encoded
 * 
 * @param encodedId - The encoded ID from the URL
 * @returns Decoded ID
 */
export const decodeId = (encodedId: string): string => {
    if (!encodedId) return '';
    
    // First, try URL-safe base64 (new format with - and _)
    try {
        const base64 = encodedId
            .replace(/-/g, '+')
            .replace(/_/g, '/');
        
        // Add padding if needed (base64 requires length to be multiple of 4)
        const padding = (4 - (base64.length % 4)) % 4;
        const padded = base64 + '='.repeat(padding);
        
        return atob(padded);
    } catch (e) {
        // If that fails, try old format (special chars were removed)
        // Old format: btoa().replace(/[+/=]/g, '') - we need to try adding padding
        // Note: This is not 100% reliable since we don't know what chars were removed
        for (let pad = 0; pad < 4; pad++) {
            try {
                const testBase64 = encodedId + '='.repeat(pad);
                return atob(testBase64);
            } catch (e2) {
                // Continue trying different padding
            }
        }
        
        // Try URL decoding as fallback (for IDs that were URL encoded)
        try {
            return decodeURIComponent(encodedId);
        } catch (e3) {
            // If all decoding fails, return as-is (might be already decoded)
            return encodedId;
        }
    }
};

/**
 * Encode a trip ID (shorter format, max 50 chars)
 * Used for trip IDs that need to be compact
 * 
 * @param tripKey - The trip key to encode (e.g., vehicleJourneyId_departureDateTime)
 * @returns Encoded trip ID (max 50 characters)
 */
export const encodeTripId = (tripKey: string): string => {
    return encodeId(tripKey, 50);
};

/**
 * Decode a trip ID
 * 
 * @param encodedTripId - The encoded trip ID from URL
 * @returns Decoded trip key
 */
export const decodeTripId = (encodedTripId: string): string => {
    return decodeId(encodedTripId);
};

/**
 * Encode a vehicle journey ID for use in URLs
 * 
 * @param vehicleJourneyId - The vehicle journey ID to encode
 * @returns Encoded vehicle journey ID
 */
export const encodeVehicleJourneyId = (vehicleJourneyId: string): string => {
    return encodeId(vehicleJourneyId);
};

/**
 * Decode a vehicle journey ID from URL
 * 
 * @param encodedId - The encoded vehicle journey ID from URL
 * @returns Decoded vehicle journey ID
 */
export const decodeVehicleJourneyId = (encodedId: string): string => {
    return decodeId(encodedId);
};

