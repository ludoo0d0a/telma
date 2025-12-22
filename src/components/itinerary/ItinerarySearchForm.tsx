import React from 'react';
import { Search, ArrowLeftRight } from 'lucide-react';
import LocationAutocomplete from '@/components/LocationAutocomplete';
import type { Place } from '@/client/models/place';

interface ItinerarySearchFormProps {
    fromName: string;
    toName: string;
    fromId: string | undefined;
    toId: string | undefined;
    filterDate: string;
    filterTime: string;
    loading: boolean;
    onFromChange: (id: string | undefined) => void;
    onToChange: (id: string | undefined) => void;
    onFromValueChange: (value: string) => void;
    onToValueChange: (value: string) => void;
    onFromStationFound: (station: Place & { name?: string | null }) => void;
    onToStationFound: (station: Place & { name?: string | null }) => void;
    onFilterDateChange: (date: string) => void;
    onFilterTimeChange: (time: string) => void;
    onSearch: () => void;
    onInvertItinerary: () => void;
}

const ItinerarySearchForm: React.FC<ItinerarySearchFormProps> = ({
    fromName,
    toName,
    fromId,
    toId,
    filterDate,
    filterTime,
    loading,
    onFromChange,
    onToChange,
    onFromValueChange,
    onToValueChange,
    onFromStationFound,
    onToStationFound,
    onFilterDateChange,
    onFilterTimeChange,
    onSearch,
    onInvertItinerary,
}) => {
    return (
        <div className='box mb-5'>
            <h3 className='title is-5 mb-4'>Recherche d'itinéraire</h3>
            <div className='columns'>
                <div className='column'>
                    <LocationAutocomplete
                        label='Gare de départ'
                        value={fromName}
                        onValueChange={onFromValueChange}
                        onChange={onFromChange}
                        defaultSearchTerm={fromName || 'Metz'}
                        onStationFound={onFromStationFound}
                        disabled={loading}
                    />
                </div>
                <div className='column is-narrow'>
                    <div className='field'>
                        <label className='label'>&nbsp;</label>
                        <div className='control'>
                            <button
                                className='button is-light'
                                onClick={onInvertItinerary}
                                disabled={loading || !fromId || !toId}
                                title="Inverser l'itinéraire"
                            >
                                <span className='icon'>
                                    <ArrowLeftRight size={20} />
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
                <div className='column'>
                    <LocationAutocomplete
                        label="Gare d'arrivée"
                        value={toName}
                        onValueChange={onToValueChange}
                        onChange={onToChange}
                        defaultSearchTerm={toName || 'Thionville'}
                        onStationFound={onToStationFound}
                        disabled={loading}
                    />
                </div>
            </div>
            <div className='columns mt-4'>
                <div className='column is-narrow'>
                    <div className='field'>
                        <label className='label'>Date</label>
                        <div className='control'>
                            <input
                                className='input'
                                type='date'
                                value={filterDate}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onFilterDateChange(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                    </div>
                </div>
                <div className='column is-narrow'>
                    <div className='field'>
                        <label className='label'>Heure</label>
                        <div className='control'>
                            <input
                                className='input'
                                type='time'
                                value={filterTime}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onFilterTimeChange(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                    </div>
                </div>
                <div className='column is-narrow'>
                    <div className='field'>
                        <label className='label'>&nbsp;</label>
                        <div className='control'>
                            <button
                                className='button is-primary'
                                onClick={onSearch}
                                disabled={loading || !fromId || !toId}
                            >
                                <span className='icon'><Search size={16} /></span>
                                <span>Rechercher</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ItinerarySearchForm;

