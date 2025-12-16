import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { getCommercialModes } from '../services/navitiaApi';

const CommercialModes = () => {
    const [modes, setModes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchModes = async () => {
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
                    <Link to='/' className='home__link'>
                        Accueil
                    </Link>

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

