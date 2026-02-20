import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import Map, { Marker, Popup, NavigationControl, GeolocateControl } from 'react-map-gl/maplibre';
import type { MapRef, ViewState } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
    Box,
    Paper,
    Button,
    Alert,
    Typography,
    Grid,
    Stack,
} from '@mui/material';
import Footer from '@/components/Footer';
import { PageHeader } from '@/components/skytrip';
import PageLayout from '@/components/shared/PageLayout';
import { getPlacesNearby, getDepartures, getArrivals, formatDateTime } from '@/services/navitiaApi';
import { getVehicleJourney, extractVehicleJourneyId } from '@/services/vehicleJourneyService';
import { encodeVehicleJourneyId } from '@/utils/uriUtils';
import { MapPin, RefreshCw, Square, Loader2, CheckCircle2, Train, Info, AlertTriangle } from 'lucide-react';
import { cleanLocationName } from '@/services/locationService';
import { parseUTCDate } from '@/utils/dateUtils';
import type { Departure } from '@/client/models/departure';
import type { Arrival } from '@/client/models/arrival';
import type { VehicleJourney } from '@/client/models/vehicle-journey';
import type { StopTime } from '@/client/models/stop-time';

export const DEFAULT_RADIUS_NEARBY = 5000;
export const DEFAULT_RADIUS_NEARBY_LARGE = 10000;

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
    const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);
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
            const [departuresData, arrivalsData] = await Promise.all([
                getDepartures(stopAreaId, nowStr, 'sncf', { count: 20, depth: 2 }),
                getArrivals(stopAreaId, nowStr, 'sncf', { count: 20, depth: 2 })
            ]);

            const allTrains: Array<{ departure?: Departure; arrival?: Arrival; type: 'departure' | 'arrival' }> = [
                ...(departuresData.departures || []).map(d => ({ departure: d, type: 'departure' as const })),
                ...(arrivalsData.arrivals || []).map(a => ({ arrival: a, type: 'arrival' as const }))
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
                    const vjData = await getVehicleJourney(vehicleJourneyId, 'sncf', 2);
                    const vehicleJourney = vjData.data.vehicle_journeys?.[0];

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
                                    // VehicleJourney doesn't have display_informations, construct it from available properties
                                    const displayInfo = (train.departure?.display_informations) ||
                                        (train.arrival?.display_informations) ||
                                        {
                                            headsign: vehicleJourney.headsign || '',
                                            trip_short_name: vehicleJourney.name || '',
                                            network: (vehicleJourney.journey_pattern as any)?.route?.line?.network?.name || 'SNCF',
                                            direction: vehicleJourney.headsign || ''
                                        };

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
                    distance: 10000, // Search within 10000m
                    depth: 2
                });
            } catch (apiError: any) {
                // If 404, try without type filter (some regions might not support filtered queries)
                if (apiError?.response?.status === 404) {
                    console.warn('Places nearby with type filter returned 404, trying without filter...');
                    try {
                        response = await getPlacesNearby(coordStr, 'sncf', {
                            count: 10,
                            distance: 10000,
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

            // getPlacesNearby returns StopAreasResponse with stop_areas property
            const stopAreas = response.stop_areas || [];
            
            // Also collect stop_points from the stop_areas
            const allStations: Array<{ type: 'stop_area' | 'stop_point'; data: any }> = [];
            for (const stopArea of stopAreas) {
                allStations.push({ type: 'stop_area', data: stopArea });
                // Add stop_points as separate entries
                if (stopArea.stop_points) {
                    for (const stopPoint of stopArea.stop_points) {
                        allStations.push({ type: 'stop_point', data: stopPoint });
                    }
                }
            }

            // Store nearby stations for map display
            const nearbyStations = allStations.map(({ type, data }) => {
                const coord = data.coord || data.stop_area?.coord;

                if (coord?.lat && coord?.lon) {
                    const distance = calculateDistance(latitude, longitude, coord.lat, coord.lon);
                    return {
                        id: data.id || data.stop_area?.id || '',
                        name: cleanLocationName(data.name || data.stop_area?.name) || 'Gare inconnue',
                        distance: Math.round(distance),
                        coord: { lat: coord.lat, lon: coord.lon },
                        type: type
                    };
                }
                return null;
            }).filter((s): s is NonNullable<typeof s> => s !== null);

            if (allStations.length === 0) {
                setDetectionResult({
                    isInStation: false,
                    userLocation: { lat: latitude, lon: longitude, accuracy },
                    nearbyStations: []
                });
                setLoading(false);
                return;
            }

            // Find the closest station
            // The getPlacesNearby API call returns a list of stations within a radius.
            // We then iterate through this list and calculate the precise distance to each station
            // to identify the one that is truly the closest to the user's coordinates.
            // This approach is correct and ensures accuracy.
            let closestStation: { type: 'stop_area' | 'stop_point'; data: any } | null = null;
            let minDistance = Infinity;
            let closestStopPoint: { type: 'stop_area' | 'stop_point'; data: any } | null = null;

            for (const { type, data } of allStations) {
                const coord = data.coord || data.stop_area?.coord;

                if (coord?.lat && coord?.lon) {
                    const distance = calculateDistance(latitude, longitude, coord.lat, coord.lon);
                    if (distance < minDistance) {
                        minDistance = distance;
                        if (type === 'stop_point') {
                            closestStopPoint = { type, data };
                            // Find the parent stop_area for the stop_point
                            const parentStopArea = stopAreas.find(sa => 
                                sa.stop_points?.some(sp => sp.id === data.id)
                            );
                            closestStation = parentStopArea 
                                ? { type: 'stop_area', data: parentStopArea }
                                : { type, data };
                        } else {
                            closestStation = { type, data };
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

            const stationCoord = closestStation.data.coord || closestStation.data.stop_area?.coord;

            if (!stationCoord?.lat || !stationCoord?.lon) {
                setError('Impossible de déterminer les coordonnées de la gare');
                setLoading(false);
                return;
            }

            const stationId = closestStation.data.id;
            if (!stationId) {
                setError('Impossible de déterminer l\'ID de la gare');
                setLoading(false);
                return;
            }

            // Determine platform
            let platform: DetectionResult['platform'] | undefined;
            if (closestStopPoint) {
                const platformName = closestStopPoint.data.name || '';
                const platformNumber = extractPlatform(platformName);
                const platformCoord = closestStopPoint.data.coord;

                if (platformCoord?.lat && platformCoord?.lon) {
                    platform = {
                        id: closestStopPoint.data.id || '',
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
                    name: cleanLocationName(closestStation.data.name) || 'Gare inconnue',
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

    const handleDetectLocation = async () => {
        if (!navigator.geolocation) {
            setError('La géolocalisation n\'est pas supportée par votre navigateur');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0,
                });
            });
            await detectLocation(position);
        } catch (err: any) {
            console.error('Geolocation error:', err);
            setError(`Erreur de géolocalisation: ${err.message}`);
        } finally {
            setLoading(false);
        }
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

        // Always include all nearby stations
        if (detectionResult.nearbyStations && detectionResult.nearbyStations.length > 0) {
            allPoints.push(...detectionResult.nearbyStations.map(s => s.coord));
        }

        // Also include detected station if available (and not already in nearbyStations)
        if (detectionResult.station) {
            const alreadyIncluded = detectionResult.nearbyStations?.some(
                s => s.id === detectionResult.station?.id
            );
            if (!alreadyIncluded) {
                allPoints.push(detectionResult.station.coord);
            }
        }

        // Also include platform if available
        if (detectionResult.platform) {
            allPoints.push(detectionResult.platform.coord);
        }

        if (allPoints.length === 0) return null;

        const lats = allPoints.map(p => p.lat);
        const lons = allPoints.map(p => p.lon);
        
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLon = Math.min(...lons);
        const maxLon = Math.max(...lons);

        // Calculate padding based on the spread of points
        // For a single point or very close points, use a minimum padding
        const latRange = maxLat - minLat;
        const lonRange = maxLon - minLon;
        
        // Use 15% padding, but at least 0.002 degrees (~222m) for visibility
        const latPadding = Math.max(latRange * 0.15, 0.002);
        const lonPadding = Math.max(lonRange * 0.15, 0.002);

        return [
            [minLon - lonPadding, minLat - latPadding],
            [maxLon + lonPadding, maxLat + latPadding]
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

    // Fit bounds when detection result changes or when map is loaded
    useEffect(() => {
        if (!mapRef.current || !isMapLoaded) return;

        // If we have bounds and nearby stations, fit bounds to show all stations
        if (mapBounds && detectionResult?.nearbyStations && detectionResult.nearbyStations.length > 0) {
            // Use fitBounds to show all stations with proper padding
            mapRef.current.fitBounds(mapBounds, {
                padding: { top: 100, bottom: 100, left: 100, right: 100 },
                duration: 800,
                maxZoom: 16, // Prevent zooming in too much
                minZoom: 12  // Prevent zooming out too much
            });
        } else if (mapBounds && detectionResult?.userLocation) {
            // If we have bounds but no nearby stations (e.g., only user location and detected station)
            // Still fit bounds but with less padding
            mapRef.current.fitBounds(mapBounds, {
                padding: { top: 100, bottom: 100, left: 100, right: 100 },
                duration: 800,
                maxZoom: 16
            });
        } else if (detectionResult?.userLocation) {
            // If no bounds calculated, just center on user location with a reasonable zoom
            setViewState(prev => ({
                ...prev,
                longitude: detectionResult.userLocation!.lon,
                latitude: detectionResult.userLocation!.lat,
                zoom: 15
            }));
        }
    }, [mapBounds, detectionResult, isMapLoaded]);

    return (
        <>
            <PageHeader
                title="Détection de localisation"
                subtitle="Identifiez votre position, la gare la plus proche et le train en cours"
                showNotification={false}
            />
            <PageLayout>
                <Paper sx={{ p: 2, mb: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        Détecter votre position
                    </Typography>
                    <Typography sx={{ mb: 2 }}>
                        Cette page détecte votre position exacte et tente de déterminer :
                    </Typography>
                    <Box component="ul" sx={{ mb: 2, pl: 2 }}>
                        <li>Si vous êtes dans une gare</li>
                        <li>Sur quel quai vous vous trouvez</li>
                        <li>Dans quel train vous êtes actuellement</li>
                    </Box>

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} flexWrap="wrap">
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleDetectLocation}
                            disabled={loading || watchingLocation}
                            startIcon={<MapPin size={20} />}
                        >
                            Détecter maintenant
                        </Button>
                        {!watchingLocation ? (
                            <Button
                                variant="contained"
                                color="info"
                                onClick={handleStartWatching}
                                disabled={loading}
                                startIcon={<RefreshCw size={20} />}
                            >
                                Surveiller en continu
                            </Button>
                        ) : (
                            <Button
                                variant="contained"
                                color="error"
                                onClick={handleStopWatching}
                                startIcon={<Square size={20} />}
                            >
                                Arrêter la surveillance
                            </Button>
                        )}
                    </Stack>
                </Paper>

                {error && (
                    <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {loading && !detectionResult && (
                    <Paper sx={{ p: 4, textAlign: 'center' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                            <Loader2 size={48} className="animate-spin" />
                            <Typography>Détection en cours...</Typography>
                        </Box>
                    </Paper>
                )}

                {detectionResult && (
                    <Paper sx={{ p: 2, mb: 2 }}>
                        <Typography variant="h5" sx={{ mb: 2 }}>
                            Résultats de la détection
                        </Typography>

                        {detectionResult.userLocation && (
                            <Box sx={{ mb: 2 }}>
                                <Typography><strong>Votre position :</strong></Typography>
                                <Typography>
                                    Latitude: {detectionResult.userLocation.lat.toFixed(6)},
                                    Longitude: {detectionResult.userLocation.lon.toFixed(6)}
                                </Typography>
                                <Typography>Précision: ±{Math.round(detectionResult.userLocation.accuracy)}m</Typography>
                            </Box>
                        )}

                        {detectionResult.isInStation ? (
                            <>
                                {detectionResult.station && (
                                    <Box sx={{ mb: 2 }}>
                                        <Typography color="success.main" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <CheckCircle2 size={20} />
                                            <strong>Vous êtes dans une gare !</strong>
                                        </Typography>
                                        <Typography><strong>Gare :</strong> {detectionResult.station.name}</Typography>
                                        <Typography>Distance: {detectionResult.station.distance}m</Typography>
                                    </Box>
                                )}

                                {detectionResult.platform && (
                                    <Box sx={{ mb: 2 }}>
                                        <Typography><strong>Quai détecté :</strong></Typography>
                                        <Typography>{detectionResult.platform.name}</Typography>
                                    </Box>
                                )}

                                {detectionResult.detectedTrain ? (
                                    <Box sx={{ mb: 2 }}>
                                        <Typography color="info.main" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                            <Train size={20} />
                                            <strong>Train détecté !</strong>
                                        </Typography>
                                        <Paper variant="outlined" sx={{ p: 2, backgroundColor: 'action.hover', mb: 2 }}>
                                            <Typography><strong>Numéro de train :</strong> {detectionResult.detectedTrain.trainNumber}</Typography>
                                            <Typography><strong>Destination :</strong> {detectionResult.detectedTrain.destination}</Typography>
                                            <Typography><strong>Réseau :</strong> {detectionResult.detectedTrain.network}</Typography>
                                            <Typography><strong>Arrêt actuel :</strong> {detectionResult.detectedTrain.currentStop}</Typography>
                                            <Typography><strong>Prochain arrêt :</strong> {detectionResult.detectedTrain.nextStop}</Typography>
                                            <Typography><strong>Confiance :</strong> {detectionResult.detectedTrain.confidence}%</Typography>
                                            <Box sx={{ mt: 2 }}>
                                                <Button
                                                    component={Link}
                                                    to={`/train/${encodeVehicleJourneyId(detectionResult.detectedTrain.vehicleJourneyId)}`}
                                                    variant="contained"
                                                    color="primary"
                                                    startIcon={<Info size={20} />}
                                                >
                                                    Voir les détails du train
                                                </Button>
                                            </Box>
                                        </Paper>
                                    </Box>
                                ) : (
                                    <Box sx={{ mb: 2 }}>
                                        <Typography color="warning.main" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <AlertTriangle size={20} />
                                            Aucun train détecté à votre position actuelle.
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                            Cela peut signifier que vous êtes sur un quai sans train,
                                            ou que le train n'a pas encore été détecté. Essayez de vous déplacer
                                            ou attendez quelques instants.
                                        </Typography>
                                    </Box>
                                )}
                            </>
                        ) : (
                            <>
                                <Box sx={{ mb: 2 }}>
                                    <Typography color="warning.main" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <AlertTriangle size={16} />
                                        Vous ne semblez pas être dans une gare.
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                        Aucune gare trouvée à moins de 200m de votre position.
                                        Vous pouvez sélectionner une gare dans la liste ci-dessous pour continuer.
                                    </Typography>
                                </Box>

                                {detectionResult.nearbyStations && detectionResult.nearbyStations.length > 0 && (
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="h6" sx={{ mb: 1 }}>
                                            Gares à proximité
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                            Sélectionnez une gare pour la définir comme gare actuelle et détecter les trains :
                                        </Typography>
                                        <Grid container spacing={2}>
                                            {detectionResult.nearbyStations
                                                .sort((a, b) => a.distance - b.distance)
                                                .map((station, idx) => (
                                                    <Grid item xs={12} sm={6} md={4} key={`station-${station.id}-${idx}`}>
                                                        <Paper
                                                            variant="outlined"
                                                            sx={{
                                                                p: 2,
                                                                cursor: 'pointer',
                                                                transition: 'all 0.2s',
                                                                border: selectedStation?.id === station.id ? 2 : 1,
                                                                borderColor: selectedStation?.id === station.id ? 'primary.main' : 'divider',
                                                                backgroundColor: selectedStation?.id === station.id ? 'primary.light' : 'background.paper',
                                                                '&:hover': {
                                                                    backgroundColor: selectedStation?.id === station.id ? 'primary.light' : 'action.hover',
                                                                },
                                                            }}
                                                            onClick={() => handleSelectStation({
                                                                id: station.id,
                                                                name: station.name,
                                                                distance: station.distance,
                                                                coord: station.coord
                                                            })}
                                                        >
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                                <Train size={16} color="var(--primary)" />
                                                                <Typography fontWeight="bold">{station.name}</Typography>
                                                            </Box>
                                                            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                <MapPin size={16} />
                                                                Distance: {station.distance}m
                                                            </Typography>
                                                            {selectedStation?.id === station.id && (
                                                                <Typography color="info.main" variant="body2" sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                    <CheckCircle2 size={20} />
                                                                    Gare sélectionnée
                                                                </Typography>
                                                            )}
                                                        </Paper>
                                                    </Grid>
                                                ))}
                                        </Grid>
                                        {detectingTrainForStation && (
                                            <Paper variant="outlined" sx={{ p: 3, mt: 2, textAlign: 'center' }}>
                                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                                                    <Loader2 size={32} className="animate-spin" />
                                                    <Typography>Détection des trains en cours...</Typography>
                                                </Box>
                                            </Paper>
                                        )}
                                    </Box>
                                )}

                                {selectedStation && detectionResult.isInStation && (
                                    <>
                                        {detectionResult.detectedTrain ? (
                                            <Box sx={{ mb: 2 }}>
                                                <Typography color="info.main" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                    <Train size={20} />
                                                    <strong>Train détecté !</strong>
                                                </Typography>
                                                <Paper variant="outlined" sx={{ p: 2, backgroundColor: 'action.hover' }}>
                                                    <Typography><strong>Numéro de train :</strong> {detectionResult.detectedTrain.trainNumber}</Typography>
                                                    <Typography><strong>Destination :</strong> {detectionResult.detectedTrain.destination}</Typography>
                                                    <Typography><strong>Réseau :</strong> {detectionResult.detectedTrain.network}</Typography>
                                                    <Typography><strong>Arrêt actuel :</strong> {detectionResult.detectedTrain.currentStop}</Typography>
                                                    <Typography><strong>Prochain arrêt :</strong> {detectionResult.detectedTrain.nextStop}</Typography>
                                                    <Typography><strong>Confiance :</strong> {detectionResult.detectedTrain.confidence}%</Typography>
                                                    <Box sx={{ mt: 2 }}>
                                                        <Button
                                                            component={Link}
                                                            to={`/train/${encodeVehicleJourneyId(detectionResult.detectedTrain.vehicleJourneyId)}`}
                                                            variant="contained"
                                                            color="primary"
                                                            startIcon={<Info size={20} />}
                                                        >
                                                            Voir les détails du train
                                                        </Button>
                                                    </Box>
                                                </Paper>
                                            </Box>
                                        ) : (
                                            <Box sx={{ mb: 2 }}>
                                                <Typography color="warning.main" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <AlertTriangle size={20} />
                                                    Aucun train détecté à la gare sélectionnée.
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                                    Cela peut signifier qu'il n'y a pas de train actuellement à cette gare,
                                                    ou que le train n'a pas encore été détecté.
                                                </Typography>
                                            </Box>
                                        )}
                                    </>
                                )}
                            </>
                        )}
                    </Paper>
                )}

                {/* Map showing user location and nearby stations */}
                {detectionResult && detectionResult.userLocation && (
                    <Paper sx={{ p: 2, mt: 2 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Carte des gares à proximité
                        </Typography>
                        <Box
                            data-map-loaded={isMapLoaded}
                            sx={{ height: 500, width: '100%', borderRadius: 1, overflow: 'hidden' }}
                        >
                            <Map
                                ref={mapRef}
                                {...viewState}
                                onMove={evt => setViewState(evt.viewState)}
                                onLoad={() => setIsMapLoaded(true)}
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
                                        <Box>
                                            <Typography fontWeight="bold">
                                                {detectionResult.nearbyStations[selectedStationIndex].name}
                                            </Typography>
                                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                                                Distance: {detectionResult.nearbyStations[selectedStationIndex].distance}m
                                            </Typography>
                                            {detectionResult.station?.id === detectionResult.nearbyStations[selectedStationIndex].id && (
                                                <Typography variant="body2" color="success.main" sx={{ mt: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <CheckCircle2 size={16} /> Gare détectée
                                                </Typography>
                                            )}
                                        </Box>
                                    </Popup>
                                )}
                            </Map>
                        </Box>
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                                <Box component="span" sx={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', backgroundColor: '#00d1b2', border: '2px solid white', mr: 0.75, verticalAlign: 'middle' }} />
                                Votre position
                                {' '}
                                <Box component="span" sx={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ff3860', border: '2px solid white', mr: 0.75, ml: 1.5, verticalAlign: 'middle' }} />
                                Gare détectée
                                {' '}
                                <Box component="span" sx={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', backgroundColor: '#3273dc', border: '2px solid white', mr: 0.75, ml: 1.5, verticalAlign: 'middle' }} />
                                Autres gares
                            </Typography>
                        </Box>
                    </Paper>
                )}
            </PageLayout>
            <Footer />
        </>
    );
};

export default LocationDetection;
