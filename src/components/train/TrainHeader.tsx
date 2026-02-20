import React from 'react';
import { Box, Typography, Button, Chip } from '@mui/material';
import { Search, Loader2, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

interface TrainHeaderProps {
    trainNumber: string;
    onRefresh: () => void;
    refreshing: boolean;
}

const TrainHeader: React.FC<TrainHeaderProps> = ({ trainNumber, onRefresh, refreshing }) => {
    return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h4">Détails du train</Typography>
                {trainNumber && trainNumber !== 'N/A' && (
                    <Chip label={trainNumber} color="primary" size="medium" />
                )}
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                    variant="contained"
                    onClick={onRefresh}
                    disabled={refreshing}
                    startIcon={refreshing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                >
                    {refreshing ? 'Actualisation...' : 'Actualiser'}
                </Button>
                <Button component={Link} to="/train" variant="outlined" startIcon={<Search size={16} />}>
                    Rechercher
                </Button>
            </Box>
        </Box>
    );
};

export default TrainHeader;
