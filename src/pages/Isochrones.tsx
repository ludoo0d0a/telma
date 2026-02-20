import React, { useState } from 'react';
import {
    Box,
    Paper,
    TextField,
    Button,
    Alert,
    Typography,
    CircularProgress,
} from '@mui/material';
import Footer from '@/components/Footer';
import { PageHeader } from '@/components/skytrip';
import QueryOverview from '@/components/shared/QueryOverview';
import PageLayout from '@/components/shared/PageLayout';
import GeoJSONMap from '@/components/GeoJSONMap';
import { Loader2, Calculator, ChevronLeft } from 'lucide-react';
import { getIsochrones } from '@/services/navitiaApi';
import type { CoverageCoverageIsochronesGet200Response } from '@/client/models';

interface IsochroneFeature {
    max_duration?: number;
    [key: string]: unknown;
}

const Isochrones: React.FC = () => {
    const [from, setFrom] = useState<string>('');
    const [maxDuration, setMaxDuration] = useState<string>('3600');
    const [isochrones, setIsochrones] = useState<CoverageCoverageIsochronesGet200Response | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [showResults, setShowResults] = useState<boolean>(false);

    const handleSearch = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        if (!from.trim()) {
            setError('Veuillez entrer un point de départ');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setShowResults(false);
            const data = await getIsochrones(from, null, 'sncf', {
                max_duration: parseInt(maxDuration) || 3600,
            });
            setIsochrones(data);
            setShowResults(true);
        } catch (err) {
            setError('Erreur lors du calcul des isochrones');
            console.error(err);
            setIsochrones(null);
            setShowResults(false);
        } finally {
            setLoading(false);
        }
    };

    if (showResults) {
        return (
            <>
                <nav className="navbar is-fixed-top">
                    <PageHeader
                        title="Résultats des isochrones"
                        subtitle="Zones accessibles"
                        showNotification={false}
                    />
                </nav>
                <section className='section'>
                    <div className='container'>
                        <div className="box mb-5">
                            <button onClick={() => setShowResults(false)} className="button is-light is-fullwidth">
                                <span className="icon"><ChevronLeft size={16} /></span>
                                <span>Modifier la recherche</span>
                            </button>
                            <div className="mt-4 content is-small">
                                <p><strong>Départ:</strong> {from}</p>
                                <p><strong>Durée max:</strong> {maxDuration}s</p>
                            </div>
                        </div>

                        {loading && (
                            <div className='box has-text-centered'>
                                <div className='loader-wrapper'>
                                    <div className='loader is-loading'></div>
                                </div>
                                <p className='mt-4 subtitle is-5'>Calcul des isochrones...</p>
                            </div>
                        )}

                        {error && (
                            <div className='notification is-danger'>
                                <button className='delete' onClick={() => setError(null)}></button>
                                <p className='title is-5'>Erreur</p>
                                <p>{error}</p>
                            </div>
                        )}

                        {!loading && isochrones && (
                            <div className='box'>
                                <h2 className='title is-4 mb-5'>Résultats</h2>
                                {isochrones.isochrones && isochrones.isochrones.length > 0 && (
                                    <div className='mb-5'>
                                        <GeoJSONMap
                                            geojsonData={isochrones.isochrones}
                                            style={(feature: unknown) => {
                                                const props = (feature as { properties?: IsochroneFeature })?.properties;
                                                const duration = props?.max_duration || 0;
                                                const hue = Math.max(0, 240 - (duration / 3600) * 60);
                                                return {
                                                    color: `hsl(${hue}, 70%, 50%)`,
                                                    weight: 2,
                                                    opacity: 0.8,
                                                    fillColor: `hsl(${hue}, 70%, 50%)`,
                                                    fillOpacity: 0.3
                                                };
                                            }}
                                            height={500}
                                        />
                                    </div>
                                )}
                                <div className='content mb-4'>
                                    {isochrones.isochrones && isochrones.isochrones.map((iso, index) => (
                                        <div key={index} className='box mb-3'>
                                            <strong>Isochrone {index + 1}:</strong> Durée maximale: {iso.max_duration ? `${Math.floor(iso.max_duration / 60)} minutes` : 'N/A'}
                                        </div>
                                    ))}
                                </div>
                                <details>
                                    <summary className='title is-6 mb-4' style={{ cursor: 'pointer' }}>
                                        Afficher les données JSON
                                    </summary>
                                    <div className='content mt-4'>
                                        <pre style={{
                                            background: 'rgba(0, 0, 0, 0.3)',
                                            borderRadius: '10px',
                                            padding: '1.5rem',
                                            overflow: 'auto',
                                            color: '#ccc',
                                            fontFamily: "'Roboto Mono', monospace",
                                            fontSize: '0.9rem',
                                            whiteSpace: 'pre-wrap',
                                            wordWrap: 'break-word'
                                        }}>{JSON.stringify(isochrones, null, 2)}</pre>
                                    </div>
                                </details>
                            </div>
                        )}
                    </div>
                </section>
                <Footer />
            </>
        )
    }

    return (
        <>
            <nav className="navbar is-fixed-top">
                <PageHeader
                    title="Isochrones"
                    subtitle="Visualisez les zones accessibles selon un temps de trajet"
                    showNotification={false}
                />
            </nav>
            <section className='section'>
                <div className='container'>
                    <div className='notification is-warning mb-5'>
                        <p><strong>⚠️ Cette fonctionnalité est en version Beta</strong></p>
                    </div>

                        <Paper sx={{ p: 2, mb: 2, flex: 1 }}>
                            <Typography variant="h6" sx={{ mb: 2 }}>
                                Calculer les isochrones
                            </Typography>
                            <form onSubmit={handleSearch}>
                                <TextField
                                    fullWidth
                                    label="Point de départ"
                                    id="from"
                                    value={from}
                                    onChange={(e) => setFrom(e.target.value)}
                                    placeholder="admin:fr:75056 ou 2.3522;48.8566"
                                    helperText="ID admin (ex: admin:fr:75056) ou coordonnées (ex: 2.3522;48.8566)"
                                    disabled={loading}
                                    sx={{ mb: 2 }}
                                />
                                <TextField
                                    fullWidth
                                    label="Durée maximale (en secondes)"
                                    id="maxDuration"
                                    type="number"
                                    value={maxDuration}
                                    onChange={(e) => setMaxDuration(e.target.value)}
                                    placeholder="3600"
                                    helperText="Durée maximale en secondes (ex: 3600 = 1 heure)"
                                    disabled={loading}
                                    sx={{ mb: 2 }}
                                />
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={loading}
                                    fullWidth
                                    startIcon={loading ? <Loader2 size={16} className="animate-spin" /> : <Calculator size={16} />}
                                >
                                    {loading ? 'Calcul...' : 'Calculer les isochrones'}
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
                            queryLabel="Isochrones"
                            onClick={() => setShowResults(false)}
                        />

                        {loading && (
                            <Paper sx={{ p: 4, textAlign: 'center' }}>
                                <CircularProgress />
                                <Typography sx={{ mt: 2 }}>Calcul des isochrones...</Typography>
                            </Paper>
                        )}

                        {error && !loading && (
                            <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
                                {error}
                            </Alert>
                        )}

                        {!loading && isochrones && (
                            <Paper sx={{ p: 2 }}>
                                <Typography variant="h5" sx={{ mb: 2 }}>
                                    Résultats
                                </Typography>
                                {isochrones.isochrones && isochrones.isochrones.length > 0 && (
                                    <Box sx={{ mb: 2 }}>
                                        <GeoJSONMap
                                            geojsonData={isochrones.isochrones}
                                            style={(feature: unknown) => {
                                                const props = (feature as { properties?: IsochroneFeature })?.properties;
                                                const duration = props?.max_duration || 0;
                                                const hue = Math.max(0, 240 - (duration / 3600) * 60);
                                                return {
                                                    color: `hsl(${hue}, 70%, 50%)`,
                                                    weight: 2,
                                                    opacity: 0.8,
                                                    fillColor: `hsl(${hue}, 70%, 50%)`,
                                                    fillOpacity: 0.3,
                                                };
                                            }}
                                            height={500}
                                        />
                                    </Box>
                                )}
                                <Box sx={{ mb: 2 }}>
                                    {isochrones.isochrones && isochrones.isochrones.map((iso, index) => (
                                        <Paper key={index} variant="outlined" sx={{ p: 2, mb: 2 }}>
                                            <strong>Isochrone {index + 1}:</strong> Durée maximale:{' '}
                                            {iso.max_duration ? `${Math.floor(iso.max_duration / 60)} minutes` : 'N/A'}
                                        </Paper>
                                    ))}
                                </Box>
                                <details>
                                    <summary style={{ cursor: 'pointer', marginBottom: 16 }}>
                                        <Typography variant="subtitle1">Afficher les données JSON</Typography>
                                    </summary>
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
                                        {JSON.stringify(isochrones, null, 2)}
                                    </Box>
                                </details>
                            </Paper>
                        )}
                    </>
                )}
            </PageLayout>
            <Footer />
        </>
    );
};

export default Isochrones;
