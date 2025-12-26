import firebaseFavoritesService from './firebaseFavoritesService';
import localStorageFavoritesService from './localStorageFavoritesService';
import type { IFavoritesStorageService, FavoriteLocation } from './favoritesStorageService.interface';

// Re-export the interface for convenience
export type { FavoriteLocation } from './favoritesStorageService.interface';

/**
 * Determine which storage service to use based on authentication state
 * Uses Firebase if user is authenticated, localStorage otherwise
 */
const getStorageService = (): IFavoritesStorageService => {
    // Check if user is authenticated by looking for Google ID token
    const hasAuthToken = localStorage.getItem('googleIdToken') !== null;
    
    if (hasAuthToken) {
        try {
            // Try to use Firebase service
            return firebaseFavoritesService;
        } catch (error) {
            console.warn('Firebase service not available, falling back to localStorage:', error);
            return localStorageFavoritesService;
        }
    }
    
    // Use localStorage for unauthenticated users
    return localStorageFavoritesService;
};

/**
 * Get all favorite locations
 * Uses Firebase if authenticated, localStorage otherwise
 */
export const getFavorites = async (): Promise<FavoriteLocation[]> => {
    const storageService = getStorageService();
    try {
        return await storageService.getFavorites();
    } catch (error) {
        console.error('Error getting favorites:', error);
        // Fallback to localStorage if Firebase fails
        if (storageService !== localStorageFavoritesService) {
            try {
                return await localStorageFavoritesService.getFavorites();
            } catch (fallbackError) {
                console.error('Error getting favorites from localStorage fallback:', fallbackError);
            }
        }
        return [];
    }
};

/**
 * Add a location to favorites
 * Uses Firebase if authenticated, localStorage otherwise
 */
export const addFavorite = async (id: string, name: string, type: string): Promise<void> => {
    const storageService = getStorageService();
    const favorite: FavoriteLocation = {
        id,
        name,
        type,
        addedAt: new Date().toISOString(),
    };

    try {
        await storageService.addFavorite(favorite);
    } catch (error) {
        console.error('Error adding favorite:', error);
        // Fallback to localStorage if Firebase fails
        if (storageService !== localStorageFavoritesService) {
            try {
                await localStorageFavoritesService.addFavorite(favorite);
            } catch (fallbackError) {
                console.error('Error adding favorite to localStorage fallback:', fallbackError);
                throw fallbackError;
            }
        } else {
            throw error;
        }
    }
};

/**
 * Remove a location from favorites
 * Uses Firebase if authenticated, localStorage otherwise
 */
export const removeFavorite = async (id: string): Promise<void> => {
    const storageService = getStorageService();
    
    try {
        await storageService.removeFavorite(id);
    } catch (error) {
        console.error('Error removing favorite:', error);
        // Fallback to localStorage if Firebase fails
        if (storageService !== localStorageFavoritesService) {
            try {
                await localStorageFavoritesService.removeFavorite(id);
            } catch (fallbackError) {
                console.error('Error removing favorite from localStorage fallback:', fallbackError);
                throw fallbackError;
            }
        } else {
            throw error;
        }
    }
};

/**
 * Check if a location is in favorites
 * Uses Firebase if authenticated, localStorage otherwise
 */
export const isFavorite = async (id: string): Promise<boolean> => {
    const storageService = getStorageService();
    
    try {
        const favorite = await storageService.getFavorite(id);
        return favorite !== null;
    } catch (error) {
        console.warn('Error checking favorite:', error);
        // Fallback to localStorage if Firebase fails
        if (storageService !== localStorageFavoritesService) {
            try {
                const favorite = await localStorageFavoritesService.getFavorite(id);
                return favorite !== null;
            } catch (fallbackError) {
                console.error('Error checking favorite in localStorage fallback:', fallbackError);
                return false;
            }
        }
        return false;
    }
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
