import React, { useState } from 'react';
import Footer from '@/components/Footer';
import { PageHeader } from '@/components/skytrip';
import QueryOverview from '@/components/shared/QueryOverview';
import GeoJSONMap from '@/components/GeoJSONMap';
import { Loader2, Calculator } from 'lucide-react';
import { getIsochrones } from '@/services/navitiaApi';
import type { CoverageCoverageIsochronesGet200Response } from '@/client/models';

interface IsochroneFeature {
    max_duration?: number;
    [key: string]: unknown;
}

const Isochrones: React.FC = () => {
    const [from, setFrom] = useState<string>('');
    const [maxDuration, setMaxDuration] = useState<string>('3600');
    const [isochrones, setIsochrones] = useState<CoverageCoverageIsochronesGet200Response | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [showResults, setShowResults] = useState<boolean>(false);

    const handleSearch = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        if (!from.trim()) {
            setError('Veuillez entrer un point de départ');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setShowResults(false);
            const data = await getIsochrones(from, null, 'sncf', {
                max_duration: parseInt(maxDuration) || 3600,
            });
            setIsochrones(data);
            setShowResults(true);
        } catch (err) {
            setError('Erreur lors du calcul des isochrones');
            console.error(err);
            setIsochrones(null);
            setShowResults(false);
        } finally {
            setLoading(false);
        }
    };

    const getQueryDisplay = (): string => {
        const durationMinutes = Math.floor(parseInt(maxDuration) / 60);
        return `${from} (${durationMinutes} min)`;
    };

    return (
        <>
            <PageHeader
                title="Isochrones"
                subtitle="Visualisez les zones accessibles selon un temps de trajet"
                showNotification={false}
                
            />
            <section className='section' style={{ 
                minHeight: showResults ? 'auto' : 'calc(100vh - 200px)',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div className='container' style={{ 
                    flex: showResults ? '0 1 auto' : '1 1 auto',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    {/* Search Form - Fullscreen when not showing results */}
                    {!showResults && (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <div className='notification is-warning mb-5'>
                                <p><strong>⚠️ Cette fonctionnalité est en version Beta</strong></p>
                            </div>

                            <div className='box mb-5' style={{ flex: 1 }}>
                                <h3 className='title is-5 mb-4'>Calculer les isochrones</h3>
                                <form onSubmit={handleSearch}>
                                    <div className='field'>
                                        <label className='label' htmlFor='from'>Point de départ</label>
                                        <div className='control'>
                                            <input
                                                id='from'
                                                className='input'
                                                type='text'
                                                value={from}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFrom(e.target.value)}
                                                placeholder='admin:fr:75056 ou 2.3522;48.8566'
                                                disabled={loading}
                                            />
                                        </div>
                                        <p className='help'>ID admin (ex: admin:fr:75056) ou coordonnées (ex: 2.3522;48.8566)</p>
                                    </div>

                                    <div className='field'>
                                        <label className='label' htmlFor='maxDuration'>Durée maximale (en secondes)</label>
                                        <div className='control'>
                                            <input
                                                id='maxDuration'
                                                className='input'
                                                type='number'
                                                value={maxDuration}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMaxDuration(e.target.value)}
                                                placeholder='3600'
                                                disabled={loading}
                                            />
                                        </div>
                                        <p className='help'>Durée maximale en secondes (ex: 3600 = 1 heure)</p>
                                    </div>

                                    <div className='field'>
                                        <div className='control'>
                                            <button type='submit' className='button is-primary' disabled={loading}>
                                                <span className='icon'>{loading ? <Loader2 size={16} className="animate-spin" /> : <Calculator size={16} />}</span>
                                                <span>{loading ? 'Calcul...' : 'Calculer les isochrones'}</span>
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>

                            {error && !loading && (
                                <div className='notification is-danger mt-4'>
                                    <button className='delete' onClick={() => setError(null)}></button>
                                    <p className='title is-5'>Erreur</p>
                                    <p>{error}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Results View - Hide search form, show results */}
                    {showResults && (
                        <>
                            {/* Compact Query Overview */}
                            <QueryOverview
                                query={getQueryDisplay()}
                                queryLabel="Isochrones"
                                onClick={() => setShowResults(false)}
                            />

                            {/* Loading state */}
                            {loading && (
                                <div className='box has-text-centered'>
                                    <div className='loader-wrapper'>
                                        <div className='loader is-loading'></div>
                                    </div>
                                    <p className='mt-4 subtitle is-5'>Calcul des isochrones...</p>
                                </div>
                            )}

                            {/* Error state */}
                            {error && !loading && (
                                <div className='notification is-danger'>
                                    <button className='delete' onClick={() => setError(null)}></button>
                                    <p className='title is-5'>Erreur</p>
                                    <p>{error}</p>
                                </div>
                            )}

                            {/* Results */}
                            {!loading && isochrones && (
                                <div className='box'>
                                    <h2 className='title is-4 mb-5'>Résultats</h2>
                                    {isochrones.isochrones && isochrones.isochrones.length > 0 && (
                                        <div className='mb-5'>
                                            <GeoJSONMap 
                                                geojsonData={isochrones.isochrones}
                                                style={(feature: unknown) => {
                                                    const props = (feature as { properties?: IsochroneFeature })?.properties;
                                                    const duration = props?.max_duration || 0;
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
                                    <div className='content mb-4'>
                                        {isochrones.isochrones && isochrones.isochrones.map((iso, index) => (
                                            <div key={index} className='box mb-3'>
                                                <strong>Isochrone {index + 1}:</strong> Durée maximale: {iso.max_duration ? `${Math.floor(iso.max_duration / 60)} minutes` : 'N/A'}
                                            </div>
                                        ))}
                                    </div>
                                    <details>
                                        <summary className='title is-6 mb-4' style={{ cursor: 'pointer' }}>
                                            Afficher les données JSON
                                        </summary>
                                        <div className='content mt-4'>
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
                                            }}>{JSON.stringify(isochrones, null, 2)}</pre>
                                        </div>
                                    </details>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>
            <Footer />
        </>
    );
};

export default Isochrones;

