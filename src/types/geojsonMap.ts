import type { Feature, FeatureCollection } from 'geojson';
import type { GeoJSONMarker } from './geojson';

/**
 * Props for GeoJSONMap component
 */
export interface GeoJSONMapProps {
    geojsonData?: unknown;
    style?: ((feature: unknown) => Record<string, unknown>) | Record<string, unknown>;
    markers?: GeoJSONMarker[];
    height?: number;
    center?: [number, number];
    zoom?: number;
    fitBounds?: boolean;
}

/**
 * Processed GeoJSON data structure
 */
export interface ProcessedGeoJSON extends FeatureCollection {
    type: 'FeatureCollection';
    features: Feature[];
}

