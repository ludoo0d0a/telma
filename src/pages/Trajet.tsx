import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Footer from '@/components/Footer';
import Ad from '@/components/Ad';
import { PageHeader } from '@/components/skytrip';
import ItinerarySearchForm from '@/components/itinerary/ItinerarySearchForm';
import DisruptionsList from '@/components/itinerary/DisruptionsList';
import JourneyTable from '@/components/itinerary/JourneyTable';
import EmptyState from '@/components/itinerary/EmptyState';
import QueryOverview from '@/components/shared/QueryOverview';
import { getJourneys, formatDateTime } from '@/services/navitiaApi';
import { parseUTCDate } from '@/utils/dateUtils';
import { cleanLocationName } from '@/services/locationService';
import { getJourneyInfo, type JourneyInfo } from '@/services/journeyService';
import { doesDisruptionMatchSectionByTrip, doesDisruptionMatchSectionByStopPoint } from '@/services/disruptionService';
import { encodeTripId } from '@/utils/uriUtils';
import { Loader2, RefreshCw } from 'lucide-react';
import type { JourneyItem } from '@/client/models/journey-item';
import type { Disruption } from '@/client/models/disruption';
import type { Section } from '@/client/models/section';
import type { Place } from '@/client/models/place';
import type { ImpactApplicationPeriodsInner } from '@/client/models/impact-application-periods-inner';

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
    const [showResults, setShowResults] = useState<boolean>(false);

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

    // Reset showResults when stations change (user manually changed)
    useEffect(() => {
        if (userHasChangedValuesRef.current) {
            setShowResults(false);
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
            setShowResults(false); // Hide results while loading
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
                const data = await getJourneys(from, to, dayDatetime, 'sncf', {
                    count: 100, // Get more results
                    data_freshness: 'realtime' // Get real-time data including delays
                });
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
            // Show results after successful search (only if we have results or if it was an auto-search)
            if (uniqueTrains.length > 0 || isInitialLoadFromUrlRef.current) {
                setShowResults(true);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
            setError('Erreur lors de la récupération des trains TER: ' + errorMessage);
            console.error(err);
            setShowResults(false); // Don't show results on error
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
        <>
            <PageHeader
                title="Recherche de trains"
                subtitle="Planifiez vos trajets TER et visualisez les perturbations"
                showNotification={false}
                
            />
            <section className='section' style={{ 
                minHeight: showResults ? 'auto' : 'calc(100vh - 200px)',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div className='container' style={{ 
                    flex: showResults ? '0 1 auto' : '1 1 auto',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    {/* Search Form - Fullscreen when not showing results */}
                    {!showResults && (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <div className='level mb-5 is-justify-content-flex-end'>
                                <div className='level-item'>
                                    <button
                                        className='button is-primary'
                                        onClick={handleRefresh}
                                        disabled={loading}
                                    >
                                        <span className='icon'>
                                            {loading ? <Loader2 size={20} className="animate-spin" /> : <RefreshCw size={20} />}
                                        </span>
                                        <span>Actualiser</span>
                                    </button>
                                </div>
                            </div>

                            {/* Advertisement */}
                            <Ad format="horizontal" size="responsive" className="mb-5" />

                            <div style={{ flex: 1 }}>
                                <ItinerarySearchForm
                                    fromName={fromName}
                                    toName={toName}
                                    fromId={fromId}
                                    toId={toId}
                                    filterDate={filterDate}
                                    filterTime={filterTime}
                                    loading={loading}
                                    onFromChange={(id: string | undefined) => setFromId(id)}
                                    onToChange={(id: string | undefined) => setToId(id)}
                                    onFromValueChange={(value) => {
                                                    setFromName(value);
                                                    // Mark as user change if they typed something different
                                                    if (hasAutoSearchedRef.current || value !== initialFromNameRef.current) {
                                                        userHasChangedValuesRef.current = true;
                                                    }
                                                }}
                                    onToValueChange={(value) => {
                                                    setToName(value);
                                                    // Mark as user change if they typed something different
                                                    if (hasAutoSearchedRef.current || value !== initialToNameRef.current) {
                                                        userHasChangedValuesRef.current = true;
                                                    }
                                                }}
                                    onFromStationFound={handleFromStationFound}
                                    onToStationFound={handleToStationFound}
                                    onFilterDateChange={setFilterDate}
                                    onFilterTimeChange={setFilterTime}
                                    onSearch={handleSearch}
                                    onInvertItinerary={handleInvertItinerary}
                                />
                            </div>

                            {error && !loading && (
                                <div className='notification is-danger mt-4'>
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
                        </div>
                    )}

                    {/* Results View - Hide search form, show results */}
                    {showResults && (
                        <>
                            {/* Compact Query Overview */}
                            <QueryOverview
                                fromName={fromName}
                                toName={toName}
                                filterDate={filterDate}
                                filterTime={filterTime}
                                onClick={() => setShowResults(false)}
                            />

                            {/* Refresh button */}
                            <div className='level mb-5 is-justify-content-flex-end'>
                                <div className='level-item'>
                                    <button
                                        className='button is-primary'
                                        onClick={handleRefresh}
                                        disabled={loading}
                                    >
                                        <span className='icon'>
                                            {loading ? <Loader2 size={20} className="animate-spin" /> : <RefreshCw size={20} />}
                                        </span>
                                        <span>Actualiser</span>
                                    </button>
                                </div>
                            </div>

                            {/* Loading state */}
                            {loading && (
                                <div className='box has-text-centered'>
                                    <div className='loader-wrapper'>
                                        <div className='loader is-loading'></div>
                                    </div>
                                    <p className='mt-4 subtitle is-5'>Chargement des trains...</p>
                                    <p className='has-text-grey'>Recherche des gares et des horaires en cours...</p>
                                </div>
                            )}

                            {/* Error state */}
                            {error && !loading && (
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

                            {/* Disruptions */}
                            {!loading && <DisruptionsList disruptions={disruptions} />}

                            {/* Results */}
                            {!loading && !error && terTrains.length > 0 && (
                                <>
                                    {/* Advertisement */}
                                    <Ad format="auto" size="responsive" className="mb-5" />
                                    
                                    <JourneyTable
                                        journeys={terTrains}
                                        getJourneyInfo={(journey) => getJourneyInfo(journey, fromName, toName)}
                                        getJourneyDisruptions={getJourneyDisruptions}
                                        generateTripId={generateTripId}
                                        onDetailClick={(journey, journeyInfo, journeyDisruptions, tripId) => {
                                                    // Store journey data in sessionStorage for the Trip page
                                                        sessionStorage.setItem(`trip_${tripId}`, JSON.stringify({
                                                            journey,
                                                info: journeyInfo,
                                                            disruptions: journeyDisruptions
                                                        }));
                                        }}
                                    />

                                    {/* Advertisement */}
                                    <Ad format="rectangle" size="responsive" className="mb-5" />
                                </>
                            )}

                            {/* Empty state */}
                            {!loading && !error && terTrains.length === 0 && (
                                <EmptyState
                                    fromName={fromName}
                                    toName={toName}
                                    fromId={fromId}
                                    toId={toId}
                                />
                            )}
                        </>
                    )}
                </div>
            </section>
            <Footer />
        </>
    );
};

export default Trajet;

