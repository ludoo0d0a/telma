import React from 'react';
import CityCard from './CityCard';
import stations from '../gares.json';

interface CityCardsProps {
    searchTerm: string;
    currentPage: number;
    cardsPerPage: number;
}

const CityCards: React.FC<CityCardsProps> = ({ searchTerm, currentPage, cardsPerPage }) => {
    const cities: string[] = Object.keys(stations as Record<string, unknown>);

    // Filtrer les villes en fonction de la recherche
    const filteredCities: string[] = cities.filter((city: string) =>
        city.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastCard: number = currentPage * cardsPerPage;
    const indexOfFirstCard: number = indexOfLastCard - cardsPerPage;
    const visibleCities: string[] = filteredCities.slice(indexOfFirstCard, indexOfLastCard);

    return (
        <div className='columns is-multiline is-mobile'>
            {visibleCities.map((city: string) => (
                <div key={city} className='column is-6-mobile is-4-tablet is-3-desktop'>
                    <CityCard city={city} currentPage={currentPage} />
                </div>
            ))}
        </div>
    );
};

export default CityCards;

