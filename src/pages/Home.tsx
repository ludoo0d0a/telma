import React from 'react';
import { Link } from 'react-router-dom';
import LoginButton from '../components/LoginButton';
import Footer from '../components/Footer';
import CurrentLocationWidget from '../components/CurrentLocationWidget';
import Ad from '../components/Ad';
import { LogIn, Crosshair, LayoutGrid, Route, List, Code, Train, MapPin, Clock, BarChart3, Map, Circle, Star, Bus, ArrowRight, Bookmark, Book } from 'lucide-react';

interface DashboardCard {
    title: string;
    description: string;
    path: string;
    icon: React.ComponentType<{ size?: number | string; className?: string }>;
    color?: 'primary' | 'secondary';
}

const Home: React.FC = () => {
    const mainPages: DashboardCard[] = [
        {
            title: 'Train',
            description: 'Rechercher et suivre les trains',
            path: '/train',
            icon: Train,
            color: 'primary'
        },
        {
            title: 'Places',
            description: 'Rechercher des lieux et gares',
            path: '/places',
            icon: MapPin
        },
        {
            title: 'Lignes',
            description: 'Explorer les lignes de transport',
            path: '/lines',
            icon: Route
        },
        {
            title: 'Horaires',
            description: 'Consulter les horaires',
            path: '/schedules',
            icon: Clock
        },
        {
            title: 'Rapports',
            description: 'Voir les rapports et statistiques',
            path: '/reports',
            icon: BarChart3
        },
        {
            title: 'Couverture',
            description: 'Carte de couverture du réseau',
            path: '/coverage',
            icon: Map
        },
        {
            title: 'Isochrones',
            description: 'Visualiser les isochrones',
            path: '/isochrones',
            icon: Circle
        },
        {
            title: 'Favoris',
            description: 'Vos favoris sauvegardés',
            path: '/favorites',
            icon: Star
        },
        {
            title: 'Modes Commerciaux',
            description: 'Types de transport disponibles',
            path: '/commercial-modes',
            icon: Bus
        }
    ];

    const sampleRoutes: DashboardCard[] = [
        {
            title: 'Bettembourg → Metz',
            description: 'Exemple de trajet',
            path: '/itinerary/bettembourg/metz',
            icon: ArrowRight,
            color: 'secondary'
        },
        {
            title: 'Metz → Thionville',
            description: 'Exemple de trajet',
            path: '/itinerary/metz/thionville',
            icon: ArrowRight,
            color: 'secondary'
        },
        {
            title: 'Choose your trip',
            description: 'Sample 1',
            path: '/sample1',
            icon: ArrowRight,
            color: 'secondary'
        },
        {
            title: 'Saved Flights',
            description: 'Sample 2',
            path: '/sample2',
            icon: Bookmark,
            color: 'secondary'
        },
        {
            title: 'Select Flight',
            description: 'Sample 3',
            path: '/sample3',
            icon: Bookmark,
            color: 'secondary'
        }
    ];

    const sampleTrips: DashboardCard[] = [
        {
            title: 'Train SNCF 88769',
            description: 'Exemple de trajet détaillé - 18 décembre 2025',
            path: '/trip/dmVoaWNsZV9qb3VybmV5OlNOQ0Y6MjAyNS0xMi0xODo4ODc2OT',
            icon: Train,
            color: 'secondary'
        },
        {
            title: 'Train SNCF 88786',
            description: 'Exemple de trajet détaillé - 19 décembre 2025',
            path: '/trip/dmVoaWNsZV9qb3VybmV5OlNOQ0Y6MjAyNS0xMi0xOTo4ODc4Nj',
            icon: Train,
            color: 'secondary'
        }
    ];

    const apiDocs: DashboardCard[] = [
        {
            title: 'API Documentation',
            description: 'Documentation Swagger de l\'API',
            path: '/api-docs',
            icon: Book,
            color: 'primary'
        }
    ];

    return (
        <>
            <section className='section'>
                <div className='container'>
                    <div className='has-text-centered mb-6'>
                        <h1 className='title is-1 mb-4'>
                            Dashboard
                        </h1>
                        <p className='subtitle is-4 has-text-secondary'>
                            Accédez rapidement aux principales fonctionnalités
                        </p>
                    </div>

                    {/* Authentication Section */}
                    <div className='mb-6'>
                        <h2 className='title is-3 mb-4'>
                            <span className='icon mr-2'>
                                <LogIn size={24} />
                            </span>
                            Authentification
                        </h2>
                        <div className='columns is-centered'>
                            <div className='column is-half has-text-centered'>
                                <p className='mb-4'>Connectez-vous pour accéder à des fonctionnalités supplémentaires.</p>
                                <LoginButton />
                            </div>
                        </div>
                    </div>

                    {/* Current Location Widget */}
                    <div className='mb-6'>
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

                    {/* Advertisement */}
                    <Ad format="horizontal" size="responsive" className="mb-6" />

                    {/* Main Pages Section */}
                    <div className='mb-6'>
                        <h2 className='title is-3 mb-4'>
                            <span className='icon mr-2'>
                                <LayoutGrid size={24} />
                            </span>
                            Pages Principales
                        </h2>
                        <div className='columns is-multiline'>
                            {mainPages.map((page) => (
                                <div key={page.path} className='column is-one-third-tablet is-half-mobile'>
                                    <Link to={page.path} className='dashboard-card-link'>
                                        <div className={`card dashboard-card ${page.color === 'primary' ? 'has-background-primary' : ''}`}>
                                            <div className='card-content'>
                                                <div className='media'>
                                                    <div className='media-left'>
                                                        <span className={`icon is-large ${page.color === 'primary' ? 'has-text-white' : ''}`}>
                                                            <page.icon size={32} />
                                                        </span>
                                                    </div>
                                                    <div className='media-content'>
                                                        <p className={`title is-5 ${page.color === 'primary' ? 'has-text-white' : ''}`}>
                                                            {page.title}
                                                        </p>
                                                        <p className={`subtitle is-6 ${page.color === 'primary' ? 'has-text-white' : 'has-text-secondary'}`}>
                                                            {page.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Advertisement */}
                    <Ad format="horizontal" size="responsive" className="mb-6" />

                    {/* Sample Routes Section */}
                    <div className='mb-6'>
                        <h2 className='title is-3 mb-4'>
                            <span className='icon mr-2'>
                                <Route size={24} />
                            </span>
                            Exemples de Trajets
                        </h2>
                        <div className='columns is-multiline'>
                            {sampleRoutes.map((route) => (
                                <div key={route.path} className='column is-half-tablet is-half-mobile'>
                                    <Link to={route.path} className='dashboard-card-link'>
                                        <div className={`card dashboard-card ${route.color === 'secondary' ? 'has-background-secondary' : ''}`}>
                                            <div className='card-content'>
                                                <div className='media'>
                                                    <div className='media-left'>
                                                        <span className={`icon is-large ${route.color === 'secondary' ? 'has-text-white' : ''}`}>
                                                            <route.icon size={32} />
                                                        </span>
                                                    </div>
                                                    <div className='media-content'>
                                                        <p className={`title is-5 ${route.color === 'secondary' ? 'has-text-white' : ''}`}>
                                                            {route.title}
                                                        </p>
                                                        <p className={`subtitle is-6 ${route.color === 'secondary' ? 'has-text-white' : 'has-text-secondary'}`}>
                                                            {route.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Advertisement */}
                    <Ad format="horizontal" size="responsive" className="mb-6" />

                    {/* Sample Trips Section */}
                    <div className='mb-6'>
                        <h2 className='title is-3 mb-4'>
                            <span className='icon mr-2'>
                                <List size={24} />
                            </span>
                            Exemples de Trajets Détaillés
                        </h2>
                        <div className='columns is-multiline'>
                            {sampleTrips.map((trip) => (
                                <div key={trip.path} className='column is-half-tablet is-full-mobile'>
                                    <Link to={trip.path} className='dashboard-card-link'>
                                        <div className={`card dashboard-card ${trip.color === 'secondary' ? 'has-background-secondary' : ''}`}>
                                            <div className='card-content'>
                                                <div className='media'>
                                                    <div className='media-left'>
                                                        <span className={`icon is-large ${trip.color === 'secondary' ? 'has-text-white' : ''}`}>
                                                            <trip.icon size={32} />
                                                        </span>
                                                    </div>
                                                    <div className='media-content'>
                                                        <p className={`title is-5 ${trip.color === 'secondary' ? 'has-text-white' : ''}`}>
                                                            {trip.title}
                                                        </p>
                                                        <p className={`subtitle is-6 ${trip.color === 'secondary' ? 'has-text-white' : 'has-text-secondary'}`}>
                                                            {trip.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Advertisement */}
                    <Ad format="horizontal" size="responsive" className="mb-6" />

                    {/* API Documentation Section */}
                    <div className='mb-6'>
                        <h2 className='title is-3 mb-4'>
                            <span className='icon mr-2'>
                                <Code size={24} />
                            </span>
                            Documentation
                        </h2>
                        <div className='columns'>
                            {apiDocs.map((doc) => (
                                <div key={doc.path} className='column is-half-tablet is-half-mobile'>
                                    <Link to={doc.path} className='dashboard-card-link'>
                                        <div className={`card dashboard-card ${doc.color === 'primary' ? 'has-background-primary' : ''}`}>
                                            <div className='card-content'>
                                                <div className='media'>
                                                    <div className='media-left'>
                                                        <span className={`icon is-large ${doc.color === 'primary' ? 'has-text-white' : ''}`}>
                                                            <doc.icon size={32} />
                                                        </span>
                                                    </div>
                                                    <div className='media-content'>
                                                        <p className={`title is-5 ${doc.color === 'primary' ? 'has-text-white' : ''}`}>
                                                            {doc.title}
                                                        </p>
                                                        <p className={`subtitle is-6 ${doc.color === 'primary' ? 'has-text-white' : 'has-text-secondary'}`}>
                                                            {doc.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Advertisement */}
                    <Ad format="auto" size="responsive" className="mb-6" />
                </div>
            </section>
            <Footer />
        </>
    );
};

export default Home;
