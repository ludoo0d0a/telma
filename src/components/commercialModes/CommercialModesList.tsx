import React from 'react';
import type { CommercialMode } from '@/client/models/commercial-mode';
import CommercialModeCard from './CommercialModeCard';

interface CommercialModesListProps {
    modes: CommercialMode[];
}

const CommercialModesList: React.FC<CommercialModesListProps> = ({ modes }) => {
    if (modes.length === 0) {
        return (
            <div className='has-text-centered'>
                <p className='subtitle is-5'>Aucun mode de transport trouvé</p>
            </div>
        );
    }

    return (
        <div className='box'>
            <h2 className='title is-4 mb-5'>
                Modes disponibles <span className='tag is-primary is-medium'>{modes.length}</span>
            </h2>
            <div className='columns is-multiline'>
                {modes.map((mode) => (
                    <CommercialModeCard key={mode.id} mode={mode} />
                ))}
            </div>
        </div>
    );
};

export default CommercialModesList;

