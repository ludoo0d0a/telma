import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Footer from '../components/Footer';
import Header from '../components/Header';
import LocationAutocomplete from '../components/LocationAutocomplete';
import { getJourneys, formatDateTime } from '../services/sncfApi';
import { parseUTCDate, getFullMinutes, calculateDelay, cleanLocationName, getTransportIcon, formatTime, formatDate, getDelay, getDelayMinutes, getMaxDelay, getWagonCount, getJourneyInfo } from '../components/Utils';

// Decode URL parameters and format location names
const decodeLocationName = (slug) => {
    if (!slug) return '';
    return decodeURIComponent(slug).replace(/-/g, ' ').split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
};

const Trajet = () => {
    const { from, to } = useParams();
    const navigate = useNavigate();
    const [terTrains, setTerTrains] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [fromId, setFromId] = useState(null);
    const [toId, setToId] = useState(null);
    const [disruptions, setDisruptions] = useState([]);
    const [showDisruptionsSection, setShowDisruptionsSection] = useState(false);
    
    const [fromName, setFromName] = useState(() => decodeLocationName(from) || '');
    const [toName, setToName] = useState(() => decodeLocationName(to) || '');
    
    // Default to current date/time - 1 hour
    const getDefaultDateTime = () => {
        const now = new Date();
        now.setHours(now.getHours() - 1);
        return now;
    };
    
    const [filterDate, setFilterDate] = useState(() => {
        const defaultDate = getDefaultDateTime();
        return defaultDate.toISOString().split('T')[0]; // YYYY-MM-DD format
    });
    
    const [filterTime, setFilterTime] = useState(() => {
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
        }
        if (to) {
            const decodedTo = decodeLocationName(to);
            setToName(decodedTo);
        }
    }, [from, to]);

    // Search for default stations on component mount
    useEffect(() => {
        const findDefaultStations = async () => {
            if (fromId && toId) {
                // Stations already set, fetch journeys
                await fetchTerTrains(fromId, toId);
            }
        };

        findDefaultStations();
    }, [fromId, toId]);

    const handleFromStationFound = (station) => {
        setFromId(station.id);
        const cleanedName = cleanLocationName(station.name);
        setFromName(cleanedName);
        setError(null);
        // Update URL if toId is also set
        if (toId && toName) {
            const fromSlug = encodeURIComponent(cleanedName.toLowerCase().replace(/\s+/g, '-'));
            const toSlug = encodeURIComponent(toName.toLowerCase().replace(/\s+/g, '-'));
            navigate(`/trajet/${fromSlug}/${toSlug}`, { replace: true });
        }
    };

    const handleToStationFound = (station) => {
        setToId(station.id);
        const cleanedName = cleanLocationName(station.name);
        setToName(cleanedName);
        setError(null);
        // Update URL if fromId is also set
        if (fromId && fromName) {
            const fromSlug = encodeURIComponent(fromName.toLowerCase().replace(/\s+/g, '-'));
            const toSlug = encodeURIComponent(cleanedName.toLowerCase().replace(/\s+/g, '-'));
            navigate(`/trajet/${fromSlug}/${toSlug}`, { replace: true });
        }
    };

    const handleSearch = () => {
        if (fromId && toId) {
            fetchTerTrains(fromId, toId);
        } else {
            setError('Veuillez sélectionner les gares de départ et d\'arrivée');
        }
    };

    const handleInvertItinerary = () => {
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
        navigate(`/trajet/${fromSlug}/${toSlug}`, { replace: true });
        
        // Trigger search with swapped stations
        fetchTerTrains(newFromId, newToId);
    };

    const fetchTerTrains = async (from, to) => {
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
            const allJourneys = [];
            const allDisruptions = [];
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
            const filteredJourneys = allJourneys.filter(journey => {
                if (!journey.departure_date_time) return false;
                const journeyDate = parseUTCDate(journey.departure_date_time);
                return journeyDate.getTime() >= filterDateTimeMs;
            });

            // Show all transport types (no filtering)
            // Filter to only journeys with public_transport sections
            const allTransportTypes = filteredJourneys.filter(journey => {
                return journey.sections?.some(section => section.type === 'public_transport');
            });

            // Remove duplicates and sort by departure time
            const uniqueTrains = [];
            const seenIds = new Set();
            
            allTransportTypes.forEach(journey => {
                const firstSection = journey.sections?.find(s => s.type === 'public_transport');
                if (firstSection) {
                    const trainId = firstSection.display_informations?.headsign || 
                                   firstSection.display_informations?.trip_short_name ||
                                   journey.departure_date_time;
                    
                    if (!seenIds.has(trainId)) {
                        seenIds.add(trainId);
                        uniqueTrains.push(journey);
                    }
                }
            });

            // Sort by departure time
            uniqueTrains.sort((a, b) => {
                const timeA = a.departure_date_time ? parseUTCDate(a.departure_date_time).getTime() : 0;
                const timeB = b.departure_date_time ? parseUTCDate(b.departure_date_time).getTime() : 0;
                return timeA - timeB;
            });

            setTerTrains(uniqueTrains);
        } catch (err) {
            setError('Erreur lors de la récupération des trains TER: ' + (err.message || 'Erreur inconnue'));
            console.error(err);
        } finally {
            setLoading(false);
        }
    };



    // Generate a unique trip ID from journey data
    const generateTripId = (journey, journeyInfo) => {
        // Use vehicle journey ID + departure datetime if available
        if (journeyInfo.vehicleJourneyId && journey.departure_date_time) {
            const tripKey = `${journeyInfo.vehicleJourneyId}_${journey.departure_date_time}`;
            return btoa(tripKey).replace(/[+/=]/g, '').substring(0, 50);
        }
        // Fallback: create hash from journey data
        const tripKey = `${journey.departure_date_time}_${journeyInfo.departureStation}_${journeyInfo.arrivalStation}_${journeyInfo.trainNumber}`;
        return btoa(tripKey).replace(/[+/=]/g, '').substring(0, 50);
    };

    // Match disruptions to a specific journey
    const getJourneyDisruptions = (journey, journeyInfo) => {
        if (!disruptions || disruptions.length === 0) return [];
        
        const matchedDisruptions = [];
        const vehicleJourneyId = journeyInfo.vehicleJourneyId;
        const trainNumber = journeyInfo.trainNumber;
        const departureTime = journey.departure_date_time;
        const sections = journey.sections || [];
        
        disruptions.forEach(disruption => {
            let isMatch = false;
            
            // Check if disruption impacts this journey through impacted_objects
            if (disruption.impacted_objects && Array.isArray(disruption.impacted_objects)) {
                disruption.impacted_objects.forEach(obj => {
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
                    
                    // Match by trip ID
                    if (ptObject.embedded_type === 'trip') {
                        sections.forEach(section => {
                            if (section.type === 'public_transport') {
                                const sectionTripId = section.trip?.id || section.vehicle_journey?.trip?.id;
                                if (sectionTripId && ptObject.id === sectionTripId) {
                                    isMatch = true;
                                }
                            }
                        });
                    }
                    
                    // Match by route ID
                    if (ptObject.embedded_type === 'route') {
                        sections.forEach(section => {
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
                        sections.forEach(section => {
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
                        obj.impacted_stops.forEach(impactedStop => {
                            const stopId = impactedStop.id || impactedStop.stop_point?.id || impactedStop.stop_area?.id;
                            const stopName = impactedStop.name || impactedStop.stop_point?.name || impactedStop.stop_area?.name;
                            
                            sections.forEach(section => {
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
                                        const normalizedStopName = cleanLocationName(stopName).toLowerCase().trim();
                                        const normalizedFromName = cleanLocationName(fromStopName || '').toLowerCase().trim();
                                        const normalizedToName = cleanLocationName(toStopName || '').toLowerCase().trim();
                                        if (normalizedStopName === normalizedFromName || normalizedStopName === normalizedToName) {
                                            isMatch = true;
                                        }
                                    }
                                    
                                    // Check intermediate stops in stop_date_times
                                    if (section.stop_date_times && Array.isArray(section.stop_date_times)) {
                                        section.stop_date_times.forEach(stopTime => {
                                            const intermediateStopId = stopTime.stop_point?.id || stopTime.stop_area?.id;
                                            const intermediateStopName = stopTime.stop_point?.name || stopTime.stop_area?.name;
                                            
                                            // Match by stop ID
                                            if (stopId && intermediateStopId && stopId === intermediateStopId) {
                                                isMatch = true;
                                            }
                                            
                                            // Match by stop name
                                            if (stopName && intermediateStopName) {
                                                const normalizedStopName = cleanLocationName(stopName).toLowerCase().trim();
                                                const normalizedIntermediateName = cleanLocationName(intermediateStopName).toLowerCase().trim();
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
                    const journeyTime = parseUTCDate(departureTime).getTime();
                    const isInPeriod = disruption.application_periods.some(period => {
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
                const journeyTime = parseUTCDate(departureTime).getTime();
                const isInPeriod = disruption.application_periods.some(period => {
                    if (!period.begin || !period.end) return true; // If no period specified, assume it applies
                    const beginTime = new Date(period.begin).getTime();
                    const endTime = new Date(period.end).getTime();
                    return journeyTime >= beginTime && journeyTime <= endTime;
                });
                if (!isInPeriod) {
                    isMatch = false; // Disruption doesn't apply to this journey's time
                }
            }
            
            if (isMatch) {
                matchedDisruptions.push(disruption);
            }
        });
        
        return matchedDisruptions;
    };


    const handleRefresh = async () => {
        if (fromId && toId) {
            await fetchTerTrains(fromId, toId);
        } else {
            setError('Veuillez sélectionner les gares de départ et d\'arrivée');
        }
    };

    return (
        <>
            <Header />
            <section className='section'>
                <div className='container'>
                    <div className='level mb-5'>
                        <div className='level-left'>
                            <div className='level-item'>
                                <h1 className='title is-2'>
                                    Recherche de trains
                                </h1>
                            </div>
                        </div>
                        <div className='level-right'>
                            <div className='level-item'>
                                <button 
                                    className='button is-primary' 
                                    onClick={handleRefresh}
                                    disabled={loading}
                                >
                                    <span className='icon'>
                                        <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-sync-alt'}`}></i>
                                    </span>
                                    <span>Actualiser</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className='box mb-5'>
                        <h3 className='title is-5 mb-4'>Recherche d'itinéraire</h3>
                        <div className='columns'>
                            <div className='column'>
                                <LocationAutocomplete
                                    label='Gare de départ'
                                    value={fromName}
                                    onChange={setFromId}
                                    defaultSearchTerm={fromName || 'Metz'}
                                    onStationFound={handleFromStationFound}
                                    disabled={loading}
                                />
                            </div>
                            <div className='column is-narrow'>
                                <div className='field'>
                                    <label className='label'>&nbsp;</label>
                                    <div className='control'>
                                        <button
                                            className='button is-light'
                                            onClick={handleInvertItinerary}
                                            disabled={loading || !fromId || !toId}
                                            title="Inverser l'itinéraire"
                                        >
                                            <span className='icon'>
                                                <i className='fas fa-exchange-alt'></i>
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className='column'>
                                <LocationAutocomplete
                                    label="Gare d'arrivée"
                                    value={toName}
                                    onChange={setToId}
                                    defaultSearchTerm={toName || 'Thionville'}
                                    onStationFound={handleToStationFound}
                                    disabled={loading}
                                />
                            </div>
                        </div>
                        <div className='columns mt-4'>
                            <div className='column is-narrow'>
                                <div className='field'>
                                    <label className='label'>Date</label>
                                    <div className='control'>
                                        <input
                                            className='input'
                                            type='date'
                                            value={filterDate}
                                            onChange={(e) => setFilterDate(e.target.value)}
                                            disabled={loading}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className='column is-narrow'>
                                <div className='field'>
                                    <label className='label'>Heure</label>
                                    <div className='control'>
                                        <input
                                            className='input'
                                            type='time'
                                            value={filterTime}
                                            onChange={(e) => setFilterTime(e.target.value)}
                                            disabled={loading}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className='column is-narrow'>
                                <div className='field'>
                                    <label className='label'>&nbsp;</label>
                                    <div className='control'>
                                        <button
                                            className='button is-primary'
                                            onClick={handleSearch}
                                            disabled={loading || !fromId || !toId}
                                        >
                                            <span className='icon'><i className='fas fa-search'></i></span>
                                            <span>Rechercher</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
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
                                    <i className='fas fa-exclamation-triangle'></i>
                                </span>
                                Perturbations ({disruptions.length})
                                <span className='icon ml-2'>
                                    <i className={`fas fa-chevron-${showDisruptionsSection ? 'up' : 'down'}`}></i>
                                </span>
                            </h3>
                            {showDisruptionsSection && disruptions.map((disruption, index) => {
                                // Handle severity - can be string, object with name, or object with other properties
                                let severityText = 'unknown';
                                if (typeof disruption.severity === 'string') {
                                    severityText = disruption.severity;
                                } else if (disruption.severity && typeof disruption.severity === 'object') {
                                    severityText = disruption.severity.name || disruption.severity.label || JSON.stringify(disruption.severity);
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
                                                <i className={`fas ${icon}`}></i>
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
                                                        {msg.text || msg.message || JSON.stringify(msg)}
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
                        <div className='box'>
                            <h2 className='title is-4 mb-5'>
                                Trains disponibles <span className='tag is-primary is-medium'>{terTrains.length}</span>
                            </h2>
                            <div className='table-container'>
                                <table className='table is-fullwidth is-striped is-hoverable'>
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Train</th>
                                            <th>Départ</th>
                                            <th>Arrivée</th>
                                            <th>Retard</th>
                                            <th>Perturbations</th>
                                            <th>Durée</th>
                                            <th>Wagons</th>
                                            <th>Détails</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {terTrains.map((journey, index) => {
                                            const info = getJourneyInfo(journey, fromName, toName);
                                            const depDate = parseUTCDate(info.departureTime);
                                            const arrDate = parseUTCDate(info.arrivalTime);
                                            const depDelay = getDelay(info.baseDepartureTime, info.realDepartureTime);
                                            const arrDelay = getDelay(info.baseArrivalTime, info.realArrivalTime);
                                            const maxDelay = getMaxDelay(
                                                depDelay, 
                                                arrDelay, 
                                                info.baseDepartureTime, 
                                                info.realDepartureTime,
                                                info.baseArrivalTime,
                                                info.realArrivalTime
                                            );
                                            const journeyDisruptions = getJourneyDisruptions(journey, info);
                                            const tripId = generateTripId(journey, info);
                                            
                                            // Store journey data in sessionStorage for the Trip page
                                            const handleDetailClick = () => {
                                                sessionStorage.setItem(`trip_${tripId}`, JSON.stringify({
                                                    journey,
                                                    info,
                                                    disruptions: journeyDisruptions
                                                }));
                                            };
                                            
                                            return (
                                                <tr key={index}>
                                                    <td>
                                                        <span className='tag is-dark has-text-weight-semibold'>{formatDate(depDate, 'short')}</span>
                                                    </td>
                                                    <td>
                                                        <div>
                                                            <div className='is-flex is-align-items-center mb-2'>
                                                                <span className={`icon ${info.transportColor} mr-2`}>
                                                                    <i className={`fas ${info.transportIcon}`}></i>
                                                                </span>
                                                                {info.vehicleJourneyId ? (
                                                                    <Link 
                                                                        to={`/train/${encodeURIComponent(info.vehicleJourneyId)}`}
                                                                        className='has-text-primary has-text-weight-bold'
                                                                    >
                                                                        {info.trainNumber}
                                                                    </Link>
                                                                ) : (
                                                                    <strong className='has-text-primary'>{info.trainNumber}</strong>
                                                                )}
                                                            </div>
                                                            <span className={`tag ${info.transportTagColor} is-light`}>
                                                                {info.transportLabel}
                                                            </span>
                                                            {info.network && info.network !== info.commercialMode && (
                                                                <>
                                                                    <br />
                                                                    <small className='has-text-grey'>{info.network}</small>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div>
                                                            <strong className='has-text-info'>{info.departureStation}</strong>
                                                            <br />
                                                            <span className='is-size-5'>{formatTime(parseUTCDate(info.baseDepartureTime))}</span>
                                                            {depDelay && depDelay !== 'À l\'heure' && (
                                                                <>
                                                                    <br />
                                                                    <span className='has-text-danger'>{formatTime(parseUTCDate(info.realDepartureTime))}</span>
                                                                </>
                                                            )}
                                                            {depDelay && (
                                                                <>
                                                                    <br />
                                                                    <span className={`tag is-small ${depDelay !== 'À l\'heure' ? 'is-danger' : 'is-success'}`}>
                                                                        {depDelay}
                                                                    </span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div>
                                                            <strong className='has-text-info'>{info.arrivalStation}</strong>
                                                            <br />
                                                            <span className='is-size-5'>{formatTime(parseUTCDate(info.baseArrivalTime))}</span>
                                                            {arrDelay && arrDelay !== 'À l\'heure' && (
                                                                <>
                                                                    <br />
                                                                    <span className='has-text-danger'>{formatTime(parseUTCDate(info.realArrivalTime))}</span>
                                                                </>
                                                            )}
                                                            {arrDelay && (
                                                                <>
                                                                    <br />
                                                                    <span className={`tag is-small ${arrDelay !== 'À l\'heure' ? 'is-danger' : 'is-success'}`}>
                                                                        {arrDelay}
                                                                    </span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        {maxDelay && maxDelay !== 'À l\'heure' ? (
                                                            <span className='tag is-danger'>{maxDelay}</span>
                                                        ) : (
                                                            <span className='tag is-success'>À l'heure</span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        {journeyDisruptions.length > 0 ? (
                                                            <div className='tags'>
                                                                {journeyDisruptions.map((disruption, disIndex) => {
                                                                    let severityText = 'unknown';
                                                                    if (typeof disruption.severity === 'string') {
                                                                        severityText = disruption.severity;
                                                                    } else if (disruption.severity && typeof disruption.severity === 'object') {
                                                                        severityText = disruption.severity.name || disruption.severity.label || 'Perturbation';
                                                                    }
                                                                    
                                                                    const severityLevel = severityText.toLowerCase();
                                                                    let tagClass = 'is-warning';
                                                                    if (severityLevel.includes('blocking') || severityLevel.includes('blocked') || severityLevel.includes('suspended')) {
                                                                        tagClass = 'is-danger';
                                                                    } else if (severityLevel.includes('information') || severityLevel.includes('info')) {
                                                                        tagClass = 'is-info';
                                                                    } else if (severityLevel.includes('delay') || severityLevel.includes('retard')) {
                                                                        tagClass = 'is-warning';
                                                                    }
                                                                    
                                                                    const message = disruption.messages && disruption.messages.length > 0 
                                                                        ? disruption.messages[0].text || disruption.messages[0].message 
                                                                        : disruption.message || severityText;
                                                                    
                                                                    return (
                                                                        <span 
                                                                            key={disIndex} 
                                                                            className={`tag ${tagClass} is-small`}
                                                                            title={message}
                                                                        >
                                                                            <span className='icon mr-1'>
                                                                                <i className='fas fa-exclamation-triangle'></i>
                                                                            </span>
                                                                            {message.length > 30 ? message.substring(0, 30) + '...' : message}
                                                                        </span>
                                                                    );
                                                                })}
                                                            </div>
                                                        ) : (
                                                            <span className='has-text-grey' style={{fontStyle: 'italic'}}>-</span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <span className='tag is-dark has-text-weight-semibold'>{Math.floor(info.duration / 60)}min</span>
                                                    </td>
                                                    <td>
                                                        {info.wagonCount ? (
                                                            <span className='tag is-info is-light'>
                                                                <span className='icon mr-1'><i className='fas fa-train'></i></span>
                                                                {info.wagonCount}
                                                            </span>
                                                        ) : (
                                                            <span className='has-text-grey' style={{fontStyle: 'italic'}}>N/A</span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <Link
                                                            to={`/trip/${tripId}`}
                                                            className='button is-small is-info is-light'
                                                            onClick={handleDetailClick}
                                                            title='Voir les détails du trajet'
                                                        >
                                                            <span className='icon'>
                                                                <i className='fas fa-info-circle'></i>
                                                            </span>
                                                        </Link>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
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
                </div>
            </section>
            <Footer />
        </>
    );
};

export default Trajet;

