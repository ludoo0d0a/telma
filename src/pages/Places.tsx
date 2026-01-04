import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Footer from '@/components/Footer';
import { PageHeader } from '@/components/skytrip';
import Ad from '@/components/Ad';
import { searchPlaces, getPlacesNearby } from '@/services/navitiaApi';
import type { Place } from '@/client/models/place';
import { Loader2, ChevronLeft, Search, MapPin } from 'lucide-react';

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

const Places: React.FC = () => {
    const [places, setPlaces] = useState<Place[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [coordQuery, setCoordQuery] = useState<string>('');
    const [searchType, setSearchType] = useState<'text' | 'nearby'>('text');
    const [showResults, setShowResults] = useState<boolean>(false);

    const navigate = useNavigate();
    const location = useLocation();
    const query = useQuery();
    const q = query.get('q');
    const coord = query.get('coord');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            setPlaces([]);

            try {
                let data;
                if (q) {
                    data = await searchPlaces(q);
                    setPlaces(data.places || []);
                    setSearchQuery(q);
                    setShowResults(true);
                } else if (coord) {
                    data = await getPlacesNearby(coord);
                    setPlaces(data.stop_areas || []);
                    setCoordQuery(coord);
                    setShowResults(true);
                }
            } catch (err) {
                setError('Erreur lors de la recherche');
                console.error(err);
                setPlaces([]);
            } finally {
                setLoading(false);
            }
        };

        if (q || coord) {
            fetchData();
        }
    }, [location.search]);

    const handleTextSearch = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        if (!searchQuery.trim()) {
            setError('Veuillez entrer un terme de recherche');
            return;
        }
        setLoading(true);
        navigate(`/places?q=${encodeURIComponent(searchQuery)}`);
    };

    const handleNearbySearch = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        if (!coordQuery.trim()) {
            setError('Veuillez entrer des coordonnées (format: lon;lat)');
            return;
        }
        setLoading(true);
        navigate(`/places?coord=${encodeURIComponent(coordQuery)}`);
    };

    if (showResults) {
        return (
            <>
                <nav className="navbar is-fixed-top">
                    <PageHeader
                        title="Résultats de la recherche"
                        subtitle="Liste des lieux trouvés"
                        showNotification={false}
                    />
                </nav>
                <section className='section'>
                    <div className='container'>
                        <div className="box mb-5">
                            <button onClick={() => {
                                setShowResults(false);
                                navigate('/places');
                            }} className="button is-light is-fullwidth">
                                <span className="icon"><ChevronLeft size={16} /></span>
                                <span>Modifier la recherche</span>
                            </button>
                            <div className="mt-4 content is-small">
                                {searchQuery && <p><strong>Recherche:</strong> {searchQuery}</p>}
                                {coordQuery && <p><strong>Coordonnées:</strong> {coordQuery}</p>}
                            </div>
                        </div>

                        <Ad format="horizontal" size="responsive" className="mb-5" />

                        {loading && (
                            <div className='box has-text-centered'>
                                <div className='loader-wrapper'>
                                    <Loader2 size={32} className="animate-spin" />
                                </div>
                                <p className='mt-4 subtitle is-5'>Chargement des lieux...</p>
                            </div>
                        )}

                        {error && (
                            <div className='notification is-danger'>
                                <button className='delete' onClick={() => setError(null)}></button>
                                <p className='title is-5'>Erreur</p>
                                <p>{error}</p>
                            </div>
                        )}

                        {!loading && places.length > 0 && (
                            <>
                                <Ad format="auto" size="responsive" className="mb-5" />

                                <div className='box'>
                                    <h2 className='title is-4 mb-5'>
                                        Résultats <span className='tag is-primary is-medium'>{places.length}</span>
                                    </h2>
                                    <div className='columns is-multiline'>
                                        {places.map((place, index) => (
                                            <div key={place.id || index} className='column is-half'>
                                                <div className='box'>
                                                    <h3 className='title is-5 mb-3'>{place.name || 'Sans nom'}</h3>
                                                    <div className='content'>
                                                        <p><strong>Type:</strong> {place.embedded_type || 'N/A'}</p>
                                                        {place.id && <p><strong>ID:</strong> <code>{place.id}</code></p>}
                                                        {place.administrative_regions?.[0] && (
                                                            <p><strong>Région:</strong> {place.administrative_regions[0].name}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <Ad format="rectangle" size="responsive" className="mb-5" />
                            </>
                        )}

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
                    </div>
                </section>
                <Footer />
            </>
        )
    }

    return (
        <>
            <nav className="navbar is-fixed-top">
                <PageHeader
                    title="Recherche de lieux"
                    subtitle="Trouvez les gares et arrêts à proximité ou par mot-clé"
                    showNotification={false}
                />
            </nav>
            <section className='section'>
                <div className='container'>
                    <Ad format="horizontal" size="responsive" className="mb-5" />

                    <div className='box mb-5'>
                        <h3 className='title is-5 mb-4'>Type de recherche</h3>
                        <div className='tabs is-boxed mb-4'>
                            <ul>
                                <li className={searchType === 'text' ? 'is-active' : ''}>
                                    <a onClick={() => setSearchType('text')}>
                                        <span className='icon is-small'><Search size={16} /></span>
                                        <span>Recherche par texte</span>
                                    </a>
                                </li>
                                <li className={searchType === 'nearby' ? 'is-active' : ''}>
                                    <a onClick={() => setSearchType('nearby')}>
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
                     {error && (
                        <div className='notification is-danger'>
                            <button className='delete' onClick={() => setError(null)}></button>
                            <p className='title is-5'>Erreur</p>
                            <p>{error}</p>
                        </div>
                    )}
                </div>
            </section>
            <Footer />
        </>
    );
};

export default Places;
