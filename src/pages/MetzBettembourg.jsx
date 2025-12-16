import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { getJourneys, formatDateTime, searchPlaces } from '../services/sncfApi';
import { parseUTCDate, getFullMinutes, calculateDelay, cleanLocationName, getTransportIcon, formatTime, formatDate, getDelay, getWagonCount, getJourneyInfo } from '../components/Utils';

const MetzBettembourg = () => {
    const [terTrains, setTerTrains] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [fromId, setFromId] = useState(null);
    const [toId, setToId] = useState(null);
    
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

    // Search for station IDs on component mount
    useEffect(() => {
        const findStations = async () => {
            try {
                // Search for Metz
                const metzResults = await searchPlaces('Metz', 'sncf', { count: 20 });
                const metzStation = metzResults.places?.find(
                    place => {
                        const name = place.name?.toLowerCase() || '';
                        return (name.includes('metz') || name.includes('gare de metz')) && 
                               (place.embedded_type === 'stop_area' || place.embedded_type === 'stop_point')
                    }
                );
                
                // Search for Bettembourg (try multiple variations)
                let bettembourgStation = null;
                const searchTerms = ['Bettembourg', 'BettembourgFrontiere', 'Bettembourg Frontiere'];
                
                for (const term of searchTerms) {
                    const results = await searchPlaces(term, 'sncf', { count: 20 });
                    bettembourgStation = results.places?.find(
                        place => {
                            const name = place.name?.toLowerCase() || '';
                            return (name.includes('bettembourg') || name.includes('frontiere')) && 
                                   (place.embedded_type === 'stop_area' || place.embedded_type === 'stop_point')
                        }
                    );
                    if (bettembourgStation) {
                        break;
                    }
                }

                if (metzStation) {
                    setFromId(metzStation.id);
                }
                if (bettembourgStation) {
                    setToId(bettembourgStation.id);
                }

                // If we found both, fetch journeys
                if (metzStation && bettembourgStation) {
                    await fetchTerTrains(metzStation.id, bettembourgStation.id);
                } else {
                    const missing = [];
                    if (!metzStation) missing.push('Metz');
                    if (!bettembourgStation) missing.push('BettembourgFrontiere');
                    setError(`Impossible de trouver les gares: ${missing.join(', ')}`);
                    setLoading(false);
                }
            } catch (err) {
                setError('Erreur lors de la recherche des gares');
                console.error(err);
                setLoading(false);
            }
        };

        findStations();
    }, []);

    const fetchTerTrains = async (from, to) => {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/9d3d7068-4952-4f99-89ae-6519e28eef00',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MetzBettembourg.jsx:75',message:'fetchTerTrains called',data:{from,to},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
        // #endregion
        try {
            setLoading(true);
            setError(null);
            
            // Build datetime from filter date and time
            const [hours, minutes] = filterTime.split(':');
            const filterDateTime = new Date(filterDate);
            filterDateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
            
            // Fetch journeys for the selected date and next 2 days
            const allJourneys = [];
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
                fetch('http://127.0.0.1:7242/ingest/9d3d7068-4952-4f99-89ae-6519e28eef00',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MetzBettembourg.jsx:110',message:'Fetching journeys',data:{day,datetime:dayDatetime,from,to},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
                // #endregion
                const data = await getJourneys(from, to, dayDatetime, 'sncf', {
                    count: 100, // Get more results
                    data_freshness: 'realtime' // Get real-time data including delays
                });
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/9d3d7068-4952-4f99-89ae-6519e28eef00',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MetzBettembourg.jsx:120',message:'Journeys received',data:{day,journeyCount:data.journeys?.length||0,hasError:!!data.error},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
                // #endregion
                
                if (data.journeys) {
                    allJourneys.push(...data.journeys);
                }
            }
            
            // Filter journeys to only show those after the filter datetime
            const filterDateTimeMs = filterDateTime.getTime();
            const filteredJourneys = allJourneys.filter(journey => {
                if (!journey.departure_date_time) return false;
                const journeyDate = parseUTCDate(journey.departure_date_time);
                return journeyDate.getTime() >= filterDateTimeMs;
            });
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/9d3d7068-4952-4f99-89ae-6519e28eef00',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MetzBettembourg.jsx:130',message:'All journeys collected and filtered',data:{totalJourneys:allJourneys.length,filteredCount:filteredJourneys.length,filterDateTime:filterDateTime.toISOString()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
            // #endregion

            // Show all transport types (no filtering)
            // Filter to only journeys with public_transport sections
            const allTransportTypes = filteredJourneys.filter(journey => {
                return journey.sections?.some(section => section.type === 'public_transport');
            });
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/9d3d7068-4952-4f99-89ae-6519e28eef00',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MetzBettembourg.jsx:115',message:'All transport types collected',data:{totalJourneys:allJourneys.length,transportCount:allTransportTypes.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
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
            fetch('http://127.0.0.1:7242/ingest/9d3d7068-4952-4f99-89ae-6519e28eef00',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MetzBettembourg.jsx:135',message:'Setting terTrains',data:{uniqueTrainsCount:uniqueTrains.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
            // #endregion
            setTerTrains(uniqueTrains);
        } catch (err) {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/9d3d7068-4952-4f99-89ae-6519e28eef00',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MetzBettembourg.jsx:138',message:'Error in fetchTerTrains',data:{error:err.message,stack:err.stack?.substring(0,200)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
            // #endregion
            setError('Erreur lors de la récupération des trains TER: ' + (err.message || 'Erreur inconnue'));
            console.error(err);
        } finally {
            setLoading(false);
        }
    };


    const handleRefresh = async () => {
        if (fromId && toId) {
            // If stations are already found, just refresh the trains
            await fetchTerTrains(fromId, toId);
        } else {
            // Otherwise, re-run the station search
            setLoading(true);
            setError(null);
            try {
                const metzResults = await searchPlaces('Metz', 'sncf', { count: 20 });
                const metzStation = metzResults.places?.find(
                    place => {
                        const name = place.name?.toLowerCase() || '';
                        return (name.includes('metz') || name.includes('gare de metz')) && 
                               (place.embedded_type === 'stop_area' || place.embedded_type === 'stop_point')
                    }
                );
                
                let bettembourgStation = null;
                const searchTerms = ['Bettembourg', 'BettembourgFrontiere', 'Bettembourg Frontiere'];
                
                for (const term of searchTerms) {
                    const results = await searchPlaces(term, 'sncf', { count: 20 });
                    bettembourgStation = results.places?.find(
                        place => {
                            const name = place.name?.toLowerCase() || '';
                            return (name.includes('bettembourg') || name.includes('frontiere')) && 
                                   (place.embedded_type === 'stop_area' || place.embedded_type === 'stop_point')
                        }
                    );
                    if (bettembourgStation) break;
                }

                if (metzStation && bettembourgStation) {
                    setFromId(metzStation.id);
                    setToId(bettembourgStation.id);
                    await fetchTerTrains(metzStation.id, bettembourgStation.id);
                } else {
                    setError('Impossible de trouver les gares');
                    setLoading(false);
                }
            } catch (err) {
                setError('Erreur lors de la recherche des gares');
                setLoading(false);
            }
        }
    };

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/9d3d7068-4952-4f99-89ae-6519e28eef00',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MetzBettembourg.jsx:194',message:'Component render',data:{loading,error:!!error,terTrainsCount:terTrains.length,fromId,toId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
    // #endregion

    return (
        <>
            <Header />
            <section className='section'>
                <div className='container'>
                    <div className='level mb-5'>
                        <div className='level-left'>
                            <div className='level-item'>
                                <h1 className='title is-2'>
                                    Trains <span className='has-text-secondary'>Metz → Bettembourg</span>
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
                        <div className='level mb-0'>
                            <div className='level-left'>
                                <div className='level-item'>
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
                                <div className='level-item'>
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
                                <div className='level-item'>
                                    <div className='field'>
                                        <label className='label'>&nbsp;</label>
                                        <div className='control'>
                                            <button
                                                className='button is-primary'
                                                onClick={() => {
                                                    if (fromId && toId) {
                                                        fetchTerTrains(fromId, toId);
                                                    }
                                                }}
                                                disabled={loading}
                                            >
                                                <span className='icon'><i className='fas fa-search'></i></span>
                                                <span>Rechercher</span>
                                            </button>
                                        </div>
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
                            <p className='mt-4 subtitle is-5'>Chargement des trains TER...</p>
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

                    {!loading && !error && terTrains.length > 0 && (
                        <div className='box'>
                            <h2 className='title is-4 mb-5'>
                                Trains TER disponibles <span className='tag is-primary is-medium'>{terTrains.length}</span>
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
                                            const info = getJourneyInfo(journey, 'Metz', 'Bettembourg');
                                            const depDate = parseUTCDate(info.departureTime);
                                            const arrDate = parseUTCDate(info.arrivalTime);
                                            const depDelay = getDelay(info.baseDepartureTime, info.realDepartureTime);
                                            const arrDelay = getDelay(info.baseArrivalTime, info.realArrivalTime);
                                            
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
                                                        {depDelay && depDelay !== 'À l\'heure' ? (
                                                            <span className='tag is-danger'>{depDelay}</span>
                                                        ) : (
                                                            <span className='tag is-success'>À l'heure</span>
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
                                <h2 className='title is-4'>Aucun train TER trouvé</h2>
                                <p className='subtitle is-6 has-text-grey'>
                                    Il n'y a actuellement aucun train TER disponible entre Metz et Bettembourg pour les prochains jours.
                                </p>
                                <div className='content has-text-left mt-5'>
                                    <div className='message is-info'>
                                        <div className='message-header'>
                                            <p>Informations</p>
                                        </div>
                                        <div className='message-body'>
                                            <ul>
                                                <li>Gare de départ: <strong>{fromId ? 'Metz (trouvée)' : 'Metz (non trouvée)'}</strong></li>
                                                <li>Gare d'arrivée: <strong>{toId ? 'BettembourgFrontiere (trouvée)' : 'BettembourgFrontiere (non trouvée)'}</strong></li>
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

export default MetzBettembourg;

