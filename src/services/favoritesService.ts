const FAVORITES_KEY = 'sncf_favorite_locations';

interface FavoriteLocation {
    id: string;
    name: string;
    type: string;
    addedAt?: string;
}

/**
 * Get all favorite locations from localStorage
 */
export const getFavorites = (): FavoriteLocation[] => {
    try {
        const favorites = localStorage.getItem(FAVORITES_KEY);
        return favorites ? JSON.parse(favorites) : [];
    } catch (error) {
        console.error('Error reading favorites from localStorage:', error);
        return [];
    }
};

/**
 * Add a location to favorites
 */
export const addFavorite = (id: string, name: string, type: string): void => {
    try {
        const favorites = getFavorites();
        // Check if already exists
        if (!favorites.find(fav => fav.id === id)) {
            favorites.push({ id, name, type, addedAt: new Date().toISOString() });
            localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
        }
    } catch (error) {
        console.error('Error adding favorite to localStorage:', error);
    }
};

/**
 * Remove a location from favorites
 */
export const removeFavorite = (id: string): void => {
    try {
        const favorites = getFavorites();
        const filtered = favorites.filter(fav => fav.id !== id);
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
    } catch (error) {
        console.error('Error removing favorite from localStorage:', error);
    }
};

/**
 * Check if a location is in favorites
 */
export const isFavorite = (id: string): boolean => {
    const favorites = getFavorites();
    return favorites.some(fav => fav.id === id);
};

/**
 * Sort suggestions to show favorites first
 */
export const sortFavoritesFirst = <T extends { id: string }>(suggestions: T[]): T[] => {
    const favorites = getFavorites();
    const favoriteIds = new Set(favorites.map(fav => fav.id));
    
    const favoritesList = suggestions.filter(s => favoriteIds.has(s.id));
    const nonFavoritesList = suggestions.filter(s => !favoriteIds.has(s.id));
    
    return [...favoritesList, ...nonFavoritesList];
};

