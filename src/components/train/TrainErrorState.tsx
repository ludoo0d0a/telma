import React from 'react';
import { Paper, Typography, Box, Button } from '@mui/material';
import { AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '@/components/Footer';
import PageLayout from '@/components/shared/PageLayout';

interface TrainErrorStateProps {
    error: string | null;
    onRefresh: () => void;
    refreshing: boolean;
}

const TrainErrorState: React.FC<TrainErrorStateProps> = ({ error, onRefresh, refreshing }) => {
    return (
        <>
            <PageLayout>
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <AlertTriangle size={48} color="var(--primary)" />
                        <Typography color="error">{error || 'Train non trouvé'}</Typography>
                        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                            <Button
                                variant="contained"
                                onClick={onRefresh}
                                disabled={refreshing}
                                startIcon={refreshing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                            >
                                {refreshing ? 'Actualisation...' : 'Actualiser'}
                            </Button>
                            <Button component={Link} to="/train" variant="outlined">
                                Rechercher un autre train
                            </Button>
                        </Box>
                    </Box>
                </Paper>
            </PageLayout>
            <Footer />
        </>
    );
};

export default TrainErrorState;
