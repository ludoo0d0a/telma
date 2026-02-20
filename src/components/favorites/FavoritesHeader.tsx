import React from 'react';
import { Box, Typography } from '@mui/material';
import { Star } from 'lucide-react';

const FavoritesHeader: React.FC = () => {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Star size={24} color="var(--primary, #f97316)" style={{ marginRight: 12 }} />
            <Typography variant="h4">Favoris</Typography>
        </Box>
    );
};

export default FavoritesHeader;
