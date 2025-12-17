import React, { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix missing marker icons when bundling with Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

const FitBounds = ({ bounds }) => {
    const map = useMap();
    useEffect(() => {
        if (!bounds || !bounds.isValid()) return;
        map.fitBounds(bounds, { padding: [24, 24] });
    }, [map, bounds]);
    return null;
};

FitBounds.propTypes = {
    bounds: PropTypes.object,
};

const TrainWaypointsMap = ({ waypoints }) => {
    const positions = useMemo(
        () => (waypoints || []).map((w) => [w.lat, w.lon]),
        [waypoints]
    );

    const bounds = useMemo(() => {
        if (!positions.length) return null;
        return L.latLngBounds(positions);
    }, [positions]);

    const center = positions[0] || [48.8566, 2.3522]; // Paris fallback
    const zoom = positions.length <= 1 ? 12 : 8;

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

TrainWaypointsMap.propTypes = {
    waypoints: PropTypes.arrayOf(
        PropTypes.shape({
            lat: PropTypes.number.isRequired,
            lon: PropTypes.number.isRequired,
            name: PropTypes.string,
            isStart: PropTypes.bool,
            isEnd: PropTypes.bool,
        })
    ),
};

export default TrainWaypointsMap;


