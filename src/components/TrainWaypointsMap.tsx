import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
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
    const positions = useMemo<[number, number][]>(
        () => (waypoints || []).map((w) => [w.lat, w.lon]),
        [waypoints]
    );

    const bounds = useMemo<L.LatLngBounds | null>(() => {
        if (!positions.length) return null;
        return L.latLngBounds(positions);
    }, [positions]);

    const center: [number, number] = positions[0] || [48.8566, 2.3522]; // Paris fallback
    const zoom: number = positions.length <= 1 ? 12 : 8;

    if (!positions.length) return null;

    return (
        <div style={{ height: 380, width: '100%', borderRadius: 6, overflow: 'hidden' }}>
            <MapContainer center={center} zoom={zoom} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                />
                {bounds && positions.length > 1 && <FitBounds bounds={bounds} />}
                {positions.length > 1 && (
                    <Polyline positions={positions} pathOptions={{ color: '#3273dc', weight: 4, opacity: 0.85 }} />
                )}
                {(waypoints || []).map((w, idx) => (
                    <Marker key={`${w.lat},${w.lon},${idx}`} position={[w.lat, w.lon]}>
                        <Popup>
                            <div>
                                <strong>{w.name || `Arrêt ${idx + 1}`}</strong>
                                {w.isStart && <div>Départ</div>}
                                {w.isEnd && <div>Arrivée</div>}
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default TrainWaypointsMap;

