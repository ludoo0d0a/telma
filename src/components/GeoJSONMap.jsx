import React, { useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMap } from 'react-leaflet';
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

/**
 * GeoJSONMap component to display GeoJSON geometries on a map
 * @param {Object} props
 * @param {Array|Object} props.geojsonData - GeoJSON Feature, FeatureCollection, or array of GeoJSON geometries
 * @param {Object} props.style - Optional style function or object for GeoJSON features
 * @param {Array} props.markers - Optional array of marker objects with {lat, lon, name, popup}
 * @param {number} props.height - Map height in pixels (default: 400)
 * @param {Array} props.center - Map center [lat, lon] (default: [48.8566, 2.3522] - Paris)
 * @param {number} props.zoom - Initial zoom level (default: 10)
 * @param {boolean} props.fitBounds - Whether to fit bounds to GeoJSON data (default: true)
 */
const GeoJSONMap = ({ 
    geojsonData, 
    style,
    markers = [],
    height = 400,
    center = [48.8566, 2.3522],
    zoom = 10,
    fitBounds = true
}) => {
    const geojsonRef = useRef(null);

    // Process GeoJSON data
    const processedGeoJSON = useMemo(() => {
        if (!geojsonData) return null;

        // If it's already a FeatureCollection, use it as is
        if (geojsonData.type === 'FeatureCollection') {
            return geojsonData;
        }

        // If it's a single Feature, wrap it in a FeatureCollection
        if (geojsonData.type === 'Feature') {
            return {
                type: 'FeatureCollection',
                features: [geojsonData]
            };
        }

        // If it's a Geometry object, wrap it in a Feature
        if (geojsonData.type && ['Point', 'LineString', 'Polygon', 'MultiPoint', 'MultiLineString', 'MultiPolygon'].includes(geojsonData.type)) {
            return {
                type: 'FeatureCollection',
                features: [{
                    type: 'Feature',
                    geometry: geojsonData,
                    properties: {}
                }]
            };
        }

        // If it's an array, process each item
        if (Array.isArray(geojsonData)) {
            const features = [];
            geojsonData
                .filter(item => item && item.geojson)
                .forEach((item, index) => {
                    const geom = item.geojson;
                    // If it's already a FeatureCollection, extract its features
                    if (geom.type === 'FeatureCollection' && geom.features) {
                        geom.features.forEach(feature => {
                            features.push({
                                ...feature,
                                properties: {
                                    ...feature.properties,
                                    ...item,
                                    index
                                }
                            });
                        });
                    }
                    // If it's a single Feature, use it
                    else if (geom.type === 'Feature') {
                        features.push({
                            ...geom,
                            properties: {
                                ...geom.properties,
                                ...item,
                                index
                            }
                        });
                    }
                    // If it's a Geometry object, wrap it in a Feature
                    else if (geom.type && ['Point', 'LineString', 'Polygon', 'MultiPoint', 'MultiLineString', 'MultiPolygon'].includes(geom.type)) {
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

            if (features.length === 0) return null;

            return {
                type: 'FeatureCollection',
                features
            };
        }

        return null;
    }, [geojsonData]);

    // Calculate bounds from GeoJSON data
    const bounds = useMemo(() => {
        if (!processedGeoJSON || !fitBounds) return null;

        try {
            const latlngs = [];
            
            const extractCoordinates = (coords) => {
                if (typeof coords[0] === 'number') {
                    // Point: [lon, lat]
                    latlngs.push([coords[1], coords[0]]);
                } else if (Array.isArray(coords[0])) {
                    coords.forEach(coord => extractCoordinates(coord));
                }
            };

            processedGeoJSON.features.forEach(feature => {
                if (feature.geometry) {
                    const coords = feature.geometry.coordinates;
                    if (coords) {
                        extractCoordinates(coords);
                    }
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
        if (typeof style === 'object') {
            return () => style;
        }
        
        // Default style based on geometry type
        return (feature) => {
            const geomType = feature?.geometry?.type;
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
    const mapCenter = useMemo(() => {
        if (bounds && bounds.isValid()) {
            return bounds.getCenter();
        }
        if (markers.length > 0 && markers[0].lat && markers[0].lon) {
            return [markers[0].lat, markers[0].lon];
        }
        return center;
    }, [bounds, markers, center]);

    const mapZoom = useMemo(() => {
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

GeoJSONMap.propTypes = {
    geojsonData: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.array
    ]),
    style: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.func
    ]),
    markers: PropTypes.arrayOf(
        PropTypes.shape({
            lat: PropTypes.number,
            lon: PropTypes.number,
            name: PropTypes.string,
            popup: PropTypes.node
        })
    ),
    height: PropTypes.number,
    center: PropTypes.arrayOf(PropTypes.number),
    zoom: PropTypes.number,
    fitBounds: PropTypes.bool
};

export default GeoJSONMap;
