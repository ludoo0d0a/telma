import React from 'react';
import type { CommercialMode } from '@/client/models/commercial-mode';

interface CommercialModeCardProps {
    mode: CommercialMode;
}

const CommercialModeCard: React.FC<CommercialModeCardProps> = ({ mode }) => {
    return (
        <div className='column is-half-tablet is-one-third-desktop is-half-mobile'>
            <div className='box'>
                <h3 className='title is-5 mb-3'>
                    {mode.name || 'Non spécifié'}
                </h3>
                <div className='content'>
                    <p><strong>ID:</strong> <code>{mode.id}</code></p>
                </div>
            </div>
        </div>
    );
};

export default CommercialModeCard;

