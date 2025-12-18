import React, { useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix missing marker icons when bundling with Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

interface FitBoundsProps {
    bounds: L.LatLngBounds | null;
}

const FitBounds: React.FC<FitBoundsProps> = ({ bounds }) => {
    const map = useMap();
    useEffect(() => {
        if (!bounds || !bounds.isValid()) return;
        map.fitBounds(bounds, { padding: [24, 24] });
    }, [map, bounds]);
    return null;
};

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
    const geojsonRef = useRef<L.GeoJSON>(null);

    // Process GeoJSON data
    const processedGeoJSON = useMemo<GeoJSONFeatureCollection | null>(() => {
        if (!geojsonData) return null;

        const data = geojsonData as GeoJSONFeature | GeoJSONFeatureCollection | GeoJSONFeature[] | { geojson?: unknown };

        // If it's already a FeatureCollection, use it as is
        if (typeof data === 'object' && 'type' in data && data.type === 'FeatureCollection') {
            return data as GeoJSONFeatureCollection;
        }

        // If it's a single Feature, wrap it in a FeatureCollection
        if (typeof data === 'object' && 'type' in data && data.type === 'Feature') {
            return {
                type: 'FeatureCollection',
                features: [data as GeoJSONFeature]
            };
        }

        // If it's a Geometry object, wrap it in a Feature
        if (typeof data === 'object' && 'type' in data && 
            ['Point', 'LineString', 'Polygon', 'MultiPoint', 'MultiLineString', 'MultiPolygon'].includes(data.type)) {
            return {
                type: 'FeatureCollection',
                features: [{
                    type: 'Feature',
                    geometry: data as GeoJSONFeature['geometry'],
                    properties: {}
                }]
            };
        }

        // If it's an array, process each item
        if (Array.isArray(data)) {
            const features: GeoJSONFeature[] = [];
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

            if (features.length === 0) return null;

            return {
                type: 'FeatureCollection',
                features
            };
        }

        return null;
    }, [geojsonData]);

    // Calculate bounds from GeoJSON data
    const bounds = useMemo<L.LatLngBounds | null>(() => {
        if (!processedGeoJSON || !fitBounds) return null;

        try {
            const latlngs: [number, number][] = [];
            
            const extractCoordinates = (coords: unknown): void => {
                if (Array.isArray(coords)) {
                    if (typeof coords[0] === 'number' && typeof coords[1] === 'number') {
                        // Point: [lon, lat]
                        latlngs.push([coords[1], coords[0]]);
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

            if (latlngs.length === 0) return null;
            return L.latLngBounds(latlngs);
        } catch (err) {
            console.error('Error calculating bounds:', err);
            return null;
        }
    }, [processedGeoJSON, fitBounds]);

    // Default style function
    const getStyle = useMemo(() => {
        if (typeof style === 'function') {
            return style;
        }
        if (typeof style === 'object' && style !== null) {
            return () => style;
        }
        
        // Default style based on geometry type
        return (feature: unknown) => {
            const geomType = (feature as GeoJSONFeature)?.geometry?.type;
            switch (geomType) {
                case 'LineString':
                case 'MultiLineString':
                    return {
                        color: '#3273dc',
                        weight: 4,
                        opacity: 0.85
                    };
                case 'Polygon':
                case 'MultiPolygon':
                    return {
                        color: '#3273dc',
                        weight: 2,
                        opacity: 0.8,
                        fillColor: '#3273dc',
                        fillOpacity: 0.3
                    };
                case 'Point':
                case 'MultiPoint':
                    return {
                        radius: 6,
                        fillColor: '#3273dc',
                        fillOpacity: 0.8,
                        color: '#fff',
                        weight: 2
                    };
                default:
                    return {
                        color: '#3273dc',
                        weight: 2,
                        opacity: 0.8
                    };
            }
        };
    }, [style]);

    if (!processedGeoJSON && markers.length === 0) {
        return null;
    }

    // Determine center and zoom
    const mapCenter = useMemo<[number, number]>(() => {
        if (bounds && bounds.isValid()) {
            const center = bounds.getCenter();
            return [center.lat, center.lng];
        }
        if (markers.length > 0 && markers[0].lat && markers[0].lon) {
            return [markers[0].lat, markers[0].lon];
        }
        return center;
    }, [bounds, markers, center]);

    const mapZoom = useMemo<number | null>(() => {
        if (bounds && bounds.isValid()) {
            return null; // Will be handled by FitBounds
        }
        return zoom;
    }, [bounds, zoom]);

    return (
        <div style={{ height, width: '100%', borderRadius: 6, overflow: 'hidden' }}>
            <MapContainer 
                center={mapCenter} 
                zoom={mapZoom || zoom} 
                scrollWheelZoom 
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                />
                {bounds && fitBounds && <FitBounds bounds={bounds} />}
                {processedGeoJSON && (
                    <GeoJSON
                        ref={geojsonRef}
                        data={processedGeoJSON}
                        style={getStyle}
                    />
                )}
                {markers.map((marker, idx) => {
                    if (!marker.lat || !marker.lon) return null;
                    return (
                        <Marker key={idx} position={[marker.lat, marker.lon]}>
                            {marker.popup || marker.name ? (
                                <Popup>
                                    {marker.popup || <strong>{marker.name}</strong>}
                                </Popup>
                            ) : null}
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
};

export default GeoJSONMap;

