import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import GeoJSONMap from '../components/GeoJSONMap';
import { parseUTCDate, formatTime, formatDate } from '../components/Utils';
import { cleanLocationName } from '../services/locationService';
import { getTransportIcon } from '../services/transportService';
import { getDelay } from '../services/delayService';
import { getVehicleJourney } from '../services/vehicleJourneyService';
import { getJourneyInfo } from '../services/journeyService';
import { decodeTripId, decodeVehicleJourneyId, encodeVehicleJourneyId } from '../utils/uriUtils';
import type { JourneyItem } from '../client/models/journey-item';
import type { JourneyInfo } from '../services/journeyService';
import type { Disruption } from '../client/models/disruption';
import type { Section } from '../client/models/section';
import type { Coord } from '../client/models/coord';
import type { VehicleJourney } from '../client/models/vehicle-journey';

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
            console.log('[Trip] loadTripData called', { tripId, forceRefresh });
            
            // Prevent concurrent loads
            if (loadingRef.current && !forceRefresh) {
                console.log('[Trip] Already loading, skipping');
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
                    return;
                }
                
                console.log('[Trip] Processing tripId:', tripId);
                
                // Clear sessionStorage cache and reset state if force refresh (like page reload)
                if (forceRefresh) {
                    const cacheKey = `trip_${tripId}`;
                    const hadCachedData = !!sessionStorage.getItem(cacheKey);
                    console.log('[Trip] Force refresh, clearing cache', { cacheKey, hadCachedData });
                    sessionStorage.removeItem(cacheKey);
                    // Reset state to ensure clean reload
                    setTripData(null);
                    setError(null);
                }
                
                // Skip cache if force refresh
                if (!forceRefresh) {
                    const storedData = sessionStorage.getItem(`trip_${tripId}`);
                    if (storedData) {
                        console.log('[Trip] Found cached data in sessionStorage');
                        const data = JSON.parse(storedData) as TripData;
                        setTripData(data);
                        setLoading(false);
                        return;
                    } else {
                        console.log('[Trip] No cached data found');
                    }
                }

                // If not in sessionStorage, try to decode tripId and fetch from API
                let extractedVehicleJourneyId: string | null = null;
                try {
                    // Decode the trip ID
                    const decoded = decodeTripId(tripId);
                    console.log('[Trip] Decoded tripId:', decoded);
                    
                    // Check if it contains vehicle_journey ID pattern
                    // TripId format can be:
                    // 1. vehicle_journey:SNCF:2025-12-18:88769 (just the ID, no datetime)
                    // 2. vehicle_journey:SNCF:2025-12-18:88769_20251218T123000 (ID with datetime suffix)
                    // We need to split on the LAST underscore to separate ID from datetime if present
                    
                    if (decoded.includes('vehicle_journey:')) {
                        console.log('[Trip] Found vehicle_journey: in decoded string');
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
                            console.log('[Trip] Extracted vehicle journey ID (removed datetime suffix):', extractedVehicleJourneyId);
                        } else {
                            // No underscore after prefix, use decoded as-is
                            extractedVehicleJourneyId = decoded;
                            console.log('[Trip] Using decoded as vehicle journey ID (no datetime suffix):', extractedVehicleJourneyId);
                        }
                    } else if (decoded.includes('_')) {
                        console.log('[Trip] Found underscore in decoded string (no vehicle_journey: prefix), splitting');
                        // Format: vehicleJourneyId_departureDateTime (but ID might not start with vehicle_journey:)
                        // Split on last underscore
                        const lastUnderscoreIndex = decoded.lastIndexOf('_');
                        if (lastUnderscoreIndex > 0) {
                            extractedVehicleJourneyId = decoded.substring(0, lastUnderscoreIndex);
                            console.log('[Trip] Extracted vehicle journey ID from underscore split:', extractedVehicleJourneyId);
                        } else {
                            extractedVehicleJourneyId = decoded;
                            console.log('[Trip] Using full decoded as vehicle journey ID (underscore split):', extractedVehicleJourneyId);
                        }
                    } else {
                        // No vehicle_journey: prefix and no underscore - use decoded as-is
                        extractedVehicleJourneyId = decoded;
                        console.log('[Trip] Using decoded as-is (no vehicle_journey: or underscore):', extractedVehicleJourneyId);
                    }
                    
                    // Fallback: if tripId itself contains vehicle_journey (shouldn't happen, but handle it)
                    if (!extractedVehicleJourneyId && tripId.includes('vehicle_journey:')) {
                        console.log('[Trip] Fallback: tripId itself contains vehicle_journey:, using tripId');
                        extractedVehicleJourneyId = tripId;
                    }

                    // Store for error message
                    if (extractedVehicleJourneyId) {
                        setVehicleJourneyId(extractedVehicleJourneyId);
                        console.log('[Trip] Set vehicleJourneyId state:', extractedVehicleJourneyId);
                    } else {
                        console.warn('[Trip] Could not extract vehicle journey ID');
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
                                console.log('[Trip] Decoded URL encoding:', cleanVehicleJourneyId);
                            }
                        } catch (e) {
                            console.warn('[Trip] Failed to decode URL encoding, using as-is:', e);
                            // If decoding fails, use as-is
                        }
                        
                        console.log('[Trip] Calling getVehicleJourney API with:', cleanVehicleJourneyId);
                        let response;
                        try {
                            response = await getVehicleJourney(cleanVehicleJourneyId, 'sncf');
                            console.log('[Trip] API response received:', {
                                status: response.status,
                                hasData: !!response.data,
                                vehicleJourneysCount: response.data?.vehicle_journeys?.length || 0
                            });
                        } catch (apiError: any) {
                            console.error('[Trip] API error:', {
                                message: apiError?.message,
                                status: apiError?.response?.status,
                                statusText: apiError?.response?.statusText,
                                data: apiError?.response?.data
                            });
                            // If 404, the vehicle journey might not exist or ID is wrong
                            // Continue to show error message below
                            throw apiError;
                        }
                        const vehicleJourneyData = response.data;
                        
                        if (vehicleJourneyData.vehicle_journeys && vehicleJourneyData.vehicle_journeys.length > 0) {
                            console.log('[Trip] Found vehicle journey in response');
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
                            
                            console.log('[Trip] Vehicle journey details:', {
                                id: vehicleJourney.id,
                                name: vehicleJourney.name,
                                headsign: vehicleJourney.headsign,
                                stopTimesCount: vehicleJourney.stop_times?.length || 0,
                                hasDisplayInfo: !!vehicleJourney.display_informations,
                                hasGeoJSON: !!(vehicleJourney as any).geojson
                            });
                            
                            // Try to reconstruct journey data from vehicle journey
                            // This is a fallback - we'll create minimal journey structure
                            const stopTimes = vehicleJourney.stop_times || [];
                            console.log('[Trip] Stop times:', stopTimes.length);
                            
                            if (stopTimes.length > 0) {
                                const firstStop = stopTimes[0];
                                const lastStop = stopTimes[stopTimes.length - 1];
                                
                                console.log('[Trip] First stop:', {
                                    name: firstStop.stop_point?.name || firstStop.stop_point?.stop_area?.name,
                                    departure: firstStop.departure_date_time || firstStop.base_departure_date_time || firstStop.utc_departure_time
                                });
                                console.log('[Trip] Last stop:', {
                                    name: lastStop.stop_point?.name || lastStop.stop_point?.stop_area?.name,
                                    arrival: lastStop.arrival_date_time || lastStop.base_arrival_date_time || lastStop.utc_arrival_time
                                });
                                
                                // Use extended fields if available, otherwise fall back to utc_* fields
                                const firstDeparture = firstStop.departure_date_time || firstStop.base_departure_date_time || firstStop.utc_departure_time || '';
                                const lastArrival = lastStop.arrival_date_time || lastStop.base_arrival_date_time || lastStop.utc_arrival_time || '';
                                
                                console.log('[Trip] Journey times:', { firstDeparture, lastArrival });
                                
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
                                    display_informations: vehicleJourney.display_informations || {
                                        commercial_mode: vehicleJourney.journey_pattern?.commercial_mode || 'Train',
                                        network: vehicleJourney.journey_pattern?.route?.line?.network?.name || 'SNCF',
                                        headsign: vehicleJourney.headsign || '',
                                        trip_short_name: vehicleJourney.name || ''
                                    },
                                    vehicle_journey: vehicleJourney.id || extractedVehicleJourneyId,
                                    geojson: geojson,
                                    stop_date_times: stopTimes.map((st: any) => ({
                                        base_arrival_date_time: st.base_arrival_date_time || st.utc_arrival_time,
                                        arrival_date_time: st.arrival_date_time || st.utc_arrival_time,
                                        base_departure_date_time: st.base_departure_date_time || st.utc_departure_time,
                                        departure_date_time: st.departure_date_time || st.utc_departure_time,
                                        stop_point: st.stop_point,
                                        stop_area: st.stop_point?.stop_area
                                    })),
                                    base_departure_date_time: firstStop.base_departure_date_time || firstStop.utc_departure_time,
                                    departure_date_time: firstStop.departure_date_time || firstStop.utc_departure_time,
                                    base_arrival_date_time: lastStop.base_arrival_date_time || lastStop.utc_arrival_time,
                                    arrival_date_time: lastStop.arrival_date_time || lastStop.utc_arrival_time
                                };
                                
                                const journey: JourneyItem = {
                                    departure_date_time: firstDeparture,
                                    arrival_date_time: lastArrival,
                                    sections: [section],
                                    durations: {
                                        total: stopTimes.length > 0 && firstDeparture && lastArrival ? 
                                            (new Date(lastArrival).getTime() - new Date(firstDeparture).getTime()) / 1000 : 0
                                    }
                                };
                                
                                const info = getJourneyInfo(journey, 
                                    cleanLocationName(firstStop.stop_point?.name || firstStop.stop_point?.stop_area?.name),
                                    cleanLocationName(lastStop.stop_point?.name || lastStop.stop_point?.stop_area?.name)
                                );
                                
                                console.log('[Trip] Journey info:', info);
                                
                                const tripData: TripData = {
                                    journey,
                                    info,
                                    disruptions: vehicleJourney.disruptions || []
                                };
                                
                                console.log('[Trip] Trip data created successfully, saving to sessionStorage and setting state');
                                
                                // Save to sessionStorage (even on refresh, for next time)
                                sessionStorage.setItem(`trip_${tripId}`, JSON.stringify(tripData));
                                setTripData(tripData);
                                setLoading(false);
                                return;
                            } else {
                                console.warn('[Trip] Vehicle journey has no stop_times');
                            }
                        } else {
                            console.warn('[Trip] No vehicle journeys in response data');
                        }
                    } else {
                        console.warn('[Trip] No vehicle journey ID extracted, cannot fetch data');
                    }
                } catch (apiErr) {
                    console.error('[Trip] Error in try-catch block:', apiErr);
                }

                // If we couldn't load from API either, show error with helpful links
                console.error('[Trip] Failed to load trip data, showing error message');
                setError('Données du trajet non trouvées. Veuillez revenir à la recherche.');
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
                console.error('[Trip] Outer catch block error:', err);
                setError('Erreur lors du chargement des données du trajet: ' + errorMessage);
                console.error(err);
            } finally {
                loadingRef.current = false;
                setLoading(false);
                console.log('[Trip] loadTripData finished, loading set to false');
            }
    }, [tripId]);

    useEffect(() => {
        // Only load on mount or when tripId changes, not when loadTripData changes
        console.log('[Trip] useEffect triggered, calling loadTripData', { tripId });
        loadTripData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tripId]); // Only depend on tripId, not loadTripData to avoid re-runs

    // Compute derived data - must be called before any early returns to maintain hook order
    console.log('[Trip] Render - tripData state:', {
        hasTripData: !!tripData,
        hasJourney: !!tripData?.journey,
        hasSections: !!tripData?.journey?.sections,
        sectionsCount: tripData?.journey?.sections?.length || 0,
        hasInfo: !!tripData?.info,
        error,
        loading
    });
    
    const sections = tripData?.journey?.sections || [];
    const publicTransportSections = sections.filter((s: Section) => s.type === 'public_transport');
    
    console.log('[Trip] Derived data:', {
        sectionsCount: sections.length,
        publicTransportSectionsCount: publicTransportSections.length
    });
    
    // Get all stops from all sections
    const allStops: ExtendedStopTime[] = [];
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
                allStops.push(stop);
            });
        }
    });
    
    console.log('[Trip] All stops count:', allStops.length);

    // Get sections with geojson for map display
    const sectionsWithGeoJSON = useMemo<Section[]>(() => {
        const withGeoJSON = sections.filter((section: Section) => section.geojson);
        console.log('[Trip] Sections with GeoJSON:', withGeoJSON.length);
        return withGeoJSON;
    }, [sections]);

    // Get markers for all waypoints (stops) from stop_date_times
    const journeyMarkers = useMemo<JourneyMarker[]>(() => {
        console.log('[Trip] Computing journey markers from', allStops.length, 'stops');
        const markers: JourneyMarker[] = [];
        
        // Convert all stops from stop_date_times to markers
        allStops.forEach((stop, index) => {
            const stopPoint = stop.stop_point as { coord?: { lat?: number; lon?: number }; name?: string | null } | undefined;
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
        
        console.log('[Trip] Journey markers computed:', markers.length);
        return markers;
    }, [allStops]);

    console.log('[Trip] Render conditions:', { loading, error, hasTripData: !!tripData });

    if (loading) {
        console.log('[Trip] Rendering loading state');
        return (
            <>
                <section className='section'>
                    <div className='container'>
                        <div className='box has-text-centered'>
                            <span className='icon is-large'>
                                <i className='fas fa-spinner fa-spin fa-3x'></i>
                            </span>
                            <p className='mt-4'>Chargement des détails du trajet...</p>
                        </div>
                    </div>
                </section>
                <Footer />
            </>
        );
    }

    if (error || !tripData) {
        console.log('[Trip] Rendering error state', { error, hasTripData: !!tripData });
        return (
            <>
                <section className='section'>
                    <div className='container'>
                        <div className='box has-text-centered'>
                            <span className='icon is-large has-text-danger'>
                                <i className='fas fa-exclamation-triangle fa-3x'></i>
                            </span>
                            <p className='mt-4 has-text-danger'>{error || 'Trajet non trouvé'}</p>
                            <div className='buttons is-centered mt-4'>
                                <button onClick={() => navigate(-1)} className='button is-primary'>
                                    Retour
                                </button>
                                {vehicleJourneyId && (
                                    <Link 
                                        to={`/train/${encodeVehicleJourneyId(vehicleJourneyId)}`}
                                        className='button is-link'
                                    >
                                        <span className='icon'><i className='fas fa-train'></i></span>
                                        <span>Voir les détails du train</span>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
                <Footer />
            </>
        );
    }

    const { journey, info, disruptions } = tripData;
    console.log('[Trip] Rendering trip details:', {
        hasJourney: !!journey,
        hasInfo: !!info,
        info: info ? {
            departureStation: info.departureStation,
            arrivalStation: info.arrivalStation,
            trainNumber: info.trainNumber,
            commercialMode: info.commercialMode
        } : null,
        disruptionsCount: disruptions?.length || 0
    });
    
    const transportInfo = getTransportIcon(info.commercialMode, info.network);
    const depDate = parseUTCDate(info.departureTime);
    const arrDate = parseUTCDate(info.arrivalTime);

    console.log('[Trip] Rendering main trip view');
    return (
        <>
            <section className='section'>
                <div className='container'>
                    <div className='level mb-5'>
                        <div className='level-left'>
                            <div className='level-item'>
                                <h1 className='title is-2'>
                                    Détails du trajet
                                </h1>
                            </div>
                        </div>
                        <div className='level-right'>
                            <div className='level-item'>
                                <button 
                                    className='button is-light' 
                                    onClick={() => {
                                        loadTripData(true);
                                    }}
                                    disabled={loading}
                                >
                                    <span className='icon'>
                                        <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`}></i>
                                    </span>
                                    <span>Actualiser</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Train Information */}
                    <div className='box mb-5'>
                        <h2 className='title is-4 mb-4'>Informations du train</h2>
                        <div className='columns'>
                            <div className='column'>
                                <div className='is-flex is-align-items-center mb-3'>
                                    <span className={`icon ${transportInfo.color} mr-3`} style={{ fontSize: '2rem' }}>
                                        <i className={`fas ${transportInfo.icon}`}></i>
                                    </span>
                                    <div>
                                        <h3 className='title is-5 mb-1'>
                                            {info.trainNumber}
                                        </h3>
                                        <span className={`tag ${transportInfo.tagColor} is-medium`}>
                                            {transportInfo.label}
                                        </span>
                                        {info.network && info.network !== info.commercialMode && (
                                            <span className='tag is-dark ml-2'>{info.network}</span>
                                        )}
                                    </div>
                                </div>
                                {info.vehicleJourneyId && (() => {
                                    // Ensure we have a string ID, not an object
                                    let trainId = info.vehicleJourneyId;
                                    if (typeof trainId === 'object' && trainId !== null) {
                                        trainId = (trainId as { id?: string; href?: string }).id || (trainId as { id?: string; href?: string }).href || null;
                                    }
                                    return trainId ? (
                                        <Link 
                                            to={`/train/${encodeVehicleJourneyId(trainId)}`}
                                            className='button is-small is-link'
                                        >
                                            <span className='icon'><i className='fas fa-train'></i></span>
                                            <span>Voir les détails du train</span>
                                        </Link>
                                    ) : null;
                                })()}
                            </div>
                            <div className='column'>
                                <div className='content'>
                                    <p><strong>Gare de départ:</strong> {info.departureStation}</p>
                                    <p><strong>Gare d'arrivée:</strong> {info.arrivalStation}</p>
                                    <p><strong>Date:</strong> {formatDate(depDate)}</p>
                                    <p><strong>Durée totale:</strong> {Math.floor(info.duration / 60)} minutes</p>
                                    {info.wagonCount && (
                                        <p><strong>Nombre de wagons:</strong> {info.wagonCount}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Journey Map */}
                    {(sectionsWithGeoJSON.length > 0 || journeyMarkers.length > 0) && (
                        <div className='box mb-5'>
                            <h2 className='title is-4 mb-4'>
                                <span className='icon mr-2'>
                                    <i className='fas fa-map'></i>
                                </span>
                                Carte de l'itinéraire
                            </h2>
                            <GeoJSONMap 
                                geojsonData={sectionsWithGeoJSON.length > 0 ? sectionsWithGeoJSON : undefined}
                                markers={journeyMarkers}
                                height={400}
                            />
                        </div>
                    )}

                    {/* Disruptions */}
                    {disruptions && disruptions.length > 0 && (
                        <div className='box mb-5'>
                            <h2 className='title is-4 mb-4'>
                                <span className='icon has-text-warning mr-2'>
                                    <i className='fas fa-exclamation-triangle'></i>
                                </span>
                                Perturbations ({disruptions.length})
                            </h2>
                            {disruptions.map((disruption, index) => {
                                let severityText = 'unknown';
                                if (typeof disruption.severity === 'string') {
                                    severityText = disruption.severity;
                                } else if (disruption.severity && typeof disruption.severity === 'object') {
                                    severityText = (disruption.severity as { name?: string; label?: string }).name || 
                                                  (disruption.severity as { name?: string; label?: string }).label || 
                                                  'Perturbation';
                                }
                                
                                const severityLevel = severityText.toLowerCase();
                                let notificationClass = 'is-warning';
                                let icon = 'fa-exclamation-triangle';
                                if (severityLevel.includes('blocking') || severityLevel.includes('blocked') || severityLevel.includes('suspended')) {
                                    notificationClass = 'is-danger';
                                    icon = 'fa-ban';
                                } else if (severityLevel.includes('information') || severityLevel.includes('info')) {
                                    notificationClass = 'is-info';
                                    icon = 'fa-info-circle';
                                } else if (severityLevel.includes('delay') || severityLevel.includes('retard')) {
                                    notificationClass = 'is-warning';
                                    icon = 'fa-clock';
                                }
                                
                                return (
                                    <div key={index} className={`notification ${notificationClass} mb-3`}>
                                        <div className='is-flex is-align-items-center mb-2'>
                                            <span className='icon mr-2'>
                                                <i className={`fas ${icon}`}></i>
                                            </span>
                                            <strong>{severityText !== 'unknown' ? severityText : 'Perturbation'}</strong>
                                        </div>
                                        {disruption.messages && Array.isArray(disruption.messages) && disruption.messages.length > 0 && (
                                            <div className='content mb-2'>
                                                {disruption.messages.map((msg, msgIndex) => (
                                                    <p key={msgIndex} className='mb-2'>
                                                        {msg.text || (msg as { message?: string }).message || JSON.stringify(msg)}
                                                    </p>
                                                ))}
                                            </div>
                                        )}
                                        {(!disruption.messages || disruption.messages.length === 0) && disruption.message && (
                                            <p className='mb-2'>{disruption.message}</p>
                                        )}
                                        {disruption.application_periods && disruption.application_periods.length > 0 && (
                                            <div className='content is-small mt-2'>
                                                <p className='has-text-weight-semibold'>Période d'application:</p>
                                                <ul>
                                                    {disruption.application_periods.map((period, periodIndex) => (
                                                        <li key={periodIndex}>
                                                            Du {period.begin ? new Date(period.begin).toLocaleString('fr-FR') : 'N/A'} 
                                                            {' '}au {period.end ? new Date(period.end).toLocaleString('fr-FR') : 'N/A'}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* All Stops */}
                    <div className='box'>
                        <h2 className='title is-4 mb-4'>
                            Arrêts et horaires
                        </h2>
                        {allStops.length === 0 ? (
                            <p className='has-text-grey'>Aucun arrêt disponible pour ce trajet.</p>
                        ) : (
                            <div className='table-container'>
                                <table className='table is-fullwidth is-striped is-hoverable'>
                                    <thead>
                                        <tr>
                                            <th>Gare</th>
                                            <th>Voie/Quai</th>
                                            <th>Horaire</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allStops.map((stop, index) => {
                                        const stopName = cleanLocationName(
                                            stop.stop_point?.name || 
                                            stop.stop_area?.name || 
                                            'Gare inconnue'
                                        );
                                        const platform = stop.stop_point?.label || 'N/A';
                                        const baseArrival = stop.base_arrival_date_time;
                                        const realArrival = stop.arrival_date_time;
                                        const baseDeparture = stop.base_departure_date_time;
                                        const realDeparture = stop.departure_date_time;
                                        
                                        // Use arrival for intermediate stops, departure for last stop
                                        const baseTime = stop.isLast ? baseDeparture : baseArrival;
                                        const realTime = stop.isLast ? realDeparture : realArrival;
                                        const delay = getDelay(baseTime, realTime);
                                        const hasDelay = delay && delay !== 'À l\'heure';
                                        
                                        return (
                                            <tr key={index}>
                                                <td>
                                                    <strong>{stopName}</strong>
                                                    {stop.isFirst && (
                                                        <span className='tag is-success is-small ml-2'>Départ</span>
                                                    )}
                                                    {stop.isLast && (
                                                        <span className='tag is-danger is-small ml-2'>Arrivée</span>
                                                    )}
                                                </td>
                                                <td>{platform}</td>
                                                <td>
                                                    {baseTime ? (
                                                        <div>
                                                            <div className='is-flex is-align-items-center'>
                                                                <span className='is-size-5 has-text-weight-semibold'>
                                                                    {formatTime(parseUTCDate(baseTime))}
                                                                </span>
                                                                {hasDelay && realTime && (
                                                                    <>
                                                                        <span className='mx-2 has-text-grey'>→</span>
                                                                        <span className='is-size-5 has-text-danger has-text-weight-semibold'>
                                                                            {formatTime(parseUTCDate(realTime))}
                                                                        </span>
                                                                    </>
                                                                )}
                                                            </div>
                                                            {delay && (
                                                                <div className='mt-1'>
                                                                    {hasDelay ? (
                                                                        <span className='tag is-danger is-small'>
                                                                            <span className='icon mr-1'>
                                                                                <i className='fas fa-clock'></i>
                                                                            </span>
                                                                            {delay}
                                                                        </span>
                                                                    ) : (
                                                                        <span className='tag is-success is-small'>
                                                                            {delay}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className='has-text-grey'>-</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </section>
            <Footer />
        </>
    );
};

export default Trip;


