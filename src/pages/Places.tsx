import React, { useState } from 'react';
import Footer from '@/components/Footer';
import { PageHeader } from '@/components/skytrip';
import Ad from '@/components/Ad';
import QueryOverview from '@/components/shared/QueryOverview';
import { searchPlaces, getPlacesNearby } from '@/services/navitiaApi';
import type { Place } from '@/client/models/place';
import { Search, MapPin, Loader2 } from 'lucide-react';

const Places: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [coordQuery, setCoordQuery] = useState<string>('');
    const [places, setPlaces] = useState<Place[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [searchType, setSearchType] = useState<'text' | 'nearby'>('text'); // 'text' or 'nearby'
    const [showResults, setShowResults] = useState<boolean>(false);

    const handleTextSearch = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        if (!searchQuery.trim()) {
            setError('Veuillez entrer un terme de recherche');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setShowResults(false);
            const data = await searchPlaces(searchQuery);
            setPlaces(data.places || []);
            setShowResults(true);
        } catch (err) {
            setError('Erreur lors de la recherche');
            console.error(err);
            setPlaces([]);
            setShowResults(false);
        } finally {
            setLoading(false);
        }
    };

    const handleNearbySearch = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        if (!coordQuery.trim()) {
            setError('Veuillez entrer des coordonnées (format: lon;lat)');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setShowResults(false);
            const data = await getPlacesNearby(coordQuery);
            setPlaces(data.stop_areas || []);
            setShowResults(true);
        } catch (err) {
            setError('Erreur lors de la recherche');
            console.error(err);
            setPlaces([]);
            setShowResults(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <PageHeader
                title="Recherche de lieux"
                subtitle="Trouvez les gares et arrêts à proximité ou par mot-clé"
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
                            {/* Advertisement */}
                            <Ad format="horizontal" size="responsive" className="mb-5" />

                            <div className='box mb-5' style={{ flex: 1 }}>
                                <h3 className='title is-5 mb-4'>Type de recherche</h3>
                                <div className='tabs is-boxed mb-4'>
                                    <ul>
                                        <li className={searchType === 'text' ? 'is-active' : ''}>
                                            <a onClick={() => {
                                                setSearchType('text');
                                                setPlaces([]);
                                                setError(null);
                                                setShowResults(false);
                                            }}>
                                                <span className='icon is-small'><Search size={16} /></span>
                                                <span>Recherche par texte</span>
                                            </a>
                                        </li>
                                        <li className={searchType === 'nearby' ? 'is-active' : ''}>
                                            <a onClick={() => {
                                                setSearchType('nearby');
                                                setPlaces([]);
                                                setError(null);
                                                setShowResults(false);
                                            }}>
                                                <span className='icon is-small'><MapPin size={16} /></span>
                                                <span>Recherche par coordonnées</span>
                                            </a>
                                        </li>
                                    </ul>
                                </div>

                                {searchType === 'text' ? (
                                    <form onSubmit={handleTextSearch}>
                                        <div className='field'>
                                            <label className='label' htmlFor='search'>Rechercher un lieu</label>
                                            <div className='control'>
                                                <input
                                                    id='search'
                                                    className='input'
                                                    type='text'
                                                    value={searchQuery}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                                                    placeholder='Ex: Paris, Gare du Nord...'
                                                    disabled={loading}
                                                />
                                            </div>
                                        </div>
                                        <div className='field'>
                                            <div className='control'>
                                                <button type='submit' className='button is-primary' disabled={loading}>
                                                    <span className='icon'>{loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}</span>
                                                    <span>{loading ? 'Recherche...' : 'Rechercher'}</span>
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                ) : (
                                    <form onSubmit={handleNearbySearch}>
                                        <div className='field'>
                                            <label className='label' htmlFor='coord'>Coordonnées (format: lon;lat)</label>
                                            <div className='control'>
                                                <input
                                                    id='coord'
                                                    className='input'
                                                    type='text'
                                                    value={coordQuery}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCoordQuery(e.target.value)}
                                                    placeholder='Ex: 2.3522;48.8566'
                                                    disabled={loading}
                                                />
                                            </div>
                                            <p className='help'>Format: longitude;latitude (ex: 2.3522;48.8566 pour Paris)</p>
                                        </div>
                                        <div className='field'>
                                            <div className='control'>
                                                <button type='submit' className='button is-primary' disabled={loading}>
                                                    <span className='icon'>{loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}</span>
                                                    <span>{loading ? 'Recherche...' : 'Rechercher'}</span>
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                )}
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
                                query={searchType === 'text' ? searchQuery : coordQuery}
                                queryLabel={searchType === 'text' ? 'Recherche par texte' : 'Recherche par coordonnées'}
                                onClick={() => setShowResults(false)}
                            />

                            {/* Loading state */}
                            {loading && (
                                <div className='box has-text-centered'>
                                    <div className='loader-wrapper'>
                                        <div className='loader is-loading'></div>
                                    </div>
                                    <p className='mt-4 subtitle is-5'>Chargement des lieux...</p>
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
                            {!loading && places.length > 0 && (
                                <>
                                    {/* Advertisement */}
                                    <Ad format="auto" size="responsive" className="mb-5" />
                                    
                                    <div className='box'>
                                        <h2 className='title is-4 mb-5'>
                                            Résultats <span className='tag is-primary is-medium'>{places.length}</span>
                                        </h2>
                                        <div className='columns is-multiline'>
                                            {places.map((place, index) => (
                                                <div key={place.id || index} className='column is-half is-half-mobile'>
                                                    <div className='box'>
                                                        <h3 className='title is-5 mb-3'>{place.name || 'Sans nom'}</h3>
                                                        <div className='content'>
                                                            <p><strong>Type:</strong> {place.embedded_type || 'N/A'}</p>
                                                            {place.id && (
                                                                <p><strong>ID:</strong> <code>{place.id}</code></p>
                                                            )}
                                                            {place.administrative_regions && place.administrative_regions.length > 0 && (
                                                                <p><strong>Région:</strong> {place.administrative_regions[0].name}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    {/* Advertisement */}
                                    <Ad format="rectangle" size="responsive" className="mb-5" />
                                </>
                            )}

                            {/* Empty state */}
                            {!loading && places.length === 0 && !error && (searchQuery || coordQuery) && (
                                <div className='box has-text-centered'>
                                    <div className='content'>
                                        <span className='icon is-large has-text-warning mb-4' style={{fontSize: '4rem'}}>📍</span>
                                        <h2 className='title is-4'>Aucun résultat trouvé</h2>
                                        <p className='subtitle is-6 has-text-grey'>
                                            Aucun lieu ne correspond à votre recherche.
                                        </p>
                                    </div>
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

export default Places;

