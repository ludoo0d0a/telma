import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '@/components/Footer';
import { PageHeader } from '@/components/skytrip';
import Ad from '@/components/Ad';
import { Search, MapPin, Loader2 } from 'lucide-react';

const PlacesSearch: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [coordQuery, setCoordQuery] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [searchType, setSearchType] = useState<'text' | 'nearby'>('text');
    const navigate = useNavigate();

    const handleTextSearch = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        if (!searchQuery.trim()) {
            setError('Veuillez entrer un terme de recherche');
            return;
        }
        setLoading(true);
        navigate(`/places/results?q=${encodeURIComponent(searchQuery)}`);
    };

    const handleNearbySearch = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        if (!coordQuery.trim()) {
            setError('Veuillez entrer des coordonnées (format: lon;lat)');
            return;
        }
        setLoading(true);
        navigate(`/places/results?coord=${encodeURIComponent(coordQuery)}`);
    };

    return (
        <>
            <PageHeader
                title="Recherche de lieux"
                subtitle="Trouvez les gares et arrêts à proximité ou par mot-clé"
                showNotification={false}
            />
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

export default PlacesSearch;
