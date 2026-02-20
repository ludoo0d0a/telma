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
import { Route, TrafficCone, Settings, Loader2, Download } from 'lucide-react';
import Footer from '@/components/Footer';
import QueryOverview from '@/components/shared/QueryOverview';
import PageLayout from '@/components/shared/PageLayout';
import { getLineReports, getTrafficReports, getEquipmentReports } from '@/services/navitiaApi';
import type {
    CoverageCoverageLineReportsGet200Response,
    CoverageCoverageTrafficReportsGet200Response,
    CoverageCoverageEquipmentReportsGet200Response,
} from '@/client/models';

const Reports: React.FC = () => {
    const [reportType, setReportType] = useState<'line' | 'traffic' | 'equipment'>('traffic');
    const [filter, setFilter] = useState<string>('');
    const [reports, setReports] = useState<
        | CoverageCoverageLineReportsGet200Response
        | CoverageCoverageTrafficReportsGet200Response
        | CoverageCoverageEquipmentReportsGet200Response
        | null
    >(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [showResults, setShowResults] = useState<boolean>(false);

    const handleSearch = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        if (reportType === 'line' && !filter.trim()) {
            setError('Veuillez entrer un filtre pour les rapports de ligne');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setShowResults(false);
            let response;
            switch (reportType) {
                case 'line':
                    response = await getLineReports(filter);
                    break;
                case 'traffic':
                    response = await getTrafficReports();
                    break;
                case 'equipment':
                    response = await getEquipmentReports('sncf', filter || null);
                    break;
                default:
                    throw new Error('Type de rapport invalide');
            }

            setReports(response);
            setShowResults(true);
        } catch (err) {
            setError('Erreur lors de la récupération des rapports');
            console.error(err);
            setReports(null);
            setShowResults(false);
        } finally {
            setLoading(false);
        }
    };

    const getReportTypeLabel = (): string => {
        switch (reportType) {
            case 'line':
                return 'Rapports de ligne';
            case 'traffic':
                return 'Rapports de trafic';
            case 'equipment':
                return "Rapports d'équipement";
            default:
                return 'Rapports';
        }
    };

    const getQueryDisplay = (): string => {
        if (reportType === 'traffic') {
            return 'Tous les rapports de trafic';
        }
        return filter || 'Aucun filtre';
    };

    return (
        <>
            <PageLayout fullHeight={!showResults}>
                {!showResults && (
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <Paper sx={{ p: 2, mb: 2, flex: 1 }}>
                            <Typography variant="h6" sx={{ mb: 2 }}>
                                Type de rapport
                            </Typography>
                            <Tabs
                                value={reportType}
                                onChange={(_, v: 'line' | 'traffic' | 'equipment') => {
                                    setReportType(v);
                                    setReports(null);
                                    setError(null);
                                    setShowResults(false);
                                }}
                                variant="fullWidth"
                                sx={{ mb: 2 }}
                            >
                                <Tab value="line" icon={<Route size={16} />} iconPosition="start" label="Rapports de ligne" />
                                <Tab value="traffic" icon={<TrafficCone size={16} />} iconPosition="start" label="Rapports de trafic" />
                                <Tab value="equipment" icon={<Settings size={16} />} iconPosition="start" label="Rapports d'équipement" />
                            </Tabs>

                            <form onSubmit={handleSearch}>
                                {(reportType === 'line' || reportType === 'equipment') && (
                                    <TextField
                                        fullWidth
                                        label={`Filtre ${reportType === 'equipment' ? '(optionnel)' : '(requis)'}`}
                                        id="filter"
                                        value={filter}
                                        onChange={(e) => setFilter(e.target.value)}
                                        placeholder="Ex: line.id=line:SNCF:1"
                                        disabled={loading}
                                        sx={{ mb: 2 }}
                                    />
                                )}
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={loading}
                                    fullWidth
                                    startIcon={loading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                                >
                                    {loading ? 'Chargement...' : 'Récupérer les rapports'}
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
                            query={getQueryDisplay()}
                            queryLabel={getReportTypeLabel()}
                            onClick={() => setShowResults(false)}
                        />

                        {loading && (
                            <Paper sx={{ p: 4, textAlign: 'center' }}>
                                <CircularProgress />
                                <Typography sx={{ mt: 2 }}>Chargement des rapports...</Typography>
                            </Paper>
                        )}

                        {error && !loading && (
                            <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
                                {error}
                            </Alert>
                        )}

                        {!loading && reports && (
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
                                    {JSON.stringify(reports, null, 2)}
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

export default Reports;
