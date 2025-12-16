import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { getVehicleJourney, autocompletePT } from '../services/sncfApi';
import { parseUTCDate, getFullMinutes, calculateDelay, cleanLocationName } from '../components/Utils';

const Train = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [trainData, setTrainData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/9d3d7068-4952-4f99-89ae-6519e28eef00',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Train.jsx:12',message:'Train component render',data:{hasId:!!id,idValue:id,loading,hasTrainData:!!trainData,hasError:!!error},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    
    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const searchTimeoutRef = useRef(null);
    const wrapperRef = useRef(null);

    useEffect(() => {
        const fetchTrainDetails = async () => {
            if (!id) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                // Decode the ID if it's URL encoded
                const decodedId = decodeURIComponent(id);
                const data = await getVehicleJourney(decodedId, 'sncf');
                
                if (data.vehicle_journeys && data.vehicle_journeys.length > 0) {
                    setTrainData(data.vehicle_journeys[0]);
                } else {
                    setError('Train non trouvé');
                }
            } catch (err) {
                setError('Erreur lors de la récupération des détails du train: ' + (err.message || 'Erreur inconnue'));
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchTrainDetails();
    }, [id]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsSearchOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const searchTrains = async (query) => {
        if (!query || query.length < 2) {
            setSuggestions([]);
            setIsSearchOpen(false);
            return;
        }

        setSearchLoading(true);
        try {
            const data = await autocompletePT(query, 'sncf', 20);
            // Filter to only show vehicle_journeys and extract the vehicle_journey object
            const vehicleJourneys = (data.pt_objects || [])
                .filter(obj => obj.embedded_type === 'vehicle_journey' && obj.vehicle_journey)
                .map(obj => obj.vehicle_journey);
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

    const handleSearchChange = (e) => {
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

    const handleSelectTrain = (train) => {
        navigate(`/train/${encodeURIComponent(train.id)}`);
    };

    const formatTime = (date) => {
        if (!date) return 'N/A';
        const d = parseUTCDate(date);
        return `${d.getHours()}h${getFullMinutes(d)}`;
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        const d = parseUTCDate(date);
        const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
        const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
        return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
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
        return { icon: 'fa-train', color: 'has-text-grey', tagColor: 'is-light', label: commercialMode || 'Train' };
    };

    // Show search interface when no ID is provided
    if (!id) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/9d3d7068-4952-4f99-89ae-6519e28eef00',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Train.jsx:162',message:'Rendering search view',data:{hasHeader:true,hasFooter:true},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
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
                                                    const trainNumber = displayInfo.headsign || displayInfo.trip_short_name || train.id;
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
                                <Link to='/' className='button is-light'>
                                    Retour à l'accueil
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

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/9d3d7068-4952-4f99-89ae-6519e28eef00',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Train.jsx:308',message:'Rendering train detail view',data:{hasHeader:true,hasFooter:true,hasTrainData:!!trainData},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
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
                                    <Link to='/' className='button is-light'>
                                        <span className='icon'><i className='fas fa-arrow-left'></i></span>
                                        <span>Accueil</span>
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
                                                const baseArrival = stop.base_arrival_date_time;
                                                const realArrival = stop.arrival_date_time;
                                                const baseDeparture = stop.base_departure_date_time;
                                                const realDeparture = stop.departure_date_time;
                                                
                                                // Use arrival for intermediate stops, departure for last stop
                                                const baseTime = index === stopTimes.length - 1 ? baseDeparture : baseArrival;
                                                const realTime = index === stopTimes.length - 1 ? realDeparture : realArrival;
                                                
                                                const delay = calculateDelay(
                                                    parseUTCDate(baseTime),
                                                    parseUTCDate(realTime)
                                                );

                                                const stopPoint = stop.stop_point || {};
                                                const stopArea = stopPoint.stop_area || {};
                                                const stopName = stopPoint.name || stopArea.name || 'Gare inconnue';
                                                const platform = stopPoint.label || 'N/A';

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
                                                        <td>{formatTime(baseTime)}</td>
                                                        <td>
                                                            {realTime && realTime !== baseTime ? (
                                                                <span className='has-text-danger'>{formatTime(realTime)}</span>
                                                            ) : (
                                                                formatTime(baseTime)
                                                            )}
                                                        </td>
                                                        <td>
                                                            {delay && delay !== 'À l\'heure' ? (
                                                                <span className='tag is-danger'>{delay}</span>
                                                            ) : (
                                                                <span className='tag is-success'>À l'heure</span>
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
                                            <li><strong>Gare de départ:</strong> {cleanLocationName(stopTimes[0]?.stop_point?.name || stopTimes[0]?.stop_point?.stop_area?.name || 'N/A')}</li>
                                            <li><strong>Gare d'arrivée:</strong> {cleanLocationName(stopTimes[stopTimes.length - 1]?.stop_point?.name || stopTimes[stopTimes.length - 1]?.stop_point?.stop_area?.name || 'N/A')}</li>
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

