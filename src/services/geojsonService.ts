import type { Feature, FeatureCollection, Geometry } from 'geojson';
import type { GeoJSONInput, SectionWithGeoJSON } from '@/types/geojson';
import { isGeoJSONFeatureCollection, isGeoJSONFeature, isGeoJSONGeometry, isSectionWithGeoJSON } from '@/types/geojson';

/**
 * Convert multi-geometries to single geometries
 * MapLibre doesn't support MultiLineString, MultiPolygon, MultiPoint in filters
 */
export function expandMultiGeometries(feature: Feature): Feature[] {
    if (!feature.geometry) return [feature];

    const geom = feature.geometry;
    if (geom.type === 'GeometryCollection') return [feature]; // Don't expand GeometryCollection
    
    const geomType = geom.type;
    const coords = 'coordinates' in geom ? geom.coordinates : null;

    if (geomType === 'MultiLineString' && Array.isArray(coords)) {
        // Convert MultiLineString to multiple LineString features
        return coords.map((lineStringCoords) => ({
            type: 'Feature' as const,
            geometry: {
                type: 'LineString' as const,
                coordinates: lineStringCoords
            },
            properties: feature.properties || {}
        }));
    }

    if (geomType === 'MultiPolygon' && Array.isArray(coords)) {
        // Convert MultiPolygon to multiple Polygon features
        return coords.map((polygonCoords) => ({
            type: 'Feature' as const,
            geometry: {
                type: 'Polygon' as const,
                coordinates: polygonCoords
            },
            properties: feature.properties || {}
        }));
    }

    if (geomType === 'MultiPoint' && Array.isArray(coords)) {
        // Convert MultiPoint to multiple Point features
        return coords.map((pointCoords) => ({
            type: 'Feature' as const,
            geometry: {
                type: 'Point' as const,
                coordinates: pointCoords
            },
            properties: feature.properties || {}
        }));
    }

    // Return as-is for other geometry types
    return [feature];
}

/**
 * Process GeoJSON data from various input formats into a FeatureCollection
 */
export function processGeoJSONData(geojsonData: unknown): FeatureCollection | null {
    if (!geojsonData) return null;

    const data: GeoJSONInput = geojsonData as GeoJSONInput;

    let features: Feature[] = [];

    // If it's already a FeatureCollection, use it as is
    if (isGeoJSONFeatureCollection(data)) {
        features = data.features;
    }
    // If it's a single Feature, wrap it in a FeatureCollection
    else if (isGeoJSONFeature(data)) {
        features = [data];
    }
    // If it's a Geometry object, wrap it in a Feature
    else if (isGeoJSONGeometry(data)) {
        features = [{
            type: 'Feature',
            geometry: data,
            properties: {}
        }];
    }
    // If it's an array, process each item
    else if (Array.isArray(data)) {
        data
            .filter(isSectionWithGeoJSON)
            .forEach((item, index) => {
                const geom = item.geojson;
                if (!geom) return;
                
                // If it's already a FeatureCollection, extract its features
                if (isGeoJSONFeatureCollection(geom)) {
                    geom.features.forEach((feature) => {
                        features.push({
                            ...feature,
                            properties: {
                                ...(feature.properties || {}),
                                ...item,
                                index
                            }
                        });
                    });
                }
                // If it's a single Feature, use it
                else if (isGeoJSONFeature(geom)) {
                    features.push({
                        ...geom,
                        properties: {
                            ...(geom.properties || {}),
                            ...item,
                            index
                        }
                    });
                }
                // If it's a Geometry object, wrap it in a Feature
                else if (isGeoJSONGeometry(geom)) {
                    features.push({
                        type: 'Feature',
                        geometry: geom,
                        properties: {
                            ...item,
                            index
                        }
                    });
                }
            });
    }

    if (features.length === 0) {
        return null;
    }

    // Expand multi-geometries to single geometries
    const expandedFeatures: Feature[] = [];
    features.forEach(feature => {
        expandedFeatures.push(...expandMultiGeometries(feature));
    });

    return {
        type: 'FeatureCollection',
        features: expandedFeatures
    };
}

/**
 * Extract coordinates from a GeoJSON feature collection for bounds calculation
 * Returns array of [lon, lat] pairs
 */
function extractCoordinates(coords: unknown, lons: number[], lats: number[]): void {
    if (Array.isArray(coords)) {
        if (typeof coords[0] === 'number' && typeof coords[1] === 'number') {
            // Point: [lon, lat] in GeoJSON
            lons.push(coords[0]);
            lats.push(coords[1]);
        } else if (Array.isArray(coords[0])) {
            coords.forEach(coord => extractCoordinates(coord, lons, lats));
        }
    }
}

/**
 * Calculate bounds from GeoJSON data
 * Returns format: [[minLon, minLat], [maxLon, maxLat]]
 */
export function calculateBounds(processedGeoJSON: FeatureCollection | null): [[number, number], [number, number]] | null {
    if (!processedGeoJSON) return null;

    try {
        const lons: number[] = [];
        const lats: number[] = [];

        processedGeoJSON.features.forEach(feature => {
            if (feature.geometry && 'coordinates' in feature.geometry) {
                extractCoordinates(feature.geometry.coordinates, lons, lats);
            }
        });

        if (lons.length === 0 || lats.length === 0) {
            return null;
        }

        return [
            [Math.min(...lons), Math.min(...lats)],
            [Math.max(...lons), Math.max(...lats)]
        ];
    } catch (err) {
        return null;
    }
}

/**
 * Calculate bounds from GeoJSON data and markers
 * Returns format: [[minLon, minLat], [maxLon, maxLat]]
 */
export function calculateBoundsWithMarkers(
    processedGeoJSON: FeatureCollection | null,
    markers: Array<{ lat: number; lon: number }> = []
): [[number, number], [number, number]] | null {
    const lons: number[] = [];
    const lats: number[] = [];

    // Add coordinates from GeoJSON
    if (processedGeoJSON) {
        processedGeoJSON.features.forEach(feature => {
            if (feature.geometry && 'coordinates' in feature.geometry) {
                extractCoordinates(feature.geometry.coordinates, lons, lats);
            }
        });
    }

    // Add coordinates from markers
    markers.forEach(marker => {
        if (typeof marker.lat === 'number' && typeof marker.lon === 'number' && 
            Number.isFinite(marker.lat) && Number.isFinite(marker.lon)) {
            lons.push(marker.lon);
            lats.push(marker.lat);
        }
    });

    if (lons.length === 0 || lats.length === 0) {
        return null;
    }

    try {
        return [
            [Math.min(...lons), Math.min(...lats)],
            [Math.max(...lons), Math.max(...lats)]
        ];
    } catch (err) {
        return null;
    }
}

/**
 * Check if FeatureCollection contains LineString geometries
 */
export function hasLineStrings(processedGeoJSON: FeatureCollection | null): boolean {
    if (!processedGeoJSON) {
        return false;
    }
    return processedGeoJSON.features.some(f => 
        f.geometry?.type === 'LineString'
    );
}

/**
 * Check if FeatureCollection contains Polygon geometries
 */
export function hasPolygons(processedGeoJSON: FeatureCollection | null): boolean {
    if (!processedGeoJSON) return false;
    return processedGeoJSON.features.some(f => 
        f.geometry?.type === 'Polygon'
    );
}

