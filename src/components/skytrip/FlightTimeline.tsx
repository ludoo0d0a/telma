import React from 'react';
import { Plane } from 'lucide-react';
import './FlightTimeline.scss';

interface FlightTimelineProps {
    departureTime: string;
    arrivalTime: string;
    duration?: string;
    variant?: 'default' | 'compact' | 'detailed';
    showPlane?: boolean;
}

const FlightTimeline: React.FC<FlightTimelineProps> = ({
    departureTime,
    arrivalTime,
    duration,
    variant = 'default',
    showPlane = true
}) => {
    return (
        <div className={`skytrip-flight-timeline ${variant}`}>
            <span className="time">{departureTime}</span>
            <div className="timeline-line">
                <span className="dot start-dot"></span>
                {showPlane && (
                    <div className="plane-icon">
                        <Plane size={20} />
                    </div>
                )}
                {variant === 'detailed' && duration && (
                    <div className="duration-info">
                        <div className="duration">{duration}</div>
                        <div className="type">Direct</div>
                    </div>
                )}
                <span className="dot end-dot"></span>
            </div>
            <span className="time">{arrivalTime}</span>
        </div>
    );
};

export default FlightTimeline;

