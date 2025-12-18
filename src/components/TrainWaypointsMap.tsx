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
                                width: 20,
                                height: 20,
                                borderRadius: '50%',
                                border: '2px solid white',
                                cursor: 'pointer',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                            }}
                        />
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

