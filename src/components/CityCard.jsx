import React from 'react';
import { Link } from 'react-router-dom';

const CityCard = ({ city, currentPage }) => {
    // Placeholder image path
    const defaultImagePath = '/telma/images/default.webp';

    return (
        <Link to={`${city}?page=${currentPage}`} className='card has-background-primary'>
            <div className='card-image'>
                <figure className='image is-4by3'>
                    <img
                        type='image/webp'
                        src={`/telma/images/${city}.webp`}
                        alt={city}
                        onError={(e) => {
                            e.target.src = defaultImagePath; // Set default image if the specific image fails to load
                        }}
                    />
                </figure>
            </div>
            <div className='card-content has-text-centered'>
                <p className='title is-5 has-text-white'>{city}</p>
            </div>
        </Link>
    );
};

export default CityCard;



