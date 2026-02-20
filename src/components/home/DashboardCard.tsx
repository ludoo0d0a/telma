import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, Box, Typography } from '@mui/material';

interface DashboardCardProps {
    title: string;
    description: string;
    path: string;
    icon: React.ComponentType<{ size?: number | string; className?: string }>;
    color?: 'primary' | 'secondary';
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, description, path, icon: Icon, color }) => {
    return (
        <Link to={path} style={{ textDecoration: 'none' }}>
            <Card
                sx={{
                    height: '100%',
                    bgcolor: color === 'primary' ? 'primary.main' : color === 'secondary' ? 'secondary.main' : 'background.paper',
                    color: color ? 'white' : 'text.primary',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4,
                    },
                }}
            >
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                        <Box sx={{ flexShrink: 0 }}>
                            <Icon size={32} />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="h6" component="p" gutterBottom>
                                {title}
                            </Typography>
                            <Typography variant="body2" color={color ? 'inherit' : 'text.secondary'}>
                                {description}
                            </Typography>
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        </Link>
    );
};

export default DashboardCard;
