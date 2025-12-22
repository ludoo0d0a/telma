import React from 'react';

interface CommercialModesErrorStateProps {
    error: string;
    onDismiss: () => void;
}

const CommercialModesErrorState: React.FC<CommercialModesErrorStateProps> = ({ error, onDismiss }) => {
    return (
        <div className='notification is-danger'>
            <button className='delete' onClick={onDismiss}></button>
            <p className='title is-5'>Erreur</p>
            <p>{error}</p>
        </div>
    );
};

export default CommercialModesErrorState;

