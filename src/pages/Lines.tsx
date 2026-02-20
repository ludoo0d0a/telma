import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    Grid,
    CircularProgress,
    Alert,
} from '@mui/material';
import Footer from '@/components/Footer';
import PageLayout from '@/components/shared/PageLayout';
import { ArrowDown } from 'lucide-react';
import { getLines } from '@/services/navitiaApi';
import type { Line } from '@/client/models/line';

const Lines: React.FC = () => {
    const [lines, setLines] = useState<Line[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState<number>(0);
    const [hasMore, setHasMore] = useState<boolean>(true);

    useEffect(() => {
        const fetchLines = async (): Promise<void> => {
            try {
                setLoading(true);
                const data = await getLines('sncf', { start_page: page, count: 25 });
                const newLines = data.lines || [];
                setLines((prev) => (page === 0 ? newLines : [...prev, ...newLines]));
                setHasMore(newLines.length === 25);
                setError(null);
            } catch (err) {
                setError('Erreur lors du chargement des lignes');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchLines();
    }, [page]);

    return (
        <>
            <PageLayout>
                {loading && lines.length === 0 && (
                    <Paper sx={{ p: 4, textAlign: 'center' }}>
                        <CircularProgress />
                        <Typography sx={{ mt: 2 }}>Chargement des lignes...</Typography>
                    </Paper>
                )}

                {error && (
                    <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {!loading && lines.length > 0 && (
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h5" sx={{ mb: 2 }}>
                            Lignes disponibles <Box component="span" sx={{ color: 'primary.main' }}>{lines.length}</Box>
                        </Typography>
                        <Grid container spacing={2}>
                            {lines.map((line) => (
                                <Grid item key={line.id} xs={12} sm={6} md={4}>
                                    <Paper variant="outlined" sx={{ p: 2 }}>
                                        <Typography variant="h6" sx={{ mb: 1 }}>
                                            {line.name || line.code || 'Sans nom'}
                                        </Typography>
                                        <Typography variant="body2">
                                            <strong>ID:</strong> <code>{line.id}</code>
                                        </Typography>
                                        {line.commercial_mode && typeof line.commercial_mode === 'object' && 'name' in line.commercial_mode && (
                                            <Typography variant="body2">
                                                <strong>Mode:</strong> {(line.commercial_mode as { name?: string }).name}
                                            </Typography>
                                        )}
                                        {line.network && typeof line.network === 'object' && 'name' in line.network && (
                                            <Typography variant="body2">
                                                <strong>Réseau:</strong> {(line.network as { name?: string }).name}
                                            </Typography>
                                        )}
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    </Paper>
                )}

                {hasMore && !loading && (
                    <Box sx={{ textAlign: 'center', mt: 3 }}>
                        <Button
                            variant="contained"
                            onClick={() => setPage((prev) => prev + 1)}
                            startIcon={<ArrowDown size={20} />}
                        >
                            Charger plus
                        </Button>
                    </Box>
                )}

                {loading && lines.length > 0 && (
                    <Paper sx={{ p: 4, textAlign: 'center', mt: 2 }}>
                        <CircularProgress />
                        <Typography sx={{ mt: 2 }}>Chargement...</Typography>
                    </Paper>
                )}
            </PageLayout>
            <Footer />
        </>
    );
};

export default Lines;
