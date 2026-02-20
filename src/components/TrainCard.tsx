import React from 'react';
import { Train, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, Box, Typography } from '@mui/material';

interface TrainCardProps {
    city: string;
}

const TrainCard: React.FC<TrainCardProps> = ({ city }) => {
    return (
        <Link to={`/city/${city.toLowerCase()}`} className='train-card-wrapper' style={{ textDecoration: 'none' }}>
            <Card variant="outlined" sx={{ '&:hover': { boxShadow: 2 } }}>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ color: 'primary.main', display: 'flex', alignItems: 'center' }}>
                            <Train size={32} />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="h6" sx={{ mb: 0.5 }}>{city}</Typography>
                            <Typography variant="body2" color="text.secondary">View station schedules</Typography>
                        </Box>
                        <Box sx={{ color: 'text.secondary' }}>
                            <ChevronRight size={20} />
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        </Link>
    );
};

export default TrainCard;
