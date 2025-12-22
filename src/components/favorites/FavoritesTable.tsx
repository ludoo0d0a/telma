import React from 'react';
import type { FavoriteLocation } from '@/services/favoritesService';
import FavoriteTableRow from './FavoriteTableRow';

interface FavoritesTableProps {
    favorites: FavoriteLocation[];
    onRemove: (id: string) => void;
    formatDate: (dateString: string | undefined) => string;
}

const FavoritesTable: React.FC<FavoritesTableProps> = ({ favorites, onRemove, formatDate }) => {
    return (
        <div className='box'>
            <h2 className='title is-4 mb-5'>
                Mes gares favorites <span className='tag is-primary is-medium'>{favorites.length}</span>
            </h2>
            <div className='table-container'>
                <table className='table is-fullwidth is-striped is-hoverable'>
                    <thead>
                        <tr>
                            <th>Nom</th>
                            <th>Type</th>
                            <th>Ajouté le</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {favorites.map((favorite) => (
                            <FavoriteTableRow
                                key={favorite.id}
                                favorite={favorite}
                                onRemove={onRemove}
                                formatDate={formatDate}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default FavoritesTable;

