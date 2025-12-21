import React from 'react';
import Tabs from './Tabs';
import { ArrowLeftRight } from 'lucide-react';
import './SearchCard.scss';

interface SearchCardProps {
    tabs?: Array<{ label: string; value: string }>;
    activeTab?: string;
    onTabChange?: (value: string) => void;
    onSwap?: () => void;
    onSearch?: () => void;
    fromValue?: string;
    fromLabel?: string;
    toValue?: string;
    toLabel?: string;
    departureDate?: string;
    passengers?: string;
    classType?: string;
}

const SearchCard: React.FC<SearchCardProps> = ({
    tabs,
    activeTab,
    onTabChange,
    onSwap,
    onSearch,
    fromValue = "United Arab Amiret",
    fromLabel = "Dubai",
    toValue = "United Stated",
    toLabel = "USA",
    departureDate = "Wednesday. Dec 27 2023",
    passengers = "1 Seat",
    classType = "Economy"
}) => {
    return (
        <div className="skytrip-search-card">
            {tabs && activeTab && onTabChange && (
                <Tabs tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} />
            )}

            <div className="form">
                <div className="input-group">
                    <label>From</label>
                    <input type="text" defaultValue={fromValue} />
                    <span>{fromLabel}</span>
                </div>

                {onSwap && (
                    <div className="swap-icon" onClick={onSwap}>
                        <ArrowLeftRight size={20} />
                    </div>
                )}

                <div className="input-group">
                    <label>To</label>
                    <input type="text" defaultValue={toValue} />
                    <span>{toLabel}</span>
                </div>

                <div className="input-group">
                    <label>Departure Date</label>
                    <input type="text" defaultValue={departureDate} />
                </div>

                <div className="inline-inputs">
                    <div className="input-group">
                        <label>Passengers</label>
                        <input type="text" defaultValue={passengers} />
                    </div>
                    <div className="input-group">
                        <label>Class</label>
                        <input type="text" defaultValue={classType} />
                    </div>
                </div>

                {onSearch && (
                    <button className="search-button" onClick={onSearch}>
                        Search Flights
                    </button>
                )}
            </div>
        </div>
    );
};

export default SearchCard;

