import React, { useState, useEffect } from 'react';
import Footer from '../components/Footer';
import { getCommercialModes } from '../services/navitiaApi';
import type { CommercialMode } from '../client/models/commercial-mode';

const CommercialModes: React.FC = () => {
    const [modes, setModes] = useState<CommercialMode[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchModes = async (): Promise<void> => {
            try {
                setLoading(true);
                const response = await getCommercialModes();
                const data = response.data;
                setModes(data.commercial_modes || []);
                setError(null);
            } catch (err) {
                setError('Erreur lors du chargement des modes de transport');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchModes();
    }, []);

    return (
        <>
            <section className='section'>
                <div className='container'>
                    <div className='level mb-5'>
                        <div className='level-left'>
                            <div className='level-item'>
                                <h1 className='title is-2'>
                                    Modes de transport <span>SNCF</span>
                                </h1>
                            </div>
                        </div>
                    </div>

                    {loading && (
                        <div className='box has-text-centered'>
                            <div className='loader-wrapper'>
                                <div className='loader is-loading'></div>
                            </div>
                            <p className='mt-4 subtitle is-5'>Chargement des modes de transport...</p>
                        </div>
                    )}

                    {error && (
                        <div className='notification is-danger'>
                            <button className='delete' onClick={() => setError(null)}></button>
                            <p className='title is-5'>Erreur</p>
                            <p>{error}</p>
                        </div>
                    )}

                    {!loading && !error && (
                        <div className='box'>
                            <h2 className='title is-4 mb-5'>
                                Modes disponibles <span className='tag is-primary is-medium'>{modes.length}</span>
                            </h2>
                            {modes.length === 0 ? (
                                <div className='has-text-centered'>
                                    <p className='subtitle is-5'>Aucun mode de transport trouvé</p>
                                </div>
                            ) : (
                                <div className='columns is-multiline'>
                                    {modes.map((mode) => (
                                        <div key={mode.id} className='column is-half-tablet is-one-third-desktop is-half-mobile'>
                                            <div className='box'>
                                                <h3 className='title is-5 mb-3'>
                                                    {mode.name || 'Non spécifié'}
                                                </h3>
                                                <div className='content'>
                                                    <p><strong>ID:</strong> <code>{mode.id}</code></p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>
            <Footer />
        </>
    );
};

export default CommercialModes;

