import React from 'react';
import {
    Box,
    Paper,
    Typography,
    Grid,
    Link,
    Chip,
} from '@mui/material';
import Footer from '@/components/Footer';
import PageLayout from '@/components/shared/PageLayout';
import packageJson from '../../package.json';
import { Info, Tag, ExternalLink, Star, Settings, CheckSquare, History, Train, Route, MapPin, Bus, Map, Search, Circle, BarChart3, Book, Code, Network, Palette, BookOpen, Wrench, Smartphone, TrendingUp, FlaskConical } from 'lucide-react';

const About: React.FC = () => {
    const functionalFeatures = [
        { title: 'Real-time Train Information', description: 'View departures and arrivals for any train station', icon: Train },
        { title: 'Journey Planning', description: 'Search for journeys between different locations', icon: Route },
        { title: 'Station Explorer', description: 'Browse train stations by city with detailed information', icon: MapPin },
        { title: 'Commercial Modes', description: 'Explore different transportation modes available', icon: Bus },
        { title: 'Coverage Areas', description: 'View coverage information for different regions', icon: Map },
        { title: 'Places Search', description: 'Find train stations and places', icon: Search },
        { title: 'Lines Information', description: 'View train line details', icon: Route },
        { title: 'Isochrones', description: 'Visualize travel time zones from specific locations', icon: Circle },
        { title: 'Reports', description: 'Access detailed train reports', icon: BarChart3 },
        { title: 'Favorites', description: 'Save and manage your favorite train stations', icon: Star },
        { title: 'Interactive API Documentation', description: 'Built-in Swagger UI for API exploration', icon: Book },
    ];

    const technicalFeatures = [
        { title: 'Frontend Framework', description: 'React 19.2.3 with TypeScript for type-safe development', icon: Code },
        { title: 'Routing', description: 'React Router DOM 7.11.0 for client-side navigation', icon: Route },
        { title: 'HTTP Client', description: 'Axios for making API calls to SNCF Connect API', icon: Network },
        { title: 'Styling', description: 'MUI (Material-UI) for responsive, mobile-first design', icon: Palette },
        { title: 'API Documentation', description: 'Swagger UI React for interactive API exploration', icon: BookOpen },
        { title: 'Maps', description: 'MapLibre GL and React Map GL for interactive maps', icon: Map },
        { title: 'Build Tool', description: 'Vite 7.3.0 for fast development and optimized builds', icon: Wrench },
        { title: 'PWA Support', description: 'Progressive Web App capabilities with service workers', icon: Smartphone },
        { title: 'Analytics', description: 'React GA4 for page view tracking', icon: TrendingUp },
        { title: 'Testing', description: 'Vitest with React Testing Library', icon: FlaskConical },
    ];

    const todos = [
        {
            title: 'Notifications from X (Twitter)',
            items: ['TER Nancy Metz Lux', 'TER Metz Lux', 'ITLF Lorraine Fron'],
            links: ['https://x.com/TERNancyMetzLux', 'https://x.com/TER_Metz_Lux', 'https://x.com/itlflorfron'],
        },
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
                'Swagger UI integration for API documentation',
            ],
        },
    ];

    return (
        <>
            <PageLayout>
                <Paper sx={{ p: 2, mb: 2 }}>
                    <Typography variant="h5" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Tag size={24} color="var(--primary)" />
                        Version & Author
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Typography><strong>Version:</strong> <Chip label={packageJson.version} color="primary" size="small" /></Typography>
                            <Typography sx={{ mt: 1 }}>
                                <strong>Author:</strong> {packageJson.author}{' '}
                                <Link href="https://github.com/ludooo0d0a" target="_blank" rel="noopener noreferrer" color="primary">
                                    (@ludooo0d0a)
                                </Link>
                            </Typography>
                            <Typography sx={{ mt: 1 }}>
                                <strong>Homepage:</strong>{' '}
                                <Link href={packageJson.homepage} target="_blank" rel="noopener noreferrer" color="primary">
                                    {packageJson.homepage}
                                </Link>
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography>
                                <strong>Repository:</strong>{' '}
                                <Link href="https://github.com/ludooo0d0a/telma" target="_blank" rel="noopener noreferrer" color="primary">
                                    GitHub <ExternalLink size={14} style={{ verticalAlign: 'middle', marginLeft: 4 }} />
                                </Link>
                            </Typography>
                            <Typography sx={{ mt: 1 }}><strong>API:</strong> SNCF Connect API (Navitia)</Typography>
                            <Typography sx={{ mt: 1 }}><strong>License:</strong> Check repository for license information</Typography>
                        </Grid>
                    </Grid>
                </Paper>

                <Paper sx={{ p: 2, mb: 2 }}>
                    <Typography variant="h5" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Star size={24} color="var(--primary)" />
                        Functional Features
                    </Typography>
                    <Grid container spacing={2}>
                        {functionalFeatures.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                            <Grid item key={index} xs={12} md={6}>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Box sx={{ color: 'primary.main', flexShrink: 0 }}>
                                        <Icon size={32} />
                                    </Box>
                                    <Box>
                                        <Typography variant="h6">{feature.title}</Typography>
                                        <Typography variant="body2" color="text.secondary">{feature.description}</Typography>
                                    </Box>
                                </Box>
                            </Grid>
                            );
                        })}
                    </Grid>
                </Paper>

                <Paper sx={{ p: 2, mb: 2 }}>
                    <Typography variant="h5" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Settings size={24} color="var(--primary)" />
                        Technical Features
                    </Typography>
                    <Grid container spacing={2}>
                        {technicalFeatures.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                            <Grid item key={index} xs={12} md={6}>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Box sx={{ color: 'primary.main', flexShrink: 0 }}>
                                        <Icon size={32} />
                                    </Box>
                                    <Box>
                                        <Typography variant="h6">{feature.title}</Typography>
                                        <Typography variant="body2" color="text.secondary">{feature.description}</Typography>
                                    </Box>
                                </Box>
                            </Grid>
                            );
                        })}
                    </Grid>
                </Paper>

                <Paper sx={{ p: 2, mb: 2 }}>
                    <Typography variant="h5" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckSquare size={24} color="var(--primary)" />
                        Todo
                    </Typography>
                    {todos.map((todo, index) => (
                        <Box key={index} sx={{ mb: 2 }}>
                            <Typography variant="h6" sx={{ mb: 1 }}>{todo.title}</Typography>
                            <Box component="ul" sx={{ m: 0, pl: 2 }}>
                                {todo.items.map((item, itemIndex) => (
                                    <li key={itemIndex}>
                                        {item}
                                        {todo.links?.[itemIndex] && (
                                            <>
                                                {' - '}
                                                <Link href={todo.links[itemIndex]} target="_blank" rel="noopener noreferrer" color="primary">
                                                    Link <ExternalLink size={12} style={{ verticalAlign: 'middle' }} />
                                                </Link>
                                            </>
                                        )}
                                    </li>
                                ))}
                            </Box>
                        </Box>
                    ))}
                </Paper>

                <Paper sx={{ p: 2, mb: 2 }}>
                    <Typography variant="h5" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <History size={24} color="var(--primary)" />
                        Changelog
                    </Typography>
                    {changelog.map((entry, index) => (
                        <Box key={index} sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                <Chip label={entry.version} color="primary" />
                                <Typography variant="body2" color="text.secondary">{entry.date}</Typography>
                            </Box>
                            <Box component="ul" sx={{ m: 0, pl: 2 }}>
                                {entry.changes.map((change, changeIndex) => (
                                    <li key={changeIndex}>{change}</li>
                                ))}
                            </Box>
                        </Box>
                    ))}
                </Paper>
            </PageLayout>
            <Footer />
        </>
    );
};

export default About;
