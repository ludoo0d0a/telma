import React from 'react';
import { Alert } from '@mui/material';

interface CommercialModesErrorStateProps {
    error: string;
    onDismiss: () => void;
}

const CommercialModesErrorState: React.FC<CommercialModesErrorStateProps> = ({ error, onDismiss }) => {
    return (
        <Alert severity="error" onClose={onDismiss} sx={{ mb: 2 }}>
            {error}
        </Alert>
    );
};

export default CommercialModesErrorState;
