import React from 'react';
import CityCard from './CityCard';
import stations from '../gares.json';

interface CityCardsProps {
    searchTerm: string;
    itemsToShow: number;
}

const CityCards: React.FC<CityCardsProps> = ({ searchTerm, itemsToShow }) => {
    const cities: string[] = Object.keys(stations as Record<string, unknown>);

    // Filtrer les villes en fonction de la recherche
    const filteredCities: string[] = cities.filter((city: string) =>
        city.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Afficher seulement les premiers itemsToShow éléments
    const visibleCities: string[] = filteredCities.slice(0, itemsToShow);

    return (
        <ul className='city-list'>
            {visibleCities.map((city: string) => (
                <li key={city}>
                    <CityCard city={city} />
                </li>
            ))}
        </ul>
    );
};

export default CityCards;

