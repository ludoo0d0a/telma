import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import '../styles/Trajet.scss';
import Footer from '../components/Footer';
import Ad from '../components/Ad';
import LocationAutocomplete from '../components/LocationAutocomplete';
import { getJourneys, formatDateTime } from '../services/navitiaApi';
import { parseUTCDate, formatTime, formatDate } from '../components/Utils';
import { cleanLocationName } from '../services/locationService';
import { getDelay, getMaxDelay } from '../services/delayService';
import { getJourneyInfo, type JourneyInfo } from '../services/journeyService';
import { doesDisruptionMatchSectionByTrip, doesDisruptionMatchSectionByStopPoint } from '../services/disruptionService';
import { encodeTripId, encodeVehicleJourneyId } from '../utils/uriUtils';
import { Icon } from '../utils/iconMapping';
import type { JourneyItem } from '../client/models/journey-item';
import type { Disruption } from '../client/models/disruption';
import type { Section } from '../client/models/section';
import type { Place } from '../client/models/place';
import type { ImpactApplicationPeriodsInner } from '../client/models/impact-application-periods-inner';

// Decode URL parameters and format location names
const decodeLocationName = (slug: string | undefined): string => {
    if (!slug) return '';
    return decodeURIComponent(slug).replace(/-/g, ' ').split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
};

const Trajet: React.FC = () => {
    const { from, to } = useParams<{ from?: string; to?: string }>();
    const navigate = useNavigate();
    const [terTrains, setTerTrains] = useState<JourneyItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [fromId, setFromId] = useState<string | undefined>(undefined);
    const [toId, setToId] = useState<string | undefined>(undefined);
    const [disruptions, setDisruptions] = useState<Disruption[]>([]);
    const [showDisruptionsSection, setShowDisruptionsSection] = useState<boolean>(false);
    
    // Track if we should auto-search on initial load
    const hasAutoSearchedRef = useRef<boolean>(false);
    const isInitialLoadFromUrlRef = useRef<boolean>(Boolean(from && to));
    const userHasChangedValuesRef = useRef<boolean>(false);
    const initialFromNameRef = useRef<string>(decodeLocationName(from) || '');
    const initialToNameRef = useRef<string>(decodeLocationName(to) || '');
    
    const [fromName, setFromName] = useState<string>(() => decodeLocationName(from) || '');
    const [toName, setToName] = useState<string>(() => decodeLocationName(to) || '');
    
    // Default to current date/time - 1 hour
    const getDefaultDateTime = (): Date => {
        const now = new Date();
        now.setHours(now.getHours() - 1);
        return now;
    };
    
    const [filterDate, setFilterDate] = useState<string>(() => {
        const defaultDate = getDefaultDateTime();
        return defaultDate.toISOString().split('T')[0]; // YYYY-MM-DD format
    });
    
    const [filterTime, setFilterTime] = useState<string>(() => {
        const defaultDate = getDefaultDateTime();
        const hours = String(defaultDate.getHours()).padStart(2, '0');
        const minutes = String(defaultDate.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`; // HH:MM format
    });

    // Update default search terms when URL params change
    useEffect(() => {
        if (from) {
            const decodedFrom = decodeLocationName(from);
            setFromName(decodedFrom);
            initialFromNameRef.current = decodedFrom;
        }
        if (to) {
            const decodedTo = decodeLocationName(to);
            setToName(decodedTo);
            initialToNameRef.current = decodedTo;
        }
        // Reset auto-search flag when URL params change (user navigated to new URL)
        hasAutoSearchedRef.current = false;
        isInitialLoadFromUrlRef.current = Boolean(from && to);
        userHasChangedValuesRef.current = false;
    }, [from, to]);

    // Auto-search when both stations are resolved from URL params on initial load
    useEffect(() => {
        // Only auto-search if:
        // 1. We have URL params (initial load from URL)
        // 2. Both IDs are set
        // 3. We haven't auto-searched yet
        // 4. User hasn't manually changed values
        if (
            isInitialLoadFromUrlRef.current &&
            fromId &&
            toId &&
            !hasAutoSearchedRef.current &&
            !userHasChangedValuesRef.current
        ) {
            hasAutoSearchedRef.current = true;
            fetchTerTrains(fromId, toId);
        }
    }, [fromId, toId]);

    // Clear itinerary when stations change (don't auto-search on manual changes)
    useEffect(() => {
        // Only clear if user manually changed values (not on initial load auto-search)
        if (userHasChangedValuesRef.current) {
            setTerTrains([]);
            setDisruptions([]);
            setError(null);
        }
    }, [fromId, toId]);

    const handleFromStationFound = (station: Place & { name?: string | null }): void => {
        if (!station.id) return;
        
        const cleanedName = cleanLocationName(station.name) || '';
        const normalizedCleanedName = cleanedName.toLowerCase().trim();
        const normalizedInitialFrom = initialFromNameRef.current.toLowerCase().trim();
        
        // Determine if this is a manual change:
        // 1. If user has already manually changed values (flag set from onValueChange)
        // 2. If we've already auto-searched (any change after that is manual)
        // 3. If the name doesn't match initial URL param (user selected different station)
        const isManualChange = 
            userHasChangedValuesRef.current ||
            hasAutoSearchedRef.current ||
            (normalizedCleanedName !== normalizedInitialFrom && isInitialLoadFromUrlRef.current);
        
        if (isManualChange) {
            userHasChangedValuesRef.current = true;
            // Clear current itinerary on manual change (but not on initial auto-selection)
            if (hasAutoSearchedRef.current) {
                setTerTrains([]);
                setDisruptions([]);
            }
        }
        
        setFromId(station.id);
        setFromName(cleanedName);
        setError(null);
        
        // Update URL if toId is also set
        if (toId && toName) {
            const fromSlug = encodeURIComponent(cleanedName.toLowerCase().replace(/\s+/g, '-'));
            const toSlug = encodeURIComponent(toName.toLowerCase().replace(/\s+/g, '-'));
            navigate(`/itinerary/${fromSlug}/${toSlug}`, { replace: true });
        }
    };

    const handleToStationFound = (station: Place & { name?: string | null }): void => {
        if (!station.id) return;
        
        const cleanedName = cleanLocationName(station.name) || '';
        const normalizedCleanedName = cleanedName.toLowerCase().trim();
        const normalizedInitialTo = initialToNameRef.current.toLowerCase().trim();
        
        // Determine if this is a manual change:
        // 1. If user has already manually changed values (flag set from onValueChange)
        // 2. If we've already auto-searched (any change after that is manual)
        // 3. If the name doesn't match initial URL param (user selected different station)
        const isManualChange = 
            userHasChangedValuesRef.current ||
            hasAutoSearchedRef.current ||
            (normalizedCleanedName !== normalizedInitialTo && isInitialLoadFromUrlRef.current);
        
        if (isManualChange) {
            userHasChangedValuesRef.current = true;
            // Clear current itinerary on manual change (but not on initial auto-selection)
            if (hasAutoSearchedRef.current) {
                setTerTrains([]);
                setDisruptions([]);
            }
        }
        
        setToId(station.id);
        setToName(cleanedName);
        setError(null);
        
        // Update URL if fromId is also set
        if (fromId && fromName) {
            const fromSlug = encodeURIComponent(fromName.toLowerCase().replace(/\s+/g, '-'));
            const toSlug = encodeURIComponent(cleanedName.toLowerCase().replace(/\s+/g, '-'));
            navigate(`/itinerary/${fromSlug}/${toSlug}`, { replace: true });
        }
    };

    const handleSearch = (): void => {
        if (fromId && toId) {
            fetchTerTrains(fromId, toId);
        } else {
            setError('Veuillez sélectionner les gares de départ et d\'arrivée');
        }
    };

    const handleInvertItinerary = (): void => {
        if (!fromId || !toId) return;
        
        // Swap stations
        const newFromId = toId;
        const newFromName = toName;
        const newToId = fromId;
        const newToName = fromName;
        
        setFromId(newFromId);
        setFromName(newFromName);
        setToId(newToId);
        setToName(newToName);
        
        // Update URL
        const fromSlug = encodeURIComponent(newFromName.toLowerCase().replace(/\s+/g, '-'));
        const toSlug = encodeURIComponent(newToName.toLowerCase().replace(/\s+/g, '-'));
        navigate(`/itinerary/${fromSlug}/${toSlug}`, { replace: true });
        
        // Trigger search with swapped stations
        fetchTerTrains(newFromId, newToId);
    };

    const fetchTerTrains = async (from: string, to: string): Promise<void> => {
        try {
            setLoading(true);
            setError(null);
            setDisruptions([]); // Clear previous disruptions
            
            // Build datetime from filter date and time
            const [hours, minutes] = filterTime.split(':');
            const filterDateTime = new Date(filterDate);
            filterDateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
            
            const searchDatetime = formatDateTime(filterDateTime);
            
            // Fetch journeys for the selected date and next 2 days
            const allJourneys: JourneyItem[] = [];
            const allDisruptions: Disruption[] = [];
            const filterDateObj = new Date(filterDate);
            
            // Fetch for selected date and next 2 days
            for (let day = 0; day < 3; day++) {
                const date = new Date(filterDateObj);
                date.setDate(date.getDate() + day);
                
                // For the first day, use the filter time; for others, start at 00:00
                if (day === 0) {
                    date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
                } else {
                    date.setHours(0, 0, 0, 0);
                }
                
                const dayDatetime = formatDateTime(date);
                const response = await getJourneys(from, to, dayDatetime, 'sncf', {
                    count: 100, // Get more results
                    data_freshness: 'realtime' // Get real-time data including delays
                });
                const data = response.data;
                
                if (data.journeys) {
                    allJourneys.push(...data.journeys);
                }
                
                // Collect disruptions from API response
                if (data.disruptions && Array.isArray(data.disruptions)) {
                    allDisruptions.push(...data.disruptions);
                }
            }
            
            // Store disruptions in state
            setDisruptions(allDisruptions);
            
            // Filter journeys to only show those after the filter datetime
            const filterDateTimeMs = filterDateTime.getTime();
            const filteredJourneys = allJourneys.filter((journey: JourneyItem) => {
                if (!journey.departure_date_time) return false;
                const journeyDate = parseUTCDate(journey.departure_date_time);
                return journeyDate.getTime() >= filterDateTimeMs;
            });

            // Show all transport types (no filtering)
            // Filter to only journeys with public_transport sections
            const allTransportTypes = filteredJourneys.filter((journey: JourneyItem) => {
                return journey.sections?.some((section: Section) => section.type === 'public_transport');
            });

            // Remove duplicates and sort by departure time
            const uniqueTrains: JourneyItem[] = [];
            const seenIds = new Set<string>();
            
            allTransportTypes.forEach((journey: JourneyItem) => {
                const firstSection = journey.sections?.find((s: Section) => s.type === 'public_transport');
                if (firstSection) {
                    const trainId = firstSection.display_informations?.headsign || 
                                   firstSection.display_informations?.trip_short_name ||
                                   journey.departure_date_time || '';
                    
                    if (!seenIds.has(trainId)) {
                        seenIds.add(trainId);
                        uniqueTrains.push(journey);
                    }
                }
            });

            // Sort by departure time
            uniqueTrains.sort((a: JourneyItem, b: JourneyItem) => {
                const timeA = a.departure_date_time ? parseUTCDate(a.departure_date_time).getTime() : 0;
                const timeB = b.departure_date_time ? parseUTCDate(b.departure_date_time).getTime() : 0;
                return timeA - timeB;
            });

            setTerTrains(uniqueTrains);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
            setError('Erreur lors de la récupération des trains TER: ' + errorMessage);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };



    // Generate a unique trip ID from journey data
    const generateTripId = (journey: JourneyItem, journeyInfo: JourneyInfo): string => {
        // Use vehicle journey ID + departure datetime if available
        if (journeyInfo.vehicleJourneyId && journey.departure_date_time) {
            const tripKey = `${journeyInfo.vehicleJourneyId}_${journey.departure_date_time}`;
            return encodeTripId(tripKey);
        }
        // Fallback: create hash from journey data
        const tripKey = `${journey.departure_date_time}_${journeyInfo.departureStation}_${journeyInfo.arrivalStation}_${journeyInfo.trainNumber}`;
        return encodeTripId(tripKey);
    };

    // Match disruptions to a specific journey
    const getJourneyDisruptions = (journey: JourneyItem, journeyInfo: JourneyInfo): Disruption[] => {
        if (!disruptions || disruptions.length === 0) return [];
        
        const matchedDisruptions: Disruption[] = [];
        const vehicleJourneyId = journeyInfo.vehicleJourneyId;
        const departureTime = journey.departure_date_time;
        const sections = journey.sections || [];
        
        // First, check for disruption links in sections (primary method using disruption_id)
        const disruptionLinkIds = new Set<string>();
        sections.forEach((section: Section) => {
            if (section.type === 'public_transport') {
                // Check section links for disruptions
                const sectionLinks = section.links?.filter((link) => 
                    link.type === 'disruption'
                ) || [];
                sectionLinks.forEach((link) => {
                    if (link.id) {
                        disruptionLinkIds.add(link.id);
                    }
                });
            }
        });
        
        // Match disruptions using disruption_id from links
        const matchedByLink: Disruption[] = [];
        if (disruptionLinkIds.size > 0) {
            disruptions.forEach((disruption: Disruption) => {
                const disruptionId = disruption.disruption_uri || disruption.id || disruption.disruption_id;
                if (disruptionId && disruptionLinkIds.has(disruptionId)) {
                    matchedByLink.push(disruption);
                }
            });
        }
        
        // If we found disruptions via links, return them (and check application periods)
        if (matchedByLink.length > 0) {
            return matchedByLink.filter((disruption: Disruption) => {
                // Check application periods to see if disruption applies to this journey's time
                if (disruption.application_periods && Array.isArray(disruption.application_periods) && disruption.application_periods.length > 0) {
                    if (!departureTime) return false;
                    const journeyTime = parseUTCDate(departureTime).getTime();
                    return disruption.application_periods.some((period: ImpactApplicationPeriodsInner) => {
                        if (!period.begin || !period.end) return true; // If no period specified, assume it applies
                        const beginTime = new Date(period.begin).getTime();
                        const endTime = new Date(period.end).getTime();
                        return journeyTime >= beginTime && journeyTime <= endTime;
                    });
                }
                return true; // No application periods, assume it applies
            });
        }
        
        // Fallback: Use existing impacted_objects matching method
        disruptions.forEach((disruption: Disruption) => {
            let isMatch = false;
            
            // Check if disruption impacts this journey through impacted_objects
            if (disruption.impacted_objects && Array.isArray(disruption.impacted_objects)) {
                disruption.impacted_objects.forEach((obj) => {
                    const ptObject = obj.pt_object;
                    if (!ptObject) return;
                    
                    // Match by vehicle_journey ID
                    if (vehicleJourneyId && ptObject.id && ptObject.id === vehicleJourneyId) {
                        isMatch = true;
                    }
                    
                    // Match by embedded_type and id
                    if (ptObject.embedded_type === 'vehicle_journey' && vehicleJourneyId && ptObject.id === vehicleJourneyId) {
                        isMatch = true;
                    }
                    
                    // Match by trip ID using pt_object.trip (using shared function)
                    sections.forEach((section: Section) => {
                        if (section.type === 'public_transport') {
                            const sectionTripId = section.trip?.id || (section.vehicle_journey && typeof section.vehicle_journey === 'object' && 'trip' in section.vehicle_journey ? (section.vehicle_journey as { trip?: { id?: string } }).trip?.id : undefined);
                            if (sectionTripId && doesDisruptionMatchSectionByTrip(disruption, sectionTripId)) {
                                isMatch = true;
                            }
                        }
                    });
                    
                    // Match by stop_point ID (using shared function)
                    const stopPointIds: string[] = [];
                    sections.forEach((section: Section) => {
                        if (section.type === 'public_transport') {
                            // Collect all stop point IDs from this section
                            const fromStopId = section.from?.stop_point?.id || section.from?.stop_area?.id;
                            const toStopId = section.to?.stop_point?.id || section.to?.stop_area?.id;
                            if (fromStopId) stopPointIds.push(fromStopId);
                            if (toStopId) stopPointIds.push(toStopId);
                            
                            // Collect intermediate stops
                            if (section.stop_date_times && Array.isArray(section.stop_date_times)) {
                                section.stop_date_times.forEach((stopTime) => {
                                    const intermediateStopId = stopTime.stop_point?.id || stopTime.stop_area?.id;
                                    if (intermediateStopId) stopPointIds.push(intermediateStopId);
                                });
                            }
                        }
                    });
                    if (stopPointIds.length > 0 && doesDisruptionMatchSectionByStopPoint(disruption, stopPointIds)) {
                        isMatch = true;
                    }
                    
                    // Match by route ID
                    if (ptObject.embedded_type === 'route') {
                        sections.forEach((section: Section) => {
                            if (section.type === 'public_transport') {
                                const sectionRouteId = section.route?.id || section.display_informations?.route_id;
                                if (sectionRouteId && ptObject.id === sectionRouteId) {
                                    isMatch = true;
                                }
                            }
                        });
                    }
                    
                    // Match by line ID
                    if (ptObject.embedded_type === 'line') {
                        sections.forEach((section: Section) => {
                            if (section.type === 'public_transport') {
                                const sectionLineId = section.route?.line?.id || section.display_informations?.line_id;
                                if (sectionLineId && ptObject.id === sectionLineId) {
                                    isMatch = true;
                                }
                            }
                        });
                    }
                    
                    // Match by impacted stops (check if journey passes through these stops)
                    if (obj.impacted_stops && Array.isArray(obj.impacted_stops)) {
                        obj.impacted_stops.forEach((impactedStop) => {
                            const stopId = impactedStop.id || impactedStop.stop_point?.id || impactedStop.stop_area?.id;
                            const stopName = impactedStop.name || impactedStop.stop_point?.name || impactedStop.stop_area?.name;
                            
                            sections.forEach((section: Section) => {
                                if (section.type === 'public_transport') {
                                    // Check from/to stops
                                    const fromStopId = section.from?.stop_point?.id || section.from?.stop_area?.id;
                                    const toStopId = section.to?.stop_point?.id || section.to?.stop_area?.id;
                                    const fromStopName = section.from?.stop_point?.name || section.from?.stop_area?.name;
                                    const toStopName = section.to?.stop_point?.name || section.to?.stop_area?.name;
                                    
                                    // Match by stop ID
                                    if (stopId && (stopId === fromStopId || stopId === toStopId)) {
                                        isMatch = true;
                                    }
                                    
                                    // Match by stop name (normalized comparison)
                                    if (stopName && (fromStopName || toStopName)) {
                                        const normalizedStopName = cleanLocationName(stopName)?.toLowerCase().trim() || '';
                                        const normalizedFromName = cleanLocationName(fromStopName || '')?.toLowerCase().trim() || '';
                                        const normalizedToName = cleanLocationName(toStopName || '')?.toLowerCase().trim() || '';
                                        if (normalizedStopName === normalizedFromName || normalizedStopName === normalizedToName) {
                                            isMatch = true;
                                        }
                                    }
                                    
                                    // Check intermediate stops in stop_date_times
                                    if (section.stop_date_times && Array.isArray(section.stop_date_times)) {
                                        section.stop_date_times.forEach((stopTime) => {
                                            const intermediateStopId = stopTime.stop_point?.id || stopTime.stop_area?.id;
                                            const intermediateStopName = stopTime.stop_point?.name || stopTime.stop_area?.name;
                                            
                                            // Match by stop ID
                                            if (stopId && intermediateStopId && stopId === intermediateStopId) {
                                                isMatch = true;
                                            }
                                            
                                            // Match by stop name
                                            if (stopName && intermediateStopName) {
                                                const normalizedStopName = cleanLocationName(stopName)?.toLowerCase().trim() || '';
                                                const normalizedIntermediateName = cleanLocationName(intermediateStopName)?.toLowerCase().trim() || '';
                                                if (normalizedStopName === normalizedIntermediateName) {
                                                    isMatch = true;
                                                }
                                            }
                                        });
                                    }
                                }
                            });
                        });
                    }
                });
            }
            
            // If no specific match found but disruption has no impacted_objects, 
            // check if it applies by time period (general disruptions)
            if (!isMatch && (!disruption.impacted_objects || disruption.impacted_objects.length === 0)) {
                // Only match general disruptions if they have application periods that match
                if (disruption.application_periods && Array.isArray(disruption.application_periods) && disruption.application_periods.length > 0) {
                    if (!departureTime) return;
                    const journeyTime = parseUTCDate(departureTime).getTime();
                    const isInPeriod = disruption.application_periods.some((period: ImpactApplicationPeriodsInner) => {
                        if (!period.begin || !period.end) return false; // Require specific period for general disruptions
                        const beginTime = new Date(period.begin).getTime();
                        const endTime = new Date(period.end).getTime();
                        // Match if journey time is within the disruption period
                        return journeyTime >= beginTime && journeyTime <= endTime;
                    });
                    if (isInPeriod) {
                        isMatch = true;
                    }
                }
            }
            
            // Check application periods to see if disruption applies to this journey's time
            if (isMatch && disruption.application_periods && Array.isArray(disruption.application_periods) && disruption.application_periods.length > 0) {
                if (!departureTime) {
                    isMatch = false;
                } else {
                    const journeyTime = parseUTCDate(departureTime).getTime();
                    const isInPeriod = disruption.application_periods.some((period: ImpactApplicationPeriodsInner) => {
                        if (!period.begin || !period.end) return true; // If no period specified, assume it applies
                        const beginTime = new Date(period.begin).getTime();
                        const endTime = new Date(period.end).getTime();
                        return journeyTime >= beginTime && journeyTime <= endTime;
                    });
                    if (!isInPeriod) {
                        isMatch = false; // Disruption doesn't apply to this journey's time
                    }
                }
            }
            
            if (isMatch) {
                matchedDisruptions.push(disruption);
            }
        });
        
        return matchedDisruptions;
    };


    const handleRefresh = async (): Promise<void> => {
        if (fromId && toId) {
            await fetchTerTrains(fromId, toId);
        } else {
            setError('Veuillez sélectionner les gares de départ et d\'arrivée');
        }
    };

    return (
            <main className="main-content">
                    <div className="search-card">
                        <div className="tabs">
                            {/* //TODO: Implement Round Trip and Multi-City functionality */}
                            <button className="tab-button active">One-Way</button>
                            <button className="tab-button">Round Trip</button>
                            <button className="tab-button">Multi-City</button>
                        </div>

                        <div className="form">
                            <div className="input-group">
                                <label>From</label>
                                <LocationAutocomplete
                                    value={fromName}
                                    onValueChange={(value) => {
                                        setFromName(value);
                                        if (hasAutoSearchedRef.current || value !== initialFromNameRef.current) {
                                            userHasChangedValuesRef.current = true;
                                        }
                                    }}
                                    onChange={(id: string | undefined) => setFromId(id)}
                                    defaultSearchTerm={fromName}
                                    onStationFound={handleFromStationFound}
                                    disabled={loading}
                                />
                            </div>

                            <div className="swap-icon" onClick={handleInvertItinerary}>
                                <Icon name="fa-arrow-left-right" />
                            </div>

                            <div className="input-group">
                                <label>To</label>
                                <LocationAutocomplete
                                    value={toName}
                                    onValueChange={(value) => {
                                        setToName(value);
                                        if (hasAutoSearchedRef.current || value !== initialToNameRef.current) {
                                            userHasChangedValuesRef.current = true;
                                        }
                                    }}
                                    onChange={(id: string | undefined) => setToId(id)}
                                    defaultSearchTerm={toName}
                                    onStationFound={handleToStationFound}
                                    disabled={loading}
                                />
                            </div>

                            <div className="inline-inputs">
                                <div className="input-group">
                                    <label>Date</label>
                                    <input
                                        className='input'
                                        type='date'
                                        value={filterDate}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilterDate(e.target.value)}
                                        disabled={loading}
                                    />
                                </div>
                                <div className="input-group">
                                    <label>Heure</label>
                                    <input
                                        className='input'
                                        type='time'
                                        value={filterTime}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilterTime(e.target.value)}
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <button className="search-button" onClick={handleSearch} disabled={loading || !fromId || !toId}>
                                Rechercher
                            </button>
                        </div>
                    </div>

                    {loading && (
                        <div className='box has-text-centered'>
                            <div className='loader-wrapper'>
                                <div className='loader is-loading'></div>
                            </div>
                            <p className='mt-4 subtitle is-5'>Chargement des trains...</p>
                            <p className='has-text-grey'>Recherche des gares et des horaires en cours...</p>
                        </div>
                    )}

                    {error && (
                        <div className='notification is-danger'>
                            <button className='delete' onClick={() => setError(null)}></button>
                            <p className='title is-5'>Erreur</p>
                            <p>{error}</p>
                            <p className='mt-3 has-text-grey-light'>
                                {fromId && toId ? (
                                    <>Gares trouvées mais impossible de récupérer les horaires.</>
                                ) : (
                                    <>Vérifiez votre connexion et réessayez.</>
                                )}
                            </p>
                        </div>
                    )}

                    {!loading && disruptions.length > 0 && (
                        <div className='box mb-5'>
                            <h3 
                                className='title is-5 mb-4 is-clickable' 
                                onClick={() => setShowDisruptionsSection(!showDisruptionsSection)}
                                style={{ cursor: 'pointer' }}
                            >
                                <span className='icon has-text-warning mr-2'>
                                    <Icon name='fa-exclamation-triangle' size={20} />
                                </span>
                                Perturbations ({disruptions.length})
                                <span className='icon ml-2'>
                                    <Icon name={showDisruptionsSection ? 'fa-chevron-up' : 'fa-chevron-down'} size={20} />
                                </span>
                            </h3>
                            {showDisruptionsSection && disruptions.map((disruption, index) => {
                                // Handle severity - can be string, object with name, or object with other properties
                                let severityText = 'unknown';
                                if (typeof disruption.severity === 'string') {
                                    severityText = disruption.severity;
                                } else if (disruption.severity && typeof disruption.severity === 'object') {
                                    severityText = (disruption.severity as { name?: string; label?: string }).name || 
                                                  (disruption.severity as { name?: string; label?: string }).label || 
                                                  JSON.stringify(disruption.severity);
                                }
                                
                                const severityLevel = severityText.toLowerCase();
                                
                                // Determine notification type based on severity
                                let notificationClass = 'is-warning';
                                let icon = 'fa-exclamation-triangle';
                                if (severityLevel.includes('blocking') || severityLevel.includes('blocked') || severityLevel.includes('suspended')) {
                                    notificationClass = 'is-danger';
                                    icon = 'fa-ban';
                                } else if (severityLevel.includes('information') || severityLevel.includes('info') || severityLevel.includes('information')) {
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
                                                <Icon name={icon} size={20} />
                                            </span>
                                            <strong>
                                                {severityText !== 'unknown' ? severityText : 'Perturbation'}
                                            </strong>
                                        </div>
                                        {/* Display messages from messages array */}
                                        {disruption.messages && Array.isArray(disruption.messages) && disruption.messages.length > 0 && (
                                            <div className='content mb-2'>
                                                {disruption.messages.map((msg, msgIndex) => (
                                                    <p key={msgIndex} className='mb-2'>
                                                        {msg.text || (msg as { message?: string }).message || JSON.stringify(msg)}
                                                    </p>
                                                ))}
                                            </div>
                                        )}
                                        {/* Fallback to single message field if messages array doesn't exist */}
                                        {(!disruption.messages || disruption.messages.length === 0) && disruption.message && (
                                            <p className='mb-2'>{disruption.message}</p>
                                        )}
                                        {disruption.impacted_objects && disruption.impacted_objects.length > 0 && (
                                            <div className='content is-small mt-2'>
                                                <p className='has-text-weight-semibold'>Objets impactés:</p>
                                                {disruption.impacted_objects.map((obj, objIndex) => (
                                                    <div key={objIndex} className='mb-3'>
                                                        <p className='has-text-weight-medium mb-1'>
                                                            {obj.pt_object?.name || obj.pt_object?.id || `Objet ${objIndex + 1}`}
                                                        </p>
                                                        {/* Display impacted stops */}
                                                        {obj.impacted_stops && Array.isArray(obj.impacted_stops) && obj.impacted_stops.length > 0 && (
                                                            <div className='ml-3'>
                                                                <p className='has-text-weight-semibold is-size-7 mb-1'>Arrêts impactés:</p>
                                                                <ul className='is-size-7'>
                                                                    {obj.impacted_stops.map((stop, stopIndex) => (
                                                                        <li key={stopIndex}>
                                                                            {cleanLocationName(stop.name || stop.stop_point?.name || stop.stop_area?.name || stop.id || 'Arrêt inconnu')}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                        {/* Display other pt_object properties */}
                                                        {obj.pt_object && (
                                                            <div className='ml-3 is-size-7'>
                                                                {obj.pt_object.name && (
                                                                    <p><strong>Nom:</strong> {obj.pt_object.name}</p>
                                                                )}
                                                                {obj.pt_object.id && (
                                                                    <p><strong>ID:</strong> {obj.pt_object.id}</p>
                                                                )}
                                                                {obj.pt_object.embedded_type && (
                                                                    <p><strong>Type:</strong> {obj.pt_object.embedded_type}</p>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
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
                            {!showDisruptionsSection && (
                                <p className='has-text-grey is-italic'>
                                    Cliquez sur le titre pour afficher les détails des perturbations. 
                                    Les perturbations sont également affichées dans le tableau ci-dessous.
                                </p>
                            )}
                        </div>
                    )}

                    {!loading && !error && terTrains.length > 0 && (
                        <>
                            {/* Advertisement */}
                            <Ad format="auto" size="responsive" className="mb-5" />
                            
                            <div className="results-section">
                                <div className="results-header">
                                    <h3>Results</h3>
                                    <a href="#">See All</a>
                                </div>
                                {terTrains.map((journey, index) => {
                                    const info = getJourneyInfo(journey, fromName, toName);
                                    const depDate = parseUTCDate(info.departureTime);
                                    const arrDate = parseUTCDate(info.arrivalTime);

                                    return (
                                        <div className="result-card" key={index}>
                                            <div className="flight-info">
                                                <div>
                                                    <p className="airport-code">{info.departureStation.substring(0, 3)}</p>
                                                    <p className="city">{info.departureStation}</p>
                                                </div>
                                                <div className="flight-duration">
                                                    <p>Duration</p>
                                                    <p className="duration">{Math.floor(info.duration / 60)}m</p>
                                                </div>
                                                <div>
                                                    <p className="airport-code">{info.arrivalStation.substring(0, 3)}</p>
                                                    <p className="city">{info.arrivalStation}</p>
                                                </div>
                                            </div>
                                            <div className="flight-timeline">
                                                <span className="time">{formatTime(depDate)}</span>
                                                <div className="timeline-line">
                                                    <span className="dot"></span>
                                                    <Icon name={info.transportIcon} />
                                                    <span className="dot"></span>
                                                </div>
                                                <span className="time">{formatTime(arrDate)}</span>
                                            </div>
                                            <div className="airline-info">
                                                <div>
                                                    <p>{info.transportLabel}</p>
                                            <p>Wagons: {info.wagonCount || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="price">{info.trainNumber}</p>
                                            <Link to={`/trip/${generateTripId(journey, info)}`}>Details</Link>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        
                        {/* Advertisement */}
                        <Ad format="rectangle" size="responsive" className="mb-5" />
                        </>
                    )}

                    {!loading && !error && terTrains.length === 0 && (
                        <div className='box has-text-centered'>
                            <div className='content'>
                                <span className='icon is-large has-text-warning mb-4' style={{fontSize: '4rem'}}>🚂</span>
                                <h2 className='title is-4'>Aucun train trouvé</h2>
                                <p className='subtitle is-6 has-text-grey'>
                                    Il n'y a actuellement aucun train disponible entre {fromName || 'la gare de départ'} et {toName || 'la gare d\'arrivée'} pour les prochains jours.
                                </p>
                                <div className='content has-text-left mt-5'>
                                    <div className='message is-info'>
                                        <div className='message-header'>
                                            <p>Informations</p>
                                        </div>
                                        <div className='message-body'>
                                            <ul>
                                                <li>Gare de départ: <strong>{fromId ? `${fromName} (trouvée)` : `${fromName || 'Non sélectionnée'} (non trouvée)`}</strong></li>
                                                <li>Gare d'arrivée: <strong>{toId ? `${toName} (trouvée)` : `${toName || 'Non sélectionnée'} (non trouvée)`}</strong></li>
                                                <li>Période recherchée: Aujourd'hui et les 2 prochains jours</li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className='notification is-warning is-light mt-4'>
                                        <p>
                                            <strong>Suggestion:</strong> Essayez de vérifier les horaires directement sur le site SNCF ou contactez le service client.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
            </main>
    );
};

export default Trajet;

