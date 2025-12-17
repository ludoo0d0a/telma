/**
 * Navitia API Client Wrapper
 * 
 * This is a convenience wrapper around the generated OpenAPI client.
 * It provides a simple interface to configure and use the API client.
 */

import { Configuration } from './configuration';
import {
    ArrivalsApi,
    CoverageApi,
    DeparturesApi,
    JourneysApi,
    PlacesApi,
    SchedulesApi,
    ReportsApi,
    IsochronesApi,
    TransportModesApi,
    PublicTransportObjectsApi,
    ContributorsApi,
    DatasetsApi
} from './api';

export class NavitiaClient {
    public readonly arrivals: ArrivalsApi;
    public readonly coverage: CoverageApi;
    public readonly departures: DeparturesApi;
    public readonly journeys: JourneysApi;
    public readonly places: PlacesApi;
    public readonly schedules: SchedulesApi;
    public readonly reports: ReportsApi;
    public readonly isochrones: IsochronesApi;
    public readonly transportModes: TransportModesApi;
    public readonly publicTransportObjects: PublicTransportObjectsApi;
    public readonly contributors: ContributorsApi;
    public readonly datasets: DatasetsApi;

    constructor(config: {
        apiKey: string;
        basePath?: string;
    }) {
        const configuration = new Configuration({
            apiKey: config.apiKey,
            basePath: config.basePath || 'https://api.sncf.com/v1',
        });

        this.arrivals = new ArrivalsApi(configuration);
        this.coverage = new CoverageApi(configuration);
        this.departures = new DeparturesApi(configuration);
        this.journeys = new JourneysApi(configuration);
        this.places = new PlacesApi(configuration);
        this.schedules = new SchedulesApi(configuration);
        this.reports = new ReportsApi(configuration);
        this.isochrones = new IsochronesApi(configuration);
        this.transportModes = new TransportModesApi(configuration);
        this.publicTransportObjects = new PublicTransportObjectsApi(configuration);
        this.contributors = new ContributorsApi(configuration);
        this.datasets = new DatasetsApi(configuration);
    }
}

// Export all types and models
export * from './models';
export * from './configuration';
export * from './api';

