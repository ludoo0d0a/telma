import firebaseStorageService from './firebaseStorageService';
import type { IFavoritesStorageService, FavoriteLocation, Unsubscribe } from './favoritesStorageService.interface';

/**
 * Firebase-based implementation of favorites storage service
 * Wraps firebaseStorageService to match the IFavoritesStorageService interface
 */
class FirebaseFavoritesService implements IFavoritesStorageService {
    async addFavorite(favorite: FavoriteLocation): Promise<void> {
        await firebaseStorageService.addFavorite(favorite);
    }

    async removeFavorite(favoriteId: string): Promise<void> {
        await firebaseStorageService.removeFavorite(favoriteId);
    }

    async getFavorites(): Promise<FavoriteLocation[]> {
        return await firebaseStorageService.getFavorites();
    }

    async getFavorite(favoriteId: string): Promise<FavoriteLocation | null> {
        return await firebaseStorageService.getFavorite(favoriteId);
    }

    subscribeToFavorites(callback: (favorites: FavoriteLocation[]) => void): Unsubscribe | null {
        return firebaseStorageService.subscribeToFavorites(callback);
    }
}

export default new FirebaseFavoritesService();

