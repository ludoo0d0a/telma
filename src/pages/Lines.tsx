import React, { useState, useEffect } from 'react';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { getLines } from '../services/navitiaApi';
import type { Line } from '../client/models/line';

const Lines: React.FC = () => {
    const [lines, setLines] = useState<Line[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState<number>(0);
    const [hasMore, setHasMore] = useState<boolean>(true);

    useEffect(() => {
        const fetchLines = async (): Promise<void> => {
            try {
                setLoading(true);
                const response = await getLines('sncf', { start_page: page, count: 25 });
                const data = response.data;
                const newLines = data.lines || [];
                setLines((prev) => (page === 0 ? newLines : [...prev, ...newLines]));
                setHasMore(newLines.length === 25);
                setError(null);
            } catch (err) {
                setError('Erreur lors du chargement des lignes');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchLines();
    }, [page]);

    return (
        <>
            <Header />
            <div className='lines-page'>
                <div className='lines-page__content-wrapper'>
                    <h1 className='lines-page__title'>
                        Lignes de <span>transport</span>
                    </h1>

                    {loading && lines.length === 0 && (
                        <div className='loading'>
                            <p>Chargement des lignes...</p>
                        </div>
                    )}

                    {error && (
                        <div className='error'>
                            <p>{error}</p>
                        </div>
                    )}

                    {!loading && lines.length > 0 && (
                        <div className='lines-list'>
                            {lines.map((line) => (
                                <div key={line.id} className='line-card'>
                                    <h3 className='line-card__name'>
                                        {line.name || line.code || 'Sans nom'}
                                    </h3>
                                    <p className='line-card__id'>ID: {line.id}</p>
                                    {line.commercial_mode && typeof line.commercial_mode === 'object' && 'name' in line.commercial_mode && (
                                        <p className='line-card__mode'>
                                            Mode: {(line.commercial_mode as { name?: string }).name}
                                        </p>
                                    )}
                                    {line.network && typeof line.network === 'object' && 'name' in line.network && (
                                        <p className='line-card__network'>
                                            Réseau: {(line.network as { name?: string }).name}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {hasMore && !loading && (
                        <button
                            className='load-more-button'
                            onClick={() => setPage((prev) => prev + 1)}
                        >
                            Charger plus
                        </button>
                    )}

                    {loading && lines.length > 0 && (
                        <div className='loading'>
                            <p>Chargement...</p>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default Lines;

