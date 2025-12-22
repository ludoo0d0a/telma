import React from 'react';
import { getTransportIcon } from '@/services/transportService';

interface TrainInfoCardProps {
    trainNumber: string;
    commercialMode: string;
    network: string;
    direction: string;
}

const TrainInfoCard: React.FC<TrainInfoCardProps> = ({ 
    trainNumber, 
    commercialMode, 
    network, 
    direction 
}) => {
    const transportInfo = getTransportIcon(commercialMode, network);

    return (
        <div className='box has-background-light mb-5'>
            <div className='columns is-vcentered'>
                <div className='column is-narrow'>
                    <span className={`icon is-large ${transportInfo.color}`}>
                        <transportInfo.icon size={48} />
                    </span>
                </div>
                <div className='column'>
                    <h2 className='title is-3 mb-2'>{trainNumber}</h2>
                    <div className='tags'>
                        <span className={`tag ${transportInfo.tagColor} is-medium`}>
                            {transportInfo.label}
                        </span>
                        {network && network !== commercialMode && (
                            <span className='tag is-dark is-medium'>{network}</span>
                        )}
                    </div>
                    {direction && (
                        <p className='mt-2'>
                            <strong>Direction:</strong> {direction}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TrainInfoCard;

