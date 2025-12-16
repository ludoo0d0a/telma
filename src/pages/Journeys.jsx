import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { getJourneys, formatDateTime } from '../services/navitiaApi';
import { parseUTCDate, getFullMinutes, cleanLocationName, formatTime } from '../components/Utils';

const Journeys = () => {
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [datetime, setDatetime] = useState('');
    const [journeys, setJourneys] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSearch = async (e) => {
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

    const formatDuration = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        if (hours > 0) {
            return `${hours}h${minutes}min`;
        }
        return `${minutes}min`;
    };


    return (
        <>
            <Header />
            <div className='journeys'>
                <div className='journeys__content-wrapper'>
                    <h1 className='journeys__title'>
                        Recherche d'<span>itinéraires</span>
                    </h1>
                    <Link to='/' className='home__link'>
                        Accueil
                    </Link>

                    <form onSubmit={handleSearch} className='journeys__form'>
                        <div className='form-group'>
                            <label htmlFor='from'>Départ (ID admin, ex: admin:fr:75056)</label>
                            <input
                                id='from'
                                type='text'
                                value={from}
                                onChange={(e) => setFrom(e.target.value)}
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
                                onChange={(e) => setTo(e.target.value)}
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
                                onChange={(e) => setDatetime(e.target.value)}
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
                            {journeys.map((journey, index) => (
                                <div key={index} className='journey-card'>
                                    <div className='journey-card__header'>
                                        <h3>Itinéraire {index + 1}</h3>
                                        <span className='journey-card__duration'>
                                            Durée: {formatDuration(journey.durations?.total || 0)}
                                        </span>
                                    </div>
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
                                                        <span>Durée: {formatDuration(section.duration || 0)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
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

