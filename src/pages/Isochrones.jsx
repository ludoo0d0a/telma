import React, { useState } from 'react';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { getIsochrones } from '../services/navitiaApi';

const Isochrones = () => {
    const [from, setFrom] = useState('');
    const [maxDuration, setMaxDuration] = useState('3600');
    const [isochrones, setIsochrones] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!from.trim()) {
            setError('Veuillez entrer un point de départ');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const response = await getIsochrones(from, 'sncf', {
                max_duration: parseInt(maxDuration) || 3600,
            });
            const data = response.data;
            setIsochrones(data);
        } catch (err) {
            setError('Erreur lors du calcul des isochrones');
            console.error(err);
            setIsochrones(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Header />
            <div className='isochrones-page'>
                <div className='isochrones-page__content-wrapper'>
                    <h1 className='isochrones-page__title'>
                        Isochrones <span>(Beta)</span>
                    </h1>

                    <div className='beta-notice'>
                        <p>⚠️ Cette fonctionnalité est en version Beta</p>
                    </div>

                    <form onSubmit={handleSearch} className='isochrones-form'>
                        <div className='form-group'>
                            <label htmlFor='from'>Point de départ (ID admin ou coordonnées)</label>
                            <input
                                id='from'
                                type='text'
                                value={from}
                                onChange={(e) => setFrom(e.target.value)}
                                placeholder='admin:fr:75056 ou 2.3522;48.8566'
                                className='form-input'
                            />
                        </div>

                        <div className='form-group'>
                            <label htmlFor='maxDuration'>Durée maximale (en secondes)</label>
                            <input
                                id='maxDuration'
                                type='number'
                                value={maxDuration}
                                onChange={(e) => setMaxDuration(e.target.value)}
                                placeholder='3600'
                                className='form-input'
                            />
                        </div>

                        <button type='submit' className='form-button' disabled={loading}>
                            {loading ? 'Calcul...' : 'Calculer les isochrones'}
                        </button>
                    </form>

                    {error && (
                        <div className='error'>
                            <p>{error}</p>
                        </div>
                    )}

                    {!loading && isochrones && (
                        <div className='isochrones-result'>
                            <h2>Résultats</h2>
                            <div className='isochrones-content'>
                                <pre>{JSON.stringify(isochrones, null, 2)}</pre>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default Isochrones;

