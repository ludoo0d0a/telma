import React from 'react';

const FavoritesEmptyState: React.FC = () => {
    return (
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
    );
};

export default FavoritesEmptyState;

