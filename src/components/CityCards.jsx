import React from 'react';
import CityCard from './CityCard';
import stations from '../gares.json';

const CityCards = ({ searchTerm, currentPage, cardsPerPage }) => {
    const cities = Object.keys(stations);

    // Filtrer les villes en fonction de la recherche
    const filteredCities = cities.filter((city) =>
        city.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastCard = currentPage * cardsPerPage;
    const indexOfFirstCard = indexOfLastCard - cardsPerPage;
    const visibleCities = filteredCities.slice(indexOfFirstCard, indexOfLastCard);

    return (
        <div className='columns is-multiline is-mobile'>
            {visibleCities.map((city) => (
                <div key={city} className='column is-6-mobile is-4-tablet is-3-desktop'>
                    <CityCard city={city} />
                </div>
            ))}
        </div>
    );
};

export default CityCards;



