import React from 'react';
import '../styles/Sample1.scss';
import { Icon } from '../utils/iconMapping';

const Sample1: React.FC = () => {
    return (
        <div className="sample1-page">
            <header className="header">
                <div className="user-info">
                    <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="User Avatar" className="avatar" />
                    <div>
                        <p>Good Morning!</p>
                        <h2>Andrew Ainsley</h2>
                    </div>
                </div>
                <div className="notification">
                    <Icon name="fa-circle" />
                </div>
            </header>

            <main className="main-content">
                <div className="search-card">
                    <div className="tabs">
                        <button className="tab-button active">One-Way</button>
                        <button className="tab-button">Round Trip</button>
                        <button className="tab-button">Multi-City</button>
                    </div>

                    <div className="form">
                        <div className="input-group">
                            <label>From</label>
                            <input type="text" value="United Arab Amiret" readOnly />
                            <span>Dubai</span>
                        </div>

                        <div className="swap-icon">
                            <Icon name="fa-arrow-left-right" />
                        </div>

                        <div className="input-group">
                            <label>To</label>
                            <input type="text" value="United Stated" readOnly />
                            <span>USA</span>
                        </div>

                        <div className="input-group">
                            <label>Departure Date</label>
                            <input type="text" value="Wednesday. Dec 27 2023" readOnly />
                        </div>

                        <div className="inline-inputs">
                            <div className="input-group">
                                <label>Passengers</label>
                                <input type="text" value="1 Seat" readOnly />
                            </div>
                            <div className="input-group">
                                <label>Class</label>
                                <input type="text" value="Economy" readOnly />
                            </div>
                        </div>

                        <button className="search-button">Search Flights</button>
                    </div>
                </div>

                <div className="results-section">
                    <div className="results-header">
                        <h3>Results</h3>
                        <a href="#">See All</a>
                    </div>

                    <div className="result-card">
                        <div className="flight-info">
                            <div>
                                <p className="airport-code">DPS</p>
                                <p className="city">Bali</p>
                            </div>
                            <div className="flight-duration">
                                <p>Flight Time</p>
                                <p className="duration">1h 45m</p>
                            </div>
                            <div>
                                <p className="airport-code">CGK</p>
                                <p className="city">Banten</p>
                            </div>
                        </div>
                        <div className="flight-timeline">
                            <span className="time">10:00 AM</span>
                            <div className="timeline-line">
                                <span className="dot"></span>
                                <Icon name="fa-plane" />
                                <span className="dot"></span>
                            </div>
                            <span className="time">11:45 AM</span>
                        </div>
                        <div className="airline-info">
                            <div>
                                <p>Garuda Indonesia</p>
                            </div>
                            <div>
                                <p className="price">$140</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Sample1;
