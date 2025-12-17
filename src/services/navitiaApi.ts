/**
 * Navitia API Service
 * 
 * This service wraps the generated NavitiaClient to provide typed API responses.
 * 
 * All functions return the full Axios response object with typed .data property.
 * Access the typed data via response.data (e.g., response.data.journeys)
 */

import { NavitiaClient } from '../client/client';
import type { AxiosPromise } from 'axios';
import type {
    Journey,
    CommercialModesResponse,
    DeparturesResponse,
    ArrivalsResponse,
    CoverageResponse,
    PhysicalModesResponse,
    LinesResponse,
    StopAreasResponse,
    PlacesResponse,
    StopSchedulesResponse,
    RouteSchedulesResponse,
    TerminusSchedulesResponse,
    VehicleJourneysResponse,
    DatasetsResponse,
    ContributorsResponse
} from '../client/models';
import type {
    CoverageCoveragePlacesGetTypeEnum,
    CoverageCoveragePlacesNearbyGetTypeEnum
} from '../client/api/places-api';

const DEFAULT_COVERAGE = 'sncf';

// Initialize the client singleton
let clientInstance: NavitiaClient | null = null;

const getClient = (): NavitiaClient => {
    if (!clientInstance) {
        clientInstance = new NavitiaClient({
            apiKey: '',
            basePath: '/api',
        });
    }
    return clientInstance;
};

interface JourneyParams {
    datetime_represents?: 'departure' | 'arrival';
    data_freshness?: 'base_schedule' | 'realtime';
    count?: number;
    max_duration?: number;
    min_nb_journeys?: number;
    timeframe_duration?: number;
}

interface DepartureArrivalParams {
    count?: number;
    depth?: number;
}

interface PlacesParams {
    count?: number;
    type?: string | string[];
    depth?: number;
}

interface PlacesNearbyParams {
    distance?: number;
    type?: string | string[];
    count?: number;
    depth?: number;
}

interface IsochronesParams {
    max_duration?: number;
}

/**
 * Get commercial modes available in SNCF API
 */
export const getCommercialModes = (coverage: string = DEFAULT_COVERAGE): AxiosPromise<CommercialModesResponse> =>
    getClient().transportModes.coverageCoverageCommercialModesGet(coverage);

/**
 * Get journeys between two locations
 */
export const getJourneys = (
    from: string,
    to: string,
    datetime: string | null = null,
    coverage: string = DEFAULT_COVERAGE,
    params: JourneyParams = {}
): AxiosPromise<Journey> =>
    getClient().journeys.coverageCoverageJourneysGet(
        coverage,
        from,
        to,
        datetime || undefined,
        params.datetime_represents || undefined,
        params.data_freshness || undefined,
        params.count || undefined,
        params.max_duration || undefined,
        params.min_nb_journeys || undefined,
        params.timeframe_duration || undefined
    );

/**
 * Get departures from a stop area
 */
export const getDepartures = (
    stopAreaId: string,
    datetime: string | null = null,
    coverage: string = DEFAULT_COVERAGE,
    params: DepartureArrivalParams = {}
): AxiosPromise<DeparturesResponse> =>
    getClient().departures.coverageCoverageStopAreasIdDeparturesGet(
        coverage,
        stopAreaId,
        datetime || undefined,
        params.count || undefined,
        params.depth || undefined
    );

/**
 * Get arrivals to a stop area
 */
export const getArrivals = (
    stopAreaId: string,
    datetime: string | null = null,
    coverage: string = DEFAULT_COVERAGE,
    params: DepartureArrivalParams = {}
): AxiosPromise<ArrivalsResponse> =>
    getClient().arrivals.coverageCoverageStopAreasIdArrivalsGet(
        coverage,
        stopAreaId,
        datetime || undefined,
        params.count || undefined,
        params.depth || undefined
    );

/**
 * Get all available coverages
 */
export const getCoverages = (): AxiosPromise<CoverageResponse> =>
    getClient().coverage.coverageGet();

/**
 * Get coverage areas (alias for getCoverages for backward compatibility)
 */
export const getCoverage = getCoverages;

/**
 * Get specific coverage area details
 */
export const getCoverageDetails = (coverage: string = DEFAULT_COVERAGE): AxiosPromise<any> =>
    getClient().coverage.coverageCoverageGet(coverage);

/**
 * Get physical modes
 */
export const getPhysicalModes = (coverage: string = DEFAULT_COVERAGE): AxiosPromise<PhysicalModesResponse> =>
    getClient().transportModes.coverageCoveragePhysicalModesGet(coverage);

/**
 * Get all lines
 */
export const getLines = (coverage: string = DEFAULT_COVERAGE, params: any = {}): AxiosPromise<LinesResponse> =>
    getClient().publicTransportObjects.coverageCoverageLinesGet(coverage);

/**
 * Get all stop areas
 */
export const getStopAreas = (coverage: string = DEFAULT_COVERAGE, params: any = {}): AxiosPromise<StopAreasResponse> =>
    getClient().publicTransportObjects.coverageCoverageStopAreasGet(coverage);

/**
 * Search for places (geographical autocomplete)
 */
export const searchPlaces = (
    query: string,
    coverage: string = DEFAULT_COVERAGE,
    params: PlacesParams = {}
): AxiosPromise<PlacesResponse> =>
    getClient().places.coverageCoveragePlacesGet(
        coverage,
        query,
        params.count || undefined,
        params.type ? (Array.isArray(params.type) ? params.type as CoverageCoveragePlacesGetTypeEnum[] : [params.type] as CoverageCoveragePlacesGetTypeEnum[]) : undefined,
        params.depth || undefined
    );

/**
 * Autocomplete on geographical objects (alias for searchPlaces)
 */
export const autocompleteGeo = (
    q: string,
    coverage: string = DEFAULT_COVERAGE,
    count: number = 10,
    type: string | null = null
): AxiosPromise<PlacesResponse> => {
    const params: PlacesParams = { count };
    if (type) params.type = type;
    return searchPlaces(q, coverage, params);
};

/**
 * Find places nearby coordinates
 */
export const getPlacesNearby = (
    coord: string | null,
    latOrCoverage: string | number = DEFAULT_COVERAGE,
    lonOrParams: number | PlacesNearbyParams = {},
    coverageOrDistance: string | number = 200,
    paramsOrType: string | null = null
): AxiosPromise<PlacesResponse> => {
    if (typeof coord === 'string' && coord.includes(';')) {
        const params = lonOrParams as PlacesNearbyParams;
        return getClient().places.coverageCoveragePlacesNearbyGet(
            latOrCoverage as string,
            coord,
            params.distance || undefined,
            params.type ? (Array.isArray(params.type) ? params.type as CoverageCoveragePlacesNearbyGetTypeEnum[] : [params.type] as CoverageCoveragePlacesNearbyGetTypeEnum[]) : undefined,
            params.count || undefined,
            params.depth || undefined
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
            type ? [type] as CoverageCoveragePlacesNearbyGetTypeEnum[] : undefined,
            undefined,
            undefined
        );
    } else {
        const params = lonOrParams as PlacesNearbyParams;
        return getClient().places.coverageCoveragePlacesNearbyGet(
            latOrCoverage as string,
            coord as string,
            params.distance || undefined,
            params.type ? (Array.isArray(params.type) ? params.type as CoverageCoveragePlacesNearbyGetTypeEnum[] : [params.type] as CoverageCoveragePlacesNearbyGetTypeEnum[]) : undefined,
            params.count || undefined,
            params.depth || undefined
        );
    }
};

/**
 * Places nearby using lat/lon separately (convenience function)
 */
export const placesNearby = (
    lat: number,
    lon: number,
    coverage: string = DEFAULT_COVERAGE,
    distance: number = 200,
    type: string | null = null
): AxiosPromise<PlacesResponse> => {
    const coordStr = `${lon};${lat}`;
    const params: PlacesNearbyParams = { distance };
    if (type) params.type = type;
    return getPlacesNearby(coordStr, coverage, params);
};

/**
 * Get stop schedules
 */
export const getStopSchedules = (
    filterOrStopPointId: string,
    fromDatetimeOrCoverage: string = DEFAULT_COVERAGE,
    coverageOrParams: string | null = null,
    params: any = {}
): AxiosPromise<StopSchedulesResponse> => {
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
 */
export const getRouteSchedules = (
    filterOrRouteId: string,
    fromDatetimeOrCoverage: string = DEFAULT_COVERAGE,
    coverageOrParams: string | null = null,
    params: any = {}
): AxiosPromise<RouteSchedulesResponse> => {
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
 */
export const getTerminusSchedules = (
    filterOrLineId: string,
    stopAreaIdOrFromDatetime: string | null = null,
    fromDatetimeOrCoverage: string = DEFAULT_COVERAGE,
    coverageOrParams: string | null = null,
    params: any = {}
): AxiosPromise<TerminusSchedulesResponse> => {
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
            stopAreaIdOrFromDatetime!,
            fromDatetimeOrCoverage || undefined
        );
    }
};

/**
 * Calculate isochrones (Beta)
 */
export const getIsochrones = (
    from: string,
    datetime: string | null = null,
    coverage: string = DEFAULT_COVERAGE,
    params: IsochronesParams = {}
): AxiosPromise<any> =>
    getClient().isochrones.coverageCoverageIsochronesGet(
        coverage,
        from,
        params.max_duration || undefined
    );

/**
 * Get line reports
 */
export const getLineReports = (
    filterOrLineId: string,
    coverageOrParams: string = DEFAULT_COVERAGE,
    params: any = {}
): AxiosPromise<any> => {
    if (filterOrLineId.includes('=')) {
        return getClient().reports.coverageCoverageLineReportsGet(coverageOrParams, filterOrLineId);
    } else {
        return getClient().reports.coverageCoverageLinesIdLineReportsGet(coverageOrParams, filterOrLineId);
    }
};

/**
 * Get traffic reports
 */
export const getTrafficReports = (coverage: string = DEFAULT_COVERAGE, params: any = {}): AxiosPromise<any> =>
    getClient().reports.coverageCoverageTrafficReportsGet(coverage);

/**
 * Get equipment reports
 */
export const getEquipmentReports = (
    coverage: string = DEFAULT_COVERAGE,
    filter: string | null = null,
    params: any = {}
): AxiosPromise<any> =>
    getClient().reports.coverageCoverageEquipmentReportsGet(
        coverage,
        filter || undefined
    );

/**
 * Get datasets information
 */
export const getDatasets = (coverage: string = DEFAULT_COVERAGE): AxiosPromise<DatasetsResponse> =>
    getClient().datasets.coverageCoverageDatasetsGet(coverage);

/**
 * Get contributors information
 */
export const getContributors = (coverage: string = DEFAULT_COVERAGE): AxiosPromise<ContributorsResponse> =>
    getClient().contributors.coverageCoverageContributorsGet(coverage);

/**
 * Format datetime to SNCF API format (YYYYMMDDTHHmmss)
 */
export const formatDateTime = (date: Date): string => {
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
 */
export const autocompletePT = (
    q: string,
    coverage: string = DEFAULT_COVERAGE,
    count: number = 10
): AxiosPromise<PlacesResponse> =>
    getClient().publicTransportObjects.coverageCoveragePtObjectsGet(coverage, q, count);

/**
 * Inverted geocoding - get address from coordinates
 */
export const invertedGeocoding = (
    lat: number,
    lon: number,
    coverage: string = DEFAULT_COVERAGE
): AxiosPromise<PlacesResponse> => {
    const coord = `${lon};${lat}`;
    return getClient().places.coverageCoverageCoordCoordAddressesGet(coverage, coord);
};

/**
 * Get routes
 */
export const getRoutes = (coverage: string = DEFAULT_COVERAGE, params: any = {}): AxiosPromise<any> =>
    getClient().publicTransportObjects.coverageCoverageRoutesGet(coverage);

/**
 * Get stop points
 */
export const getStopPoints = (coverage: string = DEFAULT_COVERAGE, params: any = {}): AxiosPromise<any> =>
    getClient().publicTransportObjects.coverageCoverageStopPointsGet(coverage);

/**
 * Get networks
 */
export const getNetworks = (coverage: string = DEFAULT_COVERAGE, params: any = {}): AxiosPromise<any> =>
    getClient().publicTransportObjects.coverageCoverageNetworksGet(coverage);

/**
 * Get freefloatings nearby
 */
export const getFreefloatingsNearby = (
    lat: number,
    lon: number,
    coverage: string = DEFAULT_COVERAGE,
    distance: number = 200
): AxiosPromise<any> => {
    const coord = `${lon};${lat}`;
    return getClient().places.coverageCoverageCoordCoordFreefloatingsGet(coverage, coord, distance);
};

/**
 * Get vehicle journey details
 */
export const getVehicleJourney = (
    vehicleJourneyId: string,
    coverage: string = DEFAULT_COVERAGE
): AxiosPromise<VehicleJourneysResponse> =>
    getClient().publicTransportObjects.coverageCoverageVehicleJourneysIdGet(coverage, vehicleJourneyId);
