import React, { useState, useEffect } from 'react';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { getCoverage, getCoverageDetails } from '../services/navitiaApi';

const Coverage = () => {
    const [coverages, setCoverages] = useState([]);
    const [coverageResponse, setCoverageResponse] = useState(null);
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
                setCoverageResponse(data);
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

    const formatDate = (dateString) => {
        if (!dateString || dateString.length !== 8) return dateString;
        // Format YYYYMMDD to DD/MM/YYYY
        const year = dateString.substring(0, 4);
        const month = dateString.substring(4, 6);
        const day = dateString.substring(6, 8);
        return `${day}/${month}/${year}`;
    };

    const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return 'N/A';
        try {
            // Format YYYYMMDDTHHmmss to readable format
            const date = dateTimeString.substring(0, 8);
            const time = dateTimeString.substring(9);
            const formattedDate = formatDate(date);
            const hours = time.substring(0, 2);
            const minutes = time.substring(2, 4);
            const seconds = time.substring(4, 6);
            return `${formattedDate} ${hours}:${minutes}:${seconds}`;
        } catch (err) {
            return dateTimeString;
        }
    };

    const getStatusBadge = (status) => {
        if (status === 'running') {
            return <span className='coverage-status-badge coverage-status-badge--running'>En cours</span>;
        } else if (status === 'closed') {
            return <span className='coverage-status-badge coverage-status-badge--closed'>Fermé</span>;
        }
        return <span className='coverage-status-badge'>{status || 'N/A'}</span>;
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
                        <>
                            {coverageResponse?.context && (
                                <div className='coverage-context'>
                                    <h2 className='coverage-context__title'>Contexte</h2>
                                    <div className='coverage-context__content'>
                                        {coverageResponse.context.timezone && (
                                            <p><strong>Fuseau horaire:</strong> {coverageResponse.context.timezone}</p>
                                        )}
                                        {coverageResponse.context.current_datetime && (
                                            <p><strong>Date/heure actuelle:</strong> {formatDateTime(coverageResponse.context.current_datetime)}</p>
                                        )}
                                        {coverageResponse.context.car_direct_path && (
                                            <div className='coverage-context__car-path'>
                                                <strong>Chemin direct en voiture:</strong>
                                                {coverageResponse.context.car_direct_path.co2_emission && (
                                                    <p>CO₂: {coverageResponse.context.car_direct_path.co2_emission.value} {coverageResponse.context.car_direct_path.co2_emission.unit}</p>
                                                )}
                                                {coverageResponse.context.car_direct_path.air_pollutants && (
                                                    <div>
                                                        <p>Polluants atmosphériques:</p>
                                                        <ul>
                                                            {coverageResponse.context.car_direct_path.air_pollutants.values?.nox !== undefined && (
                                                                <li>NOx: {coverageResponse.context.car_direct_path.air_pollutants.values.nox} {coverageResponse.context.car_direct_path.air_pollutants.unit}</li>
                                                            )}
                                                            {coverageResponse.context.car_direct_path.air_pollutants.values?.pm !== undefined && (
                                                                <li>PM: {coverageResponse.context.car_direct_path.air_pollutants.values.pm} {coverageResponse.context.car_direct_path.air_pollutants.unit}</li>
                                                            )}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

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
                                            <div className='coverage-card__status'>
                                                {getStatusBadge(coverage.status)}
                                            </div>
                                            {coverage.start_production_date && (
                                                <p className='coverage-card__date'>
                                                    <strong>Début:</strong> {formatDate(coverage.start_production_date)}
                                                </p>
                                            )}
                                            {coverage.end_production_date && (
                                                <p className='coverage-card__date'>
                                                    <strong>Fin:</strong> {formatDate(coverage.end_production_date)}
                                                </p>
                                            )}
                                    </div>
                                ))
                            )}
                        </div>

                            {coverageResponse?.links && coverageResponse.links.length > 0 && (
                                <div className='coverage-links'>
                                    <h3 className='coverage-links__title'>Liens disponibles</h3>
                                    <div className='coverage-links__list'>
                                        {coverageResponse.links.map((link, index) => (
                                            <a
                                                key={index}
                                                href={link.href}
                                                target='_blank'
                                                rel='noopener noreferrer'
                                                className='coverage-link'
                                            >
                                                {link.type || link.rel || 'Lien'}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {selectedCoverage && (
                        <div className='coverage-details'>
                            <button
                                className='back-button'
                                onClick={() => setSelectedCoverage(null)}
                            >
                                ← Retour à la liste
                            </button>
                            
                            <div className='coverage-details__header'>
                                <h2 className='coverage-details__title'>Détails: {selectedCoverage.id}</h2>
                                {selectedCoverage.status && (
                                    <div className='coverage-details__status'>
                                        {getStatusBadge(selectedCoverage.status)}
                                    </div>
                                )}
                            </div>

                            <div className='coverage-details__content'>
                                <div className='coverage-details__section'>
                                    <h3 className='coverage-details__section-title'>Informations générales</h3>
                                    <div className='coverage-details__info-grid'>
                                        {selectedCoverage.id && (
                                            <div className='coverage-details__info-item'>
                                                <strong>ID:</strong> <code>{selectedCoverage.id}</code>
                                            </div>
                                        )}
                                        {selectedCoverage.start_production_date && (
                                            <div className='coverage-details__info-item'>
                                                <strong>Date de début de production:</strong> {formatDate(selectedCoverage.start_production_date)}
                                            </div>
                                        )}
                                        {selectedCoverage.end_production_date && (
                                            <div className='coverage-details__info-item'>
                                                <strong>Date de fin de production:</strong> {formatDate(selectedCoverage.end_production_date)}
                                            </div>
                                        )}
                                        {selectedCoverage.status && (
                                            <div className='coverage-details__info-item'>
                                                <strong>Statut:</strong> {selectedCoverage.status}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {selectedCoverage.shape && (
                                    <div className='coverage-details__section'>
                                        <h3 className='coverage-details__section-title'>Forme géographique</h3>
                                        <div className='coverage-details__shape'>
                                            <code>{selectedCoverage.shape}</code>
                                        </div>
                                    </div>
                                )}

                                {selectedCoverage.context && (
                                    <div className='coverage-details__section'>
                                        <h3 className='coverage-details__section-title'>Contexte</h3>
                                        <div className='coverage-details__context'>
                                            {selectedCoverage.context.timezone && (
                                                <p><strong>Fuseau horaire:</strong> {selectedCoverage.context.timezone}</p>
                                            )}
                                            {selectedCoverage.context.current_datetime && (
                                                <p><strong>Date/heure actuelle:</strong> {formatDateTime(selectedCoverage.context.current_datetime)}</p>
                                            )}
                                            {selectedCoverage.context.car_direct_path && (
                                                <div>
                                                    <strong>Chemin direct en voiture:</strong>
                                                    {selectedCoverage.context.car_direct_path.co2_emission && (
                                                        <p>CO₂: {selectedCoverage.context.car_direct_path.co2_emission.value} {selectedCoverage.context.car_direct_path.co2_emission.unit}</p>
                                                    )}
                                                    {selectedCoverage.context.car_direct_path.air_pollutants && (
                                                        <div>
                                                            <p>Polluants atmosphériques:</p>
                                                            <ul>
                                                                {selectedCoverage.context.car_direct_path.air_pollutants.values?.nox !== undefined && (
                                                                    <li>NOx: {selectedCoverage.context.car_direct_path.air_pollutants.values.nox} {selectedCoverage.context.car_direct_path.air_pollutants.unit}</li>
                                                                )}
                                                                {selectedCoverage.context.car_direct_path.air_pollutants.values?.pm !== undefined && (
                                                                    <li>PM: {selectedCoverage.context.car_direct_path.air_pollutants.values.pm} {selectedCoverage.context.car_direct_path.air_pollutants.unit}</li>
                                                                )}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {selectedCoverage.links && selectedCoverage.links.length > 0 && (
                                    <div className='coverage-details__section'>
                                        <h3 className='coverage-details__section-title'>Liens disponibles</h3>
                                        <div className='coverage-details__links'>
                                            {selectedCoverage.links.map((link, index) => (
                                                <a
                                                    key={index}
                                                    href={link.href}
                                                    target='_blank'
                                                    rel='noopener noreferrer'
                                                    className='coverage-link'
                                                >
                                                    {link.type || link.rel || 'Lien'} {link.templated && '(templated)'}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <details className='coverage-details__raw'>
                                    <summary className='coverage-details__raw-summary'>Afficher les données JSON brutes</summary>
                                    <div className='coverage-details__raw-content'>
                                <pre>{JSON.stringify(selectedCoverage, null, 2)}</pre>
                                    </div>
                                </details>
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

