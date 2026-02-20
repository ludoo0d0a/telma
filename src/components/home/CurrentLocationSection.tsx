import React from 'react';
import { Box, Typography } from '@mui/material';
import { Crosshair } from 'lucide-react';
import CurrentLocationWidget from '@/components/CurrentLocationWidget';

const CurrentLocationSection: React.FC = () => {
    return (
        <Box sx={{ mb: 3 }}>
            <Typography variant="h5" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Crosshair size={24} />
                Votre Position Actuelle
            </Typography>
            <Box>
                <CurrentLocationWidget />
            </Box>
        </Box>
    );
};

export default CurrentLocationSection;
