import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, AppBar, Toolbar, IconButton, Typography } from '@mui/material';
import { Menu, ArrowLeft } from 'lucide-react';
import { useSidebar } from '@/contexts/SidebarContext';
import Avatar from '@/components/Avatar';
import BottomNavbar from '@/components/BottomNavbar';

/** Route-to-title mapping for the app bar */
const ROUTE_TITLES: Record<string, string> = {
    '/': 'Dashboard',
    '/itinerary': 'Trajet',
    '/schedules': 'Horaires',
    '/places': 'Lieux',
    '/favorites': 'Favoris',
    '/train': 'Train',
    '/trip': 'Détail trajet',
    '/coverage': 'Couverture',
    '/lines': 'Lignes',
    '/commercial-modes': 'Modes Commerciaux',
    '/isochrones': 'Isochrones',
    '/location-detection': 'Localisation',
    '/about': 'À propos',
    '/api-docs': 'API',
    '/stats': 'Statistiques',
    '/dashboard': 'Dashboard',
    '/raise-issue': 'Signaler',
    '/paywall': 'Premium',
    '/premium': 'Premium',
};

const getPageTitle = (pathname: string): string => {
    if (ROUTE_TITLES[pathname]) return ROUTE_TITLES[pathname];
    const firstSegment = '/' + (pathname.split('/')[1] || '');
    if (ROUTE_TITLES[firstSegment]) return ROUTE_TITLES[firstSegment];
    if (pathname.startsWith('/city/')) return 'Gares';
    if (pathname.startsWith('/train/')) return 'Train';
    if (pathname.startsWith('/trip/')) return 'Trajet';
    return 'Telma';
};

interface AppShellProps {
    children: React.ReactNode;
}

/**
 * Mobile-first app shell with fixed top app bar and bottom navigation.
 * M3-inspired: persistent top bar, full-width content, safe area padding.
 */
const AppShell: React.FC<AppShellProps> = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { toggleSidebar } = useSidebar();
    const title = getPageTitle(location.pathname);

    const segments = location.pathname.split('/').filter(Boolean);
    const showBack = segments.length > 1;

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh',
                width: '100%',
            }}
        >
            <AppBar
                position="fixed"
                elevation={0}
                sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                }}
            >
                <Toolbar
                    sx={{
                        minHeight: { xs: 56, sm: 64 },
                        px: { xs: 1, sm: 2 },
                    }}
                >
                    <IconButton
                        color="inherit"
                        onClick={showBack ? () => navigate(-1) : toggleSidebar}
                        aria-label={showBack ? 'Retour' : 'Menu'}
                        sx={{ mr: 1 }}
                    >
                        {showBack ? <ArrowLeft size={24} /> : <Menu size={24} />}
                    </IconButton>
                    <Typography
                        variant="h6"
                        component="h1"
                        sx={{
                            flex: 1,
                            fontWeight: 600,
                            fontSize: { xs: '1rem', sm: '1.25rem' },
                        }}
                    >
                        {title}
                    </Typography>
                    <Avatar
                        variant="compact"
                        fallbackName={title}
                    />
                </Toolbar>
            </AppBar>

            <Box
                component="main"
                sx={{
                    flex: 1,
                    width: '100%',
                    pt: { xs: 7, sm: 8 },
                    pb: 10,
                    minHeight: '100vh',
                }}
            >
                {children}
            </Box>

            <BottomNavbar onMoreClick={toggleSidebar} />
        </Box>
    );
};

export default AppShell;
