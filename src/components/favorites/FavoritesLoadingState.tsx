import React from 'react';
import { Paper, Typography, CircularProgress, Box } from '@mui/material';

const FavoritesLoadingState: React.FC = () => {
    return (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
            <CircularProgress />
            <Typography sx={{ mt: 2 }}>Chargement des favoris...</Typography>
        </Paper>
    );
};

export default FavoritesLoadingState;
