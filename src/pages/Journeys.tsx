import React, { useState } from 'react';
import Footer from '../components/Footer';
import Header from '../components/Header';
import GeoJSONMap from '../components/GeoJSONMap';
import { getJourneys, formatDateTime } from '../services/navitiaApi';
import { parseUTCDate, formatTime } from '../components/Utils';
import { cleanLocationName } from '../services/locationService';
import type { JourneyItem } from '../client/models/journey-item';
import type { Section } from '../client/models/section';
import type { Coord } from '../client/models/coord';

interface JourneyMarker {
    lat: number;
    lon: number;
    name: string | null | undefined;
    popup: React.ReactNode;
}

const Journeys: React.FC = () => {
    const [from, setFrom] = useState<string>('');
    const [to, setTo] = useState<string>('');
    const [datetime, setDatetime] = useState<string>('');
    const [journeys, setJourneys] = useState<JourneyItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        if (!from || !to) {
            setError('Veuillez remplir les champs de départ et d\'arrivée');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const searchDatetime = datetime || formatDateTime(new Date());
            const response = await getJourneys(from, to, searchDatetime);
            const data = response.data;
            setJourneys(data.journeys || []);
        } catch (err) {
            setError('Erreur lors de la recherche d\'itinéraires');
            console.error(err);
            setJourneys([]);
        } finally {
            setLoading(false);
        }
    };

    const formatDuration = (seconds: number | undefined): string => {
        const sec = seconds || 0;
        const hours = Math.floor(sec / 3600);
        const minutes = Math.floor((sec % 3600) / 60);
        if (hours > 0) {
            return `${hours}h${minutes}min`;
        }
        return `${minutes}min`;
    };

    // Helper function to get sections with geojson for a journey
    const getJourneySectionsWithGeoJSON = (journey: JourneyItem): Section[] => {
        return (journey.sections || []).filter((section: Section) => section.geojson);
    };

    // Helper function to get markers for journey start/end
    const getJourneyMarkers = (journey: JourneyItem): JourneyMarker[] => {
        const markers: JourneyMarker[] = [];
        const sections = journey.sections || [];
        
        // Start marker
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

        // End marker
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
    };


    return (
        <>
            <Header />
            <div className='journeys'>
                <div className='journeys__content-wrapper'>
                    <h1 className='journeys__title'>
                        Recherche d'<span>itinéraires</span>
                    </h1>

                    <form onSubmit={handleSearch} className='journeys__form'>
                        <div className='form-group'>
                            <label htmlFor='from'>Départ (ID admin, ex: admin:fr:75056)</label>
                            <input
                                id='from'
                                type='text'
                                value={from}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFrom(e.target.value)}
                                placeholder='admin:fr:75056'
                                className='form-input'
                            />
                        </div>

                        <div className='form-group'>
                            <label htmlFor='to'>Arrivée (ID admin, ex: admin:fr:69123)</label>
                            <input
                                id='to'
                                type='text'
                                value={to}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTo(e.target.value)}
                                placeholder='admin:fr:69123'
                                className='form-input'
                            />
                        </div>

                        <div className='form-group'>
                            <label htmlFor='datetime'>
                                Date et heure (optionnel, format: YYYYMMDDTHHmmss)
                            </label>
                            <input
                                id='datetime'
                                type='text'
                                value={datetime}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDatetime(e.target.value)}
                                placeholder='20250113T152944'
                                className='form-input'
                            />
                        </div>

                        <button type='submit' className='form-button' disabled={loading}>
                            {loading ? 'Recherche...' : 'Rechercher'}
                        </button>
                    </form>

                    {error && (
                        <div className='error'>
                            <p>{error}</p>
                        </div>
                    )}

                    {!loading && journeys.length > 0 && (
                        <div className='journeys-list'>
                            <h2>Itinéraires trouvés ({journeys.length})</h2>
                            {journeys.map((journey, index) => {
                                const sectionsWithGeoJSON = getJourneySectionsWithGeoJSON(journey);
                                const hasGeoJSON = sectionsWithGeoJSON.length > 0;
                                const markers = getJourneyMarkers(journey);
                                
                                return (
                                <div key={index} className='journey-card'>
                                    <div className='journey-card__header'>
                                        <h3>Itinéraire {index + 1}</h3>
                                        <span className='journey-card__duration'>
                                            Durée: {formatDuration(journey.durations?.total)}
                                        </span>
                                    </div>
                                    {hasGeoJSON && (
                                        <div className='journey-card__map' style={{ marginBottom: '1rem' }}>
                                            <GeoJSONMap 
                                                geojsonData={sectionsWithGeoJSON}
                                                markers={markers}
                                                height={350}
                                            />
                                        </div>
                                    )}
                                    <div className='journey-card__sections'>
                                        {journey.sections?.map((section, sectionIndex) => (
                                            <div key={sectionIndex} className='journey-section'>
                                                {section.type === 'public_transport' && (
                                                    <>
                                                        <div className='section-info'>
                                                            <span className='section-mode'>
                                                                {section.display_informations?.commercial_mode || 'Transport'}
                                                            </span>
                                                            <span className='section-line'>
                                                                {section.display_informations?.headsign || ''}
                                                            </span>
                                                        </div>
                                                        <div className='section-times'>
                                                            <span>
                                                                {cleanLocationName(section.from?.stop_point?.name || 'Départ')}:{' '}
                                                                {section.departure_date_time
                                                                    ? formatTime(parseUTCDate(section.departure_date_time), ':')
                                                                    : 'N/A'}
                                                            </span>
                                                            <span>
                                                                {cleanLocationName(section.to?.stop_point?.name || 'Arrivée')}:{' '}
                                                                {section.arrival_date_time
                                                                    ? formatTime(parseUTCDate(section.arrival_date_time), ':')
                                                                    : 'N/A'}
                                                            </span>
                                                        </div>
                                                    </>
                                                )}
                                                {section.type === 'transfer' && (
                                                    <div className='section-transfer'>
                                                        <span>Correspondance</span>
                                                        <span>Durée: {formatDuration(section.duration)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                );
                            })}
                        </div>
                    )}

                    {!loading && journeys.length === 0 && !error && (
                        <div className='no-results'>
                            <p>Aucun itinéraire trouvé. Essayez avec d'autres identifiants.</p>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default Journeys;

