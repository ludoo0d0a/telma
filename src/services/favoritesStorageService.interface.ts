/**
 * Interface for favorites storage service
 * Both Firebase and localStorage implementations should conform to this interface
 */
export interface FavoriteLocation {
    id: string;
    name: string;
    type: string;
    addedAt?: string;
}

export type Unsubscribe = () => void;

export interface IFavoritesStorageService {
    /**
     * Add a favorite location
     */
    addFavorite(favorite: FavoriteLocation): Promise<void>;

    /**
     * Remove a favorite location by ID
     */
    removeFavorite(favoriteId: string): Promise<void>;

    /**
     * Get all favorite locations
     */
    getFavorites(): Promise<FavoriteLocation[]>;

    /**
     * Get a single favorite location by ID
     */
    getFavorite(favoriteId: string): Promise<FavoriteLocation | null>;

    /**
     * Subscribe to favorites changes (real-time updates)
     * Returns an unsubscribe function or null if not supported
     */
    subscribeToFavorites(callback: (favorites: FavoriteLocation[]) => void): Unsubscribe | null;
}

