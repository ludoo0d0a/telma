import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CityCards from '../components/CityCards';
import Footer from '../components/Footer';
import Header from '../components/Header';
import stations from '../gares.json';

const Home = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const cardsPerPage = 12; // Nombre de cartes par page
    const maxPageNumbers = 8; // Nombre maximal de numéros de page à afficher

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Réinitialiser la page lors de la recherche
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const cities = Object.keys(stations);
    const filteredCities = cities.filter((city) =>
        city.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPageCount = Math.ceil(filteredCities.length / cardsPerPage);

    useEffect(() => {
        // Assurez-vous que la page actuelle est valide
        if (currentPage < 1) setCurrentPage(1);
        if (currentPage > totalPageCount) setCurrentPage(totalPageCount);
    }, [currentPage, totalPageCount]);

    // Calculer les numéros de page à afficher dynamiquement
    const calculatePageNumbersToDisplay = () => {
        if (totalPageCount <= maxPageNumbers) {
            // Si le nombre total de pages est inférieur ou égal à maxPageNumbers,
            // afficher toutes les pages.
            return Array.from({ length: totalPageCount }, (_, index) => index + 1);
        } else {
            // Sinon, déterminez quels numéros de page afficher en fonction de la position actuelle
            if (currentPage <= maxPageNumbers - Math.floor(maxPageNumbers / 2)) {
                // Afficher les premières maxPageNumbers pages
                return Array.from({ length: maxPageNumbers }, (_, index) => index + 1);
            } else if (currentPage >= totalPageCount - Math.floor(maxPageNumbers / 2)) {
                // Afficher les dernières maxPageNumbers pages
                return Array.from(
                    { length: maxPageNumbers },
                    (_, index) => totalPageCount - maxPageNumbers + index + 1
                );
            } else {
                // Afficher les pages autour de la page actuelle
                return Array.from(
                    { length: maxPageNumbers },
                    (_, index) => currentPage - Math.floor(maxPageNumbers / 2) + index
                );
            }
        }
    };

    const pageNumbersToDisplay = calculatePageNumbersToDisplay();

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
                        currentPage={currentPage}
                        cardsPerPage={cardsPerPage}
                    />
                    <nav className='pagination is-centered mt-5' role='navigation' aria-label='pagination'>
                        <Link
                            to={`?page=${currentPage - 1}`}
                            className={`pagination-previous ${currentPage === 1 ? 'is-disabled' : ''}`}
                            onClick={(e) => {
                                if (currentPage === 1) e.preventDefault();
                                else handlePageChange(currentPage - 1);
                            }}
                        >
                            Précédent
                        </Link>
                        <Link
                            to={`?page=${currentPage + 1}`}
                            className={`pagination-next ${currentPage === totalPageCount ? 'is-disabled' : ''}`}
                            onClick={(e) => {
                                if (currentPage === totalPageCount) e.preventDefault();
                                else handlePageChange(currentPage + 1);
                            }}
                        >
                            Suivant
                        </Link>
                        <ul className='pagination-list'>
                            {pageNumbersToDisplay.map((pageNumber) => (
                                <li key={pageNumber}>
                                    <Link
                                        to={`?page=${pageNumber}`}
                                        className={`pagination-link ${currentPage === pageNumber ? 'is-current' : ''}`}
                                        onClick={() => handlePageChange(pageNumber)}
                                    >
                                        {pageNumber}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>
            </section>
            <Footer />
        </>
    );
};

export default Home;





