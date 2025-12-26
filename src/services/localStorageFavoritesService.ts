import type { IFavoritesStorageService, FavoriteLocation, Unsubscribe } from './favoritesStorageService.interface';

const FAVORITES_KEY = 'sncf_favorite_locations';

/**
 * localStorage-based implementation of favorites storage service
 * Uses the same interface as Firebase implementation for easy swapping
 */
class LocalStorageFavoritesService implements IFavoritesStorageService {
    private listeners: Set<(favorites: FavoriteLocation[]) => void> = new Set();

    constructor() {
        // Listen to storage events for cross-tab synchronization
        if (typeof window !== 'undefined') {
            window.addEventListener('storage', this.handleStorageChange.bind(this));
        }
    }

    private handleStorageChange(event: StorageEvent): void {
        if (event.key === FAVORITES_KEY && event.newValue) {
            try {
                const favorites: FavoriteLocation[] = JSON.parse(event.newValue);
                this.notifyListeners(favorites);
            } catch (error) {
                console.error('Error parsing favorites from storage event:', error);
            }
        }
    }

    private notifyListeners(favorites: FavoriteLocation[]): void {
        this.listeners.forEach(callback => {
            try {
                callback(favorites);
            } catch (error) {
                console.error('Error in favorites listener:', error);
            }
        });
    }

    private getFavoritesFromStorage(): FavoriteLocation[] {
        try {
            const stored = localStorage.getItem(FAVORITES_KEY);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('Error reading favorites from localStorage:', error);
        }
        return [];
    }

    private saveFavoritesToStorage(favorites: FavoriteLocation[]): void {
        try {
            localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
            // Notify listeners of the change
            this.notifyListeners(favorites);
        } catch (error) {
            console.error('Error saving favorites to localStorage:', error);
            throw error;
        }
    }

    async addFavorite(favorite: FavoriteLocation): Promise<void> {
        const favorites = this.getFavoritesFromStorage();
        
        // Check if already exists
        if (favorites.some(fav => fav.id === favorite.id)) {
            return; // Already exists
        }

        // Add the favorite
        favorites.push({
            ...favorite,
            addedAt: favorite.addedAt || new Date().toISOString(),
        });

        this.saveFavoritesToStorage(favorites);
    }

    async removeFavorite(favoriteId: string): Promise<void> {
        const favorites = this.getFavoritesFromStorage();
        const updatedFavorites = favorites.filter(fav => fav.id !== favoriteId);
        this.saveFavoritesToStorage(updatedFavorites);
    }

    async getFavorites(): Promise<FavoriteLocation[]> {
        return this.getFavoritesFromStorage();
    }

    async getFavorite(favoriteId: string): Promise<FavoriteLocation | null> {
        const favorites = this.getFavoritesFromStorage();
        return favorites.find(fav => fav.id === favoriteId) || null;
    }

    subscribeToFavorites(callback: (favorites: FavoriteLocation[]) => void): Unsubscribe | null {
        // Add listener
        this.listeners.add(callback);

        // Immediately call with current favorites
        const currentFavorites = this.getFavoritesFromStorage();
        callback(currentFavorites);

        // Return unsubscribe function
        return () => {
            this.listeners.delete(callback);
        };
    }
}

export default new LocalStorageFavoritesService();

