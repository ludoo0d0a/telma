import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Loader2, CheckCircle2, Navigation, Star } from 'lucide-react';
import { searchPlaces, getPlacesNearby } from '../services/navitiaApi';
import { getFavorites, addFavorite, removeFavorite, isFavorite, sortFavoritesFirst } from '../services/favoritesService';
import { cleanLocationName } from '../services/locationService';
import type { Place } from '../client/models/place';

interface LocationAutocompleteProps {
    label: string;
    value: string;
    onValueChange: (newValue: string) => void;
    onChange: (id: string | undefined) => void;
    placeholder?: string;
    defaultSearchTerm?: string | null;
    onStationFound?: ((station: Place & { name?: string | null }) => void) | null;
    disabled?: boolean;
}

const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
    label,
    value,
    onValueChange,
    onChange,
    placeholder = 'Rechercher une gare...',
    defaultSearchTerm = null,
    onStationFound = null,
    disabled = false
}) => {
    const [suggestions, setSuggestions] = useState<Place[]>([]);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [geolocating, setGeolocating] = useState<boolean>(false);
    const [geolocationError, setGeolocationError] = useState<string | null>(null);
    const [selectedStation, setSelectedStation] = useState<Place | null>(null);
    const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set(getFavorites().map(f => f.id)));
    const wrapperRef = useRef<HTMLDivElement>(null);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    // Internal input state - user has full control while typing
    const [inputValue, setInputValue] = useState<string>(value);
    const hasUserInteractedRef = useRef<boolean>(false);

    const handleSelectStation = useCallback((station: Place): void => {
        const cleanedName = cleanLocationName(station.name);
        const newValue = cleanedName || '';
        setInputValue(newValue); // Update internal state
        onValueChange(newValue); // Update parent's state
        setSelectedStation(station);
        setIsOpen(false);
        setGeolocationError(null); // Clear geolocation error when station is selected
        onChange(station.id); // Notify parent of ID change
        hasUserInteractedRef.current = false; // Reset interaction flag after selection
        if (onStationFound) {
            onStationFound({ ...station, name: cleanedName });
        }
    }, [onValueChange, onChange, onStationFound]);

    // Sync inputValue with value prop only when user hasn't interacted
    useEffect(() => {
        if (!hasUserInteractedRef.current) {
            setInputValue(value);
        }
    }, [value]);

    // Effect to perform search for the default term (only on mount, not when user types)
    useEffect(() => {
        const performDefaultSearch = async () => {
            // Only run default search if:
            // 1. defaultSearchTerm is provided
            // 2. No station is selected yet
            // 3. User hasn't interacted with the input
            if (defaultSearchTerm && defaultSearchTerm.length >= 2 && !selectedStation && !hasUserInteractedRef.current) {
                setLoading(true);
                try {
                    const response = await searchPlaces(defaultSearchTerm, 'sncf', { count: 20 });
                    const results = response.data;
                    const stations = results.places?.filter(place =>
                        place.embedded_type === 'stop_area' || place.embedded_type === 'stop_point'
                    ) || [];

                    if (stations.length > 0) {
                        const sortedStations = sortFavoritesFirst(stations);
                        const firstStation = sortedStations[0];
                        handleSelectStation(firstStation); // Select the first station
                    }
                } catch (error) {
                    console.error('Error searching default place:', error);
                } finally {
                    setLoading(false);
                }
            }
        };

        performDefaultSearch();
    }, [defaultSearchTerm, handleSelectStation, selectedStation]);

    // Effect to close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const searchStation = async (searchTerm: string, autoSelect: boolean = false): Promise<void> => {
        if (!searchTerm || searchTerm.length < 2) {
            setSuggestions([]);
            setIsOpen(false);
            return;
        }

        setLoading(true);
        try {
            const response = await searchPlaces(searchTerm, 'sncf', { count: 20 });
            const results = response.data;
            const stations = results.places?.filter(place => 
                place.embedded_type === 'stop_area' || place.embedded_type === 'stop_point'
            ) || [];
            
            // Sort favorites first
            const sortedStations = sortFavoritesFirst(stations);
            setSuggestions(sortedStations);
            setIsOpen(sortedStations.length > 0 && !autoSelect);
            
            // Auto-select first station if autoSelect is true and we have results
            if (autoSelect && sortedStations.length > 0 && !selectedStation) {
                const firstStation = sortedStations[0];
                handleSelectStation(firstStation);
            }
        } catch (error) {
            console.error('Error searching places:', error);
            setSuggestions([]);
            setIsOpen(false);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const newValue = e.target.value;
        setInputValue(newValue); // Update internal state immediately
        hasUserInteractedRef.current = true; // Mark that user has interacted
        onValueChange(newValue); // Notify parent of value change
        setSelectedStation(null); // Reset selection
        setGeolocationError(null); // Clear geolocation error when user types

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            if (newValue.length >= 2) {
                searchStation(newValue);
            } else {
                setSuggestions([]);
                setIsOpen(false);
            }
        }, 300);
    };


    const handleToggleFavorite = (e: React.MouseEvent, station: Place): void => {
        e.stopPropagation(); // Prevent selecting the station when clicking star
        const stationId = station.id;
        if (!stationId) return;
        
        const isFav = isFavorite(stationId);
        
        if (isFav) {
            removeFavorite(stationId);
        } else {
            addFavorite(stationId, station.name || '', station.embedded_type || '');
        }
        
        // Update favoriteIds state
        setFavoriteIds(new Set(getFavorites().map(f => f.id)));
        
        // Re-sort suggestions
        const sortedStations = sortFavoritesFirst(suggestions);
        setSuggestions(sortedStations);
    };

    const handleInputFocus = (): void => {
        if (suggestions.length > 0) {
            setIsOpen(true);
        }
    };

    const handleGetCurrentLocation = async (): Promise<void> => {
        if (!navigator.geolocation) {
            setGeolocationError('La géolocalisation n\'est pas supportée par votre navigateur');
            return;
        }

        setGeolocating(true);
        setGeolocationError(null);
        setLoading(true);

        try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(
                    resolve,
                    reject,
                    {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 0
                    }
                );
            });

            const { latitude, longitude } = position.coords;
            
            // Find nearby stations using coordinates
            const coordStr = `${longitude};${latitude}`;
            const response = await getPlacesNearby(coordStr, 'sncf', {
                type: ['stop_area', 'stop_point'],
                count: 20,
                distance: 2000 // Search within 2km
            });

            const results = response.data;
            const stations = results.places?.filter(place =>
                place.embedded_type === 'stop_area' || place.embedded_type === 'stop_point'
            ) || [];

            if (stations.length > 0) {
                // Sort favorites first
                const sortedStations = sortFavoritesFirst(stations);
                setSuggestions(sortedStations);
                setIsOpen(true);
                
                // Auto-select the closest station (first in results)
                if (sortedStations.length > 0) {
                    handleSelectStation(sortedStations[0]);
                }
            } else {
                setGeolocationError('Aucune gare trouvée à proximité');
            }
        } catch (error) {
            console.error('Error getting location:', error);
            if (error && typeof error === 'object' && 'code' in error) {
                const geoError = error as GeolocationPositionError;
                switch (geoError.code) {
                    case geoError.PERMISSION_DENIED:
                        setGeolocationError('Permission de géolocalisation refusée. Veuillez autoriser l\'accès à votre position dans les paramètres de votre navigateur.');
                        break;
                    case geoError.POSITION_UNAVAILABLE:
                        setGeolocationError('Impossible de déterminer votre position');
                        break;
                    case geoError.TIMEOUT:
                        setGeolocationError('La demande de géolocalisation a expiré');
                        break;
                    default:
                        setGeolocationError('Erreur lors de la géolocalisation');
                }
            } else {
                setGeolocationError('Erreur lors de la recherche de gares à proximité');
            }
        } finally {
            setGeolocating(false);
            setLoading(false);
        }
    };

    return (
        <div className='field' ref={wrapperRef}>
            <label className='label'>{label}</label>
            <div className='field has-addons'>
                <div className='control is-expanded has-icons-right'>
                    <input
                        className='input'
                        type='text'
                        value={inputValue}
                        onChange={handleInputChange}
                        onFocus={handleInputFocus}
                        placeholder={placeholder}
                        disabled={disabled || geolocating}
                    />
                    {loading && !geolocating && (
                        <span className='icon is-right'>
                            <Loader2 size={20} className="animate-spin" />
                        </span>
                    )}
                    {!loading && !geolocating && selectedStation && (
                        <span className='icon is-right has-text-success'>
                            <CheckCircle2 size={20} />
                        </span>
                    )}
                </div>
                <div className='control'>
                    <button
                        type='button'
                        className={`button ${geolocating ? 'is-loading' : ''}`}
                        onClick={handleGetCurrentLocation}
                        disabled={disabled || geolocating || loading}
                        title='Utiliser ma position actuelle'
                    >
                        <span className='icon'>
                            <Navigation size={20} />
                        </span>
                    </button>
                </div>
            </div>
            {geolocationError && (
                <p className='help is-danger'>{geolocationError}</p>
            )}
            {isOpen && suggestions.length > 0 && (
                <div className='dropdown is-active' style={{ width: '100%', position: 'relative' }}>
                    <div className='dropdown-menu' style={{ width: '100%' }}>
                        <div className='dropdown-content' style={{ maxHeight: '200px', overflowY: 'auto' }}>
                            {suggestions.map((station, index) => {
                                const isFav = station.id ? isFavorite(station.id) : false;
                                return (
                                    <a
                                        key={station.id || index}
                                        className='dropdown-item'
                                        onClick={() => handleSelectStation(station)}
                                        style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                    >
                                        <div>
                                            <strong>{cleanLocationName(station.name)}</strong>
                                            {station.embedded_type && (
                                                <span className='tag is-dark is-small ml-2'>
                                                    {station.embedded_type === 'stop_area' ? 'Gare' : 'Point d\'arrêt'}
                                                </span>
                                            )}
                                        </div>
                                        <span
                                            className='icon'
                                            onClick={(e) => handleToggleFavorite(e, station)}
                                            style={{ cursor: 'pointer', marginLeft: 'auto' }}
                                        >
                                            <Star size={16} className={isFav ? 'has-text-warning' : 'has-text-grey'} />
                                        </span>
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LocationAutocomplete;

