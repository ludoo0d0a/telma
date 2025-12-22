import React from 'react';
import { Star } from 'lucide-react';

const FavoritesHeader: React.FC = () => {
    return (
        <div className='level mb-5'>
            <div className='level-left'>
                <div className='level-item'>
                    <h1 className='title is-2'>
                        <span className='icon has-text-warning mr-3'><Star size={24} /></span>
                        Favoris
                    </h1>
                </div>
            </div>
        </div>
    );
};

export default FavoritesHeader;

