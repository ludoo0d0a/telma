import React from 'react';
import Footer from '../components/Footer';
import packageJson from '../../package.json';
import { Icon } from '../utils/iconMapping';

const About: React.FC = () => {
    const functionalFeatures = [
        {
            title: 'Real-time Train Information',
            description: 'View departures and arrivals for any train station',
            icon: 'fa-train'
        },
        {
            title: 'Journey Planning',
            description: 'Search for journeys between different locations',
            icon: 'fa-route'
        },
        {
            title: 'Station Explorer',
            description: 'Browse train stations by city with detailed information',
            icon: 'fa-map-marker-alt'
        },
        {
            title: 'Commercial Modes',
            description: 'Explore different transportation modes available',
            icon: 'fa-bus'
        },
        {
            title: 'Coverage Areas',
            description: 'View coverage information for different regions',
            icon: 'fa-map'
        },
        {
            title: 'Places Search',
            description: 'Find train stations and places',
            icon: 'fa-search'
        },
        {
            title: 'Lines Information',
            description: 'View train line details',
            icon: 'fa-route'
        },
        {
            title: 'Isochrones',
            description: 'Visualize travel time zones from specific locations',
            icon: 'fa-circle'
        },
        {
            title: 'Reports',
            description: 'Access detailed train reports',
            icon: 'fa-chart-bar'
        },
        {
            title: 'Favorites',
            description: 'Save and manage your favorite train stations',
            icon: 'fa-star'
        },
        {
            title: 'Interactive API Documentation',
            description: 'Built-in Swagger UI for API exploration',
            icon: 'fa-book'
        }
    ];

    const technicalFeatures = [
        {
            title: 'Frontend Framework',
            description: 'React 19.2.3 with TypeScript for type-safe development',
            icon: 'fa-code'
        },
        {
            title: 'Routing',
            description: 'React Router DOM 7.11.0 for client-side navigation',
            icon: 'fa-sitemap'
        },
        {
            title: 'HTTP Client',
            description: 'Axios for making API calls to SNCF Connect API',
            icon: 'fa-network-wired'
        },
        {
            title: 'Styling',
            description: 'SCSS/Sass with Bulma CSS framework for responsive design',
            icon: 'fa-paint-brush'
        },
        {
            title: 'API Documentation',
            description: 'Swagger UI React for interactive API exploration',
            icon: 'fa-book-open'
        },
        {
            title: 'Maps',
            description: 'MapLibre GL and React Map GL for interactive maps',
            icon: 'fa-map'
        },
        {
            title: 'Build Tool',
            description: 'Vite 7.3.0 for fast development and optimized builds',
            icon: 'fa-tools'
        },
        {
            title: 'PWA Support',
            description: 'Progressive Web App capabilities with service workers',
            icon: 'fa-mobile-alt'
        },
        {
            title: 'Analytics',
            description: 'React GA4 for page view tracking',
            icon: 'fa-chart-line'
        },
        {
            title: 'Testing',
            description: 'Vitest with React Testing Library',
            icon: 'fa-vial'
        }
    ];

    const todos = [
        {
            title: 'Notifications from X (Twitter)',
            items: [
                'TER Nancy Metz Lux',
                'TER Metz Lux',
                'ITLF Lorraine Fron'
            ],
            links: [
                'https://x.com/TERNancyMetzLux',
                'https://x.com/TER_Metz_Lux',
                'https://x.com/itlflorfron'
            ]
        }
    ];

    const changelog = [
        {
            version: '0.0.1',
            date: 'Initial Release',
            changes: [
                'Initial release of the SNCF API Explorer',
                'Real-time train information and journey planning',
                'Station explorer and favorites management',
                'Interactive maps with MapLibre GL',
                'PWA support with service workers',
                'Swagger UI integration for API documentation'
            ]
        }
    ];

    return (
        <>
            <section className='section about-page'>
                <div className='container'>
                    <div className='has-text-centered mb-6'>
                        <h1 className='title is-1 mb-4'>
                            <span className='icon has-text-primary mr-3'>
                                <Icon name='fa-info-circle' size={24} />
                            </span>
                            About
                        </h1>
                        <p className='subtitle is-5 has-text-secondary'>
                            SNCF API Explorer - Real-time train schedules and information
                        </p>
                    </div>

                    {/* Version and Author */}
                    <div className='box mb-5'>
                        <h2 className='title is-3 mb-4'>
                            <span className='icon has-text-primary mr-2'>
                                <Icon name='fa-tag' size={24} />
                            </span>
                            Version & Author
                        </h2>
                        <div className='content'>
                            <div className='columns'>
                                <div className='column is-half'>
                                    <p>
                                        <strong>Version:</strong>{' '}
                                        <span className='tag is-primary is-medium'>{packageJson.version}</span>
                                    </p>
                                    <p className='mt-3'>
                                        <strong>Author:</strong>{' '}
                                        <span>{packageJson.author}</span>
                                        {' '}
                                        <a 
                                            href='https://github.com/ludooo0d0a' 
                                            target='_blank' 
                                            rel='noopener noreferrer'
                                            className='has-text-primary'
                                        >
                                            (@ludooo0d0a)
                                        </a>
                                    </p>
                                    <p className='mt-3'>
                                        <strong>Homepage:</strong>{' '}
                                        <a 
                                            href={packageJson.homepage} 
                                            target='_blank' 
                                            rel='noopener noreferrer'
                                            className='has-text-primary'
                                        >
                                            {packageJson.homepage}
                                        </a>
                                    </p>
                                </div>
                                <div className='column is-half'>
                                    <p>
                                        <strong>Repository:</strong>{' '}
                                        <a 
                                            href='https://github.com/ludooo0d0a/telma' 
                                            target='_blank' 
                                            rel='noopener noreferrer'
                                            className='has-text-primary'
                                        >
                                            GitHub
                                            <span className='icon ml-2'>
                                                <Icon name='fa-external-link-alt' size={16} />
                                            </span>
                                        </a>
                                    </p>
                                    <p className='mt-3'>
                                        <strong>API:</strong> SNCF Connect API (Navitia)
                                    </p>
                                    <p className='mt-3'>
                                        <strong>License:</strong> Check repository for license information
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Functional Features */}
                    <div className='box mb-5'>
                        <h2 className='title is-3 mb-4'>
                            <span className='icon has-text-primary mr-2'>
                                <Icon name='fa-star' size={24} />
                            </span>
                            Functional Features
                        </h2>
                        <div className='columns is-multiline'>
                            {functionalFeatures.map((feature, index) => (
                                <div key={index} className='column is-half-tablet is-full-mobile'>
                                    <div className='media'>
                                        <div className='media-left'>
                                            <span className='icon is-medium has-text-primary'>
                                                <Icon name={feature.icon} size={32} />
                                            </span>
                                        </div>
                                        <div className='media-content'>
                                            <p className='title is-5'>{feature.title}</p>
                                            <p className='subtitle is-6 has-text-secondary'>{feature.description}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Technical Features */}
                    <div className='box mb-5'>
                        <h2 className='title is-3 mb-4'>
                            <span className='icon has-text-primary mr-2'>
                                <Icon name='fa-cog' size={24} />
                            </span>
                            Technical Features
                        </h2>
                        <div className='columns is-multiline'>
                            {technicalFeatures.map((feature, index) => (
                                <div key={index} className='column is-half-tablet is-full-mobile'>
                                    <div className='media'>
                                        <div className='media-left'>
                                            <span className='icon is-medium has-text-primary'>
                                                <Icon name={feature.icon} size={32} />
                                            </span>
                                        </div>
                                        <div className='media-content'>
                                            <p className='title is-5'>{feature.title}</p>
                                            <p className='subtitle is-6 has-text-secondary'>{feature.description}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Todo */}
                    <div className='box mb-5'>
                        <h2 className='title is-3 mb-4'>
                            <span className='icon has-text-warning mr-2'>
                                <Icon name='fa-tasks' size={24} />
                            </span>
                            Todo
                        </h2>
                        <div className='content'>
                            {todos.map((todo, index) => (
                                <div key={index} className='mb-4'>
                                    <h3 className='title is-5'>{todo.title}</h3>
                                    <ul>
                                        {todo.items.map((item, itemIndex) => (
                                            <li key={itemIndex}>
                                                {item}
                                                {todo.links && todo.links[itemIndex] && (
                                                    <>
                                                        {' - '}
                                                        <a 
                                                            href={todo.links[itemIndex]} 
                                                            target='_blank' 
                                                            rel='noopener noreferrer'
                                                            className='has-text-primary'
                                                        >
                                                            Link
                                                            <span className='icon ml-1 is-small'>
                                                                <Icon name='fa-external-link-alt' size={16} />
                                                            </span>
                                                        </a>
                                                    </>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Changelog */}
                    <div className='box mb-5'>
                        <h2 className='title is-3 mb-4'>
                            <span className='icon has-text-primary mr-2'>
                                <Icon name='fa-history' size={24} />
                            </span>
                            Changelog
                        </h2>
                        <div className='content'>
                            {changelog.map((entry, index) => (
                                <div key={index} className='mb-5'>
                                    <div className='level mb-3'>
                                        <div className='level-left'>
                                            <div className='level-item'>
                                                <span className='tag is-primary is-large'>{entry.version}</span>
                                            </div>
                                            <div className='level-item'>
                                                <p className='subtitle is-6 has-text-grey'>{entry.date}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <ul>
                                        {entry.changes.map((change, changeIndex) => (
                                            <li key={changeIndex}>{change}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
            <Footer />
        </>
    );
};

export default About;

