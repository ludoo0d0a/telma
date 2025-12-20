import type React from 'react';
import type { Feature, FeatureCollection, Geometry } from 'geojson';

/**
 * GeoJSON types using @types/geojson
 */
export type { Feature, FeatureCollection, Geometry } from 'geojson';

/**
 * Extended types for map components
 */
export interface GeoJSONMarker {
    lat: number;
    lon: number;
    name?: string | null;
    popup?: React.ReactNode;
}

export interface SectionWithGeoJSON {
    geojson?: Feature | FeatureCollection | Geometry;
    [key: string]: unknown;
}

export type GeoJSONInput = 
    | Feature 
    | FeatureCollection 
    | Feature[] 
    | SectionWithGeoJSON[]
    | Geometry;

/**
 * Type guards for GeoJSON data
 */
export function isGeoJSONFeatureCollection(obj: unknown): obj is FeatureCollection {
    return typeof obj === 'object' && obj !== null && 'type' in obj && obj.type === 'FeatureCollection' && 'features' in obj;
}

export function isGeoJSONFeature(obj: unknown): obj is Feature {
    return typeof obj === 'object' && obj !== null && 'type' in obj && obj.type === 'Feature';
}

export function isGeoJSONGeometry(obj: unknown): obj is Geometry {
    return typeof obj === 'object' && obj !== null && 'type' in obj && 
        ['Point', 'LineString', 'Polygon', 'MultiPoint', 'MultiLineString', 'MultiPolygon'].includes(obj.type as string);
}

export function isSectionWithGeoJSON(obj: unknown): obj is SectionWithGeoJSON {
    return typeof obj === 'object' && obj !== null && 'geojson' in obj;
}

