/**
 * Navitia API Service
 *
 * This service wraps the generated NavitiaClient to provide typed API responses.
 *
 * All functions return the typed data directly (e.g., response.journeys)
 */

import { NavitiaClient } from '@/client/client';
import type {
    Journey,
    JourneyItem,
    CommercialModesResponse,
    DeparturesResponse,
    ArrivalsResponse,
    CoverageResponse,
    Coverage,
    PhysicalModesResponse,
    LinesResponse,
    StopAreasResponse,
    PlacesResponse,
    StopSchedulesResponse,
    RouteSchedulesResponse,
    TerminusSchedulesResponse,
    VehicleJourneysResponse,
    DatasetsResponse,
    ContributorsResponse,
    CoverageCoverageTrafficReportsGet200Response,
    CoverageCoverageLineReportsGet200Response,
    CoverageCoverageEquipmentReportsGet200Response,
    CoverageCoverageRoutesGet200Response,
    CoverageCoverageStopPointsGet200Response,
    CoverageCoverageNetworksGet200Response,
    CoverageCoverageIsochronesGet200Response,
    CoverageCoverageCoordCoordFreefloatingsGet200Response
} from '@/client/models';
import type {
    CoverageCoveragePlacesGetTypeEnum
} from '@/client/api/places-api';
import {DEFAULT_RADIUS_NEARBY} from "@/pages/LocationDetection";

export const DEFAULT_COVERAGE = 'sncf';

// Initialize the client singleton
let clientInstance: NavitiaClient | null = null;

export const getClient = (): NavitiaClient => {
    if (!clientInstance) {
        const apiKey = import.meta.env.VITE_API_KEY;
        if (!apiKey) {
            console.warn('VITE_API_KEY is not set');
        }
        clientInstance = new NavitiaClient({
            apiKey: apiKey || '',
            basePath: 'https://api.sncf.com/v1',
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

interface LinesParams {
    count?: number;
    depth?: number;
    [key: string]: unknown;
}

interface StopAreasParams {
    count?: number;
    depth?: number;
    [key: string]: unknown;
}

interface StopSchedulesParams {
    from_datetime?: string;
    [key: string]: unknown;
}

interface RouteSchedulesParams {
    from_datetime?: string;
    [key: string]: unknown;
}

interface TerminusSchedulesParams {
    stop_area_id?: string;
    from_datetime?: string;
    [key: string]: unknown;
}

interface LineReportsParams {
    filter?: string;
    [key: string]: unknown;
}

interface TrafficReportsParams {
    [key: string]: unknown;
}

interface EquipmentReportsParams {
    filter?: string;
    [key: string]: unknown;
}

interface RoutesParams {
    count?: number;
    depth?: number;
    [key: string]: unknown;
}

interface StopPointsParams {
    count?: number;
    depth?: number;
    [key: string]: unknown;
}

interface NetworksParams {
    count?: number;
    depth?: number;
    [key: string]: unknown;
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
export const getCommercialModes = async (coverage: string = DEFAULT_COVERAGE): Promise<CommercialModesResponse> => {
    return (await getClient().transportModes.coverageCoverageCommercialModesGet(coverage)).data;
};

/**
 * Get journeys between two locations
 */
export const getJourneys = async (
    from: string,
    to: string,
    datetime: string | null = null,
    coverage: string = DEFAULT_COVERAGE,
    params: JourneyParams = {}
): Promise<Journey> => {
    return (await getClient().journeys.coverageCoverageJourneysGet(
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
    )).data;
};

/**
 * Get departures from a stop area
 */
export const getDepartures = async (
    stopAreaId: string,
    datetime: string | null = null,
    coverage: string = DEFAULT_COVERAGE,
    params: DepartureArrivalParams = {}
): Promise<DeparturesResponse> => {
    return (await getClient().departures.coverageCoverageStopAreasIdDeparturesGet(
        coverage,
        stopAreaId,
        datetime || undefined,
        params.count || undefined,
        params.depth || undefined
    )).data;
};

/**
 * Get arrivals to a stop area
 */
export const getArrivals = async (
    stopAreaId: string,
    datetime: string | null = null,
    coverage: string = DEFAULT_COVERAGE,
    params: DepartureArrivalParams = {}
): Promise<ArrivalsResponse> => {
    return (await getClient().arrivals.coverageCoverageStopAreasIdArrivalsGet(
        coverage,
        stopAreaId,
        datetime || undefined,
        params.count || undefined,
        params.depth || undefined
    )).data;
};

/**
 * Get all available coverages
 */
export const getCoverages = async (): Promise<CoverageResponse> => {
    return (await getClient().coverage.coverageGet()).data;
};

/**
 * Get coverage areas (alias for getCoverages for backward compatibility)
 */
export const getCoverage = getCoverages;

/**
 * Get specific coverage area details
 */
export const getCoverageDetails = async (coverage: string = DEFAULT_COVERAGE): Promise<Coverage> => {
    return (await getClient().coverage.coverageCoverageGet(coverage)).data;
};

/**
 * Get physical modes
 */
export const getPhysicalModes = async (coverage: string = DEFAULT_COVERAGE): Promise<PhysicalModesResponse> => {
    return (await getClient().transportModes.coverageCoveragePhysicalModesGet(coverage)).data;
};

/**
 * Get all lines
 */
export const getLines = async (coverage: string = DEFAULT_COVERAGE, params: LinesParams = {}): Promise<LinesResponse> => {
    return (await getClient().publicTransportObjects.coverageCoverageLinesGet(coverage)).data;
};

/**
 * Get all stop areas
 */
export const getStopAreas = async (coverage: string = DEFAULT_COVERAGE, params: StopAreasParams = {}): Promise<StopAreasResponse> => {
    return (await getClient().publicTransportObjects.coverageCoverageStopAreasGet(coverage)).data;
};

/**
 * Search for places (geographical autocomplete)
 */
export const searchPlaces = async (
    query: string,
    coverage: string = DEFAULT_COVERAGE,
    params: PlacesParams = {}
): Promise<PlacesResponse> => {
    return (await getClient().places.coverageCoveragePlacesGet(
        coverage,
        query,
        params.count || undefined,
        params.type ? (Array.isArray(params.type) ? params.type as CoverageCoveragePlacesGetTypeEnum[] : [params.type] as CoverageCoveragePlacesGetTypeEnum[]) : undefined,
        params.depth || undefined
    )).data;
};

/**
 * Autocomplete on geographical objects (alias for searchPlaces)
 */
export const autocompleteGeo = async (
    q: string,
    coverage: string = DEFAULT_COVERAGE,
    count: number = 10,
    type: string | null = null
): Promise<PlacesResponse> => {
    const params: PlacesParams = { count };
    if (type) params.type = type;
    return await searchPlaces(q, coverage, params);
};

/**
 * Find stop areas nearby coordinates
 * Uses the path-based endpoint format: /coverage/{coverage}/coord/{coord}/stop_areas
 * This endpoint returns stop areas within a certain distance from coordinates
 */
export const getPlacesNearby = async (
    coord: string | null,
    latOrCoverage: string | number = DEFAULT_COVERAGE,
    lonOrParams: number | PlacesNearbyParams = {},
    coverageOrDistance: string | number = DEFAULT_RADIUS_NEARBY,
    paramsOrType: string | null = null
): Promise<StopAreasResponse> => {
    let coverage: string;
    let coordStr: string;
    let params: PlacesNearbyParams;

    if (typeof coord === 'string' && coord.includes(';')) {
        coverage = latOrCoverage as string;
        coordStr = coord;
        params = lonOrParams as PlacesNearbyParams;
    } else if (typeof latOrCoverage === 'number' && typeof lonOrParams === 'number') {
        const lat = latOrCoverage;
        const lon = lonOrParams;
        coverage = typeof coverageOrDistance === 'string' ? coverageOrDistance : DEFAULT_COVERAGE;
        coordStr = `${lon};${lat}`;
        const distance = typeof coverageOrDistance === 'number' ? coverageOrDistance : DEFAULT_RADIUS_NEARBY;
        params = { distance };
    } else {
        coverage = latOrCoverage as string;
        coordStr = coord as string;
        params = lonOrParams as PlacesNearbyParams;
    }

    // Use the generated client method with the stop_areas endpoint
    // Note: The stop_areas endpoint doesn't support type filtering, so we ignore the type parameter if provided
    return (await getClient().places.coverageCoverageCoordCoordStopAreasGet(
        coverage,
        coordStr,
        params.distance || undefined,
        params.count || undefined,
        params.depth || undefined
    )).data;
};

/**
 * Stop areas nearby using lat/lon separately (convenience function)
 */
export const placesNearby = async (
    lat: number,
    lon: number,
    coverage: string = DEFAULT_COVERAGE,
    distance: number = 200,
    type: string | null = null
): Promise<StopAreasResponse> => {
    const coordStr = `${lon};${lat}`;
    const params: PlacesNearbyParams = { distance };
    // Note: type parameter is ignored as the stop_areas endpoint doesn't support type filtering
    return getPlacesNearby(coordStr, coverage, params);
};

/**
 * Get stop schedules
 */
export const getStopSchedules = async (
    filterOrStopPointId: string,
    fromDatetimeOrCoverage: string = DEFAULT_COVERAGE,
    coverageOrParams: string | null = null,
    params: StopSchedulesParams = {}
): Promise<StopSchedulesResponse> => {
    let data;
    if (filterOrStopPointId.includes('=') || filterOrStopPointId.startsWith('stop_area') || filterOrStopPointId.startsWith('stop_point')) {
        data = await getClient().schedules.coverageCoverageStopSchedulesGet(
            fromDatetimeOrCoverage,
            filterOrStopPointId,
            coverageOrParams || undefined
        );
    } else {
        data = await getClient().schedules.coverageCoverageStopPointsIdStopSchedulesGet(
            coverageOrParams || DEFAULT_COVERAGE,
            filterOrStopPointId,
            fromDatetimeOrCoverage || undefined
        );
    }
    return data.data;
};

/**
 * Get route schedules
 */
export const getRouteSchedules = async (
    filterOrRouteId: string,
    fromDatetimeOrCoverage: string = DEFAULT_COVERAGE,
    coverageOrParams: string | null = null,
    params: RouteSchedulesParams = {}
): Promise<RouteSchedulesResponse> => {
    let data;
    if (filterOrRouteId.includes('=') || filterOrRouteId.startsWith('line') || filterOrRouteId.startsWith('route')) {
        data = await getClient().schedules.coverageCoverageRouteSchedulesGet(
            fromDatetimeOrCoverage,
            filterOrRouteId,
            coverageOrParams || undefined
        );
    } else {
        data = await getClient().schedules.coverageCoverageRoutesIdRouteSchedulesGet(
            coverageOrParams || DEFAULT_COVERAGE,
            filterOrRouteId,
            fromDatetimeOrCoverage || undefined
        );
    }
    return data.data;
};

/**
 * Get terminus schedules
 */
export const getTerminusSchedules = async (
    filterOrLineId: string,
    stopAreaIdOrFromDatetime: string | null = null,
    fromDatetimeOrCoverage: string = DEFAULT_COVERAGE,
    coverageOrParams: string | null = null,
    params: TerminusSchedulesParams = {}
): Promise<TerminusSchedulesResponse> => {
    let data;
    if (filterOrLineId.includes('=')) {
        data = await getClient().schedules.coverageCoverageTerminusSchedulesGet(
            fromDatetimeOrCoverage,
            filterOrLineId,
            stopAreaIdOrFromDatetime || undefined
        );
    } else {
        data = await getClient().schedules.coverageCoveragePhysicalModesPhysicalModeLinesLineStopAreasStopAreaTerminusSchedulesGet(
            coverageOrParams || DEFAULT_COVERAGE,
            'physical_mode:Bus',
            filterOrLineId,
            stopAreaIdOrFromDatetime!,
            fromDatetimeOrCoverage || undefined
        );
    }
    return data.data;
};

/**
 * Calculate isochrones (Beta)
 */
export const getIsochrones = async (
    from: string,
    datetime: string | null = null,
    coverage: string = DEFAULT_COVERAGE,
    params: IsochronesParams = {}
): Promise<CoverageCoverageIsochronesGet200Response> => {
    return (await getClient().isochrones.coverageCoverageIsochronesGet(
        coverage,
        from,
        params.max_duration || undefined
    )).data;
};

/**
 * Get line reports
 */
export const getLineReports = async (
    filterOrLineId: string,
    coverageOrParams: string = DEFAULT_COVERAGE,
    params: LineReportsParams = {}
): Promise<CoverageCoverageLineReportsGet200Response> => {
    let data;
    if (filterOrLineId.includes('=')) {
        data = await getClient().reports.coverageCoverageLineReportsGet(coverageOrParams, filterOrLineId);
    } else {
        data = await getClient().reports.coverageCoverageLinesIdLineReportsGet(coverageOrParams, filterOrLineId);
    }
    return data.data;
};

/**
 * Get traffic reports
 */
export const getTrafficReports = async (coverage: string = DEFAULT_COVERAGE, params: TrafficReportsParams = {}): Promise<CoverageCoverageTrafficReportsGet200Response> => {
    return (await getClient().reports.coverageCoverageTrafficReportsGet(coverage)).data;
};

/**
 * Get equipment reports
 */
export const getEquipmentReports = async (
    coverage: string = DEFAULT_COVERAGE,
    filter: string | null = null,
    params: EquipmentReportsParams = {}
): Promise<CoverageCoverageEquipmentReportsGet200Response> => {
    return (await getClient().reports.coverageCoverageEquipmentReportsGet(
        coverage,
        filter || undefined
    )).data;
};

/**
 * Get datasets information
 */
export const getDatasets = async (coverage: string = DEFAULT_COVERAGE): Promise<DatasetsResponse> => {
    return (await getClient().datasets.coverageCoverageDatasetsGet(coverage)).data;
};

/**
 * Get contributors information
 */
export const getContributors = async (coverage: string = DEFAULT_COVERAGE): Promise<ContributorsResponse> => {
    return (await getClient().contributors.coverageCoverageContributorsGet(coverage)).data;
};

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
export const autocompletePT = async (
    q: string,
    coverage: string = DEFAULT_COVERAGE,
    count: number = 10
): Promise<PlacesResponse> => {
    return (await getClient().publicTransportObjects.coverageCoveragePtObjectsGet(coverage, q, count)).data;
};

/**
 * Inverted geocoding - get address from coordinates
 */
export const invertedGeocoding = async (
    lat: number,
    lon: number,
    coverage: string = DEFAULT_COVERAGE
): Promise<PlacesResponse> => {
    const coord = `${lon};${lat}`;
    return (await getClient().places.coverageCoverageCoordCoordAddressesGet(coverage, coord)).data;
};

/**
 * Get routes
 */
export const getRoutes = async (coverage: string = DEFAULT_COVERAGE, params: RoutesParams = {}): Promise<CoverageCoverageRoutesGet200Response> => {
    return (await getClient().publicTransportObjects.coverageCoverageRoutesGet(coverage)).data;
};

/**
 * Get stop points
 */
export const getStopPoints = async (coverage: string = DEFAULT_COVERAGE, params: StopPointsParams = {}): Promise<CoverageCoverageStopPointsGet200Response> => {
    return (await getClient().publicTransportObjects.coverageCoverageStopPointsGet(coverage)).data;
};

/**
 * Get networks
 */
export const getNetworks = async (coverage: string = DEFAULT_COVERAGE, params: NetworksParams = {}): Promise<CoverageCoverageNetworksGet200Response> => {
    return (await getClient().publicTransportObjects.coverageCoverageNetworksGet(coverage)).data;
};

/**
 * Get freefloatings nearby
 */
export const getFreefloatingsNearby = async (
    lat: number,
    lon: number,
    coverage: string = DEFAULT_COVERAGE,
    distance: number = 200
): Promise<CoverageCoverageCoordCoordFreefloatingsGet200Response> => {
    const coord = `${lon};${lat}`;
    return (await getClient().places.coverageCoverageCoordCoordFreefloatingsGet(coverage, coord, distance)).data;
};

