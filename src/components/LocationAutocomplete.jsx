import React, { useState, useEffect, useRef } from 'react';
import { searchPlaces } from '../services/sncfApi';
import { getFavorites, addFavorite, removeFavorite, isFavorite, sortFavoritesFirst } from '../services/favoritesService';

const LocationAutocomplete = ({ 
    label, 
    value, 
    onChange, 
    placeholder = 'Rechercher une gare...',
    defaultSearchTerm = null,
    onStationFound = null,
    disabled = false
}) => {
    const [inputValue, setInputValue] = useState(value || '');
    const [suggestions, setSuggestions] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedStation, setSelectedStation] = useState(null);
    const [favoriteIds, setFavoriteIds] = useState(new Set(getFavorites().map(f => f.id)));
    const wrapperRef = useRef(null);
    const searchTimeoutRef = useRef(null);
    const isUserTypingRef = useRef(false);
    const previousValueRef = useRef(value || '');

    // Search for default station on mount if defaultSearchTerm is provided
    useEffect(() => {
        if (defaultSearchTerm && !selectedStation && !value && !inputValue) {
            setInputValue(defaultSearchTerm);
            // Auto-select first result for default search
            const performDefaultSearch = async () => {
                if (defaultSearchTerm.length >= 2) {
                    setLoading(true);
                    try {
                        const results = await searchPlaces(defaultSearchTerm, 'sncf', { count: 20 });
                        const stations = results.places?.filter(place => 
                            place.embedded_type === 'stop_area' || place.embedded_type === 'stop_point'
                        ) || [];
                        
                        if (stations.length > 0) {
                            // Sort favorites first and select the first one
                            const sortedStations = sortFavoritesFirst(stations);
                            const firstStation = sortedStations[0];
                            setInputValue(firstStation.name);
                            setSelectedStation(firstStation);
                            onChange(firstStation.id);
                            if (onStationFound) {
                                onStationFound(firstStation);
                            }
                            // Update favoriteIds state
                            setFavoriteIds(new Set(getFavorites().map(f => f.id)));
                        }
                    } catch (error) {
                        console.error('Error searching default place:', error);
                    } finally {
                        setLoading(false);
                    }
                }
            };
            performDefaultSearch();
        }
    }, [defaultSearchTerm]);

    // Update input value when value prop changes externally (not from user typing)
    useEffect(() => {
        // Only sync from prop if:
        // 1. The value prop actually changed externally
        // 2. User is not currently typing
        // 3. The new value is different from current inputValue
        const valueChanged = value !== previousValueRef.current;
        if (valueChanged && !isUserTypingRef.current) {
            // Use a function to get current inputValue to avoid stale closure
            setInputValue(prevInputValue => {
                // Only update if the prop value is meaningfully different
                if (value && value !== prevInputValue) {
                    return value;
                }
                return prevInputValue;
            });
            setSelectedStation(null); // Clear selection when value changes externally
        }
        previousValueRef.current = value || '';
    }, [value]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const searchStation = async (searchTerm, autoSelect = false) => {
        if (!searchTerm || searchTerm.length < 2) {
            setSuggestions([]);
            setIsOpen(false);
            return;
        }

        setLoading(true);
        try {
            const results = await searchPlaces(searchTerm, 'sncf', { count: 20 });
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

    const handleInputChange = (e) => {
        const newValue = e.target.value;
        isUserTypingRef.current = true;
        setInputValue(newValue);
        setSelectedStation(null);
        
        // Clear previous timeout
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
        
        // Debounce search
        searchTimeoutRef.current = setTimeout(() => {
            if (newValue.length >= 2) {
                searchStation(newValue);
            } else {
                setSuggestions([]);
                setIsOpen(false);
            }
            // Reset typing flag after debounce completes
            isUserTypingRef.current = false;
        }, 300);
    };

    const handleSelectStation = (station) => {
        isUserTypingRef.current = false; // User selected, not typing anymore
        setInputValue(station.name);
        setSelectedStation(station);
        setIsOpen(false);
        onChange(station.id);
        if (onStationFound) {
            onStationFound(station);
        }
    };

    const handleToggleFavorite = (e, station) => {
        e.stopPropagation(); // Prevent selecting the station when clicking star
        const stationId = station.id;
        const isFav = isFavorite(stationId);
        
        if (isFav) {
            removeFavorite(stationId);
        } else {
            addFavorite(stationId, station.name, station.embedded_type);
        }
        
        // Update favoriteIds state
        setFavoriteIds(new Set(getFavorites().map(f => f.id)));
        
        // Re-sort suggestions
        const sortedStations = sortFavoritesFirst(suggestions);
        setSuggestions(sortedStations);
    };

    const handleInputFocus = () => {
        if (suggestions.length > 0) {
            setIsOpen(true);
        }
    };

    return (
        <div className='field' ref={wrapperRef}>
            <label className='label'>{label}</label>
            <div className='control has-icons-right'>
                <input
                    className='input'
                    type='text'
                    value={inputValue}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    placeholder={placeholder}
                    disabled={disabled}
                />
                {loading && (
                    <span className='icon is-right'>
                        <i className='fas fa-spinner fa-spin'></i>
                    </span>
                )}
                {!loading && selectedStation && (
                    <span className='icon is-right has-text-success'>
                        <i className='fas fa-check-circle'></i>
                    </span>
                )}
            </div>
            {isOpen && suggestions.length > 0 && (
                <div className='dropdown is-active' style={{ width: '100%', position: 'relative' }}>
                    <div className='dropdown-menu' style={{ width: '100%' }}>
                        <div className='dropdown-content' style={{ maxHeight: '200px', overflowY: 'auto' }}>
                            {suggestions.map((station, index) => {
                                const isFav = isFavorite(station.id);
                                return (
                                    <a
                                        key={station.id || index}
                                        className='dropdown-item'
                                        onClick={() => handleSelectStation(station)}
                                        style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                    >
                                        <div>
                                            <strong>{station.name}</strong>
                                            {station.embedded_type && (
                                                <span className='tag is-light is-small ml-2'>
                                                    {station.embedded_type === 'stop_area' ? 'Gare' : 'Point d\'arrêt'}
                                                </span>
                                            )}
                                        </div>
                                        <span
                                            className='icon'
                                            onClick={(e) => handleToggleFavorite(e, station)}
                                            style={{ cursor: 'pointer', marginLeft: 'auto' }}
                                        >
                                            <i className={`fas fa-star ${isFav ? 'has-text-warning' : 'has-text-grey'}`}></i>
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

