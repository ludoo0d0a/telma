import React from 'react';
import { Grid, Paper, Typography } from '@mui/material';
import type { CommercialMode } from '@/client/models/commercial-mode';

interface CommercialModeCardProps {
    mode: CommercialMode;
}

const CommercialModeCard: React.FC<CommercialModeCardProps> = ({ mode }) => {
    return (
        <Grid item xs={12} sm={6} md={4}>
            <Paper sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                    {mode.name || 'Non spécifié'}
                </Typography>
                <Typography variant="body2">
                    <strong>ID:</strong> <code>{mode.id}</code>
                </Typography>
            </Paper>
        </Grid>
    );
};

export default CommercialModeCard;
