import React from 'react';
import { Box, Paper, Typography, Grid } from '@mui/material';
import PageLayout from '@/components/shared/PageLayout';

const Stats: React.FC = () => {
    return (
        <div className="app-flight">
            <PageLayout>
                <Typography variant="h4" sx={{ mb: 3 }}>Statistics</Typography>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <Paper variant="outlined" sx={{ p: 2 }}>
                            <Typography variant="h6" color="text.secondary">Total Journeys</Typography>
                            <Typography variant="h4">1,234</Typography>
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <Paper variant="outlined" sx={{ p: 2 }}>
                            <Typography variant="h6" color="text.secondary">Stations Covered</Typography>
                            <Typography variant="h4">567</Typography>
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <Paper variant="outlined" sx={{ p: 2 }}>
                            <Typography variant="h6" color="text.secondary">Active Users</Typography>
                            <Typography variant="h4">890</Typography>
                        </Paper>
                    </Grid>
                </Grid>
            </PageLayout>
        </div>
    );
};

export default Stats;
