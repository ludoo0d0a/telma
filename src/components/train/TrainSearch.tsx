import React, { useState, useRef, useEffect } from 'react';
import { Loader2, Search, Train as TrainIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Ad from '@/components/Ad';
import { autocompletePT } from '@/services/navitiaApi';
import { encodeVehicleJourneyId, parseVehicleJourneyId } from '@/utils/uriUtils';
import { getTransportIcon } from '@/services/transportService';
import type { ExtendedVehicleJourney } from './types';

const TrainSearch: React.FC = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [suggestions, setSuggestions] = useState<ExtendedVehicleJourney[]>([]);
    const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
    const [searchLoading, setSearchLoading] = useState<boolean>(false);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent): void => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsSearchOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const searchTrains = async (query: string): Promise<void> => {
        if (!query || query.length < 2) {
            setSuggestions([]);
            setIsSearchOpen(false);
            return;
        }

        setSearchLoading(true);
        try {
            const data = await autocompletePT(query, 'sncf', 20);
            // Filter to only show vehicle_journeys and extract the vehicle_journey object
            // Note: The API actually returns pt_objects, but TypeScript types say places
            const ptObjects = ((data as unknown as { pt_objects?: Array<{ embedded_type?: string; vehicle_journey?: unknown }> }).pt_objects || []);
            const vehicleJourneys = ptObjects
                .filter((obj) => 
                    (obj.embedded_type as string) === 'vehicle_journey' && obj.vehicle_journey
                )
                .map((obj) => obj.vehicle_journey as ExtendedVehicleJourney);
            setSuggestions(vehicleJourneys);
            setIsSearchOpen(vehicleJourneys.length > 0);
        } catch (err) {
            console.error('Error searching trains:', err);
            setSuggestions([]);
            setIsSearchOpen(false);
        } finally {
            setSearchLoading(false);
        }
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const value = e.target.value;
        setSearchQuery(value);
        
        // Clear previous timeout
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
        
        // Debounce search
        searchTimeoutRef.current = setTimeout(() => {
            if (value.length >= 2) {
                searchTrains(value);
            } else {
                setSuggestions([]);
                setIsSearchOpen(false);
            }
        }, 300);
    };

    const handleSelectTrain = (train: ExtendedVehicleJourney): void => {
        if (train.id) {
            navigate(`/train/${encodeVehicleJourneyId(train.id)}`);
        }
    };

    return (
        <section className='section'>
            <div className='container'>
                <div className='box'>
                    <h1 className='title is-2 mb-5'>Rechercher un train</h1>
                    <p className='subtitle is-5 mb-5'>
                        Recherchez un train par son numéro ou son type (TGV, TER, etc.)
                    </p>
                    
                    {/* Advertisement */}
                    <Ad format="horizontal" size="responsive" className="mb-5" />

                    <div className='field' ref={wrapperRef}>
                        <label className='label'>Numéro ou type de train</label>
                        <div className='control has-icons-right'>
                            <input
                                className='input is-large'
                                type='text'
                                value={searchQuery}
                                onChange={handleSearchChange}
                                onFocus={() => {
                                    if (suggestions.length > 0) {
                                        setIsSearchOpen(true);
                                    }
                                }}
                                placeholder='Ex: 1234, TGV, TER...'
                            />
                            {searchLoading && (
                                <span className='icon is-right'>
                                    <Loader2 size={20} className="animate-spin" />
                                </span>
                            )}
                            {!searchLoading && searchQuery && (
                                <span className='icon is-right'>
                                    <Search size={20} />
                                </span>
                            )}
                        </div>
                        {isSearchOpen && suggestions.length > 0 && (
                            <div className='dropdown is-active' style={{ width: '100%', position: 'relative' }}>
                                <div className='dropdown-menu' style={{ width: '100%' }}>
                                    <div className='dropdown-content' style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                        {suggestions.map((train, index) => {
                                            const displayInfo = train.display_informations || {};
                                            const trainNumber = displayInfo.headsign || displayInfo.trip_short_name || train.id || '';
                                            const commercialMode = displayInfo.commercial_mode || '';
                                            const network = displayInfo.network || '';
                                            const direction = displayInfo.direction || '';
                                            const transportInfo = getTransportIcon(commercialMode, network);
                                            
                                            return (
                                                <a
                                                    key={train.id || index}
                                                    className='dropdown-item'
                                                    onClick={() => handleSelectTrain(train)}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <div className='is-flex is-align-items-center'>
                                                        <span className={`icon ${transportInfo.color} mr-3`}>
                                                            <transportInfo.icon size={16} />
                                                        </span>
                                                        <div style={{ flex: 1 }}>
                                                            <div className='is-flex is-align-items-center'>
                                                                <strong className='mr-2'>{trainNumber}</strong>
                                                                <span className={`tag ${transportInfo.tagColor} is-dark is-small`}>
                                                                    {transportInfo.label}
                                                                </span>
                                                            </div>
                                                            {direction && (
                                                                <small className='has-text-grey'>{direction}</small>
                                                            )}
                                                        </div>
                                                    </div>
                                                </a>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}
                        {searchQuery.length >= 2 && !searchLoading && suggestions.length === 0 && (
                            <p className='help has-text-grey mt-2'>Aucun train trouvé</p>
                        )}
                    </div>

                    {/* Samples Section */}
                    <div className='mt-6'>
                        <h3 className='title is-4 mb-4'>Exemples</h3>
                        <div className='columns is-multiline'>
                            {[
                                'vehicle_journey:SNCF:2025-12-18:88776:1187:Train',
                                'vehicle_journey:SNCF:2025-12-18:88778:1187:Train'
                            ].map((sampleId) => {
                                const parsed = parseVehicleJourneyId(sampleId);
                                if (!parsed) return null;
                                
                                return (
                                    <div key={sampleId} className='column is-half'>
                                        <Link 
                                            to={`/train/${encodeVehicleJourneyId(sampleId)}`}
                                            className='box is-clickable'
                                            style={{ textDecoration: 'none' }}
                                        >
                                            <div className='is-flex is-align-items-center'>
                                                <span className='icon is-large has-text-primary mr-3'>
                                                    <TrainIcon size={32} />
                                                </span>
                                                <div>
                                                    <p className='title is-5 mb-1'>
                                                        Train {parsed.trainNumber}
                                                    </p>
                                                    <p className='subtitle is-6 mb-1'>
                                                        <span className='tag is-dark mr-2'>{parsed.vehicleType}</span>
                                                        <span className='has-text-grey'>{parsed.date}</span>
                                                    </p>
                                                    <p className='help'>
                                                        ID: {parsed.id2}
                                                    </p>
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                );
                            })}
                        </div>
                        <p className='help mt-2 has-text-grey'>
                            Cliquez sur un exemple pour voir les détails du train
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TrainSearch;

