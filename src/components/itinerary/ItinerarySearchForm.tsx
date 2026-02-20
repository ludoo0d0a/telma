import React from 'react';
import { Box, Paper, Typography, TextField, Button } from '@mui/material';
import { Search, ArrowLeftRight, RefreshCw } from 'lucide-react';
import LocationAutocomplete from '@/components/LocationAutocomplete';
import type { Place } from '@/client/models/place';

interface ItinerarySearchFormProps {
    fromName: string;
    toName: string;
    fromId: string | undefined;
    toId: string | undefined;
    filterDate: string;
    filterTime: string;
    loading: boolean;
    onRefresh?: () => void;
    refreshing?: boolean;
    onFromChange: (id: string | undefined) => void;
    onToChange: (id: string | undefined) => void;
    onFromValueChange: (value: string) => void;
    onToValueChange: (value: string) => void;
    onFromStationFound: (station: Place & { name?: string | null }) => void;
    onToStationFound: (station: Place & { name?: string | null }) => void;
    onFilterDateChange: (date: string) => void;
    onFilterTimeChange: (time: string) => void;
    onSearch: () => void;
    onInvertItinerary: () => void;
}

const ItinerarySearchForm: React.FC<ItinerarySearchFormProps> = ({
    fromName,
    toName,
    fromId,
    toId,
    filterDate,
    filterTime,
    loading,
    onRefresh,
    refreshing,
    onFromChange,
    onToChange,
    onFromValueChange,
    onToValueChange,
    onFromStationFound,
    onToStationFound,
    onFilterDateChange,
    onFilterTimeChange,
    onSearch,
    onInvertItinerary,
}) => {
    return (
        <Paper
            sx={{
                p: 2,
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0,
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Recherche d'itinéraire</Typography>
                {onRefresh && (
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={onRefresh}
                        disabled={loading || refreshing}
                        startIcon={refreshing ? <RefreshCw size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                    >
                        Actualiser
                    </Button>
                )}
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}>
                <LocationAutocomplete
                    label="Gare de départ"
                    value={fromName}
                    onValueChange={onFromValueChange}
                    onChange={onFromChange}
                    defaultSearchTerm={fromName || 'Metz'}
                    onStationFound={onFromStationFound}
                    disabled={loading}
                />
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 0.5 }}>
                    <Button
                        variant="outlined"
                        onClick={onInvertItinerary}
                        disabled={loading || !fromId || !toId}
                        title="Inverser l'itinéraire"
                        sx={{ minWidth: 44, minHeight: 44 }}
                    >
                        <ArrowLeftRight size={20} />
                    </Button>
                </Box>
                <LocationAutocomplete
                    label="Gare d'arrivée"
                    value={toName}
                    onValueChange={onToValueChange}
                    onChange={onToChange}
                    defaultSearchTerm={toName || 'Thionville'}
                    onStationFound={onToStationFound}
                    disabled={loading}
                />
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'flex-end', mt: 2, width: '100%' }}>
                <TextField
                    label="Date"
                    type="date"
                    value={filterDate}
                    onChange={(e) => onFilterDateChange(e.target.value)}
                    disabled={loading}
                    size="small"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    sx={{ flex: { xs: '1 1 100%', sm: '1 1 140px' }, minWidth: 0 }}
                />
                <TextField
                    label="Heure"
                    type="time"
                    value={filterTime}
                    onChange={(e) => onFilterTimeChange(e.target.value)}
                    disabled={loading}
                    size="small"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    sx={{ flex: { xs: '1 1 100%', sm: '1 1 100px' }, minWidth: 0 }}
                />
                <Button
                    variant="contained"
                    onClick={onSearch}
                    disabled={loading || !fromId || !toId}
                    startIcon={<Search size={16} />}
                    sx={{ flex: { xs: '1 1 100%', sm: '1 1 auto' } }}
                >
                    Rechercher
                </Button>
            </Box>
        </Paper>
    );
};

export default ItinerarySearchForm;
