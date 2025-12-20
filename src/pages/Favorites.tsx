import React, { useState, useEffect } from 'react';
import { Icon } from '../utils/iconMapping';
import Footer from '../components/Footer';
import { getFavorites, removeFavorite, type FavoriteLocation } from '../services/favoritesService';

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
                    <div className='level mb-5'>
                        <div className='level-left'>
                            <div className='level-item'>
                                <h1 className='title is-2'>
                                    <span className='icon has-text-warning mr-3'><Icon name='fa-star' size={24} /></span>
                                    Favoris
                                </h1>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className='box has-text-centered'>
                            <div className='loader-wrapper'>
                                <div className='loader is-loading'></div>
                            </div>
                            <p className='mt-4 subtitle is-5'>Chargement des favoris...</p>
                        </div>
                    ) : favorites.length === 0 ? (
                        <div className='box has-text-centered'>
                            <div className='content'>
                                <span className='icon is-large has-text-grey mb-4' style={{fontSize: '4rem'}}>⭐</span>
                                <h2 className='title is-4'>Aucun favori</h2>
                                <p className='subtitle is-6 has-text-grey'>
                                    Vous n'avez pas encore de gares favorites.
                                </p>
                                <p className='has-text-grey'>
                                    Utilisez l'étoile dans les champs de recherche pour ajouter des gares à vos favoris.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className='box'>
                            <h2 className='title is-4 mb-5'>
                                Mes gares favorites <span className='tag is-primary is-medium'>{favorites.length}</span>
                            </h2>
                            <div className='table-container'>
                                <table className='table is-fullwidth is-striped is-hoverable'>
                                    <thead>
                                        <tr>
                                            <th>Nom</th>
                                            <th>Type</th>
                                            <th>Ajouté le</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {favorites.map((favorite) => (
                                            <tr key={favorite.id}>
                                                <td>
                                                    <strong>{favorite.name}</strong>
                                                </td>
                                                <td>
                                                    <span className='tag is-dark'>
                                                        {favorite.type === 'stop_area' ? 'Gare' : 'Point d\'arrêt'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className='has-text-grey'>{formatDate(favorite.addedAt)}</span>
                                                </td>
                                                <td>
                                                    <button
                                                        className='button is-small is-danger is-light'
                                                        onClick={() => handleRemoveFavorite(favorite.id)}
                                                        title='Retirer des favoris'
                                                    >
                                                        <span className='icon'>
                                                            <Icon name='fa-trash' size={16} />
                                                        </span>
                                                        <span>Retirer</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
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

