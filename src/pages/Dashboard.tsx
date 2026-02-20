import React from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';
import { PageHeader } from '@/components/skytrip';
import PageLayout from '@/components/shared/PageLayout';

const Dashboard: React.FC = () => {
    const favoriteStations = [
        { name: 'Gare de Lyon', city: 'Paris' },
        { name: 'Gare du Nord', city: 'Paris' },
        { name: 'Gare de Marseille-Saint-Charles', city: 'Marseille' },
    ];

    return (
        <Box sx={{ minHeight: '100vh' }}>
            <PageHeader
                title="Dashboard"
                subtitle="Accédez rapidement aux principales fonctionnalités"
                showNotification={false}
            />
            <PageLayout>
                <Typography variant="h4" gutterBottom>Your Dashboard</Typography>
                <Typography variant="h6" sx={{ mb: 2 }}>Favorite Stations</Typography>
                <Grid container spacing={2}>
                    {favoriteStations.map((station, index) => (
                        <Grid item key={index} xs={12} sm={6} md={4}>
                            <Paper sx={{ p: 2 }}>
                                <Typography variant="h6">{station.name}</Typography>
                                <Typography color="text.secondary">{station.city}</Typography>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </PageLayout>
        </Box>
    );
};

export default Dashboard;
