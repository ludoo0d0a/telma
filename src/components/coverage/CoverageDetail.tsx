import React from 'react';
import { Paper, Typography, Box, Button } from '@mui/material';
import { ArrowLeft } from 'lucide-react';
import type { Context } from '@/client/models/context';
import type { Link } from '@/client/models/link';
import type { Coverage } from '@/client/models';
import { formatDateString } from '@/utils/dateUtils';
import CoverageContext from './CoverageContext';
import CoverageLinks from './CoverageLinks';
import { getStatusBadge } from './coverageUtils';

interface SelectedCoverage extends Coverage {
    id: string;
    context?: Context;
    links?: Link[];
}

interface CoverageDetailProps {
    selectedCoverage: SelectedCoverage;
    onBack: () => void;
}

const CoverageDetail: React.FC<CoverageDetailProps> = ({ selectedCoverage, onBack }) => {
    return (
        <Paper sx={{ p: 2 }}>
            <Button variant="outlined" onClick={onBack} startIcon={<ArrowLeft size={20} />} sx={{ mb: 2 }}>
                Retour à la liste
            </Button>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 2 }}>
                <Typography variant="h5">Détails: {selectedCoverage.id}</Typography>
                {selectedCoverage.status && getStatusBadge(selectedCoverage.status)}
            </Box>

            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Informations générales</Typography>
                {selectedCoverage.id && (
                    <Typography><strong>ID:</strong> <code>{selectedCoverage.id}</code></Typography>
                )}
                {selectedCoverage.start_production_date && (
                    <Typography><strong>Date de début de production:</strong> {formatDateString(selectedCoverage.start_production_date)}</Typography>
                )}
                {selectedCoverage.end_production_date && (
                    <Typography><strong>Date de fin de production:</strong> {formatDateString(selectedCoverage.end_production_date)}</Typography>
                )}
                {selectedCoverage.status && (
                    <Typography><strong>Statut:</strong> {selectedCoverage.status}</Typography>
                )}
            </Paper>

            {selectedCoverage.shape && (
                <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>Forme géographique</Typography>
                    <Box component="pre" sx={{ overflow: 'auto' }}>{selectedCoverage.shape}</Box>
                </Paper>
            )}

            {selectedCoverage.context && <CoverageContext context={selectedCoverage.context} />}

            {selectedCoverage.links && selectedCoverage.links.length > 0 && (
                <CoverageLinks links={selectedCoverage.links} />
            )}

            <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
                <details>
                    <summary style={{ cursor: 'pointer', marginBottom: 16 }}>
                        <Typography variant="subtitle1">Afficher les données JSON brutes</Typography>
                    </summary>
                    <Box
                        component="pre"
                        sx={{
                            background: 'rgba(0, 0, 0, 0.3)',
                            borderRadius: 2,
                            p: 2,
                            overflow: 'auto',
                            color: '#ccc',
                            fontFamily: "'Roboto Mono', monospace",
                            fontSize: '0.9rem',
                            whiteSpace: 'pre-wrap',
                            wordWrap: 'break-word',
                        }}
                    >
                        {JSON.stringify(selectedCoverage, null, 2)}
                    </Box>
                </details>
            </Paper>
        </Paper>
    );
};

export default CoverageDetail;
