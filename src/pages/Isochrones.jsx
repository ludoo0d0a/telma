import React, { useState, useMemo } from 'react';
import Footer from '../components/Footer';
import Header from '../components/Header';
import GeoJSONMap from '../components/GeoJSONMap';
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
                            {isochrones.isochrones && isochrones.isochrones.length > 0 && (
                                <div className='isochrones-map' style={{ marginBottom: '2rem' }}>
                                    <GeoJSONMap 
                                        geojsonData={isochrones.isochrones}
                                        style={(feature) => {
                                            const duration = feature?.properties?.max_duration || 0;
                                            const hue = Math.max(0, 240 - (duration / 3600) * 60); // Blue to green gradient
                                            return {
                                                color: `hsl(${hue}, 70%, 50%)`,
                                                weight: 2,
                                                opacity: 0.8,
                                                fillColor: `hsl(${hue}, 70%, 50%)`,
                                                fillOpacity: 0.3
                                            };
                                        }}
                                        height={500}
                                    />
                                </div>
                            )}
                            <div className='isochrones-info' style={{ marginBottom: '1rem' }}>
                                {isochrones.isochrones && isochrones.isochrones.map((iso, index) => (
                                    <div key={index} style={{ marginBottom: '0.5rem', padding: '0.5rem', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                                        <strong>Isochrone {index + 1}:</strong> Durée maximale: {iso.max_duration ? `${Math.floor(iso.max_duration / 60)} minutes` : 'N/A'}
                                    </div>
                                ))}
                            </div>
                            <details>
                                <summary style={{ cursor: 'pointer', marginBottom: '1rem', fontWeight: 'bold' }}>
                                    Afficher les données JSON
                                </summary>
                                <div className='isochrones-content'>
                                    <pre>{JSON.stringify(isochrones, null, 2)}</pre>
                                </div>
                            </details>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default Isochrones;

