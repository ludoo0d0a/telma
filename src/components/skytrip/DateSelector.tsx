import React from 'react';
import './DateSelector.scss';

interface DateOption {
    day: string;
    date: string;
    full: string;
}

interface DateSelectorProps {
    dates: DateOption[];
    selectedDate: string;
    onDateSelect: (full: string) => void;
    title?: string;
    showSeeAll?: boolean;
    onSeeAll?: () => void;
}

const DateSelector: React.FC<DateSelectorProps> = ({
    dates,
    selectedDate,
    onDateSelect,
    title = "Flight Date",
    showSeeAll = true,
    onSeeAll
}) => {
    return (
        <div className="skytrip-date-selector">
            <div className="card-header">
                <h3>{title}</h3>
                {showSeeAll && (
                    <a href="#" className="see-all" onClick={(e) => {
                        e.preventDefault();
                        onSeeAll?.();
                    }}>
                        See All
                    </a>
                )}
            </div>
            <div className="date-cards">
                {dates.map((date, index) => (
                    <button
                        key={index}
                        className={`date-card ${selectedDate === date.full ? 'active' : ''}`}
                        onClick={() => onDateSelect(date.full)}
                    >
                        <span className="day">{date.day}</span>
                        <span className="date">{date.date}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default DateSelector;

