import React, { useState, useEffect } from 'react';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { getCoverage, getCoverageDetails } from '../services/navitiaApi';

const Coverage = () => {
    const [coverages, setCoverages] = useState([]);
    const [selectedCoverage, setSelectedCoverage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCoverages = async () => {
            try {
                setLoading(true);
                const response = await getCoverage();
                const data = response.data;
                setCoverages(data.regions || []);
                setError(null);
            } catch (err) {
                setError('Erreur lors du chargement des zones de couverture');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchCoverages();
    }, []);

    const handleCoverageClick = async (coverageId) => {
        try {
            setLoading(true);
            const response = await getCoverageDetails(coverageId);
            const data = response.data;
            setSelectedCoverage({ id: coverageId, ...data });
            setError(null);
        } catch (err) {
            setError('Erreur lors du chargement des détails');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Header />
            <div className='coverage-page'>
                <div className='coverage-page__content-wrapper'>
                    <h1 className='coverage-page__title'>
                        Zones de <span>couverture</span>
                    </h1>

                    {loading && !selectedCoverage && (
                        <div className='loading'>
                            <p>Chargement des zones de couverture...</p>
                        </div>
                    )}

                    {error && (
                        <div className='error'>
                            <p>{error}</p>
                        </div>
                    )}

                    {!loading && !selectedCoverage && (
                        <div className='coverages-list'>
                            {coverages.length === 0 ? (
                                <p>Aucune zone de couverture trouvée</p>
                            ) : (
                                coverages.map((coverage) => (
                                    <div
                                        key={coverage.id}
                                        className='coverage-card'
                                        onClick={() => handleCoverageClick(coverage.id)}
                                    >
                                        <h3 className='coverage-card__name'>{coverage.id}</h3>
                                        <p className='coverage-card__status'>
                                            Statut: {coverage.status || 'N/A'}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {selectedCoverage && (
                        <div className='coverage-details'>
                            <button
                                className='back-button'
                                onClick={() => setSelectedCoverage(null)}
                            >
                                ← Retour
                            </button>
                            <h2>Détails: {selectedCoverage.id}</h2>
                            <div className='details-content'>
                                <pre>{JSON.stringify(selectedCoverage, null, 2)}</pre>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default Coverage;

