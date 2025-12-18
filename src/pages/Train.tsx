import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import Header from '../components/Header';
import TrainWaypointsMap from '../components/TrainWaypointsMap';
import { getVehicleJourney, autocompletePT } from '../services/navitiaApi';
import { parseUTCDate, calculateDelay, cleanLocationName, getTransportIcon, formatTime } from '../components/Utils';
import type { VehicleJourney } from '../client/models/vehicle-journey';
import type { DisplayInformation } from '../client/models/display-information';
import type { StopTime } from '../client/models/stop-time';
import type { Place } from '../client/models/place';

interface ExtendedVehicleJourney extends VehicleJourney {
    display_informations?: DisplayInformation;
    stop_times?: Array<StopTime & {
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
}

interface Waypoint {
    lat: number;
    lon: number;
    name: string | null | undefined;
    isStart: boolean;
    isEnd: boolean;
}

const Train: React.FC = () => {
    const { id } = useParams<{ id?: string }>();
    const navigate = useNavigate();
    const [trainData, setTrainData] = useState<ExtendedVehicleJourney | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    
    // Search state
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [suggestions, setSuggestions] = useState<ExtendedVehicleJourney[]>([]);
    const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
    const [searchLoading, setSearchLoading] = useState<boolean>(false);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchTrainDetails = async (): Promise<void> => {
            if (!id) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                // Decode the ID if it's URL encoded
                const decodedId = decodeURIComponent(id);
                const response = await getVehicleJourney(decodedId, 'sncf');
                const data = response.data;
                
                if (data.vehicle_journeys && data.vehicle_journeys.length > 0) {
                    setTrainData(data.vehicle_journeys[0] as ExtendedVehicleJourney);
                } else {
                    setError('Train non trouvé');
                }
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
                setError('Erreur lors de la récupération des détails du train: ' + errorMessage);
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchTrainDetails();
    }, [id]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent): void => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsSearchOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const searchTrains = async (query: string): Promise<void> => {
        if (!query || query.length < 2) {
            setSuggestions([]);
            setIsSearchOpen(false);
            return;
        }

        setSearchLoading(true);
        try {
            const response = await autocompletePT(query, 'sncf', 20);
            const data = response.data;
            // Filter to only show vehicle_journeys and extract the vehicle_journey object
            const vehicleJourneys = (data.pt_objects || [])
                .filter((obj: { embedded_type?: string; vehicle_journey?: unknown }) => 
                    obj.embedded_type === 'vehicle_journey' && obj.vehicle_journey
                )
                .map((obj: { vehicle_journey?: unknown }) => obj.vehicle_journey as ExtendedVehicleJourney);
            setSuggestions(vehicleJourneys);
            setIsSearchOpen(vehicleJourneys.length > 0);
        } catch (err) {
            console.error('Error searching trains:', err);
            setSuggestions([]);
            setIsSearchOpen(false);
        } finally {
            setSearchLoading(false);
        }
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const value = e.target.value;
        setSearchQuery(value);
        
        // Clear previous timeout
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
        
        // Debounce search
        searchTimeoutRef.current = setTimeout(() => {
            if (value.length >= 2) {
                searchTrains(value);
            } else {
                setSuggestions([]);
                setIsSearchOpen(false);
            }
        }, 300);
    };

    const handleSelectTrain = (train: ExtendedVehicleJourney): void => {
        if (train.id) {
            navigate(`/train/${encodeURIComponent(train.id)}`);
        }
    };


    // Show search interface when no ID is provided
    if (!id) {
        return (
            <>
                <Header />
                <section className='section'>
                    <div className='container'>
                        <div className='box'>
                            <h1 className='title is-2 mb-5'>Rechercher un train</h1>
                            <p className='subtitle is-5 mb-5'>
                                Recherchez un train par son numéro ou son type (TGV, TER, etc.)
                            </p>
                            
                            <div className='field' ref={wrapperRef}>
                                <label className='label'>Numéro ou type de train</label>
                                <div className='control has-icons-right'>
                                    <input
                                        className='input is-large'
                                        type='text'
                                        value={searchQuery}
                                        onChange={handleSearchChange}
                                        onFocus={() => {
                                            if (suggestions.length > 0) {
                                                setIsSearchOpen(true);
                                            }
                                        }}
                                        placeholder='Ex: 1234, TGV, TER...'
                                    />
                                    {searchLoading && (
                                        <span className='icon is-right'>
                                            <i className='fas fa-spinner fa-spin'></i>
                                        </span>
                                    )}
                                    {!searchLoading && searchQuery && (
                                        <span className='icon is-right'>
                                            <i className='fas fa-search'></i>
                                        </span>
                                    )}
                                </div>
                                {isSearchOpen && suggestions.length > 0 && (
                                    <div className='dropdown is-active' style={{ width: '100%', position: 'relative' }}>
                                        <div className='dropdown-menu' style={{ width: '100%' }}>
                                            <div className='dropdown-content' style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                                {suggestions.map((train, index) => {
                                                    const displayInfo = train.display_informations || {};
                                                    const trainNumber = displayInfo.headsign || displayInfo.trip_short_name || train.id || '';
                                                    const commercialMode = displayInfo.commercial_mode || '';
                                                    const network = displayInfo.network || '';
                                                    const direction = displayInfo.direction || '';
                                                    const transportInfo = getTransportIcon(commercialMode, network);
                                                    
                                                    return (
                                                        <a
                                                            key={train.id || index}
                                                            className='dropdown-item'
                                                            onClick={() => handleSelectTrain(train)}
                                                            style={{ cursor: 'pointer' }}
                                                        >
                                                            <div className='is-flex is-align-items-center'>
                                                                <span className={`icon ${transportInfo.color} mr-3`}>
                                                                    <i className={`fas ${transportInfo.icon}`}></i>
                                                                </span>
                                                                <div style={{ flex: 1 }}>
                                                                    <div className='is-flex is-align-items-center'>
                                                                        <strong className='mr-2'>{trainNumber}</strong>
                                                                        <span className={`tag ${transportInfo.tagColor} is-light is-small`}>
                                                                            {transportInfo.label}
                                                                        </span>
                                                                    </div>
                                                                    {direction && (
                                                                        <small className='has-text-grey'>{direction}</small>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </a>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {searchQuery.length >= 2 && !searchLoading && suggestions.length === 0 && (
                                    <p className='help has-text-grey mt-2'>Aucun train trouvé</p>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
                <Footer />
            </>
        );
    }

    if (loading) {
        return (
            <>
                <Header />
                <section className='section'>
                    <div className='container'>
                        <div className='box has-text-centered'>
                            <span className='icon is-large'>
                                <i className='fas fa-spinner fa-spin fa-3x'></i>
                            </span>
                            <p className='mt-4'>Chargement des détails du train...</p>
                        </div>
                    </div>
                </section>
                <Footer />
            </>
        );
    }

    if (error || !trainData) {
        return (
            <>
                <Header />
                <section className='section'>
                    <div className='container'>
                        <div className='box has-text-centered'>
                            <span className='icon is-large has-text-danger'>
                                <i className='fas fa-exclamation-triangle fa-3x'></i>
                            </span>
                            <p className='mt-4 has-text-danger'>{error || 'Train non trouvé'}</p>
                            <div className='buttons is-centered mt-4'>
                                <Link to='/train' className='button is-primary'>
                                    Rechercher un autre train
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
                <Footer />
            </>
        );
    }

    const displayInfo = trainData.display_informations || {};
    const stopTimes = trainData.stop_times || [];
    const commercialMode = displayInfo.commercial_mode || '';
    const network = displayInfo.network || '';
    const transportInfo = getTransportIcon(commercialMode, network);
    const trainNumber = displayInfo.headsign || displayInfo.trip_short_name || 'N/A';
    const direction = displayInfo.direction || '';

    const waypoints: Waypoint[] = (stopTimes || [])
        .map((stop, index) => {
            const stopPoint = stop?.stop_point || {};
            const stopArea = (stopPoint as { stop_area?: { name?: string | null; coord?: { lat?: number; lon?: number } } }).stop_area || {};
            const coord = (stopPoint as { coord?: { lat?: number; lon?: number } }).coord || stopArea?.coord;
            const lat = coord?.lat;
            const lon = coord?.lon;

            if (typeof lat !== 'number' || typeof lon !== 'number') return null;
            if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;

            return {
                lat,
                lon,
                name: cleanLocationName((stopPoint as { name?: string | null }).name || stopArea?.name || `Arrêt ${index + 1}`),
                isStart: index === 0,
                isEnd: index === stopTimes.length - 1,
            };
        })
        .filter((w): w is Waypoint => w !== null)
        // drop consecutive duplicates (happens with some datasets)
        .filter((w, idx, arr) => idx === 0 || w.lat !== arr[idx - 1].lat || w.lon !== arr[idx - 1].lon);

    return (
        <>
            <Header />
            <section className='section'>
                <div className='container'>
                    <div className='box'>
                        <div className='level mb-5'>
                            <div className='level-left'>
                                <div className='level-item'>
                                    <h1 className='title is-2'>Détails du train</h1>
                                </div>
                            </div>
                            <div className='level-right'>
                                <div className='level-item'>
                                    <Link to='/train' className='button is-light mr-2'>
                                        <span className='icon'><i className='fas fa-search'></i></span>
                                        <span>Rechercher</span>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Train Header Info */}
                        <div className='box has-background-light mb-5'>
                            <div className='columns is-vcentered'>
                                <div className='column is-narrow'>
                                    <span className={`icon is-large ${transportInfo.color}`}>
                                        <i className={`fas ${transportInfo.icon} fa-3x`}></i>
                                    </span>
                                </div>
                                <div className='column'>
                                    <h2 className='title is-3 mb-2'>{trainNumber}</h2>
                                    <div className='tags'>
                                        <span className={`tag ${transportInfo.tagColor} is-medium`}>
                                            {transportInfo.label}
                                        </span>
                                        {network && network !== commercialMode && (
                                            <span className='tag is-light is-medium'>{network}</span>
                                        )}
                                    </div>
                                    {direction && (
                                        <p className='mt-2'>
                                            <strong>Direction:</strong> {direction}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Map / Waypoints */}
                        {waypoints.length > 0 && (
                            <div className='box'>
                                <h3 className='title is-4 mb-4'>Parcours</h3>
                                <TrainWaypointsMap waypoints={waypoints} />
                                <p className='help mt-3'>
                                    Waypoints basés sur les coordonnées (<code>lat/lon</code>) des arrêts du train.
                                </p>
                            </div>
                        )}

                        {/* Stop Times Table */}
                        {stopTimes.length > 0 && (
                            <div className='box'>
                                <h3 className='title is-4 mb-4'>Arrêts et horaires</h3>
                                <div className='table-container'>
                                    <table className='table is-fullwidth is-striped is-hoverable'>
                                        <thead>
                                            <tr>
                                                <th>Gare</th>
                                                <th>Horaire prévu</th>
                                                <th>Horaire réel</th>
                                                <th>Retard</th>
                                                <th>Quai/Voie</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {stopTimes.map((stop, index) => {
                                                const extendedStop = stop as NonNullable<ExtendedVehicleJourney['stop_times']>[0];
                                                const baseArrival = extendedStop?.base_arrival_date_time;
                                                const realArrival = extendedStop?.arrival_date_time;
                                                const baseDeparture = extendedStop?.base_departure_date_time;
                                                const realDeparture = extendedStop?.departure_date_time;
                                                
                                                // Use arrival for intermediate stops, departure for last stop
                                                const baseTime = index === stopTimes.length - 1 ? baseDeparture : baseArrival;
                                                const realTime = index === stopTimes.length - 1 ? realDeparture : realArrival;

                                                // Only calculate delay if both times are available
                                                let delay: string | null = null;
                                                if (baseTime && realTime) {
                                                    try {
                                                        delay = calculateDelay(
                                                            parseUTCDate(baseTime),
                                                            parseUTCDate(realTime)
                                                        );
                                                    } catch (err) {
                                                        delay = null;
                                                    }
                                                }

                                                const stopPoint = extendedStop?.stop_point || {};
                                                const stopArea = (stopPoint as { stop_area?: { name?: string | null } }).stop_area || {};
                                                const stopName = (stopPoint as { name?: string | null }).name || stopArea?.name || 'Gare inconnue';
                                                const platform = (stopPoint as { label?: string | null }).label || 'N/A';

                                                return (
                                                    <tr key={index}>
                                                        <td>
                                                            <strong>{stopName}</strong>
                                                            {index === 0 && (
                                                                <span className='tag is-success is-light ml-2'>Départ</span>
                                                            )}
                                                            {index === stopTimes.length - 1 && (
                                                                <span className='tag is-danger is-light ml-2'>Arrivée</span>
                                                            )}
                                                        </td>
                                                        <td>{baseTime ? formatTime(parseUTCDate(baseTime)) : 'N/A'}</td>
                                                        <td>
                                                            {realTime && realTime !== baseTime ? (
                                                                <span className='has-text-danger'>{formatTime(parseUTCDate(realTime))}</span>
                                                            ) : baseTime ? (
                                                                formatTime(parseUTCDate(baseTime))
                                                            ) : (
                                                                'N/A'
                                                            )}
                                                        </td>
                                                        <td>
                                                            {delay ? (
                                                                delay !== 'À l\'heure' && delay !== 'à l\'heure' ? (
                                                                    <span className='tag is-danger'>{delay}</span>
                                                                ) : (
                                                                    <span className='tag is-success'>À l'heure</span>
                                                                )
                                                            ) : (
                                                                <span className='tag is-light'>N/A</span>
                                                            )}
                                                        </td>
                                                        <td>{platform}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Additional Information */}
                        <div className='box'>
                            <h3 className='title is-4 mb-4'>Informations complémentaires</h3>
                            <div className='content'>
                                <ul>
                                    <li><strong>ID du train:</strong> <code>{trainData.id}</code></li>
                                    {displayInfo.physical_mode && (
                                        <li><strong>Mode de transport:</strong> {displayInfo.physical_mode}</li>
                                    )}
                                    {displayInfo.commercial_mode && (
                                        <li><strong>Mode commercial:</strong> {displayInfo.commercial_mode}</li>
                                    )}
                                    {displayInfo.network && (
                                        <li><strong>Réseau:</strong> {displayInfo.network}</li>
                                    )}
                                    {stopTimes.length > 0 && (
                                        <>
                                            <li><strong>Nombre d'arrêts:</strong> {stopTimes.length}</li>
                                            <li><strong>Gare de départ:</strong> {cleanLocationName((stopTimes[0] as NonNullable<ExtendedVehicleJourney['stop_times']>[0])?.stop_point?.name || (stopTimes[0] as NonNullable<ExtendedVehicleJourney['stop_times']>[0])?.stop_point?.stop_area?.name || 'N/A')}</li>
                                            <li><strong>Gare d'arrivée:</strong> {cleanLocationName((stopTimes[stopTimes.length - 1] as NonNullable<ExtendedVehicleJourney['stop_times']>[0])?.stop_point?.name || (stopTimes[stopTimes.length - 1] as NonNullable<ExtendedVehicleJourney['stop_times']>[0])?.stop_point?.stop_area?.name || 'N/A')}</li>
                                        </>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <Footer />
        </>
    );
};

export default Train;

