import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, IconButton } from '@mui/material';
import { X, Home, Route, Clock, MapPin, Crosshair, Star, Train, BarChart3, Map, Circle, Bus, Book, Info, LayoutDashboard, BarChart2, MessageSquareWarning } from 'lucide-react';

const NAV_ITEMS: { to: string; end?: boolean; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
    { to: '/', label: 'Home', icon: Home, end: true },
    { to: '/itinerary', label: 'Trajet', icon: Route },
    { to: '/schedules', label: 'Horaires', icon: Clock },
    { to: '/places', label: 'Lieux', icon: MapPin },
    { to: '/location-detection', label: 'Détection de localisation', icon: Crosshair },
    { to: '/favorites', label: 'Favoris', icon: Star },
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/stats', label: 'Stats', icon: BarChart2 },
    { to: '/raise-issue', label: 'Signaler un problème', icon: MessageSquareWarning },
    { to: '/train', label: 'Train', icon: Train },
    { to: '/lines', label: 'Lignes', icon: Route },
    { to: '/reports', label: 'Rapports', icon: BarChart3 },
    { to: '/coverage', label: 'Couverture', icon: Map },
    { to: '/isochrones', label: 'Isochrones', icon: Circle },
    { to: '/commercial-modes', label: 'Modes Commerciaux', icon: Bus },
    { to: '/api-docs', label: 'API Documentation', icon: Book },
    { to: '/about', label: 'À propos', icon: Info },
];

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
    const location = useLocation();

    return (
        <Drawer
            anchor="left"
            open={isOpen}
            onClose={onClose}
            variant="temporary"
            sx={{
                '& .MuiDrawer-paper': {
                    width: { xs: 'min(90vw, 360px)', sm: 280 },
                    boxSizing: 'border-box',
                    mt: { xs: 0, sm: 0 },
                    borderTopRightRadius: { xs: 18, sm: 0 },
                    borderBottomRightRadius: { xs: 18, sm: 0 },
                },
            }}
        >
            <List sx={{ pt: 1 }}>
                <ListItem
                    secondaryAction={
                        <IconButton edge="end" onClick={onClose} aria-label="Fermer">
                            <X size={20} />
                        </IconButton>
                    }
                    sx={{ py: 1.5 }}
                >
                    <ListItemText primary="Menu" primaryTypographyProps={{ fontWeight: 600 }} />
                </ListItem>
                {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => {
                    const isActive = end ? location.pathname === '/' : location.pathname.startsWith(to);
                    return (
                        <ListItem key={to} disablePadding>
                            <ListItemButton
                                component={NavLink}
                                to={to}
                                end={end}
                                onClick={onClose}
                                selected={isActive}
                                sx={{
                                    '&.Mui-selected': {
                                        color: 'primary.main',
                                        bgcolor: 'action.selected',
                                    },
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: 40 }}>
                                    <Icon size={20} />
                                </ListItemIcon>
                                <ListItemText primary={label} />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>
        </Drawer>
    );
};

export default Sidebar;
