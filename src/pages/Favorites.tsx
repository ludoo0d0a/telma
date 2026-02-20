import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { getFavorites, removeFavorite, type FavoriteLocation } from '@/services/favoritesService';
import { MapPin, Loader2 } from 'lucide-react';
import FavoritesTable from '@/components/favorites/FavoritesTable';
import Footer from '@/components/Footer';
import { PageHeader } from '@/components/skytrip';
import PageLayout from '@/components/shared/PageLayout';

const Favorites: React.FC = () => {
    const [favorites, setFavorites] = useState<FavoriteLocation[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchFavorites = async () => {
            setLoading(true);
            const favs = await getFavorites();
            setFavorites(favs);
            setLoading(false);
        };
        fetchFavorites();
    }, []);

    const handleRemoveFavorite = async (id: string) => {
        await removeFavorite(id);
        const updatedFavorites = await getFavorites();
        setFavorites(updatedFavorites);
    };

    return (
        <>
            <PageHeader
                title="Vos favoris"
                subtitle="Retrouvez rapidement vos gares et lieux sauvegardés"
                showNotification={false}
            />
            <PageLayout>
                {loading ? (
                    <Paper sx={{ p: 4, textAlign: 'center' }}>
                        <Loader2 className="animate-spin" size={48} />
                        <Typography sx={{ mt: 2 }}>Chargement des favoris...</Typography>
                    </Paper>
                ) : favorites.length > 0 ? (
                    <FavoritesTable
                        favorites={favorites}
                        onRemoveFavorite={handleRemoveFavorite}
                    />
                ) : (
                    <Paper sx={{ p: 4 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <MapPin size={32} color="var(--primary)" />
                            <Typography variant="h6">Vous n'avez pas encore de favoris.</Typography>
                        </Box>
                        <Typography color="text.secondary">
                            Pour ajouter un favori, recherchez un lieu ou une gare et cliquez sur l'étoile.
                        </Typography>
                    </Paper>
                )}
            </PageLayout>
            <Footer />
        </>
    );
};

export default Favorites;
