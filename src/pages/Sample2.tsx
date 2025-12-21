import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../utils/iconMapping';
import '../styles/Sample2.scss';

const Sample2: React.FC = () => {
  return (
    <div className="sample2-page">
      <header className="sample2-header">
        <Link to="/" className="back-button">
          <Icon name="fa-arrow-left" size={20} />
        </Link>
        <h1>Saved Flights</h1>
        <button className="search-button">
          <Icon name="fa-search" size={20} />
        </button>
      </header>
      <main>
        <div className="tabs">
          <button className="tab active">Active</button>
          <button className="tab">Expired</button>
        </div>
        <div className="flight-list">
          <div className="flight-card">
            <div className="card-header">
              <div className="airline">
                <Icon name="fa-plane-departure" size={20} />
                <span>Cathay Pacific</span>
              </div>
              <Icon name="fa-bookmark" size={20} />
            </div>
            <div className="card-body">
              <div className="flight-info">
                <div className="location">
                  <span className="city">New York</span>
                  <span className="time">09:30</span>
                  <span className="airport">JFK</span>
                </div>
                <div className="flight-path">
                    <span className="dot"></span>
                    <span className="line"></span>
                    <Icon name="fa-plane" size={20} />
                    <span className="line"></span>
                    <span className="dot"></span>
                    <div className="duration">12h 15m</div>
                    <div className="type">Direct</div>
                </div>
                <div className="location">
                  <span className="city">HKG</span>
                  <span className="time">21:45</span>
                  <span className="airport">HKG</span>
                </div>
              </div>
            </div>
            <div className="card-footer">
              <span className="date">Mon, Dec 18 2023</span>
              <button className="status-button">Active</button>
            </div>
          </div>
          <div className="flight-card">
            <div className="card-header">
              <div className="airline">
                <Icon name="fa-plane-departure" size={20} />
                <span>Cathay Pacific</span>
              </div>
              <Icon name="fa-bookmark" size={20} />
            </div>
            <div className="card-body">
                <div className="flight-info">
                    <div className="location">
                        <span className="city">New York</span>
                        <span className="time">09:30</span>
                        <span className="airport">JFK</span>
                    </div>
                    <div className="flight-path">
                        <span className="dot"></span>
                        <span className="line"></span>
                        <Icon name="fa-plane" size={20} />
                        <span className="line"></span>
                        <span className="dot"></span>
                        <div className="duration">12h 15m</div>
                        <div className="type">Direct</div>
                    </div>
                    <div className="location">
                        <span className="city">HKG</span>
                        <span className="time">21:45</span>
                        <span className="airport">HKG</span>
                    </div>
                </div>
            </div>
            <div className="card-footer">
              <span className="date">Mon, Dec 18 2023</span>
              <button className="status-button">Active</button>
            </div>
          </div>
          <div className="flight-card">
            <div className="card-header">
              <div className="airline">
                <Icon name="fa-plane-departure" size={20} />
                <span>Cathay Pacific</span>
              </div>
              <Icon name="fa-bookmark" size={20} />
            </div>
            <div className="card-body">
              <div className="flight-info">
                <div className="location">
                  <span className="city">New York</span>
                  <span className="time">09:30</span>
                  <span className="airport">JFK</span>
                </div>
                <div className="flight-path">
                    <span className="dot"></span>
                    <span className="line"></span>
                    <Icon name="fa-plane" size={20} />
                    <span className="line"></span>
                    <span className="dot"></span>
                    <div className="duration">12h 15m</div>
                    <div className="type">Direct</div>
                </div>
                <div className="location">
                  <span className="city">HKG</span>
                  <span className="time">21:45</span>
                  <span className="airport">HKG</span>
                </div>
              </div>
            </div>
            <div className="card-footer">
              <span className="date">Mon, Dec 18 2023</span>
              <button className="status-button">Active</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Sample2;
