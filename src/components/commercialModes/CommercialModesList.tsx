import React from 'react';
import { Paper, Typography, Grid, Chip } from '@mui/material';
import type { CommercialMode } from '@/client/models/commercial-mode';
import CommercialModeCard from './CommercialModeCard';

interface CommercialModesListProps {
    modes: CommercialMode[];
}

const CommercialModesList: React.FC<CommercialModesListProps> = ({ modes }) => {
    if (modes.length === 0) {
        return (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">Aucun mode de transport trouvé</Typography>
            </Paper>
        );
    }

    return (
        <Paper sx={{ p: 2 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
                Modes disponibles <Chip label={modes.length} color="primary" size="small" sx={{ ml: 1 }} />
            </Typography>
            <Grid container spacing={2}>
                {modes.map((mode) => (
                    <CommercialModeCard key={mode.id} mode={mode} />
                ))}
            </Grid>
        </Paper>
    );
};

export default CommercialModesList;
