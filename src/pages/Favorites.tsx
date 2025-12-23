
import React, { useState, useEffect } from 'react';
import { getFavorites, removeFavorite, type FavoriteLocation } from '@/services/favoritesService';
import { Star, MapPin, Loader2 } from 'lucide-react';
import FavoritesTable from '@/components/favorites/FavoritesTable';
import Footer from '@/components/Footer';
import { PageHeader } from '@/components/skytrip';

const Favorites: React.FC = () => {
    const [favorites, setFavorites] = useState<FavoriteLocation[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchFavorites = async () => {
            setLoading(true);
            const favs = await getFavorites();
            setFavorites(favs);
            setLoading(false);
        };
        fetchFavorites();
    }, []);

    const handleRemoveFavorite = async (id: string) => {
        await removeFavorite(id);
        const updatedFavorites = await getFavorites();
        setFavorites(updatedFavorites);
    };

    return (
        <>
            <PageHeader
                title="Vos favoris"
                subtitle="Retrouvez rapidement vos gares et lieux sauvegardés"
                showNotification={false}
                
            />
            <section className='section'>
                <div className='container'>
                    {loading ? (
                        <div className="has-text-centered">
                            <Loader2 className="animate-spin" size={48} />
                            <p className="is-size-4 mt-4">Chargement des favoris...</p>
                        </div>
                    ) : favorites.length > 0 ? (
                        <FavoritesTable
                            favorites={favorites}
                            onRemoveFavorite={handleRemoveFavorite}
                        />
                    ) : (
                        <div className='message is-info'>
                            <div className='message-body'>
                                <p className='is-size-5'>
                                    <MapPin className='icon' />
                                    Vous n'avez pas encore de favoris.
                                </p>
                                <p>
                                    Pour ajouter un favori, recherchez un lieu ou une gare et cliquez sur l'étoile.
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

export default Favorites;
