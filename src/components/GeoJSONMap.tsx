import React, { useEffect, useMemo, useRef, useState } from 'react';
import Map, { Marker, Popup, Source, Layer, NavigationControl, GeolocateControl } from 'react-map-gl/maplibre';
import type { MapRef, ViewState } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { GeoJSONMapProps } from '../types/geojsonMap';
import { processGeoJSONData, calculateBounds, hasLineStrings, hasPolygons } from '../services/geojsonService';
import type { FeatureCollection } from 'geojson';

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
    const [mapLoaded, setMapLoaded] = useState(false);
    const [layersReady, setLayersReady] = useState(false);

    // Process GeoJSON data using service
    const processedGeoJSON = useMemo<FeatureCollection | null>(() => {
        return processGeoJSONData(geojsonData);
    }, [geojsonData]);

    // Delay rendering Layers until Source is confirmed ready
    useEffect(() => {
        if (mapLoaded && processedGeoJSON) {
            // Small delay to ensure Source is registered in MapLibre
            const timer = setTimeout(() => {
                setLayersReady(true);
            }, 500);
            return () => clearTimeout(timer);
        } else {
            setLayersReady(false);
        }
    }, [mapLoaded, processedGeoJSON]);

    // Calculate bounds from GeoJSON data using service
    const bounds = useMemo<[[number, number], [number, number]] | null>(() => {
        if (!fitBounds) return null;
        return calculateBounds(processedGeoJSON);
    }, [processedGeoJSON, fitBounds]);

    // Fit bounds when GeoJSON changes
    useEffect(() => {
        if (bounds && mapRef.current && fitBounds) {
            try {
                mapRef.current.fitBounds(bounds, {
                    padding: { top: 24, bottom: 24, left: 24, right: 24 },
                    duration: 500
                });
            } catch (err) {
                // Ignore fitBounds errors
            }
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

    // Determine geometry types in the GeoJSON using service
    const hasLines = useMemo(() => {
        return hasLineStrings(processedGeoJSON);
    }, [processedGeoJSON]);

    const hasPolygonsValue = useMemo(() => {
        return hasPolygons(processedGeoJSON);
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
        zoom: zoom,
        bearing: 0,
        pitch: 0,
        padding: { top: 0, bottom: 0, left: 0, right: 0 }
    });


    return (
        <div style={{ height, width: '100%', borderRadius: 6, overflow: 'hidden' }}>
            <Map
                ref={mapRef}
                {...viewState}
                onMove={evt => setViewState(evt.viewState)}
                onLoad={() => {
                    setMapLoaded(true);
                }}
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
                attributionControl={{compact: true}}
            >
                <NavigationControl position="top-right" />
                <GeolocateControl position="top-right" />
                {processedGeoJSON && mapLoaded && (
                    <Source 
                        key="geojson-source" 
                        id="geojson-data" 
                        type="geojson" 
                        data={processedGeoJSON}
                    >
                        {hasLines && layersReady ? (
                            <Layer
                                key="geojson-lines-layer"
                                id="geojson-lines"
                                type="line"
                                paint={{
                                    'line-color': layerPaint['line-color'] as string,
                                    'line-width': layerPaint['line-width'] as number,
                                    'line-opacity': layerPaint['line-opacity'] as number
                                }}
                            />
                        ) : null}
                        {hasPolygonsValue && layersReady ? (
                            <>
                                <Layer
                                    key="geojson-polygons-fill-layer"
                                    id="geojson-polygons-fill"
                                    type="fill"
                                    filter={['==', '$type', 'Polygon']}
                                    paint={{
                                        'fill-color': layerPaint['fill-color'] as string,
                                        'fill-opacity': layerPaint['fill-opacity'] as number
                                    }}
                                />
                                <Layer
                                    key="geojson-polygons-outline-layer"
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
                        ) : null}
                    </Source>
                )}
                {markers.map((marker, idx) => {
                    if (!marker.lat || !marker.lon) {
                        return null;
                    }
                    return (
                        <Marker
                            key={`marker-${idx}-${marker.lat}-${marker.lon}`}
                            longitude={marker.lon}
                            latitude={marker.lat}
                            anchor="bottom"
                            onClick={() => setSelectedMarker(idx)}
                        >
                            <div
                                style={{
                                    backgroundColor: '#3273dc',
                                    width: 32,
                                    height: 32,
                                    borderRadius: '50%',
                                    border: '2px solid white',
                                    cursor: marker.popup || marker.name ? 'pointer' : 'default',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <svg 
                                    width="18" 
                                    height="18" 
                                    viewBox="0 0 24 24" 
                                    fill="white" 
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                                </svg>
                            </div>
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

