import React, { useState } from 'react';
import Footer from '../components/Footer';
import Header from '../components/Header';
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
            <Header />
            <div className='schedules-page'>
                <div className='schedules-page__content-wrapper'>
                    <h1 className='schedules-page__title'>
                        Horaires et <span>planning</span>
                    </h1>

                    <div className='schedule-tabs'>
                        <button
                            className={`tab-button ${scheduleType === 'stop' ? 'active' : ''}`}
                            onClick={() => {
                                setScheduleType('stop');
                                setSchedules(null);
                                setError(null);
                            }}
                        >
                            Horaires d'arrêt
                        </button>
                        <button
                            className={`tab-button ${scheduleType === 'route' ? 'active' : ''}`}
                            onClick={() => {
                                setScheduleType('route');
                                setSchedules(null);
                                setError(null);
                            }}
                        >
                            Horaires de ligne
                        </button>
                        <button
                            className={`tab-button ${scheduleType === 'terminus' ? 'active' : ''}`}
                            onClick={() => {
                                setScheduleType('terminus');
                                setSchedules(null);
                                setError(null);
                            }}
                        >
                            Horaires terminus
                        </button>
                    </div>

                    <form onSubmit={handleSearch} className='schedules-form'>
                        <div className='form-group'>
                            <label htmlFor='filter'>
                                Filtre (ex: stop_area.id=stop_area:SNCF:87391003 ou line.id=line:SNCF:1)
                            </label>
                            <input
                                id='filter'
                                type='text'
                                value={filter}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilter(e.target.value)}
                                placeholder='stop_area.id=stop_area:SNCF:87391003'
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
                            {loading ? 'Chargement...' : 'Rechercher'}
                        </button>
                    </form>

                    {error && (
                        <div className='error'>
                            <p>{error}</p>
                        </div>
                    )}

                    {!loading && schedules && (
                        <div className='schedules-result'>
                            <h2>Résultats</h2>
                            <div className='schedules-content'>
                                <pre>{JSON.stringify(schedules, null, 2)}</pre>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default Schedules;

