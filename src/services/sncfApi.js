import axios from 'axios';

const API_BASE_URL = 'https://api.sncf.com/v1';
const API_KEY = process.env.REACT_APP_API_KEY;
const DEFAULT_COVERAGE = 'sncf'; // Default coverage, can be changed

const getHeaders = () => ({
    'Authorization': API_KEY,
});

/**
 * Get commercial modes available in SNCF API
 * @param {string} coverage - Coverage area ID (default: 'sncf')
 * @returns {Promise} API response with commercial modes
 */
export const getCommercialModes = async (coverage = DEFAULT_COVERAGE) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/coverage/${coverage}/commercial_modes`,
            { headers: getHeaders() }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching commercial modes:', error);
        throw error;
    }
};

/**
 * Get journeys between two locations
 * @param {string} from - Origin location ID (e.g., 'admin:fr:75056')
 * @param {string} to - Destination location ID (e.g., 'admin:fr:69123')
 * @param {string} datetime - Date and time in format 'YYYYMMDDTHHmmss' (e.g., '20250113T152944')
 * @param {string} coverage - Coverage area ID (default: 'sncf')
 * @param {object} params - Additional query parameters
 * @returns {Promise} API response with journeys
 */
export const getJourneys = async (from, to, datetime = null, coverage = DEFAULT_COVERAGE, params = {}) => {
    try {
        const queryParams = { from, to, ...params };
        if (datetime) {
            queryParams.datetime = datetime;
        }
        const response = await axios.get(
            `${API_BASE_URL}/coverage/${coverage}/journeys`,
            {
                headers: getHeaders(),
                params: queryParams,
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching journeys:', error);
        throw error;
    }
};

/**
 * Get departures from a stop area
 * @param {string} stopAreaId - Stop area ID (e.g., 'stop_area:SNCF:87391003')
 * @param {string} datetime - Date and time in format 'YYYYMMDDTHHmmss'
 * @param {string} coverage - Coverage area ID (default: 'sncf')
 * @param {object} params - Additional query parameters
 * @returns {Promise} API response with departures
 */
export const getDepartures = async (stopAreaId, datetime = null, coverage = DEFAULT_COVERAGE, params = {}) => {
    try {
        const queryParams = { ...params };
        if (datetime) {
            queryParams.datetime = datetime;
        }
        const response = await axios.get(
            `${API_BASE_URL}/coverage/${coverage}/stop_areas/${stopAreaId}/departures`,
            {
                headers: getHeaders(),
                params: queryParams,
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching departures:', error);
        throw error;
    }
};

/**
 * Get arrivals to a stop area
 * @param {string} stopAreaId - Stop area ID
 * @param {string} datetime - Date and time in format 'YYYYMMDDTHHmmss'
 * @param {string} coverage - Coverage area ID (default: 'sncf')
 * @param {object} params - Additional query parameters
 * @returns {Promise} API response with arrivals
 */
export const getArrivals = async (stopAreaId, datetime = null, coverage = DEFAULT_COVERAGE, params = {}) => {
    try {
        const queryParams = { ...params };
        if (datetime) {
            queryParams.datetime = datetime;
        }
        const response = await axios.get(
            `${API_BASE_URL}/coverage/${coverage}/stop_areas/${stopAreaId}/arrivals`,
            {
                headers: getHeaders(),
                params: queryParams,
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching arrivals:', error);
        throw error;
    }
};

/**
 * Get all available coverages
 * @returns {Promise} API response with coverage areas
 */
export const getCoverages = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/coverage`, { headers: getHeaders() });
        return response.data;
    } catch (error) {
        console.error('Error fetching coverages:', error);
        throw error;
    }
};

/**
 * Get coverage areas (alias for getCoverages for backward compatibility)
 * @returns {Promise} API response with coverage areas
 */
export const getCoverage = getCoverages;

/**
 * Get specific coverage area details
 * @param {string} coverage - Coverage area ID (e.g., 'sncf')
 * @returns {Promise} API response with coverage details
 */
export const getCoverageDetails = async (coverage = DEFAULT_COVERAGE) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/coverage/${coverage}`,
            { headers: getHeaders() }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching coverage details:', error);
        throw error;
    }
};

/**
 * Get physical modes
 * @param {string} coverage - Coverage area ID (default: 'sncf')
 * @returns {Promise} API response with physical modes
 */
export const getPhysicalModes = async (coverage = DEFAULT_COVERAGE) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/coverage/${coverage}/physical_modes`,
            { headers: getHeaders() }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching physical modes:', error);
        throw error;
    }
};

/**
 * Get all lines
 * @param {string} coverage - Coverage area ID (default: 'sncf')
 * @param {object} params - Additional query parameters
 * @returns {Promise} API response with lines
 */
export const getLines = async (coverage = DEFAULT_COVERAGE, params = {}) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/coverage/${coverage}/lines`,
            {
                headers: getHeaders(),
                params,
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching lines:', error);
        throw error;
    }
};

/**
 * Get all stop areas
 * @param {string} coverage - Coverage area ID (default: 'sncf')
 * @param {object} params - Additional query parameters
 * @returns {Promise} API response with stop areas
 */
export const getStopAreas = async (coverage = DEFAULT_COVERAGE, params = {}) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/coverage/${coverage}/stop_areas`,
            {
                headers: getHeaders(),
                params,
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching stop areas:', error);
        throw error;
    }
};

/**
 * Search for places (geographical autocomplete)
 * @param {string} query - Search query
 * @param {string} coverage - Coverage area ID (default: 'sncf')
 * @param {object} params - Additional query parameters (count, type, etc.)
 * @returns {Promise} API response with places
 */
export const searchPlaces = async (query, coverage = DEFAULT_COVERAGE, params = {}) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/coverage/${coverage}/places`,
            {
                headers: getHeaders(),
                params: { q: query, ...params },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error searching places:', error);
        throw error;
    }
};

/**
 * Autocomplete on geographical objects (alias for searchPlaces)
 * @param {string} q - Search query
 * @param {string} coverage - Coverage area ID (default: 'sncf')
 * @param {number} count - Number of results (default: 10)
 * @param {string} type - Optional type filter
 * @returns {Promise} API response with places
 */
export const autocompleteGeo = async (q, coverage = DEFAULT_COVERAGE, count = 10, type = null) => {
    const params = { count };
    if (type) params.type = type;
    return searchPlaces(q, coverage, params);
};

/**
 * Find places nearby coordinates
 * @param {string} coord - Coordinates in format 'lon;lat' OR separate lat/lon
 * @param {string|number} latOrCoverage - If coord is string: coverage area ID. If coord is not provided: latitude
 * @param {string|number} lonOrParams - If coord is string: params object. If coord is not provided: longitude
 * @param {object|number} coverageOrDistance - If using lat/lon: coverage area ID. If using coord: distance
 * @param {object|string} paramsOrType - If using lat/lon: params object. If using coord: type filter
 * @returns {Promise} API response with nearby places
 */
export const getPlacesNearby = async (coord, latOrCoverage = DEFAULT_COVERAGE, lonOrParams = {}, coverageOrDistance = 200, paramsOrType = null) => {
    try {
        let url, requestParams;
        
        // Support both formats: coord string OR separate lat/lon
        if (typeof coord === 'string' && coord.includes(';')) {
            // Format: getPlacesNearby('lon;lat', coverage, params)
            url = `${API_BASE_URL}/coverage/${latOrCoverage}/places_nearby`;
            requestParams = { coord, ...lonOrParams };
        } else if (typeof latOrCoverage === 'number' && typeof lonOrParams === 'number') {
            // Format: getPlacesNearby(null, lat, lon, coverage, distance, type)
            const lat = latOrCoverage;
            const lon = lonOrParams;
            const coverage = typeof coverageOrDistance === 'string' ? coverageOrDistance : DEFAULT_COVERAGE;
            const distance = typeof coverageOrDistance === 'number' ? coverageOrDistance : 200;
            const type = typeof paramsOrType === 'string' ? paramsOrType : null;
            
            url = `${API_BASE_URL}/coverage/${coverage}/coord/${lon};${lat}/places_nearby`;
            requestParams = { distance };
            if (type) requestParams.type = type;
        } else {
            // Default: coord string format
            url = `${API_BASE_URL}/coverage/${latOrCoverage}/places_nearby`;
            requestParams = { coord, ...lonOrParams };
        }
        
        const response = await axios.get(url, {
            headers: getHeaders(),
            params: requestParams,
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching places nearby:', error);
        throw error;
    }
};

/**
 * Places nearby using lat/lon separately (convenience function)
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {string} coverage - Coverage area ID (default: 'sncf')
 * @param {number} distance - Distance in meters (default: 200)
 * @param {string} type - Optional type filter
 * @returns {Promise} API response with nearby places
 */
export const placesNearby = async (lat, lon, coverage = DEFAULT_COVERAGE, distance = 200, type = null) => {
    return getPlacesNearby(null, lat, lon, coverage, distance, type);
};

/**
 * Get stop schedules
 * @param {string} filterOrStopPointId - Filter string (e.g., 'stop_area.id=xxx') OR stop point ID
 * @param {string} fromDatetimeOrCoverage - If filter: coverage area ID. If stop point ID: from_datetime
 * @param {string} coverageOrParams - If filter: datetime. If stop point ID: coverage area ID
 * @param {object} params - Additional query parameters
 * @returns {Promise} API response with stop schedules
 */
export const getStopSchedules = async (filterOrStopPointId, fromDatetimeOrCoverage = DEFAULT_COVERAGE, coverageOrParams = null, params = {}) => {
    try {
        let url, requestParams;
        
        // Support both formats: filter string OR stop point ID
        if (filterOrStopPointId.includes('=') || filterOrStopPointId.startsWith('stop_area') || filterOrStopPointId.startsWith('stop_point')) {
            // Filter format: getStopSchedules('stop_area.id=xxx', coverage, datetime, params)
            const filter = filterOrStopPointId;
            const coverage = fromDatetimeOrCoverage;
            const datetime = coverageOrParams;
            url = `${API_BASE_URL}/coverage/${coverage}/stop_schedules`;
            requestParams = { filter, ...params };
            if (datetime) requestParams.datetime = datetime;
        } else {
            // Stop point ID format: getStopSchedules(stopPointId, fromDatetime, coverage, params)
            const stopPointId = filterOrStopPointId;
            const fromDatetime = fromDatetimeOrCoverage;
            const coverage = coverageOrParams || DEFAULT_COVERAGE;
            url = `${API_BASE_URL}/coverage/${coverage}/stop_points/${stopPointId}/stop_schedules`;
            requestParams = { ...params };
            if (fromDatetime) requestParams.from_datetime = fromDatetime;
        }
        
        const response = await axios.get(url, {
            headers: getHeaders(),
            params: requestParams,
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching stop schedules:', error);
        throw error;
    }
};

/**
 * Get route schedules
 * @param {string} filterOrRouteId - Filter string (e.g., 'line.id=xxx') OR route ID
 * @param {string} fromDatetimeOrCoverage - If filter: coverage area ID. If route ID: from_datetime
 * @param {string} coverageOrParams - If filter: datetime. If route ID: coverage area ID
 * @param {object} params - Additional query parameters
 * @returns {Promise} API response with route schedules
 */
export const getRouteSchedules = async (filterOrRouteId, fromDatetimeOrCoverage = DEFAULT_COVERAGE, coverageOrParams = null, params = {}) => {
    try {
        let url, requestParams;
        
        // Support both formats: filter string OR route ID
        if (filterOrRouteId.includes('=') || filterOrRouteId.startsWith('line') || filterOrRouteId.startsWith('route')) {
            // Filter format: getRouteSchedules('line.id=xxx', coverage, datetime, params)
            const filter = filterOrRouteId;
            const coverage = fromDatetimeOrCoverage;
            const datetime = coverageOrParams;
            url = `${API_BASE_URL}/coverage/${coverage}/route_schedules`;
            requestParams = { filter, ...params };
            if (datetime) requestParams.datetime = datetime;
        } else {
            // Route ID format: getRouteSchedules(routeId, fromDatetime, coverage, params)
            const routeId = filterOrRouteId;
            const fromDatetime = fromDatetimeOrCoverage;
            const coverage = coverageOrParams || DEFAULT_COVERAGE;
            url = `${API_BASE_URL}/coverage/${coverage}/routes/${routeId}/route_schedules`;
            requestParams = { ...params };
            if (fromDatetime) requestParams.from_datetime = fromDatetime;
        }
        
        const response = await axios.get(url, {
            headers: getHeaders(),
            params: requestParams,
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching route schedules:', error);
        throw error;
    }
};

/**
 * Get terminus schedules
 * @param {string} filterOrLineId - Filter string OR line ID
 * @param {string} stopAreaIdOrFromDatetime - If filter: from_datetime. If line ID: stop area ID
 * @param {string} fromDatetimeOrCoverage - If filter: coverage. If line ID: from_datetime
 * @param {string} coverageOrParams - If filter: params. If line ID: coverage area ID
 * @param {object} params - Additional query parameters
 * @returns {Promise} API response with terminus schedules
 */
export const getTerminusSchedules = async (filterOrLineId, stopAreaIdOrFromDatetime = null, fromDatetimeOrCoverage = DEFAULT_COVERAGE, coverageOrParams = null, params = {}) => {
    try {
        let url, requestParams;
        
        // Support both formats: filter string OR line ID + stop area ID
        if (filterOrLineId.includes('=')) {
            // Filter format: getTerminusSchedules('filter', fromDatetime, coverage, params)
            const filter = filterOrLineId;
            const fromDatetime = stopAreaIdOrFromDatetime;
            const coverage = fromDatetimeOrCoverage;
            url = `${API_BASE_URL}/coverage/${coverage}/terminus_schedules`;
            requestParams = { filter, ...params };
            if (fromDatetime) requestParams.from_datetime = fromDatetime;
        } else {
            // Line ID format: getTerminusSchedules(lineId, stopAreaId, fromDatetime, coverage, params)
            const lineId = filterOrLineId;
            const stopAreaId = stopAreaIdOrFromDatetime;
            const fromDatetime = fromDatetimeOrCoverage;
            const coverage = coverageOrParams || DEFAULT_COVERAGE;
            url = `${API_BASE_URL}/coverage/${coverage}/physical_modes/physical_mode:Bus/lines/${lineId}/stop_areas/${stopAreaId}/terminus_schedules`;
            requestParams = { ...params };
            if (fromDatetime) requestParams.from_datetime = fromDatetime;
        }
        
        const response = await axios.get(url, {
            headers: getHeaders(),
            params: requestParams,
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching terminus schedules:', error);
        throw error;
    }
};

/**
 * Calculate isochrones (Beta)
 * @param {string} from - Origin location ID
 * @param {string} datetime - Optional datetime (default: null)
 * @param {string} coverage - Coverage area ID (default: 'sncf')
 * @param {object} params - Additional query parameters (max_duration, etc.)
 * @returns {Promise} API response with isochrone data
 */
export const getIsochrones = async (from, datetime = null, coverage = DEFAULT_COVERAGE, params = {}) => {
    try {
        const queryParams = { from, ...params };
        if (datetime) {
            queryParams.datetime = datetime;
        }
        const response = await axios.get(
            `${API_BASE_URL}/coverage/${coverage}/isochrones`,
            {
                headers: getHeaders(),
                params: queryParams,
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching isochrones:', error);
        throw error;
    }
};

/**
 * Get line reports
 * @param {string} filterOrLineId - Filter string OR line ID
 * @param {string} coverageOrParams - If filter: coverage area ID. If line ID: coverage area ID
 * @param {object} params - Additional query parameters
 * @returns {Promise} API response with line reports
 */
export const getLineReports = async (filterOrLineId, coverageOrParams = DEFAULT_COVERAGE, params = {}) => {
    try {
        let url, requestParams;
        
        // Support both formats: filter string OR line ID
        if (filterOrLineId.includes('=')) {
            // Filter format: getLineReports('filter', coverage, params)
            const filter = filterOrLineId;
            const coverage = coverageOrParams;
            url = `${API_BASE_URL}/coverage/${coverage}/line_reports`;
            requestParams = { filter, ...params };
        } else {
            // Line ID format: getLineReports(lineId, coverage, params)
            const lineId = filterOrLineId;
            const coverage = coverageOrParams;
            url = `${API_BASE_URL}/coverage/${coverage}/lines/${lineId}/line_reports`;
            requestParams = params;
        }
        
        const response = await axios.get(url, {
            headers: getHeaders(),
            params: requestParams,
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching line reports:', error);
        throw error;
    }
};

/**
 * Get traffic reports
 * @param {string} coverage - Coverage area ID (default: 'sncf')
 * @param {object} params - Additional query parameters
 * @returns {Promise} API response with traffic reports
 */
export const getTrafficReports = async (coverage = DEFAULT_COVERAGE, params = {}) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/coverage/${coverage}/traffic_reports`,
            {
                headers: getHeaders(),
                params,
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching traffic reports:', error);
        throw error;
    }
};

/**
 * Get equipment reports
 * @param {string} coverage - Coverage area ID (default: 'sncf')
 * @param {string} filter - Optional filter string
 * @param {object} params - Additional query parameters
 * @returns {Promise} API response with equipment reports
 */
export const getEquipmentReports = async (coverage = DEFAULT_COVERAGE, filter = null, params = {}) => {
    try {
        const requestParams = { ...params };
        if (filter) {
            requestParams.filter = filter;
        }
        const response = await axios.get(
            `${API_BASE_URL}/coverage/${coverage}/equipment_reports`,
            {
                headers: getHeaders(),
                params: requestParams,
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching equipment reports:', error);
        throw error;
    }
};

/**
 * Get datasets information
 * @param {string} coverage - Coverage area ID (default: 'sncf')
 * @returns {Promise} API response with datasets
 */
export const getDatasets = async (coverage = DEFAULT_COVERAGE) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/coverage/${coverage}/datasets`,
            { headers: getHeaders() }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching datasets:', error);
        throw error;
    }
};

/**
 * Get contributors information
 * @param {string} coverage - Coverage area ID (default: 'sncf')
 * @returns {Promise} API response with contributors
 */
export const getContributors = async (coverage = DEFAULT_COVERAGE) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/coverage/${coverage}/contributors`,
            { headers: getHeaders() }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching contributors:', error);
        throw error;
    }
};

/**
 * Format datetime to SNCF API format (YYYYMMDDTHHmmss)
 * @param {Date} date - JavaScript Date object
 * @returns {string} Formatted datetime string
 */
export const formatDateTime = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}T${hours}${minutes}${seconds}`;
};

// ==================== Additional Functions from navitiaApi ====================

/**
 * Autocomplete on Public Transport objects
 * @param {string} q - Search query
 * @param {string} coverage - Coverage area ID (default: 'sncf')
 * @param {number} count - Number of results (default: 10)
 * @returns {Promise} API response with PT objects
 */
export const autocompletePT = async (q, coverage = DEFAULT_COVERAGE, count = 10) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/coverage/${coverage}/pt_objects`,
            {
                headers: getHeaders(),
                params: { q, count }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error autocomplete PT:', error);
        throw error;
    }
};

/**
 * Inverted geocoding - get address from coordinates
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {string} coverage - Coverage area ID (default: 'sncf')
 * @returns {Promise} API response with addresses
 */
export const invertedGeocoding = async (lat, lon, coverage = DEFAULT_COVERAGE) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/coverage/${coverage}/coord/${lon};${lat}/addresses`,
            {
                headers: getHeaders()
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error inverted geocoding:', error);
        throw error;
    }
};

/**
 * Get routes
 * @param {string} coverage - Coverage area ID (default: 'sncf')
 * @param {object} params - Additional query parameters
 * @returns {Promise} API response with routes
 */
export const getRoutes = async (coverage = DEFAULT_COVERAGE, params = {}) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/coverage/${coverage}/routes`,
            {
                headers: getHeaders(),
                params
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching routes:', error);
        throw error;
    }
};

/**
 * Get stop points
 * @param {string} coverage - Coverage area ID (default: 'sncf')
 * @param {object} params - Additional query parameters
 * @returns {Promise} API response with stop points
 */
export const getStopPoints = async (coverage = DEFAULT_COVERAGE, params = {}) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/coverage/${coverage}/stop_points`,
            {
                headers: getHeaders(),
                params
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching stop points:', error);
        throw error;
    }
};

/**
 * Get networks
 * @param {string} coverage - Coverage area ID (default: 'sncf')
 * @param {object} params - Additional query parameters
 * @returns {Promise} API response with networks
 */
export const getNetworks = async (coverage = DEFAULT_COVERAGE, params = {}) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/coverage/${coverage}/networks`,
            {
                headers: getHeaders(),
                params
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching networks:', error);
        throw error;
    }
};

/**
 * Get freefloatings nearby
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {string} coverage - Coverage area ID (default: 'sncf')
 * @param {number} distance - Distance in meters (default: 200)
 * @returns {Promise} API response with freefloatings
 */
export const getFreefloatingsNearby = async (lat, lon, coverage = DEFAULT_COVERAGE, distance = 200) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/coverage/${coverage}/coord/${lon};${lat}/freefloatings`,
            {
                headers: getHeaders(),
                params: { distance }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching freefloatings:', error);
        throw error;
    }
};

