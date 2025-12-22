import React from 'react';

/**
 * Get a status badge component based on the status string
 */
export const getStatusBadge = (status: string | undefined): React.ReactNode => {
    if (status === 'running') {
        return <span className='tag is-success'>En cours</span>;
    } else if (status === 'closed') {
        return <span className='tag is-danger'>Fermé</span>;
    }
    return <span className='tag is-light'>{status || 'N/A'}</span>;
};

