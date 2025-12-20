import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import Map, { Marker, Popup, NavigationControl, GeolocateControl } from 'react-map-gl/maplibre';
import type { MapRef, ViewState } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import Footer from '../components/Footer';
import { getPlacesNearby, getDepartures, getArrivals, formatDateTime } from '../services/navitiaApi';
import { getVehicleJourney, extractVehicleJourneyId } from '../services/vehicleJourneyService';
import { encodeVehicleJourneyId } from '../utils/uriUtils';
import { Icon } from '../utils/iconMapping';
import { cleanLocationName } from '../services/locationService';
import { parseUTCDate } from '../components/Utils';
import type { Place } from '../client/models/place';
import type { Departure } from '../client/models/departure';
import type { Arrival } from '../client/models/arrival';
import type { VehicleJourney } from '../client/models/vehicle-journey';
import type { StopTime } from '../client/models/stop-time';

interface DetectedTrain {
    vehicleJourneyId: string;
    trainNumber: string;
    destination: string;
    network: string;
    currentStop: string;
    nextStop: string;
    confidence: number;
    stopPoint?: {
        id?: string;
        name?: string;
        coord?: { lat?: number; lon?: number };
    };
}

interface DetectionResult {
    isInStation: boolean;
    station?: {
        id: string;
        name: string;
        distance: number;
        coord: { lat: number; lon: number };
    };
    platform?: {
        id: string;
        name: string;
        coord: { lat: number; lon: number };
    };
    detectedTrain?: DetectedTrain;
    userLocation?: { lat: number; lon: number; accuracy: number };
    nearbyStations?: Array<{
        id: string;
        name: string;
        distance: number;
        coord: { lat: number; lon: number };
        type: 'stop_area' | 'stop_point';
    }>;
}

interface SelectedStation {
    id: string;
    name: string;
    distance: number;
    coord: { lat: number; lon: number };
}

const LocationDetection: React.FC = () => {
    const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [watchingLocation, setWatchingLocation] = useState<boolean>(false);
    const [selectedStationIndex, setSelectedStationIndex] = useState<number | null>(null);
    const [selectedStation, setSelectedStation] = useState<SelectedStation | null>(null);
    const [detectingTrainForStation, setDetectingTrainForStation] = useState<boolean>(false);
    const watchIdRef = React.useRef<number | null>(null);
    const mapRef = useRef<MapRef>(null);

    // Calculate distance between two coordinates (Haversine formula)
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 6371000; // Earth radius in meters
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    // Extract platform number from stop point name
    const extractPlatform = (name: string | null | undefined): string | null => {
        if (!name) return null;
        // Try to find patterns like "Voie 1", "Platform 2", "Quai 3", etc.
        const patterns = [
            /voie\s*(\d+)/i,
            /platform\s*(\d+)/i,
            /quai\s*(\d+)/i,
            /plateforme\s*(\d+)/i,
            /(\d+)\s*voie/i,
            /(\d+)\s*quai/i,
        ];
        for (const pattern of patterns) {
            const match = name.match(pattern);
            if (match) {
                return match[1];
            }
        }
        return null;
    };

    // Handle station selection and detect train for that station
    const handleSelectStation = async (station: SelectedStation) => {
        setSelectedStation(station);
        setDetectingTrainForStation(true);
        setError(null);

        try {
            const detectedTrain = await findTrainAtLocation(
                station.coord.lat,
                station.coord.lon,
                station.id,
                50 // Use a small accuracy since we're using the station coordinates
            );

            // Update detection result with selected station
            setDetectionResult(prev => prev ? {
                ...prev,
                isInStation: true,
                station: {
                    id: station.id,
                    name: station.name,
                    distance: station.distance,
                    coord: station.coord
                },
                detectedTrain: detectedTrain || undefined
            } : null);
        } catch (err) {
            console.error('Error detecting train for selected station:', err);
            setError('Erreur lors de la détection du train pour cette gare');
        } finally {
            setDetectingTrainForStation(false);
        }
    };

    // Find the train the user is likely on based on location and time
    const findTrainAtLocation = async (
        userLat: number,
        userLon: number,
        stopAreaId: string,
        userAccuracy: number
    ): Promise<DetectedTrain | null> => {
        try {
            const now = new Date();
            const nowStr = formatDateTime(now);
            
            // Get both departures and arrivals to catch trains that are currently at the station
            const [departuresResponse, arrivalsResponse] = await Promise.all([
                getDepartures(stopAreaId, nowStr, 'sncf', { count: 20, depth: 2 }),
                getArrivals(stopAreaId, nowStr, 'sncf', { count: 20, depth: 2 })
            ]);

            const allTrains: Array<{ departure?: Departure; arrival?: Arrival; type: 'departure' | 'arrival' }> = [
                ...(departuresResponse.data.departures || []).map(d => ({ departure: d, type: 'departure' as const })),
                ...(arrivalsResponse.data.arrivals || []).map(a => ({ arrival: a, type: 'arrival' as const }))
            ];

            let bestMatch: DetectedTrain | null = null;
            let bestConfidence = 0;

            for (const train of allTrains) {
                const vehicleJourneyLink = (train.departure || train.arrival)?.links?.find(link => 
                    link.type === 'vehicle_journey' || link.id?.includes('vehicle_journey')
                );
                const rawVehicleJourneyId = vehicleJourneyLink?.id || vehicleJourneyLink?.href;
                const vehicleJourneyId = extractVehicleJourneyId(rawVehicleJourneyId);
                
                if (!vehicleJourneyId) continue;

                try {
                    const vjResponse = await getVehicleJourney(vehicleJourneyId, 'sncf', 2);
                    const vehicleJourney = vjResponse.data.vehicle_journeys?.[0];
                    
                    if (!vehicleJourney?.stop_times) continue;

                    const stopTimes = vehicleJourney.stop_times as Array<StopTime & {
                        base_arrival_date_time?: string;
                        arrival_date_time?: string;
                        base_departure_date_time?: string;
                        departure_date_time?: string;
                        stop_point?: {
                            name?: string | null;
                            label?: string | null;
                            coord?: { lat?: number; lon?: number };
                            stop_area?: {
                                name?: string | null;
                                coord?: { lat?: number; lon?: number };
                            };
                        };
                    }>;

                    // Find the stop_time that matches the user's location
                    for (let i = 0; i < stopTimes.length; i++) {
                        const stopTime = stopTimes[i];
                        const stopPoint = stopTime.stop_point;
                        const coord = stopPoint?.coord || stopPoint?.stop_area?.coord;
                        
                        if (!coord?.lat || !coord?.lon) continue;

                        const stopLat = coord.lat;
                        const stopLon = coord.lon;
                        const distance = calculateDistance(userLat, userLon, stopLat, stopLon);

                        // Check if this stop is close enough and the train should be here now
                        const arrivalTime = stopTime.arrival_date_time || stopTime.base_arrival_date_time || stopTime.utc_arrival_time;
                        const departureTime = stopTime.departure_date_time || stopTime.base_departure_date_time || stopTime.utc_departure_time;
                        
                        if (arrivalTime || departureTime) {
                            const timeStr = departureTime || arrivalTime;
                            const stopDateTime = parseUTCDate(timeStr);
                            const timeDiff = Math.abs(now.getTime() - stopDateTime.getTime());
                            
                            // Train should be at this stop if:
                            // 1. Distance is within user's accuracy + 50m (for platform width)
                            // 2. Time is within 5 minutes of scheduled time
                            const maxDistance = userAccuracy + 50; // Allow some margin for platform width
                            const maxTimeDiff = 5 * 60 * 1000; // 5 minutes
                            
                            if (distance <= maxDistance && timeDiff <= maxTimeDiff) {
                                // Calculate confidence based on distance and time accuracy
                                const distanceScore = Math.max(0, 1 - (distance / maxDistance));
                                const timeScore = Math.max(0, 1 - (timeDiff / maxTimeDiff));
                                const confidence = (distanceScore * 0.6 + timeScore * 0.4) * 100;

                                if (confidence > bestConfidence) {
                                    const displayInfo = vehicleJourney.display_informations || 
                                        (train.departure?.display_informations) || 
                                        (train.arrival?.display_informations);
                                    
                                    const nextStop = i < stopTimes.length - 1 ? 
                                        cleanLocationName(stopTimes[i + 1].stop_point?.name || stopTimes[i + 1].stop_point?.stop_area?.name) || 'Inconnu' : 
                                        'Terminus';

                                    bestMatch = {
                                        vehicleJourneyId,
                                        trainNumber: displayInfo?.headsign || displayInfo?.trip_short_name || 'N/A',
                                        destination: displayInfo?.direction || 'Inconnu',
                                        network: displayInfo?.network || 'SNCF',
                                        currentStop: cleanLocationName(stopPoint?.name || stopPoint?.stop_area?.name) || 'Inconnu',
                                        nextStop,
                                        confidence: Math.round(confidence),
                                        stopPoint: {
                                            id: stopPoint?.id,
                                            name: stopPoint?.name || undefined,
                                            coord: { lat: stopLat, lon: stopLon }
                                        }
                                    };
                                    bestConfidence = confidence;
                                }
                            }
                        }
                    }
                } catch (err) {
                    console.error(`Error fetching vehicle journey ${vehicleJourneyId}:`, err);
                    continue;
                }
            }

            return bestMatch;
        } catch (err) {
            console.error('Error finding train at location:', err);
            return null;
        }
    };

    const detectLocation = useCallback(async (position: GeolocationPosition) => {
        setLoading(true);
        setError(null);

        try {
            const { latitude, longitude, accuracy } = position.coords;
            
            // Find nearby train stations
            const coordStr = `${longitude};${latitude}`;
            let response;
            try {
                response = await getPlacesNearby(coordStr, 'sncf', {
                    type: ['stop_area', 'stop_point'],
                    count: 10,
                    distance: 500, // Search within 500m
                    depth: 2
                });
            } catch (apiError: any) {
                // If 404, try without type filter (some regions might not support filtered queries)
                if (apiError?.response?.status === 404) {
                    console.warn('Places nearby with type filter returned 404, trying without filter...');
                    try {
                        response = await getPlacesNearby(coordStr, 'sncf', {
                            count: 10,
                            distance: 500,
                            depth: 2
                        });
                    } catch (fallbackError: any) {
                        // If still failing, it might be outside coverage area
                        if (fallbackError?.response?.status === 404) {
                            setError('Aucune gare trouvée dans cette zone. L\'API SNCF ne couvre peut-être pas cette région.');
                        } else {
                            setError(`Erreur API: ${fallbackError?.message || 'Erreur inconnue'}`);
                        }
                        setLoading(false);
                        return;
                    }
                } else {
                    setError(`Erreur lors de la recherche de gares: ${apiError?.message || 'Erreur inconnue'}`);
                    setLoading(false);
                    return;
                }
            }

            const places = response.data.places || [];
            const stations = places.filter(place => 
                place.embedded_type === 'stop_area' || place.embedded_type === 'stop_point'
            );

            // Store nearby stations for map display
            const nearbyStations = stations.map(station => {
                const coord = station.coord || 
                    station.stop_area?.coord || 
                    station.stop_point?.coord ||
                    station.stop_point?.stop_area?.coord;
                
                if (coord?.lat && coord?.lon) {
                    const distance = calculateDistance(latitude, longitude, coord.lat, coord.lon);
                    return {
                        id: station.stop_area?.id || station.stop_point?.id || station.id || '',
                        name: cleanLocationName(station.stop_area?.name || station.stop_point?.name || station.name) || 'Gare inconnue',
                        distance: Math.round(distance),
                        coord: { lat: coord.lat, lon: coord.lon },
                        type: (station.embedded_type || 'stop_area') as 'stop_area' | 'stop_point'
                    };
                }
                return null;
            }).filter((s): s is NonNullable<typeof s> => s !== null);

            if (stations.length === 0) {
                setDetectionResult({
                    isInStation: false,
                    userLocation: { lat: latitude, lon: longitude, accuracy },
                    nearbyStations: []
                });
                setLoading(false);
                return;
            }

            // Find the closest station
            let closestStation: Place | null = null;
            let minDistance = Infinity;
            let closestStopPoint: Place | null = null;

            for (const station of stations) {
                const coord = station.coord || 
                    station.stop_area?.coord || 
                    station.stop_point?.coord ||
                    station.stop_point?.stop_area?.coord;
                
                if (coord?.lat && coord?.lon) {
                    const distance = calculateDistance(latitude, longitude, coord.lat, coord.lon);
                    if (distance < minDistance) {
                        minDistance = distance;
                        if (station.embedded_type === 'stop_point') {
                            closestStopPoint = station;
                            closestStation = station.stop_point?.stop_area ? {
                                ...station,
                                embedded_type: 'stop_area',
                                stop_area: station.stop_point.stop_area
                            } : station;
                        } else {
                            closestStation = station;
                        }
                    }
                }
            }

            if (!closestStation || minDistance > 200) {
                setDetectionResult({
                    isInStation: false,
                    userLocation: { lat: latitude, lon: longitude, accuracy },
                    nearbyStations
                });
                setLoading(false);
                return;
            }

            const stationCoord = closestStation.coord || 
                closestStation.stop_area?.coord || 
                closestStation.stop_point?.coord ||
                closestStation.stop_point?.stop_area?.coord;

            if (!stationCoord?.lat || !stationCoord?.lon) {
                setError('Impossible de déterminer les coordonnées de la gare');
                setLoading(false);
                return;
            }

            const stationId = closestStation.stop_area?.id || closestStation.id;
            if (!stationId) {
                setError('Impossible de déterminer l\'ID de la gare');
                setLoading(false);
                return;
            }

            // Determine platform
            let platform: DetectionResult['platform'] | undefined;
            if (closestStopPoint) {
                const platformName = closestStopPoint.stop_point?.name || closestStopPoint.name || '';
                const platformNumber = extractPlatform(platformName);
                const platformCoord = closestStopPoint.stop_point?.coord || closestStopPoint.coord;
                
                if (platformCoord?.lat && platformCoord?.lon) {
                    platform = {
                        id: closestStopPoint.stop_point?.id || closestStopPoint.id || '',
                        name: platformName,
                        coord: { lat: platformCoord.lat, lon: platformCoord.lon }
                    };
                }
            }

            // Try to find the train
            const detectedTrain = await findTrainAtLocation(
                latitude,
                longitude,
                stationId,
                accuracy
            );

            setDetectionResult({
                isInStation: true,
                station: {
                    id: stationId,
                    name: cleanLocationName(closestStation.stop_area?.name || closestStation.name) || 'Gare inconnue',
                    distance: Math.round(minDistance),
                    coord: { lat: stationCoord.lat, lon: stationCoord.lon }
                },
                platform,
                detectedTrain: detectedTrain || undefined,
                userLocation: { lat: latitude, lon: longitude, accuracy },
                nearbyStations
            });
        } catch (err) {
            console.error('Error detecting location:', err);
            setError('Erreur lors de la détection de votre position');
        } finally {
            setLoading(false);
        }
    }, []);

    const handleDetectLocation = () => {
        if (!navigator.geolocation) {
            setError('La géolocalisation n\'est pas supportée par votre navigateur');
            return;
        }

        setLoading(true);
        setError(null);

        navigator.geolocation.getCurrentPosition(
            detectLocation,
            (err) => {
                console.error('Geolocation error:', err);
                setError(`Erreur de géolocalisation: ${err.message}`);
                setLoading(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    };

    const handleStartWatching = () => {
        if (!navigator.geolocation) {
            setError('La géolocalisation n\'est pas supportée par votre navigateur');
            return;
        }

        setWatchingLocation(true);
        setLoading(true);
        setError(null);

        watchIdRef.current = navigator.geolocation.watchPosition(
            detectLocation,
            (err) => {
                console.error('Geolocation error:', err);
                setError(`Erreur de géolocalisation: ${err.message}`);
                setLoading(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    };

    const handleStopWatching = () => {
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
        setWatchingLocation(false);
    };

    useEffect(() => {
        return () => {
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
            }
        };
    }, []);

    // Calculate map bounds and center
    const mapBounds = useMemo<[[number, number], [number, number]] | null>(() => {
        if (!detectionResult?.userLocation) return null;
        
        const allPoints: Array<{ lat: number; lon: number }> = [
            { lat: detectionResult.userLocation.lat, lon: detectionResult.userLocation.lon }
        ];
        
        if (detectionResult.nearbyStations) {
            allPoints.push(...detectionResult.nearbyStations.map(s => s.coord));
        }
        
        if (allPoints.length < 2) return null;
        
        const lats = allPoints.map(p => p.lat);
        const lons = allPoints.map(p => p.lon);
        return [
            [Math.min(...lons), Math.min(...lats)],
            [Math.max(...lons), Math.max(...lats)]
        ];
    }, [detectionResult]);

    const mapCenter: [number, number] = useMemo(() => {
        if (detectionResult?.userLocation) {
            return [detectionResult.userLocation.lat, detectionResult.userLocation.lon];
        }
        return [48.8566, 2.3522]; // Paris fallback
    }, [detectionResult]);

    const [viewState, setViewState] = useState<ViewState>({
        longitude: mapCenter[1],
        latitude: mapCenter[0],
        zoom: 14,
        bearing: 0,
        pitch: 0,
        padding: { top: 0, bottom: 0, left: 0, right: 0 }
    });

    // Fit bounds when detection result changes
    useEffect(() => {
        if (mapBounds && mapRef.current) {
            mapRef.current.fitBounds(mapBounds, {
                padding: { top: 50, bottom: 50, left: 50, right: 50 },
                duration: 500
            });
        } else if (detectionResult?.userLocation) {
            setViewState(prev => ({
                ...prev,
                longitude: detectionResult.userLocation!.lon,
                latitude: detectionResult.userLocation!.lat,
                zoom: 15
            }));
        }
    }, [mapBounds, detectionResult]);

    return (
        <>
            <section className='section'>
                <div className='container'>
                    <div className='level mb-5'>
                        <div className='level-left'>
                            <div className='level-item'>
                                <h1 className='title is-2'>
                                    Détection de <span>localisation</span>
                                </h1>
                            </div>
                        </div>
                    </div>

                    <div className='box mb-5'>
                        <h3 className='title is-5 mb-4'>Détecter votre position</h3>
                        <p className='mb-4'>
                            Cette page détecte votre position exacte et tente de déterminer :
                        </p>
                        <ul className='mb-4'>
                            <li>Si vous êtes dans une gare</li>
                            <li>Sur quel quai vous vous trouvez</li>
                            <li>Dans quel train vous êtes actuellement</li>
                        </ul>

                        <div className='buttons'>
                            <button
                                className='button is-primary'
                                onClick={handleDetectLocation}
                                disabled={loading || watchingLocation}
                            >
                                <span className='icon'><Icon name='fa-map-marker-alt' size={20} /></span>
                                <span>Détecter maintenant</span>
                            </button>
                            {!watchingLocation ? (
                                <button
                                    className='button is-info'
                                    onClick={handleStartWatching}
                                    disabled={loading}
                                >
                                    <span className='icon'><Icon name='fa-sync-alt' size={20} /></span>
                                    <span>Surveiller en continu</span>
                                </button>
                            ) : (
                                <button
                                    className='button is-danger'
                                    onClick={handleStopWatching}
                                >
                                    <span className='icon'><Icon name='fa-stop' size={20} /></span>
                                    <span>Arrêter la surveillance</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {error && (
                        <div className='notification is-danger'>
                            <button className='delete' onClick={() => setError(null)}></button>
                            {error}
                        </div>
                    )}

                    {loading && !detectionResult && (
                        <div className='box has-text-centered'>
                            <span className='icon is-large'>
                                <Icon name='fa-spinner' size={48} spin={true} />
                            </span>
                            <p className='mt-4'>Détection en cours...</p>
                        </div>
                    )}

                    {detectionResult && (
                        <div className='box'>
                            <h3 className='title is-4 mb-4'>Résultats de la détection</h3>
                            
                            {detectionResult.userLocation && (
                                <div className='mb-4'>
                                    <p><strong>Votre position :</strong></p>
                                    <p>
                                        Latitude: {detectionResult.userLocation.lat.toFixed(6)}, 
                                        Longitude: {detectionResult.userLocation.lon.toFixed(6)}
                                    </p>
                                    <p>Précision: ±{Math.round(detectionResult.userLocation.accuracy)}m</p>
                                </div>
                            )}

                            {detectionResult.isInStation ? (
                                <>
                                    {detectionResult.station && (
                                        <div className='mb-4'>
                                            <p className='has-text-success'>
                                                <span className='icon'><Icon name='fa-check-circle' size={20} /></span>
                                                <strong>Vous êtes dans une gare !</strong>
                                            </p>
                                            <p><strong>Gare :</strong> {detectionResult.station.name}</p>
                                            <p>Distance: {detectionResult.station.distance}m</p>
                                        </div>
                                    )}

                                    {detectionResult.platform && (
                                        <div className='mb-4'>
                                            <p><strong>Quai détecté :</strong></p>
                                            <p>{detectionResult.platform.name}</p>
                                        </div>
                                    )}

                                    {detectionResult.detectedTrain ? (
                                        <div className='mb-4'>
                                            <p className='has-text-info'>
                                                <span className='icon'><Icon name='fa-train' size={20} /></span>
                                                <strong>Train détecté !</strong>
                                            </p>
                                            <div className='box' style={{ backgroundColor: '#f5f5f5' }}>
                                                <p><strong>Numéro de train :</strong> {detectionResult.detectedTrain.trainNumber}</p>
                                                <p><strong>Destination :</strong> {detectionResult.detectedTrain.destination}</p>
                                                <p><strong>Réseau :</strong> {detectionResult.detectedTrain.network}</p>
                                                <p><strong>Arrêt actuel :</strong> {detectionResult.detectedTrain.currentStop}</p>
                                                <p><strong>Prochain arrêt :</strong> {detectionResult.detectedTrain.nextStop}</p>
                                                <p><strong>Confiance :</strong> {detectionResult.detectedTrain.confidence}%</p>
                                                <div className='buttons mt-4'>
                                                    <Link
                                                        to={`/train/${encodeVehicleJourneyId(detectionResult.detectedTrain.vehicleJourneyId)}`}
                                                        className='button is-primary'
                                                    >
                                                        <span className='icon'><Icon name='fa-info-circle' size={20} /></span>
                                                        <span>Voir les détails du train</span>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className='mb-4'>
                                            <p className='has-text-warning'>
                                                <span className='icon'><Icon name='fa-exclamation-triangle' size={20} /></span>
                                                Aucun train détecté à votre position actuelle.
                                            </p>
                                            <p className='is-size-7 mt-2'>
                                                Cela peut signifier que vous êtes sur un quai sans train, 
                                                ou que le train n'a pas encore été détecté. Essayez de vous déplacer 
                                                ou attendez quelques instants.
                                            </p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    <div className='mb-4'>
                                        <p className='has-text-warning'>
                                            <span className='icon'><Icon name='fa-exclamation-triangle' size={16} /></span>
                                            Vous ne semblez pas être dans une gare.
                                        </p>
                                        <p className='is-size-7 mt-2'>
                                            Aucune gare trouvée à moins de 200m de votre position. 
                                            Vous pouvez sélectionner une gare dans la liste ci-dessous pour continuer.
                                        </p>
                                    </div>

                                    {detectionResult.nearbyStations && detectionResult.nearbyStations.length > 0 && (
                                        <div className='mb-4'>
                                            <h4 className='title is-5 mb-3'>Gares à proximité</h4>
                                            <p className='is-size-7 mb-3 has-text-grey'>
                                                Sélectionnez une gare pour la définir comme gare actuelle et détecter les trains :
                                            </p>
                                            <div className='columns is-multiline'>
                                                {detectionResult.nearbyStations
                                                    .sort((a, b) => a.distance - b.distance)
                                                    .map((station, idx) => (
                                                        <div key={`station-${station.id}-${idx}`} className='column is-half-tablet is-one-third-desktop'>
                                                            <div 
                                                                className={`box station-card ${selectedStation?.id === station.id ? 'has-background-info-light' : ''}`}
                                                                style={{ 
                                                                    cursor: 'pointer',
                                                                    transition: 'all 0.2s',
                                                                    border: selectedStation?.id === station.id ? '2px solid #3273dc' : '1px solid #dbdbdb'
                                                                }}
                                                                onClick={() => handleSelectStation({
                                                                    id: station.id,
                                                                    name: station.name,
                                                                    distance: station.distance,
                                                                    coord: station.coord
                                                                })}
                                                                onMouseEnter={(e) => {
                                                                    if (selectedStation?.id !== station.id) {
                                                                        e.currentTarget.style.backgroundColor = '#f5f5f5';
                                                                    }
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    if (selectedStation?.id !== station.id) {
                                                                        e.currentTarget.style.backgroundColor = '';
                                                                    }
                                                                }}
                                                            >
                                                                <div className='level mb-2'>
                                                                    <div className='level-left'>
                                                                        <div className='level-item'>
                                                                            <span className='icon has-text-primary'>
                                                                                <Icon name='fa-train' size={16} />
                                                                            </span>
                                                                        </div>
                                                                        <div className='level-item'>
                                                                            <strong>{station.name}</strong>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <p className='is-size-7 has-text-grey'>
                                                                    <span className='icon is-small'><Icon name='fa-map-marker-alt' size={16} /></span>
                                                                    Distance: {station.distance}m
                                                                </p>
                                                                {selectedStation?.id === station.id && (
                                                                    <p className='has-text-info is-size-7 mt-2'>
                                                                        <span className='icon'><Icon name='fa-check-circle' size={20} /></span>
                                                                        Gare sélectionnée
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                            </div>
                                            {detectingTrainForStation && (
                                                <div className='box has-text-centered'>
                                                    <span className='icon is-large'>
                                                        <Icon name='fa-spinner' size={32} spin={true} />
                                                    </span>
                                                    <p className='mt-3'>Détection des trains en cours...</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {selectedStation && detectionResult.isInStation && (
                                        <>
                                            {detectionResult.detectedTrain ? (
                                                <div className='mb-4'>
                                                    <p className='has-text-info'>
                                                        <span className='icon'><Icon name='fa-train' size={20} /></span>
                                                        <strong>Train détecté !</strong>
                                                    </p>
                                                    <div className='box' style={{ backgroundColor: '#f5f5f5' }}>
                                                        <p><strong>Numéro de train :</strong> {detectionResult.detectedTrain.trainNumber}</p>
                                                        <p><strong>Destination :</strong> {detectionResult.detectedTrain.destination}</p>
                                                        <p><strong>Réseau :</strong> {detectionResult.detectedTrain.network}</p>
                                                        <p><strong>Arrêt actuel :</strong> {detectionResult.detectedTrain.currentStop}</p>
                                                        <p><strong>Prochain arrêt :</strong> {detectionResult.detectedTrain.nextStop}</p>
                                                        <p><strong>Confiance :</strong> {detectionResult.detectedTrain.confidence}%</p>
                                                        <div className='buttons mt-4'>
                                                            <Link
                                                                to={`/train/${encodeVehicleJourneyId(detectionResult.detectedTrain.vehicleJourneyId)}`}
                                                                className='button is-primary'
                                                            >
                                                                <span className='icon'><Icon name='fa-info-circle' size={20} /></span>
                                                                <span>Voir les détails du train</span>
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className='mb-4'>
                                                    <p className='has-text-warning'>
                                                        <span className='icon'><Icon name='fa-exclamation-triangle' size={20} /></span>
                                                        Aucun train détecté à la gare sélectionnée.
                                                    </p>
                                                    <p className='is-size-7 mt-2'>
                                                        Cela peut signifier qu'il n'y a pas de train actuellement à cette gare, 
                                                        ou que le train n'a pas encore été détecté.
                                                    </p>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {/* Map showing user location and nearby stations */}
                    {detectionResult && detectionResult.userLocation && (
                        <div className='box mt-5'>
                            <h3 className='title is-5 mb-4'>Carte des gares à proximité</h3>
                            <div style={{ height: 500, width: '100%', borderRadius: 6, overflow: 'hidden' }}>
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
                                    attributionControl={{compact: true}}
                                >
                                    <NavigationControl position="top-right" />
                                    <GeolocateControl position="top-right" />
                                    
                                    {/* User location marker */}
                                    <Marker
                                        longitude={detectionResult.userLocation.lon}
                                        latitude={detectionResult.userLocation.lat}
                                        anchor="center"
                                    >
                                        <div
                                            style={{
                                                backgroundColor: '#00d1b2',
                                                width: 24,
                                                height: 24,
                                                borderRadius: '50%',
                                                border: '3px solid white',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'default'
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width: 12,
                                                    height: 12,
                                                    borderRadius: '50%',
                                                    backgroundColor: 'white'
                                                }}
                                            />
                                        </div>
                                    </Marker>

                                    {/* Nearby stations markers */}
                                    {detectionResult.nearbyStations?.map((station, idx) => {
                                        const isClosest = detectionResult.station?.id === station.id;
                                        return (
                                            <Marker
                                                key={`station-${station.id}-${idx}`}
                                                longitude={station.coord.lon}
                                                latitude={station.coord.lat}
                                                anchor="bottom"
                                                onClick={() => setSelectedStationIndex(idx)}
                                            >
                                                <div
                                                    style={{
                                                        backgroundColor: isClosest ? '#ff3860' : '#3273dc',
                                                        width: isClosest ? 36 : 32,
                                                        height: isClosest ? 36 : 32,
                                                        borderRadius: '50%',
                                                        border: '3px solid white',
                                                        cursor: 'pointer',
                                                        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}
                                                >
                                                    <svg 
                                                        width={isClosest ? 20 : 18} 
                                                        height={isClosest ? 20 : 18} 
                                                        viewBox="0 0 24 24" 
                                                        fill="white" 
                                                        xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                        <path d="M12 2c-4 0-8 .5-8 4v9.5c0 .95.38 1.81 1 2.44L3 22h3l.5-2h11l.5 2h3l-2-4.06c.62-.63 1-1.49 1-2.44V6c0-3.5-3.58-4-8-4zM5.5 16c-.83 0-1.5-.67-1.5-1.5S4.67 13 5.5 13s1.5.67 1.5 1.5S6.33 16 5.5 16zm13 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-5H4V6h16v5z"/>
                                                    </svg>
                                                </div>
                                            </Marker>
                                        );
                                    })}

                                    {/* Popup for selected station */}
                                    {selectedStationIndex !== null && detectionResult.nearbyStations?.[selectedStationIndex] && (
                                        <Popup
                                            longitude={detectionResult.nearbyStations[selectedStationIndex].coord.lon}
                                            latitude={detectionResult.nearbyStations[selectedStationIndex].coord.lat}
                                            anchor="bottom"
                                            onClose={() => setSelectedStationIndex(null)}
                                            closeButton={true}
                                            closeOnClick={false}
                                        >
                                            <div>
                                                <strong>{detectionResult.nearbyStations[selectedStationIndex].name}</strong>
                                                <div className='is-size-7 mt-1'>
                                                    Distance: {detectionResult.nearbyStations[selectedStationIndex].distance}m
                                                </div>
                                                {detectionResult.station?.id === detectionResult.nearbyStations[selectedStationIndex].id && (
                                                    <div className='has-text-success is-size-7 mt-1'>
                                                        <Icon name='fa-check-circle' size={16} /> Gare détectée
                                                    </div>
                                                )}
                                            </div>
                                        </Popup>
                                    )}
                                </Map>
                            </div>
                            <div className='mt-3'>
                                <p className='is-size-7 has-text-grey'>
                                    <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', backgroundColor: '#00d1b2', border: '2px solid white', marginRight: 6, verticalAlign: 'middle' }}></span>
                                    Votre position
                                    {' '}
                                    <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ff3860', border: '2px solid white', marginRight: 6, marginLeft: 12, verticalAlign: 'middle' }}></span>
                                    Gare détectée
                                    {' '}
                                    <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', backgroundColor: '#3273dc', border: '2px solid white', marginRight: 6, marginLeft: 12, verticalAlign: 'middle' }}></span>
                                    Autres gares
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </section>
            <Footer />
        </>
    );
};

export default LocationDetection;

