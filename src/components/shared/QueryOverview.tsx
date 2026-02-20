import React from 'react';
import { Button, Box, Typography } from '@mui/material';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface QueryOverviewProps {
    fromName?: string;
    toName?: string;
    filterDate?: string;
    filterTime?: string;
    query?: string;
    queryLabel?: string;
    onClick: () => void;
}

const QueryOverview: React.FC<QueryOverviewProps> = ({
    fromName,
    toName,
    filterDate,
    filterTime,
    query,
    queryLabel,
    onClick,
}) => {
    const formatDate = (dateStr: string): string => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    };

    const formatTime = (timeStr: string): string => {
        if (!timeStr) return '';
        return timeStr.substring(0, 5);
    };

    if (query !== undefined) {
        return (
            <Button
                onClick={onClick}
                variant="outlined"
                fullWidth
                sx={{
                    mb: 2,
                    textAlign: 'left',
                    justifyContent: 'flex-start',
                    height: 'auto',
                    py: 1.5,
                    px: 2,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
                        <ArrowLeft size={16} style={{ flexShrink: 0, marginRight: 8 }} />
                        <Box sx={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                            {queryLabel && (
                                <Typography variant="caption" color="text.secondary" display="block">
                                    {queryLabel}
                                </Typography>
                            )}
                            <Typography
                                variant="body2"
                                fontWeight={600}
                                sx={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }}
                                title={query}
                            >
                                {query || 'Recherche'}
                            </Typography>
                        </Box>
                    </Box>
                    <ArrowLeft size={16} style={{ flexShrink: 0, transform: 'rotate(180deg)' }} />
                </Box>
            </Button>
        );
    }

    return (
        <Button
            onClick={onClick}
            variant="outlined"
            fullWidth
            sx={{
                mb: 2,
                textAlign: 'left',
                justifyContent: 'flex-start',
                height: 'auto',
                py: 1.5,
                px: 2,
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
                    <ArrowLeft size={16} style={{ flexShrink: 0, marginRight: 8 }} />
                    <Box sx={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'nowrap' }}>
                            <Typography
                                variant="body2"
                                fontWeight={600}
                                sx={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    maxWidth: '40%',
                                }}
                                title={fromName || 'Départ'}
                            >
                                {fromName || 'Départ'}
                            </Typography>
                            <ArrowRight size={14} style={{ flexShrink: 0 }} />
                            <Typography
                                variant="body2"
                                fontWeight={600}
                                sx={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    maxWidth: '40%',
                                }}
                                title={toName || 'Arrivée'}
                            >
                                {toName || 'Arrivée'}
                            </Typography>
                        </Box>
                        {(filterDate || filterTime) && (
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                    display: 'block',
                                    mt: 0.5,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {filterDate && formatDate(filterDate)}
                                {filterDate && filterTime && ' • '}
                                {filterTime && formatTime(filterTime)}
                            </Typography>
                        )}
                    </Box>
                </Box>
                <ArrowLeft size={16} style={{ flexShrink: 0, transform: 'rotate(180deg)' }} />
            </Box>
        </Button>
    );
};

export default QueryOverview;
