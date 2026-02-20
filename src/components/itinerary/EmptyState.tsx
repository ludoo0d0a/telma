import React from 'react';
import { Paper, Typography, Box, Alert } from '@mui/material';

interface EmptyStateProps {
    fromName: string;
    toName: string;
    fromId: string | undefined;
    toId: string | undefined;
}

const EmptyState: React.FC<EmptyStateProps> = ({ fromName, toName, fromId, toId }) => {
    return (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
            <Typography sx={{ fontSize: '4rem', mb: 2 }}>🚂</Typography>
            <Typography variant="h5" sx={{ mb: 1 }}>Aucun train trouvé</Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
                Il n'y a actuellement aucun train disponible entre {fromName || 'la gare de départ'} et {toName || 'la gare d\'arrivée'} pour les prochains jours.
            </Typography>
            <Box sx={{ textAlign: 'left', mt: 3 }}>
                <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>Informations</Typography>
                    <Box component="ul" sx={{ m: 0, pl: 2 }}>
                        <li>Gare de départ: <strong>{fromId ? `${fromName} (trouvée)` : `${fromName || 'Non sélectionnée'} (non trouvée)`}</strong></li>
                        <li>Gare d'arrivée: <strong>{toId ? `${toName} (trouvée)` : `${toName || 'Non sélectionnée'} (non trouvée)`}</strong></li>
                        <li>Période recherchée: Aujourd'hui et les 2 prochains jours</li>
                    </Box>
                </Alert>
                <Alert severity="warning">
                    <strong>Suggestion:</strong> Essayez de vérifier les horaires directement sur le site SNCF ou contactez le service client.
                </Alert>
            </Box>
        </Paper>
    );
};

export default EmptyState;
