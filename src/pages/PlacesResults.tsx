import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Footer from '@/components/Footer';
import { PageHeader } from '@/components/skytrip';
import Ad from '@/components/Ad';
import { searchPlaces, getPlacesNearby } from '@/services/navitiaApi';
import type { Place } from '@/client/models/place';
import { Loader2, ChevronLeft } from 'lucide-react';

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

const PlacesResults: React.FC = () => {
    const [places, setPlaces] = useState<Place[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const query = useQuery();
    const searchQuery = query.get('q');
    const coordQuery = query.get('coord');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            setPlaces([]);

            try {
                let data;
                if (searchQuery) {
                    data = await searchPlaces(searchQuery);
                    setPlaces(data.places || []);
                } else if (coordQuery) {
                    data = await getPlacesNearby(coordQuery);
                    setPlaces(data.stop_areas || []);
                }
            } catch (err) {
                setError('Erreur lors de la recherche');
                console.error(err);
                setPlaces([]);
            } finally {
                setLoading(false);
            }
        };

        if (searchQuery || coordQuery) {
            fetchData();
        } else {
            setError('Aucun paramètre de recherche fourni.');
        }
    }, [searchQuery, coordQuery]);

    return (
        <>
            <PageHeader
                title="Résultats de la recherche"
                subtitle="Liste des lieux trouvés"
                showNotification={false}
            />
            <section className='section'>
                <div className='container'>
                    <div className="box mb-5">
                        <Link to="/places/search" className="button is-light is-fullwidth">
                            <span className="icon"><ChevronLeft size={16} /></span>
                            <span>Afficher le formulaire de recherche</span>
                        </Link>
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
    );
};

export default PlacesResults;
