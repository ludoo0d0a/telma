import React from 'react';
import FlightCard from './FlightCard';
import './FlightList.scss';

interface Flight {
    from: {
        code: string;
        city: string;
    };
    to: {
        code: string;
        city: string;
    };
    departureTime: string;
    arrivalTime: string;
    duration: string;
    airline: string;
    price: string;
    header?: React.ReactNode;
    footer?: React.ReactNode;
}

interface FlightListProps {
    flights: Flight[];
    variant?: 'default' | 'compact' | 'detailed';
    title?: string;
    showSeeAll?: boolean;
    onSeeAll?: () => void;
}

const FlightList: React.FC<FlightListProps> = ({
    flights,
    variant = 'default',
    title,
    showSeeAll = true,
    onSeeAll
}) => {
    return (
        <div className="skytrip-flight-list">
            {(title || showSeeAll) && (
                <div className="section-header">
                    {title && <h3>{title}</h3>}
                    {showSeeAll && (
                        <a href="#" className="see-all" onClick={(e) => {
                            e.preventDefault();
                            onSeeAll?.();
                        }}>
                            See All
                        </a>
                    )}
                </div>
            )}
            <div className="flights">
                {flights.map((flight, index) => (
                    <FlightCard
                        key={index}
                        from={flight.from}
                        to={flight.to}
                        departureTime={flight.departureTime}
                        arrivalTime={flight.arrivalTime}
                        duration={flight.duration}
                        airline={flight.airline}
                        price={flight.price}
                        variant={variant}
                        header={flight.header}
                        footer={flight.footer}
                    />
                ))}
            </div>
        </div>
    );
};

export default FlightList;

