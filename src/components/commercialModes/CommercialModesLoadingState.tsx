import React from 'react';

const CommercialModesLoadingState: React.FC = () => {
    return (
        <div className='box has-text-centered'>
            <div className='loader-wrapper'>
                <div className='loader is-loading'></div>
            </div>
            <p className='mt-4 subtitle is-5'>Chargement des modes de transport...</p>
        </div>
    );
};

export default CommercialModesLoadingState;

