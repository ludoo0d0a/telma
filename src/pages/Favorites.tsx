import React, { useState, useEffect } from 'react';
import Footer from '@/components/Footer';
import {
    FavoritesHeader,
    FavoritesLoadingState,
    FavoritesEmptyState,
    FavoritesTable
} from '@/components/favorites';
import { getFavorites, removeFavorite, type FavoriteLocation } from '@/services/favoritesService';

const Favorites: React.FC = () => {
    const [favorites, setFavorites] = useState<FavoriteLocation[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        loadFavorites();
    }, []);

    const loadFavorites = (): void => {
        setLoading(true);
        const favs = getFavorites();
        setFavorites(favs);
        setLoading(false);
    };

    const handleRemoveFavorite = (id: string): void => {
        removeFavorite(id);
        loadFavorites();
    };

    const formatDate = (dateString: string | undefined): string => {
        if (!dateString) return 'Date inconnue';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return 'Date inconnue';
        }
    };

    return (
        <>
            <section className='section'>
                <div className='container'>
                    <FavoritesHeader />

                    {loading ? (
                        <FavoritesLoadingState />
                    ) : favorites.length === 0 ? (
                        <FavoritesEmptyState />
                    ) : (
                        <FavoritesTable
                            favorites={favorites}
                            onRemove={handleRemoveFavorite}
                            formatDate={formatDate}
                        />
                    )}
                </div>
            </section>
            <Footer />
        </>
    );
};

export default Favorites;

