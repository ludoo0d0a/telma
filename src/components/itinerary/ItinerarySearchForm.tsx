import React from 'react';
import { Box, Paper, Typography, TextField, Button, Grid } from '@mui/material';
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
            <Grid container spacing={2} alignItems="flex-end">
                <Grid item xs={12} sm={5}>
                    <LocationAutocomplete
                        label="Gare de départ"
                        value={fromName}
                        onValueChange={onFromValueChange}
                        onChange={onFromChange}
                        defaultSearchTerm={fromName || 'Metz'}
                        onStationFound={onFromStationFound}
                        disabled={loading}
                    />
                </Grid>
                <Grid item xs={12} sm={2}>
                    <Button
                        variant="outlined"
                        onClick={onInvertItinerary}
                        disabled={loading || !fromId || !toId}
                        title="Inverser l'itinéraire"
                        sx={{ minWidth: 44, minHeight: 44 }}
                    >
                        <ArrowLeftRight size={20} />
                    </Button>
                </Grid>
                <Grid item xs={12} sm={5}>
                    <LocationAutocomplete
                        label="Gare d'arrivée"
                        value={toName}
                        onValueChange={onToValueChange}
                        onChange={onToChange}
                        defaultSearchTerm={toName || 'Thionville'}
                        onStationFound={onToStationFound}
                        disabled={loading}
                    />
                </Grid>
            </Grid>
            <Grid container spacing={2} alignItems="flex-end" sx={{ mt: 2 }}>
                <Grid item xs={6} sm={3}>
                    <TextField
                        label="Date"
                        type="date"
                        value={filterDate}
                        onChange={(e) => onFilterDateChange(e.target.value)}
                        disabled={loading}
                        size="small"
                        InputLabelProps={{ shrink: true }}
                    />
                </Grid>
                <Grid item xs={6} sm={3}>
                    <TextField
                        label="Heure"
                        type="time"
                        value={filterTime}
                        onChange={(e) => onFilterTimeChange(e.target.value)}
                        disabled={loading}
                        size="small"
                        InputLabelProps={{ shrink: true }}
                    />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Button
                        variant="contained"
                        onClick={onSearch}
                        disabled={loading || !fromId || !toId}
                        startIcon={<Search size={16} />}
                    >
                        Rechercher
                    </Button>
                </Grid>
            </Grid>
        </Paper>
    );
};

export default ItinerarySearchForm;
