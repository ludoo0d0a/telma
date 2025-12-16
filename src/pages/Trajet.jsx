import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import Header from '../components/Header';
import LocationAutocomplete from '../components/LocationAutocomplete';
import { getJourneys, formatDateTime } from '../services/sncfApi';
import { parseUTCDate, getFullMinutes, calculateDelay } from '../components/Utils';

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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [fromId, setFromId] = useState(null);
    const [toId, setToId] = useState(null);
    const [disruptions, setDisruptions] = useState([]);
    
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
        setFromName(station.name);
        setError(null);
        // Update URL if toId is also set
        if (toId && toName) {
            const fromSlug = encodeURIComponent(station.name.toLowerCase().replace(/\s+/g, '-'));
            const toSlug = encodeURIComponent(toName.toLowerCase().replace(/\s+/g, '-'));
            navigate(`/trajet/${fromSlug}/${toSlug}`, { replace: true });
        }
    };

    const handleToStationFound = (station) => {
        setToId(station.id);
        setToName(station.name);
        setError(null);
        // Update URL if fromId is also set
        if (fromId && fromName) {
            const fromSlug = encodeURIComponent(fromName.toLowerCase().replace(/\s+/g, '-'));
            const toSlug = encodeURIComponent(station.name.toLowerCase().replace(/\s+/g, '-'));
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

    const fetchTerTrains = async (from, to) => {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/9d3d7068-4952-4f99-89ae-6519e28eef00',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Trajet.jsx:95',message:'fetchTerTrains started',data:{from,to,filterDate,filterTime},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
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
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/9d3d7068-4952-4f99-89ae-6519e28eef00',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Trajet.jsx:120',message:'Fetching journeys',data:{day,datetime:dayDatetime,from,to},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
                // #endregion
                const data = await getJourneys(from, to, dayDatetime, 'sncf', {
                    count: 100, // Get more results
                    data_freshness: 'realtime' // Get real-time data including delays
                });
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/9d3d7068-4952-4f99-89ae-6519e28eef00',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Trajet.jsx:130',message:'Journeys received',data:{day,journeyCount:data.journeys?.length||0,hasError:!!data.error,error:data.error,disruptionsCount:data.disruptions?.length||0,disruptions:data.disruptions?.slice(0,2).map(d=>({severity:d.severity,message:d.message?.substring(0,100)})),hasDisruptions:!!data.disruptions},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
                // #endregion
                
                if (data.journeys) {
                    allJourneys.push(...data.journeys);
                }
                
                // Collect disruptions from API response
                if (data.disruptions && Array.isArray(data.disruptions)) {
                    allDisruptions.push(...data.disruptions);
                    // #region agent log
                    fetch('http://127.0.0.1:7242/ingest/9d3d7068-4952-4f99-89ae-6519e28eef00',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Trajet.jsx:150',message:'Disruption structure',data:{day,disruptionCount:data.disruptions.length,sampleDisruption:data.disruptions[0]?{severity:data.disruptions[0].severity,hasMessages:!!data.disruptions[0].messages,messagesCount:data.disruptions[0].messages?.length||0,hasImpactedObjects:!!data.disruptions[0].impacted_objects,impactedObjectsCount:data.disruptions[0].impacted_objects?.length||0,impactedStopsCount:data.disruptions[0].impacted_objects?.[0]?.impacted_stops?.length||0}:null},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
                    // #endregion
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
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/9d3d7068-4952-4f99-89ae-6519e28eef00',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Trajet.jsx:101',message:'All journeys collected',data:{totalJourneys:allJourneys.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
            // #endregion

            // Log commercial modes and networks before filtering
            const commercialModes = new Set();
            const networks = new Set();
            allJourneys.forEach(journey => {
                journey.sections?.forEach(section => {
                    if (section.type === 'public_transport' && section.display_informations) {
                        if (section.display_informations.commercial_mode) {
                            commercialModes.add(section.display_informations.commercial_mode);
                        }
                        if (section.display_informations.network) {
                            networks.add(section.display_informations.network);
                        }
                    }
                });
            });
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/9d3d7068-4952-4f99-89ae-6519e28eef00',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Trajet.jsx:115',message:'Commercial modes and networks found',data:{commercialModes:Array.from(commercialModes),networks:Array.from(networks),sampleJourney:allJourneys[0]?{sections:allJourneys[0].sections?.filter(s=>s.type==='public_transport').map(s=>({commercial_mode:s.display_informations?.commercial_mode,network:s.display_informations?.network}))}:null},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
            // #endregion

            // Show all transport types (no filtering)
            // Filter to only journeys with public_transport sections
            const allTransportTypes = filteredJourneys.filter(journey => {
                return journey.sections?.some(section => section.type === 'public_transport');
            });
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/9d3d7068-4952-4f99-89ae-6519e28eef00',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Trajet.jsx:155',message:'All transport types collected',data:{totalJourneys:allJourneys.length,transportCount:allTransportTypes.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
            // #endregion

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

            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/9d3d7068-4952-4f99-89ae-6519e28eef00',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Trajet.jsx:135',message:'Setting terTrains',data:{uniqueTrainsCount:uniqueTrains.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
            // #endregion
            setTerTrains(uniqueTrains);
        } catch (err) {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/9d3d7068-4952-4f99-89ae-6519e28eef00',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Trajet.jsx:138',message:'Error in fetchTerTrains',data:{error:err.message,stack:err.stack?.substring(0,200)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
            // #endregion
            setError('Erreur lors de la récupération des trains TER: ' + (err.message || 'Erreur inconnue'));
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (date) => {
        return `${date.getHours()}h${getFullMinutes(date)}`;
    };

    const formatDate = (date) => {
        const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
        const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
        return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]}`;
    };

    const getDelay = (baseTime, realTime) => {
        if (!baseTime || !realTime) return null;
        const base = parseUTCDate(baseTime);
        const real = parseUTCDate(realTime);
        const delayMs = real.getTime() - base.getTime();
        if (delayMs === 0) return 'À l\'heure';
        const delayMinutes = Math.floor(delayMs / (1000 * 60));
        if (delayMinutes >= 60) {
            return `+${Math.floor(delayMinutes / 60)}h${delayMinutes % 60}min`;
        }
        return `+${delayMinutes}min`;
    };

    const getTransportIcon = (commercialMode, network) => {
        const mode = (commercialMode || '').toLowerCase();
        const net = (network || '').toLowerCase();
        
        if (mode.includes('tgv') || net.includes('tgv')) {
            return { icon: 'fa-train', color: 'has-text-danger', tagColor: 'is-danger', label: 'TGV' };
        }
        if (mode.includes('intercités') || net.includes('intercités') || mode.includes('intercity')) {
            return { icon: 'fa-train', color: 'has-text-warning', tagColor: 'is-warning', label: 'Intercités' };
        }
        if (mode === 'ter' || net.includes('ter')) {
            return { icon: 'fa-train', color: 'has-text-info', tagColor: 'is-info', label: 'TER' };
        }
        if (mode === 'fluo' || net.includes('fluo')) {
            return { icon: 'fa-train', color: 'has-text-success', tagColor: 'is-success', label: 'FLUO' };
        }
        if (mode.includes('rer') || net.includes('rer')) {
            return { icon: 'fa-subway', color: 'has-text-primary', tagColor: 'is-primary', label: 'RER' };
        }
        if (mode.includes('metro') || net.includes('metro')) {
            return { icon: 'fa-subway', color: 'has-text-primary', tagColor: 'is-primary', label: 'Métro' };
        }
        if (mode.includes('tram') || net.includes('tram')) {
            return { icon: 'fa-tram', color: 'has-text-link', tagColor: 'is-link', label: 'Tram' };
        }
        if (mode.includes('bus') || net.includes('bus')) {
            return { icon: 'fa-bus', color: 'has-text-success', tagColor: 'is-success', label: 'Bus' };
        }
        // Default for other train types
        return { icon: 'fa-train', color: 'has-text-grey', tagColor: 'is-light', label: commercialMode || 'Train' };
    };

    const getWagonCount = (section) => {
        // Try to find wagon/car count from various possible fields
        // Check vehicle_journey, vehicle, or other fields that might contain this info
        if (!section) return null;
        
        // Check for vehicle_journey with vehicle information
        const vehicleJourney = section.vehicle_journey;
        if (vehicleJourney) {
            // Check if vehicle_journey has direct vehicle info
            if (vehicleJourney.vehicle) {
                const vehicle = vehicleJourney.vehicle;
                // Check for wagon count, car count, or capacity
                if (vehicle.wagon_count !== undefined) return vehicle.wagon_count;
                if (vehicle.car_count !== undefined) return vehicle.car_count;
                if (vehicle.length !== undefined) return vehicle.length;
                if (vehicle.capacity !== undefined) {
                    // Capacity might be seats, not wagons, but we can try
                    return vehicle.capacity;
                }
            }
            // Check for headsigns or other indicators
            if (vehicleJourney.headsigns) {
                // Sometimes headsigns contain train composition info
                const headsign = vehicleJourney.headsigns[0];
                if (headsign) {
                    const match = headsign.match(/(\d+)\s*(wagon|car|voiture)/i);
                    if (match) return parseInt(match[1]);
                }
            }
        }
        
        // Check for trip information
        const trip = section.trip;
        if (trip) {
            if (trip.vehicle_journey) {
                const vj = trip.vehicle_journey;
                if (vj.vehicle) {
                    const vehicle = vj.vehicle;
                    if (vehicle.wagon_count !== undefined) return vehicle.wagon_count;
                    if (vehicle.car_count !== undefined) return vehicle.car_count;
                    if (vehicle.length !== undefined) return vehicle.length;
                }
            }
        }
        
        // Check display_informations for any hints
        const displayInfo = section.display_informations;
        if (displayInfo) {
            // Check physical_mode name which might indicate train type/length
            const physicalMode = displayInfo.physical_mode;
            if (physicalMode && typeof physicalMode === 'string') {
                // Some physical modes indicate train length (e.g., "Train long", "Train court")
                const modeLower = physicalMode.toLowerCase();
                if (modeLower.includes('long')) return 'Long';
                if (modeLower.includes('court') || modeLower.includes('short')) return 'Court';
            }
            // Check additional_informations
            const additionalInfo = displayInfo.additional_informations;
            if (additionalInfo) {
                const match = additionalInfo.match(/(\d+)\s*(wagon|car|voiture)/i);
                if (match) return parseInt(match[1]);
            }
        }
        
        return null;
    };

    const getJourneyInfo = (journey) => {
        const firstSection = journey.sections?.find(s => s.type === 'public_transport');
        const lastSection = journey.sections?.slice().reverse().find(s => s.type === 'public_transport');
        
        const commercialMode = firstSection?.display_informations?.commercial_mode || '';
        const network = firstSection?.display_informations?.network || '';
        const transportInfo = getTransportIcon(commercialMode, network);
        
        // Try to get wagon count
        const wagonCount = getWagonCount(firstSection);
        
        return {
            trainNumber: firstSection?.display_informations?.headsign || 
                         firstSection?.display_informations?.trip_short_name || 
                         'N/A',
            commercialMode: commercialMode || 'Train',
            network: network,
            transportIcon: transportInfo.icon,
            transportColor: transportInfo.color,
            transportTagColor: transportInfo.tagColor,
            transportLabel: transportInfo.label,
            wagonCount: wagonCount,
            departureStation: firstSection?.from?.stop_point?.name || 
                            firstSection?.from?.stop_area?.name || 
                            fromName || 'Départ',
            arrivalStation: lastSection?.to?.stop_point?.name || 
                           lastSection?.to?.stop_area?.name || 
                           toName || 'Arrivée',
            departureTime: journey.departure_date_time,
            arrivalTime: journey.arrival_date_time,
            baseDepartureTime: firstSection?.base_departure_date_time || journey.departure_date_time,
            baseArrivalTime: lastSection?.base_arrival_date_time || journey.arrival_date_time,
            realDepartureTime: firstSection?.departure_date_time || journey.departure_date_time,
            realArrivalTime: lastSection?.arrival_date_time || journey.arrival_date_time,
            duration: journey.durations?.total || 0,
            sections: journey.sections || []
        };
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
                            <h3 className='title is-5 mb-4'>
                                <span className='icon has-text-warning mr-2'>
                                    <i className='fas fa-exclamation-triangle'></i>
                                </span>
                                Perturbations ({disruptions.length})
                            </h3>
                            {disruptions.map((disruption, index) => {
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
                                                                            {stop.name || stop.stop_point?.name || stop.stop_area?.name || stop.id || 'Arrêt inconnu'}
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
                                            <th>Durée</th>
                                            <th>Wagons</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {terTrains.map((journey, index) => {
                                            const info = getJourneyInfo(journey);
                                            const depDate = parseUTCDate(info.departureTime);
                                            const arrDate = parseUTCDate(info.arrivalTime);
                                            const depDelay = getDelay(info.baseDepartureTime, info.realDepartureTime);
                                            const arrDelay = getDelay(info.baseArrivalTime, info.realArrivalTime);
                                            
                                            return (
                                                <tr key={index}>
                                                    <td>
                                                        <span className='tag is-light'>{formatDate(depDate)}</span>
                                                    </td>
                                                    <td>
                                                        <div>
                                                            <div className='is-flex is-align-items-center mb-2'>
                                                                <span className={`icon ${info.transportColor} mr-2`}>
                                                                    <i className={`fas ${info.transportIcon}`}></i>
                                                                </span>
                                                                <strong className='has-text-primary'>{info.trainNumber}</strong>
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
                                                        {depDelay && depDelay !== 'À l\'heure' ? (
                                                            <span className='tag is-danger'>{depDelay}</span>
                                                        ) : (
                                                            <span className='tag is-success'>À l'heure</span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <span className='tag is-light'>{Math.floor(info.duration / 60)}min</span>
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

