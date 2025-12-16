/**
 * Navitia API Service
 * 
 * This service wraps the generated NavitiaClient to provide typed API responses.
 * 
 * All functions return the full Axios response object with typed .data property.
 * Access the typed data via response.data (e.g., response.data.journeys)
 */

import { NavitiaClient } from '../client/client';

const DEFAULT_COVERAGE = 'sncf';

// Initialize the client singleton
let clientInstance = null;

const getClient = () => {
    if (!clientInstance) {
        const apiKey = process.env.REACT_APP_API_KEY;
        if (!apiKey) {
            console.warn('REACT_APP_API_KEY is not set');
        }
        clientInstance = new NavitiaClient({
            apiKey: apiKey || '',
            basePath: 'https://api.sncf.com/v1',
        });
    }
    return clientInstance;
};

/**
 * Get commercial modes available in SNCF API
 * @param {string} coverage - Coverage area ID (default: 'sncf')
 * @returns {Promise} API response with commercial modes
 */
export const getCommercialModes = (coverage = DEFAULT_COVERAGE) =>
    getClient().transportModes.coverageCoverageCommercialModesGet(coverage);

/**
 * Get journeys between two locations
 * @param {string} from - Origin location ID
 * @param {string} to - Destination location ID
 * @param {string} datetime - Date and time in format 'YYYYMMDDTHHmmss'
 * @param {string} coverage - Coverage area ID (default: 'sncf')
 * @param {object} params - Additional query parameters
 * @returns {Promise} API response with journeys
 */
export const getJourneys = (from, to, datetime = null, coverage = DEFAULT_COVERAGE, params = {}) =>
    getClient().journeys.coverageCoverageJourneysGet(
        coverage,
        from,
        to,
        datetime || undefined,
        params?.datetime_represents || undefined,
        params?.data_freshness || undefined,
        params?.count || undefined,
        params?.max_duration || undefined,
        params?.min_nb_journeys || undefined,
        params?.timeframe_duration || undefined
    );

/**
 * Get departures from a stop area
 * @param {string} stopAreaId - Stop area ID
 * @param {string} datetime - Date and time in format 'YYYYMMDDTHHmmss'
 * @param {string} coverage - Coverage area ID (default: 'sncf')
 * @param {object} params - Additional query parameters
 * @returns {Promise} API response with departures
 */
export const getDepartures = (stopAreaId, datetime = null, coverage = DEFAULT_COVERAGE, params = {}) =>
    getClient().departures.coverageCoverageStopAreasIdDeparturesGet(
        coverage,
        stopAreaId,
        datetime || undefined,
        params?.count || undefined,
        params?.depth || undefined
    );

/**
 * Get arrivals to a stop area
 * @param {string} stopAreaId - Stop area ID
 * @param {string} datetime - Date and time in format 'YYYYMMDDTHHmmss'
 * @param {string} coverage - Coverage area ID (default: 'sncf')
 * @param {object} params - Additional query parameters
 * @returns {Promise} API response with arrivals
 */
export const getArrivals = (stopAreaId, datetime = null, coverage = DEFAULT_COVERAGE, params = {}) =>
    getClient().arrivals.coverageCoverageStopAreasIdArrivalsGet(
        coverage,
        stopAreaId,
        datetime || undefined,
        params?.count || undefined,
        params?.depth || undefined
    );

/**
 * Get all available coverages
 * @returns {Promise} API response with coverage areas
 */
export const getCoverages = () =>
    getClient().coverage.coverageGet();

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
export const getCoverageDetails = (coverage = DEFAULT_COVERAGE) =>
    getClient().coverage.coverageCoverageGet(coverage);

/**
 * Get physical modes
 * @param {string} coverage - Coverage area ID (default: 'sncf')
 * @returns {Promise} API response with physical modes
 */
export const getPhysicalModes = (coverage = DEFAULT_COVERAGE) =>
    getClient().transportModes.coverageCoveragePhysicalModesGet(coverage);

/**
 * Get all lines
 * @param {string} coverage - Coverage area ID (default: 'sncf')
 * @param {object} params - Additional query parameters
 * @returns {Promise} API response with lines
 */
export const getLines = (coverage = DEFAULT_COVERAGE, params = {}) =>
    getClient().publicTransportObjects.coverageCoverageLinesGet(coverage);

/**
 * Get all stop areas
 * @param {string} coverage - Coverage area ID (default: 'sncf')
 * @param {object} params - Additional query parameters
 * @returns {Promise} API response with stop areas
 */
export const getStopAreas = (coverage = DEFAULT_COVERAGE, params = {}) =>
    getClient().publicTransportObjects.coverageCoverageStopAreasGet(coverage);

/**
 * Search for places (geographical autocomplete)
 * @param {string} query - Search query
 * @param {string} coverage - Coverage area ID (default: 'sncf')
 * @param {object} params - Additional query parameters (count, type, etc.)
 * @returns {Promise} API response with places
 */
export const searchPlaces = (query, coverage = DEFAULT_COVERAGE, params = {}) =>
    getClient().places.coverageCoveragePlacesGet(
        coverage,
        query,
        params?.count || undefined,
        params?.type ? (Array.isArray(params.type) ? params.type : [params.type]) : undefined,
        params?.depth || undefined
    );

/**
 * Autocomplete on geographical objects (alias for searchPlaces)
 * @param {string} q - Search query
 * @param {string} coverage - Coverage area ID (default: 'sncf')
 * @param {number} count - Number of results (default: 10)
 * @param {string} type - Optional type filter
 * @returns {Promise} API response with places
 */
export const autocompleteGeo = (q, coverage = DEFAULT_COVERAGE, count = 10, type = null) => {
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
export const getPlacesNearby = (coord, latOrCoverage = DEFAULT_COVERAGE, lonOrParams = {}, coverageOrDistance = 200, paramsOrType = null) => {
    if (typeof coord === 'string' && coord.includes(';')) {
        return getClient().places.coverageCoveragePlacesNearbyGet(
            latOrCoverage,
            coord,
            lonOrParams?.distance || undefined,
            lonOrParams?.type ? [lonOrParams.type] : undefined,
            lonOrParams?.count || undefined,
            lonOrParams?.depth || undefined
        );
    } else if (typeof latOrCoverage === 'number' && typeof lonOrParams === 'number') {
        const lat = latOrCoverage;
        const lon = lonOrParams;
        const coverage = typeof coverageOrDistance === 'string' ? coverageOrDistance : DEFAULT_COVERAGE;
        const distance = typeof coverageOrDistance === 'number' ? coverageOrDistance : 200;
        const type = typeof paramsOrType === 'string' ? paramsOrType : null;
        const coordStr = `${lon};${lat}`;
        return getClient().places.coverageCoveragePlacesNearbyGet(
            coverage,
            coordStr,
            distance || undefined,
            type ? [type] : undefined,
            undefined,
            undefined
        );
    } else {
        return getClient().places.coverageCoveragePlacesNearbyGet(
            latOrCoverage,
            coord,
            lonOrParams?.distance || undefined,
            lonOrParams?.type ? [lonOrParams.type] : undefined,
            lonOrParams?.count || undefined,
            lonOrParams?.depth || undefined
        );
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
export const placesNearby = (lat, lon, coverage = DEFAULT_COVERAGE, distance = 200, type = null) =>
    getPlacesNearby(null, lat, lon, coverage, distance, type);

/**
 * Get stop schedules
 * @param {string} filterOrStopPointId - Filter string (e.g., 'stop_area.id=xxx') OR stop point ID
 * @param {string} fromDatetimeOrCoverage - If filter: coverage area ID. If stop point ID: from_datetime
 * @param {string} coverageOrParams - If filter: datetime. If stop point ID: coverage area ID
 * @param {object} params - Additional query parameters
 * @returns {Promise} API response with stop schedules
 */
export const getStopSchedules = (filterOrStopPointId, fromDatetimeOrCoverage = DEFAULT_COVERAGE, coverageOrParams = null, params = {}) => {
    if (filterOrStopPointId.includes('=') || filterOrStopPointId.startsWith('stop_area') || filterOrStopPointId.startsWith('stop_point')) {
        return getClient().schedules.coverageCoverageStopSchedulesGet(
            fromDatetimeOrCoverage,
            filterOrStopPointId,
            coverageOrParams || undefined
        );
    } else {
        return getClient().schedules.coverageCoverageStopPointsIdStopSchedulesGet(
            coverageOrParams || DEFAULT_COVERAGE,
            filterOrStopPointId,
            fromDatetimeOrCoverage || undefined
        );
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
export const getRouteSchedules = (filterOrRouteId, fromDatetimeOrCoverage = DEFAULT_COVERAGE, coverageOrParams = null, params = {}) => {
    if (filterOrRouteId.includes('=') || filterOrRouteId.startsWith('line') || filterOrRouteId.startsWith('route')) {
        return getClient().schedules.coverageCoverageRouteSchedulesGet(
            fromDatetimeOrCoverage,
            filterOrRouteId,
            coverageOrParams || undefined
        );
    } else {
        return getClient().schedules.coverageCoverageRoutesIdRouteSchedulesGet(
            coverageOrParams || DEFAULT_COVERAGE,
            filterOrRouteId,
            fromDatetimeOrCoverage || undefined
        );
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
export const getTerminusSchedules = (filterOrLineId, stopAreaIdOrFromDatetime = null, fromDatetimeOrCoverage = DEFAULT_COVERAGE, coverageOrParams = null, params = {}) => {
    if (filterOrLineId.includes('=')) {
        return getClient().schedules.coverageCoverageTerminusSchedulesGet(
            fromDatetimeOrCoverage,
            filterOrLineId,
            stopAreaIdOrFromDatetime || undefined
        );
    } else {
        return getClient().schedules.coverageCoveragePhysicalModesPhysicalModeLinesLineStopAreasStopAreaTerminusSchedulesGet(
            coverageOrParams || DEFAULT_COVERAGE,
            'physical_mode:Bus',
            filterOrLineId,
            stopAreaIdOrFromDatetime,
            fromDatetimeOrCoverage || undefined
        );
    }
};

/**
 * Calculate isochrones (Beta)
 * @param {string} from - Origin location ID
 * @param {string} datetime - Optional datetime (default: null) - Note: not supported by API
 * @param {string} coverage - Coverage area ID (default: 'sncf')
 * @param {object} params - Additional query parameters (max_duration, etc.)
 * @returns {Promise} API response with isochrone data
 */
export const getIsochrones = (from, datetime = null, coverage = DEFAULT_COVERAGE, params = {}) =>
    getClient().isochrones.coverageCoverageIsochronesGet(
        coverage,
        from,
        params?.max_duration || undefined
    );

/**
 * Get line reports
 * @param {string} filterOrLineId - Filter string OR line ID
 * @param {string} coverageOrParams - If filter: coverage area ID. If line ID: coverage area ID
 * @param {object} params - Additional query parameters
 * @returns {Promise} API response with line reports
 */
export const getLineReports = (filterOrLineId, coverageOrParams = DEFAULT_COVERAGE, params = {}) => {
    if (filterOrLineId.includes('=')) {
        return getClient().reports.coverageCoverageLineReportsGet(coverageOrParams, filterOrLineId);
    } else {
        return getClient().reports.coverageCoverageLinesIdLineReportsGet(coverageOrParams, filterOrLineId);
    }
};

/**
 * Get traffic reports
 * @param {string} coverage - Coverage area ID (default: 'sncf')
 * @param {object} params - Additional query parameters
 * @returns {Promise} API response with traffic reports
 */
export const getTrafficReports = (coverage = DEFAULT_COVERAGE, params = {}) =>
    getClient().reports.coverageCoverageTrafficReportsGet(coverage);

/**
 * Get equipment reports
 * @param {string} coverage - Coverage area ID (default: 'sncf')
 * @param {string} filter - Optional filter string
 * @param {object} params - Additional query parameters
 * @returns {Promise} API response with equipment reports
 */
export const getEquipmentReports = (coverage = DEFAULT_COVERAGE, filter = null, params = {}) =>
    getClient().reports.coverageCoverageEquipmentReportsGet(
        coverage,
        filter || undefined
    );

/**
 * Get datasets information
 * @param {string} coverage - Coverage area ID (default: 'sncf')
 * @returns {Promise} API response with datasets
 */
export const getDatasets = (coverage = DEFAULT_COVERAGE) =>
    getClient().datasets.coverageCoverageDatasetsGet(coverage);

/**
 * Get contributors information
 * @param {string} coverage - Coverage area ID (default: 'sncf')
 * @returns {Promise} API response with contributors
 */
export const getContributors = (coverage = DEFAULT_COVERAGE) =>
    getClient().contributors.coverageCoverageContributorsGet(coverage);

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

/**
 * Autocomplete on Public Transport objects
 * @param {string} q - Search query
 * @param {string} coverage - Coverage area ID (default: 'sncf')
 * @param {number} count - Number of results (default: 10)
 * @returns {Promise} API response with PT objects
 */
export const autocompletePT = (q, coverage = DEFAULT_COVERAGE, count = 10) =>
    getClient().publicTransportObjects.coverageCoveragePtObjectsGet(coverage, q, count);

/**
 * Inverted geocoding - get address from coordinates
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {string} coverage - Coverage area ID (default: 'sncf')
 * @returns {Promise} API response with addresses
 */
export const invertedGeocoding = (lat, lon, coverage = DEFAULT_COVERAGE) => {
    const coord = `${lon};${lat}`;
    return getClient().places.coverageCoverageCoordCoordAddressesGet(coverage, coord);
};

/**
 * Get routes
 * @param {string} coverage - Coverage area ID (default: 'sncf')
 * @param {object} params - Additional query parameters
 * @returns {Promise} API response with routes
 */
export const getRoutes = (coverage = DEFAULT_COVERAGE, params = {}) =>
    getClient().publicTransportObjects.coverageCoverageRoutesGet(coverage);

/**
 * Get stop points
 * @param {string} coverage - Coverage area ID (default: 'sncf')
 * @param {object} params - Additional query parameters
 * @returns {Promise} API response with stop points
 */
export const getStopPoints = (coverage = DEFAULT_COVERAGE, params = {}) =>
    getClient().publicTransportObjects.coverageCoverageStopPointsGet(coverage);

/**
 * Get networks
 * @param {string} coverage - Coverage area ID (default: 'sncf')
 * @param {object} params - Additional query parameters
 * @returns {Promise} API response with networks
 */
export const getNetworks = (coverage = DEFAULT_COVERAGE, params = {}) =>
    getClient().publicTransportObjects.coverageCoverageNetworksGet(coverage);

/**
 * Get freefloatings nearby
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {string} coverage - Coverage area ID (default: 'sncf')
 * @param {number} distance - Distance in meters (default: 200)
 * @returns {Promise} API response with freefloatings
 */
export const getFreefloatingsNearby = (lat, lon, coverage = DEFAULT_COVERAGE, distance = 200) => {
    const coord = `${lon};${lat}`;
    return getClient().places.coverageCoverageCoordCoordFreefloatingsGet(coverage, coord, distance);
};

/**
 * Get vehicle journey details
 * @param {string} vehicleJourneyId - Vehicle journey ID
 * @param {string} coverage - Coverage area ID (default: 'sncf')
 * @returns {Promise} API response with vehicle journey details
 */
export const getVehicleJourney = (vehicleJourneyId, coverage = DEFAULT_COVERAGE) =>
    getClient().publicTransportObjects.coverageCoverageVehicleJourneysIdGet(coverage, vehicleJourneyId);
