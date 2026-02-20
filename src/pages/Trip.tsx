import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Alert } from '@mui/material';
import Footer from '@/components/Footer';
import PageLayout from '@/components/shared/PageLayout';
import { PageHeader } from '@/components/skytrip';
import GeoJSONMap from '@/components/GeoJSONMap';
import { parseUTCDate, formatTime, formatDate } from '@/utils/dateUtils';
import { cleanLocationName } from '@/services/locationService';
import { getTransportIcon } from '@/services/transportService';
import { getDelay } from '@/services/delayService';
import { getVehicleJourney } from '@/services/vehicleJourneyService';
import { getJourneyInfo } from '@/services/journeyService';
import { decodeTripId, decodeVehicleJourneyId, encodeVehicleJourneyId, encodeTripId } from '@/utils/uriUtils';
import { Loader2, Route, AlertTriangle, Train as TrainIcon, Map, Ban, Info, Clock, RefreshCw } from 'lucide-react';
import type { JourneyItem } from '@/client/models/journey-item';
import type { JourneyInfo } from '@/services/journeyService';
import type { Disruption } from '@/client/models/disruption';
import type { Section } from '@/client/models/section';
import type { Coord } from '@/client/models/coord';
import type { VehicleJourney } from '@/client/models/vehicle-journey';

interface TripData {
    journey: JourneyItem;
    info: JourneyInfo;
    disruptions: Disruption[];
}

interface JourneyMarker {
    lat: number;
    lon: number;
    name: string | null | undefined;
    popup: React.ReactNode;
}

interface ExtendedStopTime {
    base_arrival_date_time?: string;
    arrival_date_time?: string;
    base_departure_date_time?: string;
    departure_date_time?: string;
    stop_point?: {
        name?: string | null;
        label?: string | null;
    };
    stop_area?: {
        name?: string | null;
    };
    section?: Section;
    isFirst: boolean;
    isLast: boolean;
    commercialMode?: string;
    network?: string;
    trainNumber?: string;
}

const Trip: React.FC = () => {
    const { tripId } = useParams<{ tripId?: string }>();
    const navigate = useNavigate();
    const [tripData, setTripData] = useState<TripData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [vehicleJourneyId, setVehicleJourneyId] = useState<string | null>(null);
    const loadingRef = React.useRef<boolean>(false); // Prevent concurrent loads

    const loadTripData = useCallback(async (forceRefresh: boolean = false): Promise<void> => {
            // Prevent concurrent loads
            if (loadingRef.current && !forceRefresh) {
                return;
            }
            
            try {
                loadingRef.current = true;
                setLoading(true);
                setError(null);
                
                // Retrieve journey data from sessionStorage
                if (!tripId) {
                    console.error('[Trip] Missing tripId');
                    setError('ID de trajet manquant');
                    setLoading(false);
                    // Show samples section instead of error
                    return;
                }
                
                // Backup cache before clearing if force refresh (like page reload)
                let cachedDataBackup: TripData | null = null;
                if (forceRefresh) {
                    const cacheKey = `trip_${tripId}`;
                    const cachedData = sessionStorage.getItem(cacheKey);
                    if (cachedData) {
                        try {
                            cachedDataBackup = JSON.parse(cachedData) as TripData;
                        } catch (e) {
                            // Backup parse failed, continue without backup
                        }
                    }
                    sessionStorage.removeItem(cacheKey);
                    // Reset state to ensure clean reload
                    setTripData(null);
                    setError(null);
                }
                
                // Skip cache if force refresh
                if (!forceRefresh) {
                    const storedData = sessionStorage.getItem(`trip_${tripId}`);
                    if (storedData) {
                        const data = JSON.parse(storedData) as TripData;
                        setTripData(data);
                        setLoading(false);
                        return;
                    }
                }

                // If not in sessionStorage, try to decode tripId and fetch from API
                let extractedVehicleJourneyId: string | null = null;
                try {
                    // Decode the trip ID
                    const decoded = decodeTripId(tripId);
                    
                    // Check if it contains vehicle_journey ID pattern
                    // TripId format can be:
                    // 1. vehicle_journey:SNCF:2025-12-18:88769 (just the ID, no datetime)
                    // 2. vehicle_journey:SNCF:2025-12-18:88769_20251218T123000 (ID with datetime suffix)
                    // We need to split on the LAST underscore to separate ID from datetime if present
                    
                    if (decoded.includes('vehicle_journey:')) {
                        // Check if there's an underscore after the vehicle_journey: prefix
                        // This would indicate a datetime suffix
                        const vehicleJourneyPrefix = 'vehicle_journey:';
                        const afterPrefix = decoded.substring(decoded.indexOf(vehicleJourneyPrefix) + vehicleJourneyPrefix.length);
                        
                        // Check if there's an underscore in the part after the prefix (likely datetime)
                        // Format: vehicle_journey:SNCF:2025-12-18:88769_20251218T123000
                        const lastUnderscoreIndex = decoded.lastIndexOf('_');
                        const prefixIndex = decoded.indexOf(vehicleJourneyPrefix);
                        
                        if (lastUnderscoreIndex > prefixIndex + vehicleJourneyPrefix.length) {
                            // There's an underscore after the prefix, likely a datetime suffix
                            // Split on last underscore to get just the vehicle journey ID
                            extractedVehicleJourneyId = decoded.substring(0, lastUnderscoreIndex);
                        } else {
                            // No underscore after prefix, use decoded as-is
                            extractedVehicleJourneyId = decoded;
                        }
                    } else if (decoded.includes('_')) {
                        // Format: vehicleJourneyId_departureDateTime (but ID might not start with vehicle_journey:)
                        // Split on last underscore
                        const lastUnderscoreIndex = decoded.lastIndexOf('_');
                        if (lastUnderscoreIndex > 0) {
                            extractedVehicleJourneyId = decoded.substring(0, lastUnderscoreIndex);
                        } else {
                            extractedVehicleJourneyId = decoded;
                        }
                    } else {
                        // No vehicle_journey: prefix and no underscore - use decoded as-is
                        extractedVehicleJourneyId = decoded;
                    }
                    
                    // Fallback: if tripId itself contains vehicle_journey (shouldn't happen, but handle it)
                    if (!extractedVehicleJourneyId && tripId.includes('vehicle_journey:')) {
                        extractedVehicleJourneyId = tripId;
                    }

                    // Store for error message
                    if (extractedVehicleJourneyId) {
                        setVehicleJourneyId(extractedVehicleJourneyId);
                    }

                    // Extract datetime from decoded tripId if present (format: vehicleJourneyId_datetime)
                    let extractedDateTime: string | null = null;
                    if (decoded.includes('_')) {
                        const lastUnderscoreIndex = decoded.lastIndexOf('_');
                        if (lastUnderscoreIndex > 0) {
                            const potentialDateTime = decoded.substring(lastUnderscoreIndex + 1);
                            // Check if it looks like a datetime (YYYYMMDDTHHmmss format)
                            if (/^\d{8}T\d{6}$/.test(potentialDateTime)) {
                                extractedDateTime = potentialDateTime;
                            }
                        }
                    }

                    // If we found a vehicle journey ID, try to fetch it
                    if (extractedVehicleJourneyId) {
                        // Decode the ID if it's URL-encoded (the API client will encode it again)
                        // Remove any URL encoding that might have been applied
                        let cleanVehicleJourneyId = extractedVehicleJourneyId;
                        try {
                            // If it contains % encoding, decode it first
                            if (cleanVehicleJourneyId.includes('%')) {
                                cleanVehicleJourneyId = decodeURIComponent(cleanVehicleJourneyId);
                            }
                        } catch (e) {
                            // If decoding fails, use as-is
                        }
                        
                        let vehicleJourneyData;
                        try {
                            const data = await getVehicleJourney(cleanVehicleJourneyId, 'sncf');
                            vehicleJourneyData = data.data;
                        } catch (apiError: any) {
                            console.error('[Trip] API error:', {
                                message: apiError?.message,
                                status: apiError?.response?.status,
                                statusText: apiError?.response?.statusText,
                                data: apiError?.response?.data
                            });
                            
                            // If 404, try to restore from cache backup (for forceRefresh) or current cache (for initial load)
                            // This handles the case where the API doesn't have the vehicle journey but we have cached data
                            if (apiError?.response?.status === 404) {
                                let dataToRestore: TripData | null = null;
                                
                                if (forceRefresh && cachedDataBackup) {
                                    // Restore from backup we saved before clearing cache
                                    dataToRestore = cachedDataBackup;
                                } else if (!forceRefresh) {
                                    // Try to get from current cache
                                    const cachedData = sessionStorage.getItem(`trip_${tripId}`);
                                    if (cachedData) {
                                        try {
                                            dataToRestore = JSON.parse(cachedData) as TripData;
                                        } catch (e) {
                                            // Cache parse failed, continue to error
                                        }
                                    }
                                }
                                
                                if (dataToRestore) {
                                    // Restore cache and data
                                    sessionStorage.setItem(`trip_${tripId}`, JSON.stringify(dataToRestore));
                                    setTripData(dataToRestore);
                                    setLoading(false);
                                    return;
                                }
                            }
                            
                            // If 404, the vehicle journey might not exist or ID is wrong
                            // Continue to show error message below
                            throw apiError;
                        }
                        
                        if (vehicleJourneyData.vehicle_journeys && vehicleJourneyData.vehicle_journeys.length > 0) {
                            const vehicleJourney = vehicleJourneyData.vehicle_journeys[0] as VehicleJourney & {
                                display_informations?: any;
                                stop_times?: Array<{
                                    base_arrival_date_time?: string;
                                    arrival_date_time?: string;
                                    base_departure_date_time?: string;
                                    departure_date_time?: string;
                                    utc_arrival_time?: string;
                                    utc_departure_time?: string;
                                    stop_point?: any;
                                }>;
                            };
                            
                            // Try to reconstruct journey data from vehicle journey
                            // This is a fallback - we'll create minimal journey structure
                            const stopTimes = vehicleJourney.stop_times || [];
                            
                            if (stopTimes.length > 0) {
                                const firstStop = stopTimes[0];
                                const lastStop = stopTimes[stopTimes.length - 1];
                                
                                // Use extended fields if available, otherwise fall back to utc_* fields
                                const firstDeparture = firstStop.departure_date_time || firstStop.base_departure_date_time || firstStop.utc_departure_time || '';
                                const lastArrival = lastStop.arrival_date_time || lastStop.base_arrival_date_time || lastStop.utc_arrival_time || '';
                                
                                // Try to use geojson from vehicle journey first, otherwise build from stops
                                let geojson = (vehicleJourney as any).geojson;
                                
                                // If no geojson in vehicle journey, generate from stop coordinates
                                if (!geojson) {
                                    const stopCoordinates: [number, number][] = [];
                                    const coordExtractionDetails: any[] = [];
                                    stopTimes.forEach((st: any, index: number) => {
                                        const stopPoint = st.stop_point;
                                        const coord = stopPoint?.coord || stopPoint?.stop_area?.coord;
                                        const hasCoord = !!(coord && typeof coord.lat === 'number' && typeof coord.lon === 'number' && 
                                            Number.isFinite(coord.lat) && Number.isFinite(coord.lon));
                                        coordExtractionDetails.push({
                                            index,
                                            hasStopPoint: !!stopPoint,
                                            hasCoord: !!coord,
                                            coordValue: coord,
                                            extracted: hasCoord
                                        });
                                        if (hasCoord) {
                                            stopCoordinates.push([coord.lon, coord.lat]); // GeoJSON format: [lon, lat]
                                        }
                                    });
                                    
                                    // Remove duplicate consecutive coordinates
                                    const uniqueCoords = stopCoordinates.filter((coord, idx, arr) => 
                                        idx === 0 || coord[0] !== arr[idx - 1][0] || coord[1] !== arr[idx - 1][1]
                                    );
                                    
                                    geojson = uniqueCoords.length >= 2 ? {
                                        type: 'Feature' as const,
                                        geometry: {
                                            type: 'LineString' as const,
                                            coordinates: uniqueCoords
                                        },
                                        properties: {}
                                    } : undefined;
                                }
                                
                                // Create a minimal section from vehicle journey
                                const section: Section = {
                                    type: 'public_transport',
                                    from: {
                                        stop_point: firstStop.stop_point,
                                        stop_area: firstStop.stop_point?.stop_area,
                                        coord: firstStop.stop_point?.coord
                                    },
                                    to: {
                                        stop_point: lastStop.stop_point,
                                        stop_area: lastStop.stop_point?.stop_area,
                                        coord: lastStop.stop_point?.coord
                                    },
                                    display_informations: {
                                        commercial_mode: (vehicleJourney.journey_pattern as any)?.route?.line?.commercial_mode?.name || 
                                                         (vehicleJourney.journey_pattern as any)?.commercial_mode || 'Train',
                                        network: (vehicleJourney.journey_pattern as any)?.route?.line?.network?.name || 'SNCF',
                                        headsign: vehicleJourney.headsign || '',
                                        trip_short_name: vehicleJourney.name || ''
                                    },
                                    vehicle_journey: vehicleJourney.id || extractedVehicleJourneyId,
                                    geojson: geojson,
                                    stop_date_times: stopTimes.map((st: any, idx: number) => {
                                        // Use primary field if it exists and is non-empty, otherwise fall back to utc_* field
                                        // Only use fallback if primary is missing/empty
                                        const baseArrival = (st.base_arrival_date_time && st.base_arrival_date_time.trim()) || (st.utc_arrival_time && st.utc_arrival_time.trim()) || undefined;
                                        const arrival = (st.arrival_date_time && st.arrival_date_time.trim()) || (st.utc_arrival_time && st.utc_arrival_time.trim()) || undefined;
                                        const baseDeparture = (st.base_departure_date_time && st.base_departure_date_time.trim()) || (st.utc_departure_time && st.utc_departure_time.trim()) || undefined;
                                        const departure = (st.departure_date_time && st.departure_date_time.trim()) || (st.utc_departure_time && st.utc_departure_time.trim()) || undefined;
                                        
                                        return {
                                            base_arrival_date_time: baseArrival,
                                            arrival_date_time: arrival,
                                            base_departure_date_time: baseDeparture,
                                            departure_date_time: departure,
                                        stop_point: st.stop_point,
                                        stop_area: st.stop_point?.stop_area
                                        };
                                    }),
                                    base_departure_date_time: firstStop.base_departure_date_time || firstStop.utc_departure_time,
                                    departure_date_time: firstStop.departure_date_time || firstStop.utc_departure_time,
                                    base_arrival_date_time: lastStop.base_arrival_date_time || lastStop.utc_arrival_time,
                                    arrival_date_time: lastStop.arrival_date_time || lastStop.utc_arrival_time
                                };
                                
                                // Calculate duration properly using parseUTCDate
                                let durationSeconds = 0;
                                if (stopTimes.length > 0 && firstDeparture && lastArrival && firstDeparture.trim() && lastArrival.trim()) {
                                    try {
                                        const depDate = parseUTCDate(firstDeparture);
                                        const arrDate = parseUTCDate(lastArrival);
                                        if (!isNaN(depDate.getTime()) && !isNaN(arrDate.getTime())) {
                                            durationSeconds = Math.floor((arrDate.getTime() - depDate.getTime()) / 1000);
                                        }
                                    } catch (e) {
                                        durationSeconds = 0;
                                    }
                                }
                                
                                const journey: JourneyItem = {
                                    departure_date_time: firstDeparture,
                                    arrival_date_time: lastArrival,
                                    sections: [section],
                                    durations: {
                                        total: durationSeconds
                                    }
                                };
                                
                                const info = getJourneyInfo(journey, 
                                    cleanLocationName(firstStop.stop_point?.name || firstStop.stop_point?.stop_area?.name),
                                    cleanLocationName(lastStop.stop_point?.name || lastStop.stop_point?.stop_area?.name)
                                );
                                
                                const tripData: TripData = {
                                    journey,
                                    info,
                                    disruptions: vehicleJourney.disruptions || []
                                };
                                
                                // Save to sessionStorage (even on refresh, for next time)
                                sessionStorage.setItem(`trip_${tripId}`, JSON.stringify(tripData));
                                setTripData(tripData);
                                setLoading(false);
                                return;
                            }
                        }
                    }
                } catch (apiErr) {
                    // Error handling
                }

                // If we couldn't load from API either, show error with helpful links
                setError('Données du trajet non trouvées. Veuillez revenir à la recherche.');
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
                setError('Erreur lors du chargement des données du trajet: ' + errorMessage);
            } finally {
                loadingRef.current = false;
                setLoading(false);
            }
    }, [tripId]);

    useEffect(() => {
        // Only load on mount or when tripId changes, not when loadTripData changes
        loadTripData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tripId]); // Only depend on tripId, not loadTripData to avoid re-runs

    // Compute derived data - must be called before any early returns to maintain hook order
    const sections = tripData?.journey?.sections || [];
    const publicTransportSections = sections.filter((s: Section) => s.type === 'public_transport');
    
    // Get all stops from all sections
    const allStops = useMemo<ExtendedStopTime[]>(() => {
        const stops: ExtendedStopTime[] = [];
        publicTransportSections.forEach((section: Section) => {
            if (section.stop_date_times && Array.isArray(section.stop_date_times)) {
                section.stop_date_times.forEach((stopTime, index) => {
                    const isFirst = index === 0;
                    const isLast = index === section.stop_date_times!.length - 1;
                    const stop = {
                        ...(stopTime as ExtendedStopTime),
                        section,
                        isFirst,
                        isLast,
                        commercialMode: section.display_informations?.commercial_mode,
                        network: section.display_informations?.network,
                        trainNumber: section.display_informations?.headsign || section.display_informations?.trip_short_name
                    };
                    stops.push(stop);
                });
            }
        });
        return stops;
    }, [publicTransportSections]);

    // Get sections with geojson for map display
    const sectionsWithGeoJSON = useMemo<Section[]>(() => {
        return sections.filter((section: Section) => section.geojson);
    }, [sections]);

    const TripHeader = (
        <PageHeader
            title="Détails du trajet"
            subtitle="Horaires, arrêts et perturbations détaillés"
            showNotification={false}
            
        />
    );

    // Get markers for all waypoints (stops) from stop_date_times
    const journeyMarkers = useMemo<JourneyMarker[]>(() => {
        if (!allStops || allStops.length === 0) {
            console.log('[Trip] No stops available for markers');
            return [];
        }
        
        console.log('[Trip] Computing journey markers from', allStops.length, 'stops');
        const markers: JourneyMarker[] = [];
        
        // Convert all stops from stop_date_times to markers
        allStops.forEach((stop, index) => {
            const stopPoint = stop.stop_point as { coord?: { lat?: number; lon?: number }; name?: string | null; stop_area?: { coord?: { lat?: number; lon?: number }; name?: string | null } } | undefined;
            const stopArea = stopPoint?.stop_area as { coord?: { lat?: number; lon?: number }; name?: string | null } | undefined;
            const coord = stopPoint?.coord || stopArea?.coord;
            
            if (coord && typeof coord.lat === 'number' && typeof coord.lon === 'number' && 
                Number.isFinite(coord.lat) && Number.isFinite(coord.lon)) {
                const stopName = cleanLocationName(
                    stopPoint?.name || stopArea?.name || `Arrêt ${index + 1}`
                );
                const isFirst = stop.isFirst;
                const isLast = stop.isLast;
                
                markers.push({
                    lat: coord.lat,
                    lon: coord.lon,
                    name: stopName,
                    popup: (
                        <div>
                            <strong>{stopName}</strong>
                            {isFirst && <div>Départ</div>}
                            {isLast && <div>Arrivée</div>}
                            {!isFirst && !isLast && <div>Arrêt intermédiaire</div>}
                        </div>
                    )
                });
            }
        });
        
        console.log('[Trip] Journey markers computed:', {
            totalStops: allStops.length,
            markersCreated: markers.length,
            markersWithCoords: markers.filter(m => m.lat && m.lon).length
        });
        return markers;
    }, [allStops]);

    if (loading) {
        return (
            <>
                {TripHeader}
                <PageLayout>
                    <Paper sx={{ p: 4, textAlign: 'center' }}>
                        <Loader2 size={48} className="animate-spin" />
                        <Typography sx={{ mt: 2 }}>Chargement des détails du trajet...</Typography>
                    </Paper>
                </PageLayout>
                <Footer />
            </>
        );
    }

    if (error || !tripData) {
        // Show samples if no tripId
        if (!tripId) {
            const sampleTripIds = [
                {
                    id: 'vehicle_journey:SNCF:2025-12-20:88507:1187:Train_20251220T113300',
                    label: 'Train 88507 - 20/12/2025 11:33'
                }
            ];
            
            return (
                <>
                    {TripHeader}
                    <PageLayout>
                        <Paper sx={{ p: 4, textAlign: 'center', mb: 2 }}>
                            <Route size={48} color="var(--primary)" />
                            <Typography sx={{ mt: 2 }}>Sélectionnez un exemple de trajet ci-dessous</Typography>
                        </Paper>
                        <Typography variant="h6" sx={{ mb: 2 }}>Exemples</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                            {sampleTripIds.map((sample) => (
                                <Link key={sample.id} to={`/trip/${encodeTripId(sample.id)}`} style={{ textDecoration: 'none', flex: '1 1 200px', maxWidth: 400 }}>
                                    <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, '&:hover': { bgcolor: 'action.hover' } }}>
                                        <Route size={32} color="var(--primary)" />
                                        <Box>
                                            <Typography variant="h6">{sample.label}</Typography>
                                            <Typography variant="body2" color="text.secondary">Cliquez pour voir les détails</Typography>
                                        </Box>
                                    </Paper>
                                </Link>
                            ))}
                        </Box>
                    </PageLayout>
                    <Footer />
                </>
            );
        }
        
        return (
            <>
                {TripHeader}
                <PageLayout>
                    <Paper sx={{ p: 4, textAlign: 'center' }}>
                        <AlertTriangle size={48} color="var(--primary)" />
                        <Typography color="error" sx={{ mt: 2 }}>{error || 'Trajet non trouvé'}</Typography>
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 2 }}>
                            <Button variant="contained" onClick={() => navigate(-1)}>Retour</Button>
                            {vehicleJourneyId && (
                                <Button component={Link} to={`/train/${encodeVehicleJourneyId(vehicleJourneyId)}`} startIcon={<TrainIcon size={20} />}>
                                    Voir les détails du train
                                </Button>
                            )}
                        </Box>
                    </Paper>
                </PageLayout>
                <Footer />
            </>
        );
    }

    const { journey, info, disruptions } = tripData;
    const transportInfo = getTransportIcon(info.commercialMode, info.network);
    
    // Parse dates safely
    let depDate: Date | null = null;
    let arrDate: Date | null = null;
    try {
        if (info.departureTime && info.departureTime.trim()) {
            depDate = parseUTCDate(info.departureTime);
            if (isNaN(depDate.getTime())) {
                depDate = null;
            }
        }
    } catch (e) {
        depDate = null;
    }
    try {
        if (info.arrivalTime && info.arrivalTime.trim()) {
            arrDate = parseUTCDate(info.arrivalTime);
            if (isNaN(arrDate.getTime())) {
                arrDate = null;
            }
        }
    } catch (e) {
        arrDate = null;
    }
    
    // Format duration in human-readable format (days, hours and minutes)
    const formatDuration = (durationSeconds: number): string => {
        if (!durationSeconds || durationSeconds <= 0) return '-';
        const days = Math.floor(durationSeconds / 86400); // 86400 seconds = 24 hours
        const hours = Math.floor((durationSeconds % 86400) / 3600);
        const minutes = Math.floor((durationSeconds % 3600) / 60);
        
        const parts: string[] = [];
        if (days > 0) {
            parts.push(`${days}j`);
        }
        if (hours > 0) {
            parts.push(`${hours}h`);
        }
        if (minutes > 0) {
            parts.push(`${minutes}min`);
        }
        
        if (parts.length > 0) {
            return parts.join(' ');
        } else {
            return '< 1min';
        }
    };

    const TransportIcon = transportInfo.icon;
    const chipColor = transportInfo.tagColor === 'is-danger' ? 'error' : transportInfo.tagColor === 'is-warning' ? 'warning' : transportInfo.tagColor === 'is-info' ? 'info' : transportInfo.tagColor === 'is-success' ? 'success' : transportInfo.tagColor === 'is-primary' ? 'primary' : 'default';

    return (
        <>
            {TripHeader}
            <PageLayout>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                    <Button
                        variant="outlined"
                        onClick={() => loadTripData(true)}
                        disabled={loading}
                        startIcon={loading ? <Loader2 size={20} className="animate-spin" /> : <RefreshCw size={20} />}
                    >
                        Actualiser
                    </Button>
                </Box>

                <Paper sx={{ p: 2, mb: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>Informations du train</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <TransportIcon size={32} />
                            <Box>
                                <Typography variant="h6">{info.trainNumber}</Typography>
                                <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                                    <Chip label={transportInfo.label} color={chipColor} size="small" />
                                    {info.network && info.network !== info.commercialMode && (
                                        <Chip label={info.network} variant="outlined" size="small" />
                                    )}
                                </Box>
                                {info.vehicleJourneyId && (() => {
                                    let trainId = info.vehicleJourneyId;
                                    if (typeof trainId === 'object' && trainId !== null) {
                                        trainId = (trainId as { id?: string; href?: string }).id || (trainId as { id?: string; href?: string }).href || null;
                                    }
                                    return trainId ? (
                                        <Button component={Link} to={`/train/${encodeVehicleJourneyId(trainId)}`} size="small" startIcon={<TrainIcon size={20} />} sx={{ mt: 1 }}>
                                            Voir les détails du train
                                        </Button>
                                    ) : null;
                                })()}
                            </Box>
                        </Box>
                        <Box>
                            <Typography><strong>Gare de départ:</strong> {info.departureStation}</Typography>
                            <Typography><strong>Gare d'arrivée:</strong> {info.arrivalStation}</Typography>
                            <Typography><strong>Date:</strong> {depDate ? formatDate(depDate) : '-'}</Typography>
                            <Typography><strong>Durée totale:</strong> {formatDuration(info.duration)}</Typography>
                            {info.wagonCount && <Typography><strong>Nombre de wagons:</strong> {info.wagonCount}</Typography>}
                        </Box>
                    </Box>
                </Paper>

                {(sectionsWithGeoJSON.length > 0 || journeyMarkers.length > 0) && (
                    <Paper sx={{ p: 2, mb: 2 }}>
                        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Map size={20} />
                            Carte de l'itinéraire
                        </Typography>
                        <GeoJSONMap
                            geojsonData={sectionsWithGeoJSON.length > 0 ? sectionsWithGeoJSON : undefined}
                            markers={journeyMarkers || []}
                            height={400}
                        />
                    </Paper>
                )}

                {disruptions && disruptions.length > 0 && (
                    <Paper sx={{ p: 2, mb: 2 }}>
                        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AlertTriangle size={20} />
                            Perturbations ({disruptions.length})
                        </Typography>
                        {disruptions.map((disruption, index) => {
                            let severityText = 'unknown';
                            if (typeof disruption.severity === 'string') {
                                severityText = disruption.severity;
                            } else if (disruption.severity && typeof disruption.severity === 'object') {
                                severityText = (disruption.severity as { name?: string; label?: string }).name ||
                                    (disruption.severity as { name?: string; label?: string }).label || 'Perturbation';
                            }
                            const severityLevel = severityText.toLowerCase();
                            let alertSeverity: 'error' | 'warning' | 'info' = 'warning';
                            let IconComponent = AlertTriangle;
                            if (severityLevel.includes('blocking') || severityLevel.includes('blocked') || severityLevel.includes('suspended')) {
                                alertSeverity = 'error';
                                IconComponent = Ban;
                            } else if (severityLevel.includes('information') || severityLevel.includes('info')) {
                                alertSeverity = 'info';
                                IconComponent = Info;
                            } else if (severityLevel.includes('delay') || severityLevel.includes('retard')) {
                                IconComponent = Clock;
                            }
                            return (
                                <Alert key={index} severity={alertSeverity} icon={<IconComponent size={20} />} sx={{ mb: 2 }}>
                                    <Typography fontWeight={600}>{severityText !== 'unknown' ? severityText : 'Perturbation'}</Typography>
                                    {disruption.messages && Array.isArray(disruption.messages) && disruption.messages.length > 0 && (
                                        <Box sx={{ mt: 1 }}>
                                            {disruption.messages.map((msg, msgIndex) => (
                                                <Typography key={msgIndex} sx={{ mb: 1 }}>
                                                    {msg.text || (msg as { message?: string }).message || JSON.stringify(msg)}
                                                </Typography>
                                            ))}
                                        </Box>
                                    )}
                                    {(!disruption.messages || disruption.messages.length === 0) && disruption.message && (
                                        <Typography sx={{ mt: 1 }}>{disruption.message}</Typography>
                                    )}
                                    {disruption.application_periods && disruption.application_periods.length > 0 && (
                                        <Box sx={{ mt: 1 }}>
                                            <Typography fontWeight={600}>Période d'application:</Typography>
                                            <Box component="ul" sx={{ m: 0, pl: 2 }}>
                                                {disruption.application_periods.map((period, periodIndex) => (
                                                    <li key={periodIndex}>
                                                        Du {period.begin ? new Date(period.begin).toLocaleString('fr-FR') : '-'}
                                                        {' '}au {period.end ? new Date(period.end).toLocaleString('fr-FR') : '-'}
                                                    </li>
                                                ))}
                                            </Box>
                                        </Box>
                                    )}
                                </Alert>
                            );
                        })}
                    </Paper>
                )}

                <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>Arrêts et horaires</Typography>
                    {allStops.length === 0 ? (
                        <Typography color="text.secondary">Aucun arrêt disponible pour ce trajet.</Typography>
                    ) : (
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell><strong>Gare</strong></TableCell>
                                        <TableCell><strong>Voie/Quai</strong></TableCell>
                                        <TableCell><strong>Horaire</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {allStops.map((stop, index) => {
                                        const stopName = cleanLocationName(
                                            stop.stop_point?.name || 
                                            stop.stop_area?.name || 
                                            'Gare inconnue'
                                        );
                                        const platform = stop.stop_point?.label || '-';
                                        const baseArrival = stop.base_arrival_date_time;
                                        const realArrival = stop.arrival_date_time;
                                        const baseDeparture = stop.base_departure_date_time;
                                        const realDeparture = stop.departure_date_time;
                                        
                                        // Use arrival for intermediate stops, departure for last stop
                                        // Filter out empty strings - only use truthy non-empty values
                                        const baseTime = stop.isLast ? (baseDeparture || undefined) : (baseArrival || undefined);
                                        const realTime = stop.isLast ? (realDeparture || undefined) : (realArrival || undefined);
                                        const delay = getDelay(baseTime, realTime);
                                        const hasDelay = delay && delay !== 'À l\'heure';
                                        
                                        // Parse dates safely - only parse if we have a non-empty string
                                        let parsedBaseTime: Date | null = null;
                                        let parsedRealTime: Date | null = null;
                                        
                                        if (baseTime && baseTime.trim()) {
                                            try {
                                                parsedBaseTime = parseUTCDate(baseTime);
                                                // Validate the parsed date
                                                if (isNaN(parsedBaseTime.getTime())) {
                                                    parsedBaseTime = null;
                                                }
                                            } catch (e: any) {
                                                parsedBaseTime = null;
                                            }
                                        }
                                        
                                        if (realTime && realTime.trim()) {
                                            try {
                                                parsedRealTime = parseUTCDate(realTime);
                                                // Validate the parsed date
                                                if (isNaN(parsedRealTime.getTime())) {
                                                    parsedRealTime = null;
                                                }
                                            } catch (e: any) {
                                                parsedRealTime = null;
                                            }
                                        }
                                        
                                        return (
                                            <TableRow key={index}>
                                                <TableCell>
                                                    <strong>{stopName}</strong>
                                                    {stop.isFirst && <Chip label="Départ" color="success" size="small" sx={{ ml: 1 }} />}
                                                    {stop.isLast && <Chip label="Arrivée" color="error" size="small" sx={{ ml: 1 }} />}
                                                </TableCell>
                                                <TableCell>{platform}</TableCell>
                                                <TableCell>
                                                    {parsedBaseTime ? (
                                                        <Box>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                <Typography fontWeight={600}>{formatTime(parsedBaseTime)}</Typography>
                                                                {hasDelay && parsedRealTime && (
                                                                    <>
                                                                        <Typography component="span" color="text.secondary">→</Typography>
                                                                        <Typography component="span" fontWeight={600} color="error.main">{formatTime(parsedRealTime)}</Typography>
                                                                    </>
                                                                )}
                                                            </Box>
                                                            {delay && (
                                                                <Box sx={{ mt: 0.5 }}>
                                                                    {hasDelay ? (
                                                                        <Chip icon={<Clock size={16} />} label={delay} color="error" size="small" />
                                                                    ) : (
                                                                        <Chip label={delay} color="success" size="small" />
                                                                    )}
                                                                </Box>
                                                            )}
                                                        </Box>
                                                    ) : (
                                                        <Typography color="text.secondary">-</Typography>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Paper>
            </PageLayout>
            <Footer />
        </>
    );
};

export default Trip;


