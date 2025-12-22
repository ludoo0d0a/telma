import React from 'react';

const FavoritesLoadingState: React.FC = () => {
    return (
        <div className='box has-text-centered'>
            <div className='loader-wrapper'>
                <div className='loader is-loading'></div>
            </div>
            <p className='mt-4 subtitle is-5'>Chargement des favoris...</p>
        </div>
    );
};

export default FavoritesLoadingState;

