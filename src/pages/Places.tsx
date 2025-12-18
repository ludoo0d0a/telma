import React, { useState } from 'react';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { searchPlaces, getPlacesNearby } from '../services/navitiaApi';
import type { Place } from '../client/models/place';

const Places: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [coordQuery, setCoordQuery] = useState<string>('');
    const [places, setPlaces] = useState<Place[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [searchType, setSearchType] = useState<'text' | 'nearby'>('text'); // 'text' or 'nearby'

    const handleTextSearch = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        if (!searchQuery.trim()) {
            setError('Veuillez entrer un terme de recherche');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const response = await searchPlaces(searchQuery);
            const data = response.data;
            setPlaces(data.places || []);
        } catch (err) {
            setError('Erreur lors de la recherche');
            console.error(err);
            setPlaces([]);
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
            const response = await getPlacesNearby(coordQuery);
            const data = response.data;
            setPlaces(data.places || []);
        } catch (err) {
            setError('Erreur lors de la recherche');
            console.error(err);
            setPlaces([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Header />
            <div className='places-page'>
                <div className='places-page__content-wrapper'>
                    <h1 className='places-page__title'>
                        Recherche de <span>lieux</span>
                    </h1>

                    <div className='search-tabs'>
                        <button
                            className={`tab-button ${searchType === 'text' ? 'active' : ''}`}
                            onClick={() => {
                                setSearchType('text');
                                setPlaces([]);
                                setError(null);
                            }}
                        >
                            Recherche par texte
                        </button>
                        <button
                            className={`tab-button ${searchType === 'nearby' ? 'active' : ''}`}
                            onClick={() => {
                                setSearchType('nearby');
                                setPlaces([]);
                                setError(null);
                            }}
                        >
                            Recherche par coordonnées
                        </button>
                    </div>

                    {searchType === 'text' ? (
                        <form onSubmit={handleTextSearch} className='places-form'>
                            <div className='form-group'>
                                <label htmlFor='search'>Rechercher un lieu</label>
                                <input
                                    id='search'
                                    type='text'
                                    value={searchQuery}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                                    placeholder='Ex: Paris, Gare du Nord...'
                                    className='form-input'
                                />
                            </div>
                            <button type='submit' className='form-button' disabled={loading}>
                                {loading ? 'Recherche...' : 'Rechercher'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleNearbySearch} className='places-form'>
                            <div className='form-group'>
                                <label htmlFor='coord'>Coordonnées (format: lon;lat)</label>
                                <input
                                    id='coord'
                                    type='text'
                                    value={coordQuery}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCoordQuery(e.target.value)}
                                    placeholder='Ex: 2.3522;48.8566'
                                    className='form-input'
                                />
                            </div>
                            <button type='submit' className='form-button' disabled={loading}>
                                {loading ? 'Recherche...' : 'Rechercher'}
                            </button>
                        </form>
                    )}

                    {error && (
                        <div className='error'>
                            <p>{error}</p>
                        </div>
                    )}

                    {!loading && places.length > 0 && (
                        <div className='places-list'>
                            <h2>Résultats ({places.length})</h2>
                            {places.map((place, index) => (
                                <div key={place.id || index} className='place-card'>
                                    <h3 className='place-card__name'>{place.name || 'Sans nom'}</h3>
                                    <p className='place-card__type'>Type: {place.embedded_type || 'N/A'}</p>
                                    {place.id && (
                                        <p className='place-card__id'>ID: {place.id}</p>
                                    )}
                                    {place.administrative_regions && place.administrative_regions.length > 0 && (
                                        <p className='place-card__region'>
                                            Région: {place.administrative_regions[0].name}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {!loading && places.length === 0 && !error && (
                        <div className='no-results'>
                            <p>Aucun résultat trouvé</p>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default Places;

