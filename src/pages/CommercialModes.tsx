import React, { useState, useEffect } from 'react';
import Footer from '../components/Footer';
import Header from '../components/Header';
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
            <Header />
            <div className='commercial-modes'>
                <div className='commercial-modes__content-wrapper'>
                    <h1 className='commercial-modes__title'>
                        Modes de transport <span>SNCF</span>
                    </h1>

                    {loading && (
                        <div className='loading'>
                            <p>Chargement des modes de transport...</p>
                        </div>
                    )}

                    {error && (
                        <div className='error'>
                            <p>{error}</p>
                        </div>
                    )}

                    {!loading && !error && (
                        <div className='modes-list'>
                            {modes.length === 0 ? (
                                <p>Aucun mode de transport trouvé</p>
                            ) : (
                                modes.map((mode) => (
                                    <div key={mode.id} className='mode-card'>
                                        <h3 className='mode-card__name'>
                                            {mode.name || 'Non spécifié'}
                                        </h3>
                                        <p className='mode-card__id'>
                                            ID: {mode.id}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default CommercialModes;

