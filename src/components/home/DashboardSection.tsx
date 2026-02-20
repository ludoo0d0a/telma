import React from 'react';
import { Box, Typography, Grid } from '@mui/material';
import DashboardCard from './DashboardCard';

interface DashboardCardData {
    title: string;
    description: string;
    path: string;
    icon: React.ComponentType<{ size?: number | string; className?: string }>;
    color?: 'primary' | 'secondary';
}

interface DashboardSectionProps {
    title: string;
    icon: React.ComponentType<{ size?: number | string; className?: string }>;
    cards: DashboardCardData[];
    columnsClass?: string;
    columnsWrapperClassName?: string;
}

const DashboardSection: React.FC<DashboardSectionProps> = ({
    title,
    icon: Icon,
    cards,
}) => {
    return (
        <Box sx={{ mb: 3 }}>
            <Typography variant="h5" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Icon size={24} />
                {title}
            </Typography>
            <Grid container spacing={2}>
                {cards.map((card) => (
                    <Grid item key={card.path} xs={12} sm={6} md={4}>
                        <DashboardCard {...card} />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default DashboardSection;
