import React from 'react';
import { Paper, Typography, CircularProgress } from '@mui/material';

const CommercialModesLoadingState: React.FC = () => {
    return (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
            <CircularProgress />
            <Typography sx={{ mt: 2 }}>Chargement des modes de transport...</Typography>
        </Paper>
    );
};

export default CommercialModesLoadingState;
