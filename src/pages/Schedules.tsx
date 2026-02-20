import React, { useState } from 'react';
import {
    Box,
    Paper,
    TextField,
    Button,
    Alert,
    Tabs,
    Tab,
    Typography,
    CircularProgress,
} from '@mui/material';
import { MapPin, Route, Flag, Loader2, Search } from 'lucide-react';
import Footer from '@/components/Footer';
import { PageHeader } from '@/components/skytrip';
import QueryOverview from '@/components/shared/QueryOverview';
import PageLayout from '@/components/shared/PageLayout';
import { getStopSchedules, getRouteSchedules, getTerminusSchedules, formatDateTime } from '@/services/navitiaApi';
import type { StopSchedulesResponse, RouteSchedulesResponse, TerminusSchedulesResponse } from '@/client/models';

const Schedules: React.FC = () => {
    const [scheduleType, setScheduleType] = useState<'stop' | 'route' | 'terminus'>('stop');
    const [filter, setFilter] = useState<string>('');
    const [datetime, setDatetime] = useState<string>('');
    const [schedules, setSchedules] = useState<StopSchedulesResponse | RouteSchedulesResponse | TerminusSchedulesResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [showResults, setShowResults] = useState<boolean>(false);

    const handleSearch = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        if (!filter.trim()) {
            setError('Veuillez entrer un filtre');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setShowResults(false);
            const searchDatetime = datetime || formatDateTime(new Date());
            let response;

            switch (scheduleType) {
                case 'stop':
                    response = await getStopSchedules(filter, 'sncf', searchDatetime);
                    break;
                case 'route':
                    response = await getRouteSchedules(filter, 'sncf', searchDatetime);
                    break;
                case 'terminus':
                    response = await getTerminusSchedules(filter, 'sncf', searchDatetime);
                    break;
                default:
                    throw new Error('Type de planning invalide');
            }

            setSchedules(response);
            setShowResults(true);
        } catch (err) {
            setError('Erreur lors de la récupération des horaires');
            console.error(err);
            setSchedules(null);
            setShowResults(false);
        } finally {
            setLoading(false);
        }
    };

    const getScheduleTypeLabel = (): string => {
        switch (scheduleType) {
            case 'stop':
                return "Horaires d'arrêt";
            case 'route':
                return 'Horaires de ligne';
            case 'terminus':
                return 'Horaires terminus';
            default:
                return 'Horaires';
        }
    };

    return (
        <>
            <PageHeader
                title="Horaires et planning"
                subtitle="Consultez les horaires par arrêt, ligne ou terminus"
                showNotification={false}
            />
            <PageLayout fullHeight={!showResults}>
                {!showResults && (
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <Paper sx={{ p: 2, mb: 2, flex: 1 }}>
                            <Typography variant="h6" sx={{ mb: 2 }}>
                                Type de planning
                            </Typography>
                            <Tabs
                                value={scheduleType}
                                onChange={(_, v: 'stop' | 'route' | 'terminus') => {
                                    setScheduleType(v);
                                    setSchedules(null);
                                    setError(null);
                                    setShowResults(false);
                                }}
                                variant="fullWidth"
                                sx={{ mb: 2 }}
                            >
                                <Tab value="stop" icon={<MapPin size={16} />} iconPosition="start" label="Horaires d'arrêt" />
                                <Tab value="route" icon={<Route size={16} />} iconPosition="start" label="Horaires de ligne" />
                                <Tab value="terminus" icon={<Flag size={16} />} iconPosition="start" label="Horaires terminus" />
                            </Tabs>

                            <form onSubmit={handleSearch}>
                                <TextField
                                    fullWidth
                                    label="Filtre"
                                    id="filter"
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                    placeholder="stop_area.id=stop_area:SNCF:87391003 ou line.id=line:SNCF:1"
                                    helperText="Exemples: stop_area.id=stop_area:SNCF:87391003 ou line.id=line:SNCF:1"
                                    disabled={loading}
                                    sx={{ mb: 2 }}
                                />
                                <TextField
                                    fullWidth
                                    label="Date et heure (optionnel)"
                                    id="datetime"
                                    value={datetime}
                                    onChange={(e) => setDatetime(e.target.value)}
                                    placeholder="20250113T152944"
                                    helperText="Format: YYYYMMDDTHHmmss (ex: 20250113T152944)"
                                    disabled={loading}
                                    sx={{ mb: 2 }}
                                />
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={loading}
                                    fullWidth
                                    startIcon={loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                                >
                                    {loading ? 'Chargement...' : 'Rechercher'}
                                </Button>
                            </form>
                        </Paper>

                        {error && !loading && (
                            <Alert severity="error" onClose={() => setError(null)} sx={{ mt: 2 }}>
                                {error}
                            </Alert>
                        )}
                    </Box>
                )}

                {showResults && (
                    <>
                        <QueryOverview
                            query={filter}
                            queryLabel={getScheduleTypeLabel()}
                            onClick={() => setShowResults(false)}
                        />

                        {loading && (
                            <Paper sx={{ p: 4, textAlign: 'center' }}>
                                <CircularProgress />
                                <Typography sx={{ mt: 2 }}>Chargement des horaires...</Typography>
                            </Paper>
                        )}

                        {error && !loading && (
                            <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
                                {error}
                            </Alert>
                        )}

                        {!loading && schedules && (
                            <Paper sx={{ p: 2 }}>
                                <Typography variant="h5" sx={{ mb: 2 }}>
                                    Résultats
                                </Typography>
                                <Box
                                    component="pre"
                                    sx={{
                                        background: 'rgba(0, 0, 0, 0.3)',
                                        borderRadius: 2,
                                        p: 2,
                                        overflow: 'auto',
                                        color: '#ccc',
                                        fontFamily: "'Roboto Mono', monospace",
                                        fontSize: '0.9rem',
                                        whiteSpace: 'pre-wrap',
                                        wordWrap: 'break-word',
                                    }}
                                >
                                    {JSON.stringify(schedules, null, 2)}
                                </Box>
                            </Paper>
                        )}
                    </>
                )}
            </PageLayout>
            <Footer />
        </>
    );
};

export default Schedules;
