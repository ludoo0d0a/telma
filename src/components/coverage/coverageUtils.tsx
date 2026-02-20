import React from 'react';
import { Chip } from '@mui/material';

/**
 * Get a status badge component based on the status string
 */
export const getStatusBadge = (status: string | undefined): React.ReactNode => {
    if (status === 'running') {
        return <Chip label="En cours" color="success" size="small" />;
    } else if (status === 'closed') {
        return <Chip label="Fermé" color="error" size="small" />;
    }
    return <Chip label={status || 'N/A'} variant="outlined" size="small" />;
};
