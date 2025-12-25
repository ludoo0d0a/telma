
import firebaseStorageService from './firebaseStorageService';

const FAVORITES_KEY = 'sncf_favorite_locations';
const FAVORITES_FILE_NAME = 'favorites.json';

export interface FavoriteLocation {
    id: string;
    name: string;
    type: string;
    addedAt?: string;
}

/**
 * Get all favorite locations from cache or Firebase Storage
 */
export const getFavorites = async (): Promise<FavoriteLocation[]> => {
    const cachedFavorites = localStorage.getItem(FAVORITES_KEY);
    if (cachedFavorites) {
        return JSON.parse(cachedFavorites);
    }

    try {
        const favorites = await firebaseStorageService.readFile(FAVORITES_FILE_NAME);
        if (favorites) {
            localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
            return favorites;
        }
    } catch (error) {
        console.warn('Could not load favorites from Firebase Storage:', error);
    }

    return [];
};

/**
 * Add a location to favorites
 */
export const addFavorite = async (id: string, name: string, type: string): Promise<void> => {
    const favorites = await getFavorites();
    if (!favorites.find(fav => fav.id === id)) {
        favorites.push({ id, name, type, addedAt: new Date().toISOString() });
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
        try {
            await firebaseStorageService.uploadFile(FAVORITES_FILE_NAME, favorites);
        } catch (error) {
            console.warn('Could not sync favorites to Firebase Storage:', error);
        }
    }
};

/**
 * Remove a location from favorites
 */
export const removeFavorite = async (id: string): Promise<void> => {
    let favorites = await getFavorites();
    favorites = favorites.filter(fav => fav.id !== id);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    try {
        await firebaseStorageService.uploadFile(FAVORITES_FILE_NAME, favorites);
    } catch (error) {
        console.warn('Could not sync favorites to Firebase Storage:', error);
    }
};

/**
 * Check if a location is in favorites
 */
export const isFavorite = async (id: string): Promise<boolean> => {
    const favorites = await getFavorites();
    return favorites.some(fav => fav.id === id);
};

/**
 * Sort suggestions to show favorites first
 */
export const sortFavoritesFirst = async <T extends { id: string }>(suggestions: T[]): Promise<T[]> => {
    const favorites = await getFavorites();
    const favoriteIds = new Set(favorites.map(fav => fav.id));
    
    const favoritesList = suggestions.filter(s => favoriteIds.has(s.id));
    const nonFavoritesList = suggestions.filter(s => !favoriteIds.has(s.id));
    
    return [...favoritesList, ...nonFavoritesList];
};
