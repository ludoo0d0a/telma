import React from 'react';
import FlightTimeline from './FlightTimeline';
import { Plane } from 'lucide-react';
import './FlightCard.scss';

interface FlightCardProps {
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
    price?: string;
    variant?: 'default' | 'compact' | 'detailed' | 'saved';
    showTimeline?: boolean;
    footer?: React.ReactNode;
    header?: React.ReactNode;
    flightType?: string;
}

const FlightCard: React.FC<FlightCardProps> = ({
    from,
    to,
    departureTime,
    arrivalTime,
    duration,
    airline,
    price,
    variant = 'default',
    showTimeline = true,
    footer,
    header,
    flightType = 'Direct'
}) => {
    if (variant === 'saved') {
        return (
            <div className={`skytrip-flight-card ${variant}`}>
                {header && <div className="card-header">{header}</div>}
                
                <div className="card-body">
                    <div className="flight-info">
                        <div className="location">
                            <span className="city">{from.city}</span>
                            <span className="time">{departureTime}</span>
                            <span className="airport">{from.code}</span>
                        </div>
                        <div className="flight-path">
                            <span className="dot"></span>
                            <span className="line"></span>
                            <div className="plane-icon">
                                <Plane size={20} />
                            </div>
                            <span className="line"></span>
                            <span className="dot"></span>
                            <div className="duration">{duration}</div>
                            <div className="type">{flightType}</div>
                        </div>
                        <div className="location">
                            <span className="city">{to.city}</span>
                            <span className="time">{arrivalTime}</span>
                            <span className="airport">{to.code}</span>
                        </div>
                    </div>
                </div>

                {footer && <div className="card-footer">{footer}</div>}
            </div>
        );
    }

    return (
        <div className={`skytrip-flight-card ${variant}`}>
            {header && <div className="card-header">{header}</div>}
            
            <div className="flight-info">
                <div className="location">
                    <p className="airport-code">{from.code}</p>
                    <p className="city">{from.city}</p>
                </div>
                
                {variant === 'default' && (
                    <div className="flight-duration">
                        <p>Flight Time</p>
                        <p className="duration">{duration}</p>
                    </div>
                )}
                
                <div className="location">
                    <p className="airport-code">{to.code}</p>
                    <p className="city">{to.city}</p>
                </div>
            </div>

            {showTimeline && (
                <FlightTimeline
                    departureTime={departureTime}
                    arrivalTime={arrivalTime}
                    duration={variant === 'detailed' ? duration : undefined}
                    variant={variant === 'detailed' ? 'detailed' : variant === 'compact' ? 'compact' : 'default'}
                />
            )}

            {price && (
                <div className="airline-info">
                    <p className="airline-name">{airline}</p>
                    <p className="price">{price}</p>
                </div>
            )}

            {footer && <div className="card-footer">{footer}</div>}
        </div>
    );
};

export default FlightCard;

