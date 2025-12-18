import React, { useMemo, useRef, useEffect, useState } from 'react';
import Map, { Marker, Popup, Source, Layer } from 'react-map-gl/maplibre';
import type { MapRef, ViewState } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

interface Waypoint {
    lat: number;
    lon: number;
    name?: string;
    isStart?: boolean;
    isEnd?: boolean;
}

interface TrainWaypointsMapProps {
    waypoints?: Waypoint[];
}

const TrainWaypointsMap: React.FC<TrainWaypointsMapProps> = ({ waypoints }) => {
    const mapRef = useRef<MapRef>(null);
    const [selectedMarker, setSelectedMarker] = useState<number | null>(null);

    const positions = useMemo<[number, number][]>(
        () => (waypoints || []).map((w) => [w.lat, w.lon]),
        [waypoints]
    );

    // Calculate bounds for fitBounds
    const bounds = useMemo<[[number, number], [number, number]] | null>(() => {
        if (positions.length < 2) return null;
        const lats = positions.map(p => p[0]);
        const lons = positions.map(p => p[1]);
        return [
            [Math.min(...lons), Math.min(...lats)],
            [Math.max(...lons), Math.max(...lats)]
        ];
    }, [positions]);

    // Fit bounds when waypoints change
    useEffect(() => {
        if (bounds && mapRef.current && positions.length > 1) {
            mapRef.current.fitBounds(bounds, {
                padding: { top: 24, bottom: 24, left: 24, right: 24 },
                duration: 500
            });
        }
    }, [bounds, positions.length]);

    const center: [number, number] = positions[0] || [48.8566, 2.3522]; // Paris fallback
    const zoom: number = positions.length <= 1 ? 12 : 8;

    const [viewState, setViewState] = useState<ViewState>({
        longitude: center[1],
        latitude: center[0],
        zoom: zoom
    });

    // Create GeoJSON for polyline
    const polylineGeoJSON = useMemo(() => {
        if (positions.length < 2) return null;
        return {
            type: 'Feature' as const,
            geometry: {
                type: 'LineString' as const,
                coordinates: positions.map(p => [p[1], p[0]]) // [lon, lat] format for GeoJSON
            },
            properties: {}
        };
    }, [positions]);

    if (!positions.length) return null;

    return (
        <div style={{ height: 380, width: '100%', borderRadius: 6, overflow: 'hidden' }}>
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
                {polylineGeoJSON && (
                    <Source id="route" type="geojson" data={polylineGeoJSON}>
                        <Layer
                            id="route-line"
                            type="line"
                            paint={{
                                'line-color': '#3273dc',
                                'line-width': 4,
                                'line-opacity': 0.85
                            }}
                        />
                    </Source>
                )}
                {(waypoints || []).map((w, idx) => (
                    <Marker
                        key={`${w.lat},${w.lon},${idx}`}
                        longitude={w.lon}
                        latitude={w.lat}
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
                                cursor: 'pointer',
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
                                <path d="M12 2c-4 0-8 .5-8 4v9.5c0 .95.38 1.81 1 2.44L3 22h3l.5-2h11l.5 2h3l-2-4.06c.62-.63 1-1.49 1-2.44V6c0-3.5-3.58-4-8-4zM5.5 16c-.83 0-1.5-.67-1.5-1.5S4.67 13 5.5 13s1.5.67 1.5 1.5S6.33 16 5.5 16zm13 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-5H4V6h16v5z"/>
                            </svg>
                        </div>
                    </Marker>
                ))}
                {selectedMarker !== null && waypoints && waypoints[selectedMarker] && (
                    <Popup
                        longitude={waypoints[selectedMarker].lon}
                        latitude={waypoints[selectedMarker].lat}
                        anchor="bottom"
                        onClose={() => setSelectedMarker(null)}
                        closeButton={true}
                        closeOnClick={false}
                    >
                        <div>
                            <strong>{waypoints[selectedMarker].name || `Arrêt ${selectedMarker + 1}`}</strong>
                            {waypoints[selectedMarker].isStart && <div>Départ</div>}
                            {waypoints[selectedMarker].isEnd && <div>Arrivée</div>}
                        </div>
                    </Popup>
                )}
            </Map>
        </div>
    );
};

export default TrainWaypointsMap;

