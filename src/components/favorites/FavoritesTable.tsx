import React from 'react';
import { Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';
import type { FavoriteLocation } from '@/services/favoritesService';
import FavoriteTableRow from './FavoriteTableRow';

interface FavoritesTableProps {
    favorites: FavoriteLocation[];
    onRemoveFavorite: (id: string) => void;
}

const FavoritesTable: React.FC<FavoritesTableProps> = ({ favorites, onRemoveFavorite }) => {
    return (
        <Paper sx={{ p: 2 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
                Mes gares favorites <Chip label={favorites.length} color="primary" size="small" sx={{ ml: 1 }} />
            </Typography>
            <TableContainer>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>Nom</strong></TableCell>
                            <TableCell><strong>Type</strong></TableCell>
                            <TableCell><strong>Ajouté le</strong></TableCell>
                            <TableCell><strong>Actions</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {favorites.map((favorite) => (
                            <FavoriteTableRow
                                key={favorite.id}
                                favorite={favorite}
                                onRemoveFavorite={onRemoveFavorite}
                            />
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
};

export default FavoritesTable;
