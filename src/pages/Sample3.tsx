import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MoreVertical, Plane } from 'lucide-react';
import '../styles/Sample3.scss';

const Sample3: React.FC = () => {
    const navigate = useNavigate();
    const [selectedDate, setSelectedDate] = useState('Sat 22');

    const dates = [
        { day: 'Sat', date: '22', full: 'Sat 22' },
        { day: 'Sat', date: '23', full: 'Sat 23' },
        { day: 'Sat', date: '24', full: 'Sat 24' },
        { day: 'Sa', date: '25', full: 'Sa 25' },
    ];

    const flights = [
        {
            from: 'DPS',
            to: 'CGK',
            duration: '1h 45m',
            departure: '10:00 AM',
            arrival: '11:45 AM',
            airline: 'Garuda Indonesia',
            price: '$140'
        },
        {
            from: 'DPS',
            to: 'CGK',
            duration: '45m',
            departure: '02:00 PM',
            arrival: '02:45 AM',
            airline: 'Garuda Indonesia',
            price: '$340'
        }
    ];

    return (
        <div className="sample3-page">
            <header className="sample3-header">
                <div className="header-top">
                    <button onClick={() => navigate(-1)} className="back-button">
                        <ArrowLeft size={20} />
                    </button>
                    <h1>Select Flight</h1>
                    <button className="menu-button">
                        <MoreVertical size={20} />
                    </button>
                </div>

                <div className="flight-route">
                    <div className="location">
                        <h2>Bali</h2>
                        <p className="code">DPS</p>
                    </div>
                    <div className="route-connector">
                        <div className="dotted-line"></div>
                        <div className="plane-icon">
                            <Plane size={24} />
                        </div>
                        <p className="duration">1h 45m</p>
                    </div>
                    <div className="location">
                        <h2>Banten</h2>
                        <p className="code">CGK</p>
                    </div>
                </div>

                <div className="selected-date">
                    <p>04 Jan 2023</p>
                </div>
            </header>

            <main className="sample3-main">
                <div className="date-selection-card">
                    <div className="card-header">
                        <h3>Flight Date</h3>
                        <a href="#" className="see-all">See All</a>
                    </div>
                    <div className="date-cards">
                        {dates.map((date, index) => (
                            <button
                                key={index}
                                className={`date-card ${selectedDate === date.full ? 'active' : ''}`}
                                onClick={() => setSelectedDate(date.full)}
                            >
                                <span className="day">{date.day}</span>
                                <span className="date">{date.date}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="airlines-section">
                    <div className="section-header">
                        <h3>Airlines</h3>
                        <a href="#" className="see-all">See All</a>
                    </div>

                    <div className="flight-list">
                        {flights.map((flight, index) => (
                            <div key={index} className="flight-card">
                                <div className="flight-route-info">
                                    <div className="airport-code">{flight.from}</div>
                                    <div className="flight-duration">
                                        <p>Flight Time</p>
                                        <p className="duration-text">{flight.duration}</p>
                                    </div>
                                    <div className="airport-code">{flight.to}</div>
                                </div>

                                <div className="flight-timeline">
                                    <span className="time">{flight.departure}</span>
                                    <div className="timeline-container">
                                        <span className="dot start-dot"></span>
                                        <div className="dotted-line"></div>
                                        <div className="plane-icon">
                                            <Plane size={20} />
                                        </div>
                                        <span className="dot end-dot"></span>
                                    </div>
                                    <span className="time">{flight.arrival}</span>
                                </div>

                                <div className="airline-price">
                                    <p className="airline-name">{flight.airline}</p>
                                    <p className="price">{flight.price}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Sample3;

