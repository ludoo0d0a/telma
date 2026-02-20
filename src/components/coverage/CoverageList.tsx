import React from 'react';
import { Box, Paper, Typography, Grid, Chip, Link } from '@mui/material';
import type { Coverage, CoverageResponse } from '@/client/models';
import CoverageCard from './CoverageCard';
import CoverageLinks from './CoverageLinks';

interface CoverageListProps {
    coverages: Coverage[];
    coverageResponse: CoverageResponse | null;
    onCoverageClick: (coverageId: string | undefined) => void;
}

const CoverageList: React.FC<CoverageListProps> = ({ coverages, coverageResponse, onCoverageClick }) => {
    return (
        <Paper sx={{ p: 2 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
                Zones de couverture <Chip label={coverages.length} color="primary" size="small" sx={{ ml: 1 }} />
            </Typography>
            {coverages.length === 0 ? (
                <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                    Aucune zone de couverture trouvée
                </Typography>
            ) : (
                <Grid container spacing={2}>
                    {coverages.map((coverage) => (
                        <CoverageCard key={coverage.id} coverage={coverage} onClick={onCoverageClick} />
                    ))}
                </Grid>
            )}

            {coverageResponse?.links && coverageResponse.links.length > 0 && (
                <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>Liens disponibles</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {coverageResponse.links.map((link, index) => (
                            <Link
                                key={index}
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{ textDecoration: 'none' }}
                            >
                                <Chip label={link.type || link.rel || 'Lien'} component="span" clickable />
                            </Link>
                        ))}
                    </Box>
                </Box>
            )}
        </Paper>
    );
};

export default CoverageList;
