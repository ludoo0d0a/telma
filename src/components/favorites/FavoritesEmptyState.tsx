import React from 'react';
import { Paper, Typography, Box } from '@mui/material';

const FavoritesEmptyState: React.FC = () => {
    return (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
            <Typography sx={{ fontSize: '4rem', mb: 2 }}>⭐</Typography>
            <Typography variant="h5" sx={{ mb: 1 }}>Aucun favori</Typography>
            <Typography color="text.secondary" sx={{ mb: 1 }}>
                Vous n'avez pas encore de gares favorites.
            </Typography>
            <Typography color="text.secondary">
                Utilisez l'étoile dans les champs de recherche pour ajouter des gares à vos favoris.
            </Typography>
        </Paper>
    );
};

export default FavoritesEmptyState;
