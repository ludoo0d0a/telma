import React, { useState } from 'react';
import { Icon } from '../utils/iconMapping';
import Footer from '../components/Footer';
import { getStopSchedules, getRouteSchedules, getTerminusSchedules, formatDateTime } from '../services/navitiaApi';
import type { StopSchedulesResponse, RouteSchedulesResponse, TerminusSchedulesResponse } from '../client/models';

const Schedules: React.FC = () => {
    const [scheduleType, setScheduleType] = useState<'stop' | 'route' | 'terminus'>('stop'); // 'stop', 'route', 'terminus'
    const [filter, setFilter] = useState<string>('');
    const [datetime, setDatetime] = useState<string>('');
    const [schedules, setSchedules] = useState<StopSchedulesResponse | RouteSchedulesResponse | TerminusSchedulesResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        if (!filter.trim()) {
            setError('Veuillez entrer un filtre');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const searchDatetime = datetime || formatDateTime(new Date());
            let response;

            switch (scheduleType) {
                case 'stop':
                    response = await getStopSchedules(filter, 'sncf', searchDatetime);
                    break;
                case 'route':
                    response = await getRouteSchedules(filter, 'sncf', searchDatetime);
                    break;
                case 'terminus':
                    response = await getTerminusSchedules(filter, 'sncf', searchDatetime);
                    break;
                default:
                    throw new Error('Type de planning invalide');
            }

            setSchedules(response.data);
        } catch (err) {
            setError('Erreur lors de la récupération des horaires');
            console.error(err);
            setSchedules(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <section className='section'>
                <div className='container'>
                    <div className='level mb-5'>
                        <div className='level-left'>
                            <div className='level-item'>
                                <h1 className='title is-2'>
                                    Horaires et <span>planning</span>
                                </h1>
                            </div>
                        </div>
                    </div>

                    <div className='box mb-5'>
                        <h3 className='title is-5 mb-4'>Type de planning</h3>
                        <div className='tabs is-boxed mb-4'>
                            <ul>
                                <li className={scheduleType === 'stop' ? 'is-active' : ''}>
                                    <a onClick={() => {
                                        setScheduleType('stop');
                                        setSchedules(null);
                                        setError(null);
                                    }}>
                                        <span className='icon is-small'><Icon name='fa-map-marker-alt' size={16} /></span>
                                        <span>Horaires d'arrêt</span>
                                    </a>
                                </li>
                                <li className={scheduleType === 'route' ? 'is-active' : ''}>
                                    <a onClick={() => {
                                        setScheduleType('route');
                                        setSchedules(null);
                                        setError(null);
                                    }}>
                                        <span className='icon is-small'><Icon name='fa-route' size={16} /></span>
                                        <span>Horaires de ligne</span>
                                    </a>
                                </li>
                                <li className={scheduleType === 'terminus' ? 'is-active' : ''}>
                                    <a onClick={() => {
                                        setScheduleType('terminus');
                                        setSchedules(null);
                                        setError(null);
                                    }}>
                                        <span className='icon is-small'><Icon name='fa-flag-checkered' size={16} /></span>
                                        <span>Horaires terminus</span>
                                    </a>
                                </li>
                            </ul>
                        </div>

                        <form onSubmit={handleSearch}>
                            <div className='field'>
                                <label className='label' htmlFor='filter'>
                                    Filtre
                                </label>
                                <div className='control'>
                                    <input
                                        id='filter'
                                        className='input'
                                        type='text'
                                        value={filter}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilter(e.target.value)}
                                        placeholder='stop_area.id=stop_area:SNCF:87391003 ou line.id=line:SNCF:1'
                                        disabled={loading}
                                    />
                                </div>
                                <p className='help'>
                                    Exemples: stop_area.id=stop_area:SNCF:87391003 ou line.id=line:SNCF:1
                                </p>
                            </div>

                            <div className='field'>
                                <label className='label' htmlFor='datetime'>
                                    Date et heure (optionnel)
                                </label>
                                <div className='control'>
                                    <input
                                        id='datetime'
                                        className='input'
                                        type='text'
                                        value={datetime}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDatetime(e.target.value)}
                                        placeholder='20250113T152944'
                                        disabled={loading}
                                    />
                                </div>
                                <p className='help'>Format: YYYYMMDDTHHmmss (ex: 20250113T152944)</p>
                            </div>

                            <div className='field'>
                                <div className='control'>
                                    <button type='submit' className='button is-primary' disabled={loading}>
                                        <span className='icon'><i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-search'}`}></i></span>
                                        <span>{loading ? 'Chargement...' : 'Rechercher'}</span>
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>

                    {loading && (
                        <div className='box has-text-centered'>
                            <div className='loader-wrapper'>
                                <div className='loader is-loading'></div>
                            </div>
                            <p className='mt-4 subtitle is-5'>Chargement des horaires...</p>
                        </div>
                    )}

                    {error && (
                        <div className='notification is-danger'>
                            <button className='delete' onClick={() => setError(null)}></button>
                            <p className='title is-5'>Erreur</p>
                            <p>{error}</p>
                        </div>
                    )}

                    {!loading && schedules && (
                        <div className='box'>
                            <h2 className='title is-4 mb-5'>Résultats</h2>
                            <div className='content'>
                                <div className='table-container'>
                                    <pre style={{
                                        background: 'rgba(0, 0, 0, 0.3)',
                                        borderRadius: '10px',
                                        padding: '1.5rem',
                                        overflow: 'auto',
                                        color: '#ccc',
                                        fontFamily: "'Roboto Mono', monospace",
                                        fontSize: '0.9rem',
                                        whiteSpace: 'pre-wrap',
                                        wordWrap: 'break-word'
                                    }}>{JSON.stringify(schedules, null, 2)}</pre>
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

export default Schedules;

