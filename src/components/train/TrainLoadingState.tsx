import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import { Loader2 } from 'lucide-react';
import Footer from '@/components/Footer';
import PageLayout from '@/components/shared/PageLayout';

const TrainLoadingState: React.FC = () => {
    return (
        <>
            <PageLayout>
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <Loader2 size={48} className="animate-spin" />
                        <Typography>Chargement des détails du train...</Typography>
                    </Box>
                </Paper>
            </PageLayout>
            <Footer />
        </>
    );
};

export default TrainLoadingState;
