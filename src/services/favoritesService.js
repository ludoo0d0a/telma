const FAVORITES_KEY = 'sncf_favorite_locations';

/**
 * Get all favorite locations from localStorage
 * @returns {Array} Array of favorite location objects {id, name, type}
 */
export const getFavorites = () => {
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
 * @param {string} id - Location ID
 * @param {string} name - Location name
 * @param {string} type - Location type (stop_area, stop_point, etc.)
 */
export const addFavorite = (id, name, type) => {
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
 * @param {string} id - Location ID
 */
export const removeFavorite = (id) => {
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
 * @param {string} id - Location ID
 * @returns {boolean} True if location is favorited
 */
export const isFavorite = (id) => {
    const favorites = getFavorites();
    return favorites.some(fav => fav.id === id);
};

/**
 * Sort suggestions to show favorites first
 * @param {Array} suggestions - Array of location suggestions
 * @returns {Array} Sorted array with favorites first
 */
export const sortFavoritesFirst = (suggestions) => {
    const favorites = getFavorites();
    const favoriteIds = new Set(favorites.map(fav => fav.id));
    
    const favoritesList = suggestions.filter(s => favoriteIds.has(s.id));
    const nonFavoritesList = suggestions.filter(s => !favoriteIds.has(s.id));
    
    return [...favoritesList, ...nonFavoritesList];
};

