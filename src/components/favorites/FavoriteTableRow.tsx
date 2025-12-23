
import React from 'react';
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
        <tr>
            <td>
                <strong>{favorite.name}</strong>
            </td>
            <td>
                <span className='tag is-dark'>
                    {favorite.type === 'stop_area' ? 'Gare' : 'Point d\'arrêt'}
                </span>
            </td>
            <td>
                <span className='has-text-grey'>{formatDate(favorite.addedAt)}</span>
            </td>
            <td>
                <button
                    className='button is-small is-danger is-light'
                    onClick={() => onRemoveFavorite(favorite.id)}
                    title='Retirer des favoris'
                >
                    <span className='icon'>
                        <Trash2 size={16} />
                    </span>
                    <span>Retirer</span>
                </button>
            </td>
        </tr>
    );
};

export default FavoriteTableRow;
