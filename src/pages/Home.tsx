import React, { useState } from 'react';
import CityCards from '../components/CityCards';
import Footer from '../components/Footer';
import Header from '../components/Header';
import stations from '../gares.json';

const Home: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [itemsToShow, setItemsToShow] = useState<number>(12); // Nombre initial de cartes à afficher
    const itemsPerLoad: number = 12; // Nombre de cartes à charger à chaque clic sur "Load More"

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setSearchTerm(e.target.value);
        setItemsToShow(itemsPerLoad); // Réinitialiser le nombre d'éléments affichés lors de la recherche
    };

    const handleLoadMore = (): void => {
        setItemsToShow((prev) => prev + itemsPerLoad);
    };

    const cities: string[] = Object.keys(stations as Record<string, unknown>);
    const filteredCities: string[] = cities.filter((city: string) =>
        city.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const hasMoreItems: boolean = itemsToShow < filteredCities.length;

    return (
        <>
            <Header />
            <section className='section'>
                <div className='container'>
                    <h1 className='title is-2 has-text-centered mb-6'>
                        Choisissez une <span className='has-text-primary'>ville</span> pour afficher les{' '}
                        <span className='has-text-secondary'>horaires</span> des trains
                    </h1>
                    <div className='field'>
                        <div className='control has-icons-left'>
                            <input
                                className='input is-large'
                                type='text'
                                placeholder='Rechercher une gare...'
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                            <span className='icon is-left'>
                                <i className='fas fa-search'></i>
                            </span>
                        </div>
                    </div>
                    <CityCards
                        searchTerm={searchTerm}
                        itemsToShow={itemsToShow}
                    />
                    {hasMoreItems && (
                        <div className='has-text-centered mt-5'>
                            <button
                                className='button is-primary is-large'
                                onClick={handleLoadMore}
                            >
                                Charger plus
                            </button>
                        </div>
                    )}
                </div>
            </section>
            <Footer />
        </>
    );
};

export default Home;

