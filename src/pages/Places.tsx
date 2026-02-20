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
    Grid,
    CircularProgress,
} from '@mui/material';
import Footer from '@/components/Footer';
import { PageHeader } from '@/components/skytrip';
import Ad from '@/components/Ad';
import QueryOverview from '@/components/shared/QueryOverview';
import PageLayout from '@/components/shared/PageLayout';
import { searchPlaces, getPlacesNearby } from '@/services/navitiaApi';
import type { Place } from '@/client/models/place';
import { Search, MapPin, Loader2 } from 'lucide-react';

const Places: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [coordQuery, setCoordQuery] = useState<string>('');
    const [places, setPlaces] = useState<Place[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [searchType, setSearchType] = useState<'text' | 'nearby'>('text');
    const [showResults, setShowResults] = useState<boolean>(false);

    const handleTextSearch = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        if (!searchQuery.trim()) {
            setError('Veuillez entrer un terme de recherche');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setShowResults(false);
            const data = await searchPlaces(searchQuery);
            setPlaces(data.places || []);
            setShowResults(true);
        } catch (err) {
            setError('Erreur lors de la recherche');
            console.error(err);
            setPlaces([]);
            setShowResults(false);
        } finally {
            setLoading(false);
        }
    };

    const handleNearbySearch = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        if (!coordQuery.trim()) {
            setError('Veuillez entrer des coordonnées (format: lon;lat)');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setShowResults(false);
            const data = await getPlacesNearby(coordQuery);
            setPlaces(data.stop_areas || []);
            setShowResults(true);
        } catch (err) {
            setError('Erreur lors de la recherche');
            console.error(err);
            setPlaces([]);
            setShowResults(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <PageHeader
                title="Recherche de lieux"
                subtitle="Trouvez les gares et arrêts à proximité ou par mot-clé"
                showNotification={false}
            />
            <PageLayout fullHeight={!showResults}>
                {!showResults && (
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ mb: 2 }}>
                            <Ad format="horizontal" size="responsive" />
                        </Box>

                        <Paper sx={{ p: 2, mb: 2, flex: 1 }}>
                            <Typography variant="h6" sx={{ mb: 2 }}>
                                Type de recherche
                            </Typography>
                            <Tabs
                                value={searchType}
                                onChange={(_, v: 'text' | 'nearby') => {
                                    setSearchType(v);
                                    setPlaces([]);
                                    setError(null);
                                    setShowResults(false);
                                }}
                                variant="fullWidth"
                                sx={{ mb: 2 }}
                            >
                                <Tab
                                    value="text"
                                    icon={<Search size={16} />}
                                    iconPosition="start"
                                    label="Recherche par texte"
                                />
                                <Tab
                                    value="nearby"
                                    icon={<MapPin size={16} />}
                                    iconPosition="start"
                                    label="Recherche par coordonnées"
                                />
                            </Tabs>

                            {searchType === 'text' ? (
                                <form onSubmit={handleTextSearch}>
                                    <TextField
                                        fullWidth
                                        label="Rechercher un lieu"
                                        id="search"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Ex: Paris, Gare du Nord..."
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
                                        {loading ? 'Recherche...' : 'Rechercher'}
                                    </Button>
                                </form>
                            ) : (
                                <form onSubmit={handleNearbySearch}>
                                    <TextField
                                        fullWidth
                                        label="Coordonnées (format: lon;lat)"
                                        id="coord"
                                        value={coordQuery}
                                        onChange={(e) => setCoordQuery(e.target.value)}
                                        placeholder="Ex: 2.3522;48.8566"
                                        helperText="Format: longitude;latitude (ex: 2.3522;48.8566 pour Paris)"
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
                                        {loading ? 'Recherche...' : 'Rechercher'}
                                    </Button>
                                </form>
                            )}
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
                            query={searchType === 'text' ? searchQuery : coordQuery}
                            queryLabel={searchType === 'text' ? 'Recherche par texte' : 'Recherche par coordonnées'}
                            onClick={() => setShowResults(false)}
                        />

                        {loading && (
                            <Paper sx={{ p: 4, textAlign: 'center' }}>
                                <CircularProgress />
                                <Typography sx={{ mt: 2 }}>Chargement des lieux...</Typography>
                            </Paper>
                        )}

                        {error && !loading && (
                            <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
                                {error}
                            </Alert>
                        )}

                        {!loading && places.length > 0 && (
                            <>
                                <Box sx={{ mb: 2 }}>
                                    <Ad format="auto" size="responsive" />
                                </Box>

                                <Paper sx={{ p: 2 }}>
                                    <Typography variant="h5" sx={{ mb: 2 }}>
                                        Résultats <Box component="span" sx={{ color: 'primary.main' }}>{places.length}</Box>
                                    </Typography>
                                    <Grid container spacing={2}>
                                        {places.map((place, index) => (
                                            <Grid item key={place.id || index} xs={12} sm={6}>
                                                <Paper variant="outlined" sx={{ p: 2 }}>
                                                    <Typography variant="h6" sx={{ mb: 1 }}>
                                                        {place.name || 'Sans nom'}
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        <strong>Type:</strong> {place.embedded_type || 'N/A'}
                                                    </Typography>
                                                    {place.id && (
                                                        <Typography variant="body2">
                                                            <strong>ID:</strong> <code>{place.id}</code>
                                                        </Typography>
                                                    )}
                                                    {place.administrative_regions && place.administrative_regions.length > 0 && (
                                                        <Typography variant="body2">
                                                            <strong>Région:</strong> {place.administrative_regions[0].name}
                                                        </Typography>
                                                    )}
                                                </Paper>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Paper>

                                <Box sx={{ mb: 2, mt: 2 }}>
                                    <Ad format="rectangle" size="responsive" />
                                </Box>
                            </>
                        )}

                        {!loading && places.length === 0 && !error && (searchQuery || coordQuery) && (
                            <Paper sx={{ p: 4, textAlign: 'center' }}>
                                <Typography sx={{ fontSize: '4rem', mb: 2 }}>📍</Typography>
                                <Typography variant="h5">Aucun résultat trouvé</Typography>
                                <Typography color="text.secondary">
                                    Aucun lieu ne correspond à votre recherche.
                                </Typography>
                            </Paper>
                        )}
                    </>
                )}
            </PageLayout>
            <Footer />
        </>
    );
};

export default Places;
