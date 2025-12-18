import React, { useEffect, useMemo, useRef, useState } from 'react';
import Map, { Marker, Popup, Source, Layer } from 'react-map-gl/maplibre';
import type { MapRef, ViewState } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

interface GeoJSONMarker {
    lat: number;
    lon: number;
    name?: string | null;
    popup?: React.ReactNode;
}

interface GeoJSONMapProps {
    geojsonData?: unknown;
    style?: ((feature: unknown) => Record<string, unknown>) | Record<string, unknown>;
    markers?: GeoJSONMarker[];
    height?: number;
    center?: [number, number];
    zoom?: number;
    fitBounds?: boolean;
}

interface GeoJSONFeature {
    type: string;
    geometry?: {
        type: string;
        coordinates: unknown;
    };
    properties?: Record<string, unknown>;
}

interface GeoJSONFeatureCollection {
    type: 'FeatureCollection';
    features: GeoJSONFeature[];
}

/**
 * GeoJSONMap component to display GeoJSON geometries on a map
 */
const GeoJSONMap: React.FC<GeoJSONMapProps> = ({ 
    geojsonData, 
    style,
    markers = [],
    height = 400,
    center = [48.8566, 2.3522],
    zoom = 10,
    fitBounds = true
}) => {
    const mapRef = useRef<MapRef>(null);
    const [selectedMarker, setSelectedMarker] = useState<number | null>(null);

    // Convert multi-geometries to single geometries (MapLibre doesn't support MultiLineString, MultiPolygon, MultiPoint in filters)
    const expandMultiGeometries = (feature: GeoJSONFeature): GeoJSONFeature[] => {
        if (!feature.geometry) return [feature];

        const geomType = feature.geometry.type;
        const coords = feature.geometry.coordinates;

        if (geomType === 'MultiLineString' && Array.isArray(coords)) {
            // Convert MultiLineString to multiple LineString features
            return coords.map((lineStringCoords: unknown) => ({
                type: 'Feature',
                geometry: {
                    type: 'LineString',
                    coordinates: lineStringCoords
                },
                properties: feature.properties || {}
            }));
        }

        if (geomType === 'MultiPolygon' && Array.isArray(coords)) {
            // Convert MultiPolygon to multiple Polygon features
            return coords.map((polygonCoords: unknown) => ({
                type: 'Feature',
                geometry: {
                    type: 'Polygon',
                    coordinates: polygonCoords
                },
                properties: feature.properties || {}
            }));
        }

        if (geomType === 'MultiPoint' && Array.isArray(coords)) {
            // Convert MultiPoint to multiple Point features
            return coords.map((pointCoords: unknown) => ({
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: pointCoords
                },
                properties: feature.properties || {}
            }));
        }

        // Return as-is for other geometry types
        return [feature];
    };

    // Process GeoJSON data
    const processedGeoJSON = useMemo<GeoJSONFeatureCollection | null>(() => {
        if (!geojsonData) return null;

        const data = geojsonData as GeoJSONFeature | GeoJSONFeatureCollection | GeoJSONFeature[] | { geojson?: unknown };

        let features: GeoJSONFeature[] = [];

        // If it's already a FeatureCollection, use it as is
        if (typeof data === 'object' && 'type' in data && data.type === 'FeatureCollection') {
            features = (data as GeoJSONFeatureCollection).features;
        }
        // If it's a single Feature, wrap it in a FeatureCollection
        else if (typeof data === 'object' && 'type' in data && data.type === 'Feature') {
            features = [data as GeoJSONFeature];
        }
        // If it's a Geometry object, wrap it in a Feature
        else if (typeof data === 'object' && 'type' in data && 
            ['Point', 'LineString', 'Polygon', 'MultiPoint', 'MultiLineString', 'MultiPolygon'].includes(data.type)) {
            features = [{
                type: 'Feature',
                geometry: data as GeoJSONFeature['geometry'],
                properties: {}
            }];
        }
        // If it's an array, process each item
        else if (Array.isArray(data)) {
            data
                .filter((item): item is { geojson?: unknown } => item !== null && typeof item === 'object')
                .forEach((item, index) => {
                    const geom = item.geojson;
                    if (!geom || typeof geom !== 'object') return;
                    
                    // If it's already a FeatureCollection, extract its features
                    if ('type' in geom && geom.type === 'FeatureCollection' && 'features' in geom && Array.isArray(geom.features)) {
                        geom.features.forEach((feature: unknown) => {
                            if (typeof feature === 'object' && feature !== null) {
                                features.push({
                                    ...(feature as GeoJSONFeature),
                                    properties: {
                                        ...((feature as GeoJSONFeature).properties || {}),
                                        ...item,
                                        index
                                    }
                                });
                            }
                        });
                    }
                    // If it's a single Feature, use it
                    else if ('type' in geom && geom.type === 'Feature') {
                        features.push({
                            ...(geom as GeoJSONFeature),
                            properties: {
                                ...((geom as GeoJSONFeature).properties || {}),
                                ...item,
                                index
                            }
                        });
                    }
                    // If it's a Geometry object, wrap it in a Feature
                    else if ('type' in geom && 
                        ['Point', 'LineString', 'Polygon', 'MultiPoint', 'MultiLineString', 'MultiPolygon'].includes(geom.type as string)) {
                        features.push({
                            type: 'Feature',
                            geometry: geom as GeoJSONFeature['geometry'],
                            properties: {
                                ...item,
                                index
                            }
                        });
                    }
                });
        }

        if (features.length === 0) return null;

        // Expand multi-geometries to single geometries
        const expandedFeatures: GeoJSONFeature[] = [];
        features.forEach(feature => {
            expandedFeatures.push(...expandMultiGeometries(feature));
        });

        return {
            type: 'FeatureCollection',
            features: expandedFeatures
        };
    }, [geojsonData]);

    // Calculate bounds from GeoJSON data (format: [[minLon, minLat], [maxLon, maxLat]])
    const bounds = useMemo<[[number, number], [number, number]] | null>(() => {
        if (!processedGeoJSON || !fitBounds) return null;

        try {
            const lons: number[] = [];
            const lats: number[] = [];
            
            const extractCoordinates = (coords: unknown): void => {
                if (Array.isArray(coords)) {
                    if (typeof coords[0] === 'number' && typeof coords[1] === 'number') {
                        // Point: [lon, lat] in GeoJSON
                        lons.push(coords[0]);
                        lats.push(coords[1]);
                    } else if (Array.isArray(coords[0])) {
                        coords.forEach(coord => extractCoordinates(coord));
                    }
                }
            };

            processedGeoJSON.features.forEach(feature => {
                if (feature.geometry && feature.geometry.coordinates) {
                    extractCoordinates(feature.geometry.coordinates);
                }
            });

            if (lons.length === 0 || lats.length === 0) return null;
            return [
                [Math.min(...lons), Math.min(...lats)],
                [Math.max(...lons), Math.max(...lats)]
            ];
        } catch (err) {
            console.error('Error calculating bounds:', err);
            return null;
        }
    }, [processedGeoJSON, fitBounds]);

    // Fit bounds when GeoJSON changes
    useEffect(() => {
        if (bounds && mapRef.current && fitBounds) {
            mapRef.current.fitBounds(bounds, {
                padding: { top: 24, bottom: 24, left: 24, right: 24 },
                duration: 500
            });
        }
    }, [bounds, fitBounds]);

    // Convert style to MapLibre layer paint properties
    const layerPaint = useMemo(() => {
        if (typeof style === 'function') {
            // For function-based styles, we'll use default for now
            // MapLibre doesn't support per-feature styling easily, would need data-driven styling
            return {
                'line-color': '#3273dc',
                'line-width': 4,
                'line-opacity': 0.85,
                'fill-color': '#3273dc',
                'fill-opacity': 0.3
            };
        }
        if (typeof style === 'object' && style !== null) {
            const s = style as Record<string, unknown>;
            return {
                'line-color': s.color as string || '#3273dc',
                'line-width': (s.weight as number || 2) * 2, // MapLibre uses pixels, Leaflet uses a different scale
                'line-opacity': (s.opacity as number || 0.8),
                'fill-color': (s.fillColor as string || s.color as string || '#3273dc'),
                'fill-opacity': (s.fillOpacity as number || 0.3)
            };
        }
        
        // Default style
        return {
            'line-color': '#3273dc',
            'line-width': 4,
            'line-opacity': 0.85,
            'fill-color': '#3273dc',
            'fill-opacity': 0.3
        };
    }, [style]);

    // Determine geometry types in the GeoJSON
    const hasLines = useMemo(() => {
        if (!processedGeoJSON) return false;
        return processedGeoJSON.features.some(f => 
            f.geometry?.type === 'LineString'
        );
    }, [processedGeoJSON]);

    const hasPolygons = useMemo(() => {
        if (!processedGeoJSON) return false;
        return processedGeoJSON.features.some(f => 
            f.geometry?.type === 'Polygon'
        );
    }, [processedGeoJSON]);

    if (!processedGeoJSON && markers.length === 0) {
        return null;
    }

    // Determine center and zoom
    const mapCenter: [number, number] = useMemo(() => {
        if (markers.length > 0 && markers[0].lat && markers[0].lon) {
            return [markers[0].lat, markers[0].lon];
        }
        return center;
    }, [markers, center]);

    const [viewState, setViewState] = useState<ViewState>({
        longitude: mapCenter[1],
        latitude: mapCenter[0],
        zoom: zoom
    });

    return (
        <div style={{ height, width: '100%', borderRadius: 6, overflow: 'hidden' }}>
            <Map
                ref={mapRef}
                {...viewState}
                onMove={evt => setViewState(evt.viewState)}
                style={{ width: '100%', height: '100%' }}
                mapStyle={{
                    version: 8,
                    sources: {
                        'osm-tiles': {
                            type: 'raster',
                            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
                            tileSize: 256,
                            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        }
                    },
                    layers: [{
                        id: 'osm-tiles-layer',
                        type: 'raster',
                        source: 'osm-tiles',
                        minzoom: 0,
                        maxzoom: 19
                    }]
                }}
                attributionControl={true}
            >
                {processedGeoJSON && (
                    <Source id="geojson-data" type="geojson" data={processedGeoJSON}>
                        {hasLines && (
                            <Layer
                                id="geojson-lines"
                                type="line"
                                filter={['==', '$type', 'LineString']}
                                paint={{
                                    'line-color': layerPaint['line-color'] as string,
                                    'line-width': layerPaint['line-width'] as number,
                                    'line-opacity': layerPaint['line-opacity'] as number
                                }}
                            />
                        )}
                        {hasPolygons && (
                            <>
                                <Layer
                                    id="geojson-polygons-fill"
                                    type="fill"
                                    filter={['==', '$type', 'Polygon']}
                                    paint={{
                                        'fill-color': layerPaint['fill-color'] as string,
                                        'fill-opacity': layerPaint['fill-opacity'] as number
                                    }}
                                />
                                <Layer
                                    id="geojson-polygons-outline"
                                    type="line"
                                    filter={['==', '$type', 'Polygon']}
                                    paint={{
                                        'line-color': layerPaint['line-color'] as string,
                                        'line-width': (layerPaint['line-width'] as number) / 2,
                                        'line-opacity': layerPaint['line-opacity'] as number
                                    }}
                                />
                            </>
                        )}
                    </Source>
                )}
                {markers.map((marker, idx) => {
                    if (!marker.lat || !marker.lon) return null;
                    return (
                        <Marker
                            key={idx}
                            longitude={marker.lon}
                            latitude={marker.lat}
                            anchor="bottom"
                            onClick={() => setSelectedMarker(idx)}
                        >
                            <div
                                style={{
                                    backgroundColor: '#3273dc',
                                    width: 20,
                                    height: 20,
                                    borderRadius: '50%',
                                    border: '2px solid white',
                                    cursor: marker.popup || marker.name ? 'pointer' : 'default',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                                }}
                            />
                        </Marker>
                    );
                })}
                {selectedMarker !== null && markers[selectedMarker] && (
                    <Popup
                        longitude={markers[selectedMarker].lon}
                        latitude={markers[selectedMarker].lat}
                        anchor="bottom"
                        onClose={() => setSelectedMarker(null)}
                        closeButton={true}
                        closeOnClick={false}
                    >
                        {markers[selectedMarker].popup || <strong>{markers[selectedMarker].name}</strong>}
                    </Popup>
                )}
            </Map>
        </div>
    );
};

export default GeoJSONMap;

