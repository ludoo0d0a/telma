import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import Footer from '@/components/Footer';
import { getCoverage, getCoverageDetails } from '@/services/navitiaApi';
import type { CoverageResponse, Coverage } from '@/client/models';
import type { Link } from '@/client/models/link';
import type { Context } from '@/client/models/context';

interface SelectedCoverage extends Coverage {
    id: string;
    context?: Context;
    links?: Link[];
}

const CoveragePage: React.FC = () => {
    const [coverages, setCoverages] = useState<Coverage[]>([]);
    const [coverageResponse, setCoverageResponse] = useState<CoverageResponse | null>(null);
    const [selectedCoverage, setSelectedCoverage] = useState<SelectedCoverage | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCoverages = async (): Promise<void> => {
            try {
                setLoading(true);
                const data = await getCoverage();
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

    const handleCoverageClick = async (coverageId: string | undefined): Promise<void> => {
        if (!coverageId) return;
        
        try {
            setLoading(true);
            const data = await getCoverageDetails(coverageId);
            setSelectedCoverage({ id: coverageId, ...data } as SelectedCoverage);
            setError(null);
        } catch (err) {
            setError('Erreur lors du chargement des détails');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string | undefined): string => {
        if (!dateString || dateString.length !== 8) return dateString || '';
        // Format YYYYMMDD to DD/MM/YYYY
        const year = dateString.substring(0, 4);
        const month = dateString.substring(4, 6);
        const day = dateString.substring(6, 8);
        return `${day}/${month}/${year}`;
    };

    const formatDateTime = (dateTimeString: string | undefined): string => {
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

    const getStatusBadge = (status: string | undefined): React.ReactNode => {
        if (status === 'running') {
            return <span className='tag is-success'>En cours</span>;
        } else if (status === 'closed') {
            return <span className='tag is-danger'>Fermé</span>;
        }
        return <span className='tag is-light'>{status || 'N/A'}</span>;
    };

    return (
        <>
            <section className='section'>
                <div className='container'>
                    <div className='level mb-5'>
                        <div className='level-left'>
                            <div className='level-item'>
                                <h1 className='title is-2'>
                                    Zones de <span>couverture</span>
                                </h1>
                            </div>
                        </div>
                    </div>

                    {loading && !selectedCoverage && (
                        <div className='box has-text-centered'>
                            <div className='loader-wrapper'>
                                <div className='loader is-loading'></div>
                            </div>
                            <p className='mt-4 subtitle is-5'>Chargement des zones de couverture...</p>
                        </div>
                    )}

                    {error && (
                        <div className='notification is-danger'>
                            <button className='delete' onClick={() => setError(null)}></button>
                            <p className='title is-5'>Erreur</p>
                            <p>{error}</p>
                        </div>
                    )}

                    {!loading && !selectedCoverage && (
                        <>
                            {coverageResponse?.context && (
                                <div className='box mb-5'>
                                    <h2 className='title is-4 mb-4'>Contexte</h2>
                                    <div className='content'>
                                        {coverageResponse.context.timezone && (
                                            <p><strong>Fuseau horaire:</strong> {coverageResponse.context.timezone}</p>
                                        )}
                                        {coverageResponse.context.current_datetime && (
                                            <p><strong>Date/heure actuelle:</strong> {formatDateTime(coverageResponse.context.current_datetime)}</p>
                                        )}
                                        {coverageResponse.context.car_direct_path && (
                                            <div>
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

                            <div className='box'>
                                <h2 className='title is-4 mb-5'>
                                    Zones de couverture <span className='tag is-primary is-medium'>{coverages.length}</span>
                                </h2>
                                {coverages.length === 0 ? (
                                    <div className='has-text-centered'>
                                        <p className='subtitle is-5'>Aucune zone de couverture trouvée</p>
                                    </div>
                                ) : (
                                    <div className='columns is-multiline'>
                                        {coverages.map((coverage) => (
                                            <div
                                                key={coverage.id}
                                                className='column is-half-tablet is-one-third-desktop'
                                            >
                                                <div className='box is-clickable' onClick={() => handleCoverageClick(coverage.id)} style={{ cursor: 'pointer' }}>
                                                    <h3 className='title is-5 mb-3'>{coverage.id}</h3>
                                                    <div className='content'>
                                                        <div className='mb-3'>
                                                            {getStatusBadge(coverage.status)}
                                                        </div>
                                                        {coverage.start_production_date && (
                                                            <p><strong>Début:</strong> {formatDate(coverage.start_production_date)}</p>
                                                        )}
                                                        {coverage.end_production_date && (
                                                            <p><strong>Fin:</strong> {formatDate(coverage.end_production_date)}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {coverageResponse?.links && coverageResponse.links.length > 0 && (
                                    <div className='mt-5'>
                                        <h3 className='title is-5 mb-3'>Liens disponibles</h3>
                                        <div className='tags'>
                                            {coverageResponse.links.map((link, index) => (
                                                <a
                                                    key={index}
                                                    href={link.href}
                                                    target='_blank'
                                                    rel='noopener noreferrer'
                                                    className='tag is-link is-medium'
                                                >
                                                    {link.type || link.rel || 'Lien'}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {selectedCoverage && (
                        <div className='box'>
                            <div className='level mb-5'>
                                <div className='level-left'>
                                    <div className='level-item'>
                                        <button
                                            className='button is-light'
                                            onClick={() => setSelectedCoverage(null)}
                                        >
                                            <span className='icon'><ArrowLeft size={20} /></span>
                                            <span>Retour à la liste</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <div className='level mb-5'>
                                <div className='level-left'>
                                    <div className='level-item'>
                                        <h2 className='title is-3'>Détails: {selectedCoverage.id}</h2>
                                    </div>
                                </div>
                                {selectedCoverage.status && (
                                    <div className='level-right'>
                                        <div className='level-item'>
                                            {getStatusBadge(selectedCoverage.status)}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className='content'>
                                <div className='box mb-5'>
                                    <h3 className='title is-5 mb-4'>Informations générales</h3>
                                    <div className='content'>
                                        {selectedCoverage.id && (
                                            <p><strong>ID:</strong> <code>{selectedCoverage.id}</code></p>
                                        )}
                                        {selectedCoverage.start_production_date && (
                                            <p><strong>Date de début de production:</strong> {formatDate(selectedCoverage.start_production_date)}</p>
                                        )}
                                        {selectedCoverage.end_production_date && (
                                            <p><strong>Date de fin de production:</strong> {formatDate(selectedCoverage.end_production_date)}</p>
                                        )}
                                        {selectedCoverage.status && (
                                            <p><strong>Statut:</strong> {selectedCoverage.status}</p>
                                        )}
                                    </div>
                                </div>

                                {selectedCoverage.shape && (
                                    <div className='box mb-5'>
                                        <h3 className='title is-5 mb-4'>Forme géographique</h3>
                                        <div className='content'>
                                            <pre>{selectedCoverage.shape}</pre>
                                        </div>
                                    </div>
                                )}

                                {selectedCoverage.context && (
                                    <div className='box mb-5'>
                                        <h3 className='title is-5 mb-4'>Contexte</h3>
                                        <div className='content'>
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
                                    <div className='box mb-5'>
                                        <h3 className='title is-5 mb-4'>Liens disponibles</h3>
                                        <div className='tags'>
                                            {selectedCoverage.links.map((link, index) => (
                                                <a
                                                    key={index}
                                                    href={link.href}
                                                    target='_blank'
                                                    rel='noopener noreferrer'
                                                    className='tag is-link is-medium'
                                                >
                                                    {link.type || link.rel || 'Lien'} {link.templated && '(templated)'}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className='box'>
                                    <details>
                                        <summary className='title is-6 mb-4' style={{ cursor: 'pointer' }}>Afficher les données JSON brutes</summary>
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
                                            }}>{JSON.stringify(selectedCoverage, null, 2)}</pre>
                                        </div>
                                    </details>
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

export default CoveragePage;

