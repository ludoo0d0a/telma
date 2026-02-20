import React from 'react';
import { TableRow, TableCell, Button, Chip } from '@mui/material';
import { Trash2 } from 'lucide-react';
import type { FavoriteLocation } from '@/services/favoritesService';

interface FavoriteTableRowProps {
    favorite: FavoriteLocation;
    onRemoveFavorite: (id: string) => void;
}

const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'Date inconnue';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

const FavoriteTableRow: React.FC<FavoriteTableRowProps> = ({ favorite, onRemoveFavorite }) => {
    return (
        <TableRow>
            <TableCell><strong>{favorite.name}</strong></TableCell>
            <TableCell>
                <Chip
                    label={favorite.type === 'stop_area' ? 'Gare' : "Point d'arrêt"}
                    size="small"
                    variant="outlined"
                />
            </TableCell>
            <TableCell>
                <span style={{ color: 'var(--text-secondary)' }}>{formatDate(favorite.addedAt)}</span>
            </TableCell>
            <TableCell>
                <Button
                    size="small"
                    color="error"
                    variant="outlined"
                    onClick={() => onRemoveFavorite(favorite.id)}
                    title="Retirer des favoris"
                    startIcon={<Trash2 size={16} />}
                >
                    Retirer
                </Button>
            </TableCell>
        </TableRow>
    );
};

export default FavoriteTableRow;
