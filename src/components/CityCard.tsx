import React from 'react';
import { Link } from 'react-router-dom';

interface CityCardProps {
    city: string;
}

const CityCard: React.FC<CityCardProps> = ({ city }) => {
    return (
        <Link to={city} className='city-list-item'>
            <span>{city}</span>
        </Link>
    );
};

export default CityCard;

