import React from 'react';
import { Box, Paper, Typography, Chip } from '@mui/material';
import { getTransportIcon } from '@/services/transportService';

interface TrainInfoCardProps {
    trainNumber: string;
    commercialMode: string;
    network: string;
    direction: string;
}

const TrainInfoCard: React.FC<TrainInfoCardProps> = ({
    trainNumber,
    commercialMode,
    network,
    direction,
}) => {
    const transportInfo = getTransportIcon(commercialMode, network);
    const Icon = transportInfo.icon;

    const chipColor = transportInfo.tagColor === 'is-danger' ? 'error' :
        transportInfo.tagColor === 'is-warning' ? 'warning' :
        transportInfo.tagColor === 'is-info' ? 'info' :
        transportInfo.tagColor === 'is-success' ? 'success' :
        transportInfo.tagColor === 'is-primary' ? 'primary' : 'default';

    return (
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ color: 'primary.main' }}>
                    <Icon size={48} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="h5" sx={{ mb: 1 }}>{trainNumber}</Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: direction ? 1 : 0 }}>
                        <Chip label={transportInfo.label} color={chipColor} size="small" />
                        {network && network !== commercialMode && (
                            <Chip label={network} variant="outlined" size="small" />
                        )}
                    </Box>
                    {direction && (
                        <Typography variant="body2">
                            <strong>Direction:</strong> {direction}
                        </Typography>
                    )}
                </Box>
            </Box>
        </Paper>
    );
};

export default TrainInfoCard;
