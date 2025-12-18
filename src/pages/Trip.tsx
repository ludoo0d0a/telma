import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import Header from '../components/Header';
import GeoJSONMap from '../components/GeoJSONMap';
import { parseUTCDate, cleanLocationName, getTransportIcon, formatTime, formatDate, getDelay } from '../components/Utils';
import type { JourneyItem } from '../client/models/journey-item';
import type { JourneyInfo } from '../components/Utils';
import type { Disruption } from '../client/models/disruption';
import type { Section } from '../client/models/section';
import type { Coord } from '../client/models/coord';

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

    useEffect(() => {
        const loadTripData = (): void => {
            try {
                setLoading(true);
                setError(null);
                
                // Retrieve journey data from sessionStorage
                if (!tripId) {
                    setError('ID de trajet manquant');
                    setLoading(false);
                    return;
                }
                
                const storedData = sessionStorage.getItem(`trip_${tripId}`);
                if (!storedData) {
                    setError('Données du trajet non trouvées. Veuillez revenir à la recherche.');
                    setLoading(false);
                    return;
                }

                const data = JSON.parse(storedData) as TripData;
                setTripData(data);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
                setError('Erreur lors du chargement des données du trajet: ' + errorMessage);
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadTripData();
    }, [tripId]);


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
                            <p className='mt-4'>Chargement des détails du trajet...</p>
                        </div>
                    </div>
                </section>
                <Footer />
            </>
        );
    }

    if (error || !tripData) {
        return (
            <>
                <Header />
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
                            </div>
                        </div>
                    </div>
                </section>
                <Footer />
            </>
        );
    }

    const { journey, info, disruptions } = tripData;
    const sections = journey.sections || [];
    const publicTransportSections = sections.filter((s: Section) => s.type === 'public_transport');
    
    // Get all stops from all sections
    const allStops: ExtendedStopTime[] = [];
    publicTransportSections.forEach((section: Section) => {
        if (section.stop_date_times && Array.isArray(section.stop_date_times)) {
            section.stop_date_times.forEach((stopTime, index) => {
                const isFirst = index === 0;
                const isLast = index === section.stop_date_times!.length - 1;
                allStops.push({
                    ...(stopTime as ExtendedStopTime),
                    section,
                    isFirst,
                    isLast,
                    commercialMode: section.display_informations?.commercial_mode,
                    network: section.display_informations?.network,
                    trainNumber: section.display_informations?.headsign || section.display_informations?.trip_short_name
                });
            });
        }
    });

    const transportInfo = getTransportIcon(info.commercialMode, info.network);
    const depDate = parseUTCDate(info.departureTime);
    const arrDate = parseUTCDate(info.arrivalTime);

    // Get sections with geojson for map display
    const sectionsWithGeoJSON = useMemo<Section[]>(() => {
        return sections.filter((section: Section) => section.geojson);
    }, [sections]);

    // Get markers for start and end points
    const journeyMarkers = useMemo<JourneyMarker[]>(() => {
        const markers: JourneyMarker[] = [];
        if (sections.length > 0 && sections[0].from) {
            const from = sections[0].from;
            const coord: Coord | undefined = from.stop_point?.coord || from.coord;
            if (coord && coord.lat !== undefined && coord.lon !== undefined) {
                markers.push({
                    lat: coord.lat,
                    lon: coord.lon,
                    name: cleanLocationName(from.stop_point?.name || from.name || 'Départ'),
                    popup: (
                        <div>
                            <strong>{cleanLocationName(from.stop_point?.name || from.name || 'Départ')}</strong>
                            <div>Départ</div>
                        </div>
                    )
                });
            }
        }
        if (sections.length > 0) {
            const lastSection = sections[sections.length - 1];
            if (lastSection.to) {
                const to = lastSection.to;
                const coord: Coord | undefined = to.stop_point?.coord || to.coord;
                if (coord && coord.lat !== undefined && coord.lon !== undefined) {
                    markers.push({
                        lat: coord.lat,
                        lon: coord.lon,
                        name: cleanLocationName(to.stop_point?.name || to.name || 'Arrivée'),
                        popup: (
                            <div>
                                <strong>{cleanLocationName(to.stop_point?.name || to.name || 'Arrivée')}</strong>
                                <div>Arrivée</div>
                            </div>
                        )
                    });
                }
            }
        }
        return markers;
    }, [sections]);

    return (
        <>
            <Header />
            <section className='section'>
                <div className='container'>
                    <div className='level mb-5'>
                        <div className='level-left'>
                            <div className='level-item'>
                                <button 
                                    className='button is-light mr-3' 
                                    onClick={() => navigate(-1)}
                                >
                                    <span className='icon'>
                                        <i className='fas fa-arrow-left'></i>
                                    </span>
                                    <span>Retour</span>
                                </button>
                                <h1 className='title is-2'>
                                    Détails du trajet
                                </h1>
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
                                            <span className='tag is-light ml-2'>{info.network}</span>
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
                                            to={`/train/${encodeURIComponent(trainId)}`}
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
                    {sectionsWithGeoJSON.length > 0 && (
                        <div className='box mb-5'>
                            <h2 className='title is-4 mb-4'>
                                <span className='icon mr-2'>
                                    <i className='fas fa-map'></i>
                                </span>
                                Carte de l'itinéraire
                            </h2>
                            <GeoJSONMap 
                                geojsonData={sectionsWithGeoJSON}
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

