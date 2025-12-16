import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { getJourneys, formatDateTime, searchPlaces } from '../services/sncfApi';
import { parseUTCDate, getFullMinutes, calculateDelay } from '../components/Utils';

const MetzBettembourg = () => {
    const [terTrains, setTerTrains] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [fromId, setFromId] = useState(null);
    const [toId, setToId] = useState(null);
    const [datetime, setDatetime] = useState(formatDateTime(new Date()));

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
            
            // Fetch journeys for today and next few days to get all TER trains
            const allJourneys = [];
            const today = new Date();
            
            // Fetch for today and next 2 days
            for (let day = 0; day < 3; day++) {
                const date = new Date(today);
                date.setDate(date.getDate() + day);
                date.setHours(0, 0, 0, 0);
                
                const searchDatetime = formatDateTime(date);
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/9d3d7068-4952-4f99-89ae-6519e28eef00',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MetzBettembourg.jsx:90',message:'Fetching journeys',data:{day,datetime:searchDatetime},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
                // #endregion
                const data = await getJourneys(from, to, searchDatetime, 'sncf', {
                    count: 100, // Get more results
                    data_freshness: 'realtime' // Get real-time data including delays
                });
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/9d3d7068-4952-4f99-89ae-6519e28eef00',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MetzBettembourg.jsx:95',message:'Journeys received',data:{day,journeyCount:data.journeys?.length||0,hasError:!!data.error},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
                // #endregion
                
                if (data.journeys) {
                    allJourneys.push(...data.journeys);
                }
            }
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/9d3d7068-4952-4f99-89ae-6519e28eef00',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MetzBettembourg.jsx:101',message:'All journeys collected',data:{totalJourneys:allJourneys.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
            // #endregion

            // Filter for TER trains only
            const terOnly = allJourneys.filter(journey => {
                return journey.sections?.some(section => 
                    section.type === 'public_transport' &&
                    (section.display_informations?.commercial_mode?.toLowerCase() === 'ter' ||
                     section.display_informations?.network?.toLowerCase()?.includes('ter'))
                );
            });
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/9d3d7068-4952-4f99-89ae-6519e28eef00',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MetzBettembourg.jsx:110',message:'TER filtering done',data:{totalJourneys:allJourneys.length,terCount:terOnly.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
            // #endregion

            // Remove duplicates and sort by departure time
            const uniqueTrains = [];
            const seenIds = new Set();
            
            terOnly.forEach(journey => {
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

    const getJourneyInfo = (journey) => {
        const firstSection = journey.sections?.find(s => s.type === 'public_transport');
        const lastSection = journey.sections?.slice().reverse().find(s => s.type === 'public_transport');
        
        return {
            trainNumber: firstSection?.display_informations?.headsign || 
                         firstSection?.display_informations?.trip_short_name || 
                         'N/A',
            commercialMode: firstSection?.display_informations?.commercial_mode || 'TER',
            network: firstSection?.display_informations?.network || '',
            departureStation: firstSection?.from?.stop_point?.name || 
                            firstSection?.from?.stop_area?.name || 
                            'Metz',
            arrivalStation: lastSection?.to?.stop_point?.name || 
                           lastSection?.to?.stop_area?.name || 
                           'Bettembourg',
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
                                    Trains TER <span className='has-text-secondary'>Metz → Bettembourg</span>
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
                            <div className='level-item'>
                                <Link to='/' className='button is-light'>
                                    <span className='icon'><i className='fas fa-home'></i></span>
                                    <span>Accueil</span>
                                </Link>
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
                                                            <strong className='has-text-primary'>{info.trainNumber}</strong>
                                                            <br />
                                                            <span className='tag is-warning is-light'>{info.commercialMode}</span>
                                                            {info.network && (
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

