import React, { useState, useRef, useEffect } from 'react';
import { Box, Paper, Typography, TextField, InputAdornment } from '@mui/material';
import { Loader2, Search, Train as TrainIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Ad from '@/components/Ad';
import { autocompletePT } from '@/services/navitiaApi';
import { encodeVehicleJourneyId, parseVehicleJourneyId } from '@/utils/uriUtils';
import { getTransportIcon } from '@/services/transportService';
import type { ExtendedVehicleJourney } from './types';
import PageLayout from '@/components/shared/PageLayout';
import { Link as RouterLink } from 'react-router-dom';

const TrainSearch: React.FC = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [suggestions, setSuggestions] = useState<ExtendedVehicleJourney[]>([]);
    const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
    const [searchLoading, setSearchLoading] = useState<boolean>(false);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent): void => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsSearchOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const searchTrains = async (query: string): Promise<void> => {
        if (!query || query.length < 2) {
            setSuggestions([]);
            setIsSearchOpen(false);
            return;
        }
        setSearchLoading(true);
        try {
            const data = await autocompletePT(query, 'sncf', 20);
            const ptObjects = ((data as unknown as { pt_objects?: Array<{ embedded_type?: string; vehicle_journey?: unknown }> }).pt_objects || []);
            const vehicleJourneys = ptObjects
                .filter((obj) => (obj.embedded_type as string) === 'vehicle_journey' && obj.vehicle_journey)
                .map((obj) => obj.vehicle_journey as ExtendedVehicleJourney);
            setSuggestions(vehicleJourneys);
            setIsSearchOpen(vehicleJourneys.length > 0);
        } catch (err) {
            console.error('Error searching trains:', err);
            setSuggestions([]);
            setIsSearchOpen(false);
        } finally {
            setSearchLoading(false);
        }
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const value = e.target.value;
        setSearchQuery(value);
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = setTimeout(() => {
            if (value.length >= 2) searchTrains(value);
            else { setSuggestions([]); setIsSearchOpen(false); }
        }, 300);
    };

    const handleSelectTrain = (train: ExtendedVehicleJourney): void => {
        if (train.id) navigate(`/train/${encodeVehicleJourneyId(train.id)}`);
    };

    return (
        <PageLayout>
            <Paper sx={{ p: 2 }}>
                <Typography variant="h4" sx={{ mb: 1 }}>Rechercher un train</Typography>
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                    Recherchez un train par son numéro ou son type (TGV, TER, etc.)
                </Typography>

                <Box sx={{ mb: 2 }}>
                    <Ad format="horizontal" size="responsive" />
                </Box>

                <Box ref={wrapperRef} sx={{ position: 'relative' }}>
                    <TextField
                        fullWidth
                        label="Numéro ou type de train"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        onFocus={() => suggestions.length > 0 && setIsSearchOpen(true)}
                        placeholder="Ex: 1234, TGV, TER..."
                        size="medium"
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    {searchLoading ? <Loader2 size={20} className="animate-spin" /> : searchQuery ? <Search size={20} /> : null}
                                </InputAdornment>
                            ),
                        }}
                    />
                    {isSearchOpen && suggestions.length > 0 && (
                        <Paper sx={{ position: 'absolute', zIndex: 10, width: '100%', maxHeight: 400, overflow: 'auto', mt: 0.5 }}>
                            {suggestions.map((train, index) => {
                                const displayInfo = train.display_informations || {};
                                const trainNumber = displayInfo.headsign || displayInfo.trip_short_name || train.id || '';
                                const transportInfo = getTransportIcon(displayInfo.commercial_mode || '', displayInfo.network || '');
                                const Icon = transportInfo.icon;
                                return (
                                    <Box
                                        key={train.id || index}
                                        onClick={() => handleSelectTrain(train)}
                                        sx={{ p: 2, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' }, borderBottom: '1px solid', borderColor: 'divider' }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Icon size={16} />
                                            <Box sx={{ flex: 1 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Typography component="span" fontWeight={600}>{trainNumber}</Typography>
                                                    <Typography component="span" variant="caption" sx={{ bgcolor: 'grey.200', px: 1, borderRadius: 1 }}>{transportInfo.label}</Typography>
                                                </Box>
                                                {displayInfo.direction && (
                                                    <Typography variant="caption" color="text.secondary">{displayInfo.direction}</Typography>
                                                )}
                                            </Box>
                                        </Box>
                                    </Box>
                                );
                            })}
                        </Paper>
                    )}
                    {searchQuery.length >= 2 && !searchLoading && suggestions.length === 0 && (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>Aucun train trouvé</Typography>
                    )}
                </Box>

                <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>Exemples</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                        {['vehicle_journey:SNCF:2025-12-18:88776:1187:Train', 'vehicle_journey:SNCF:2025-12-18:88778:1187:Train'].map((sampleId) => {
                            const parsed = parseVehicleJourneyId(sampleId);
                            if (!parsed) return null;
                            return (
                                <Link
                                    key={sampleId}
                                    component={RouterLink}
                                    to={`/train/${encodeVehicleJourneyId(sampleId)}`}
                                    underline="none"
                                    sx={{ flex: '1 1 200px', maxWidth: 400 }}
                                >
                                    <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, '&:hover': { bgcolor: 'action.hover' } }}>
                                        <TrainIcon size={32} color="var(--primary)" />
                                        <Box>
                                            <Typography variant="h6">Train {parsed.trainNumber}</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {parsed.vehicleType} • {parsed.date}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">ID: {parsed.id2}</Typography>
                                        </Box>
                                    </Paper>
                                </Link>
                            );
                        })}
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        Cliquez sur un exemple pour voir les détails du train
                    </Typography>
                </Box>
            </Paper>
        </PageLayout>
    );
};

export default TrainSearch;
