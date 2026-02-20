import React from 'react';
import { Box, Typography } from '@mui/material';

const CommercialModesHeader: React.FC = () => {
    return (
        <Box sx={{ mb: 3 }}>
            <Typography variant="h4">Modes de transport <Typography component="span" color="text.secondary">SNCF</Typography></Typography>
        </Box>
    );
};

export default CommercialModesHeader;
