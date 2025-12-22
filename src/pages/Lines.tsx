import React, { useState, useEffect } from 'react';
import Footer from '@/components/Footer';
import { ArrowDown } from 'lucide-react';
import { getLines } from '@/services/navitiaApi';
import type { Line } from '@/client/models/line';

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
                const data = await getLines('sncf', { start_page: page, count: 25 });
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
            <section className='section'>
                <div className='container'>
                    <div className='level mb-5'>
                        <div className='level-left'>
                            <div className='level-item'>
                                <h1 className='title is-2'>
                                    Lignes de <span>transport</span>
                                </h1>
                            </div>
                        </div>
                    </div>

                    {loading && lines.length === 0 && (
                        <div className='box has-text-centered'>
                            <div className='loader-wrapper'>
                                <div className='loader is-loading'></div>
                            </div>
                            <p className='mt-4 subtitle is-5'>Chargement des lignes...</p>
                        </div>
                    )}

                    {error && (
                        <div className='notification is-danger'>
                            <button className='delete' onClick={() => setError(null)}></button>
                            <p className='title is-5'>Erreur</p>
                            <p>{error}</p>
                        </div>
                    )}

                    {!loading && lines.length > 0 && (
                        <div className='box'>
                            <h2 className='title is-4 mb-5'>
                                Lignes disponibles <span className='tag is-primary is-medium'>{lines.length}</span>
                            </h2>
                            <div className='columns is-multiline'>
                                {lines.map((line) => (
                                    <div key={line.id} className='column is-half-tablet is-one-third-desktop is-half-mobile'>
                                        <div className='box'>
                                            <h3 className='title is-5 mb-3'>
                                                {line.name || line.code || 'Sans nom'}
                                            </h3>
                                            <div className='content'>
                                                <p><strong>ID:</strong> <code>{line.id}</code></p>
                                                {line.commercial_mode && typeof line.commercial_mode === 'object' && 'name' in line.commercial_mode && (
                                                    <p><strong>Mode:</strong> {(line.commercial_mode as { name?: string }).name}</p>
                                                )}
                                                {line.network && typeof line.network === 'object' && 'name' in line.network && (
                                                    <p><strong>Réseau:</strong> {(line.network as { name?: string }).name}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {hasMore && !loading && (
                        <div className='has-text-centered mt-5'>
                            <button
                                className='button is-primary'
                                onClick={() => setPage((prev) => prev + 1)}
                            >
                                <span className='icon'><ArrowDown size={20} /></span>
                                <span>Charger plus</span>
                            </button>
                        </div>
                    )}

                    {loading && lines.length > 0 && (
                        <div className='box has-text-centered'>
                            <div className='loader-wrapper'>
                                <div className='loader is-loading'></div>
                            </div>
                            <p className='mt-4'>Chargement...</p>
                        </div>
                    )}
                </div>
            </section>
            <Footer />
        </>
    );
};

export default Lines;

