import React from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';
import type { Coverage } from '@/client/models';
import { formatDateString } from '@/utils/dateUtils';
import { getStatusBadge } from './coverageUtils';

interface CoverageCardProps {
    coverage: Coverage;
    onClick: (coverageId: string | undefined) => void;
}

const CoverageCard: React.FC<CoverageCardProps> = ({ coverage, onClick }) => {
    return (
        <Grid item xs={12} sm={6} md={4}>
            <Paper
                onClick={() => onClick(coverage.id)}
                sx={{
                    p: 2,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' },
                }}
            >
                <Typography variant="h6" sx={{ mb: 1 }}>{coverage.id}</Typography>
                <Box sx={{ mb: 1 }}>{getStatusBadge(coverage.status)}</Box>
                {coverage.start_production_date && (
                    <Typography variant="body2"><strong>Début:</strong> {formatDateString(coverage.start_production_date)}</Typography>
                )}
                {coverage.end_production_date && (
                    <Typography variant="body2"><strong>Fin:</strong> {formatDateString(coverage.end_production_date)}</Typography>
                )}
            </Paper>
        </Grid>
    );
};

export default CoverageCard;
