import React from 'react';
import { Crosshair } from 'lucide-react';
import CurrentLocationWidget from '@/components/CurrentLocationWidget';

const CurrentLocationSection: React.FC = () => {
    return (
        <div className='skytrip-search-card mb-6'>
            <h2 className='title is-3 mb-4'>
                <span className='icon mr-2'>
                    <Crosshair size={24} />
                </span>
                Votre Position Actuelle
            </h2>
            <div className='columns'>
                <div className='column is-full'>
                    <CurrentLocationWidget />
                </div>
            </div>
        </div>
    );
};

export default CurrentLocationSection;

