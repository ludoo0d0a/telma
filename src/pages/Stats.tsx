import React from 'react';
import { Header } from '@/components/skytrip';

const Stats: React.FC = () => {
    return (
        <div className="app-flight">
            <Header />

            <main>
                <div className="flight-results-section">
                    <div className="container">
                        <h2 className="title is-2">Statistics</h2>
                        <div className="columns is-multiline">
                            <div className="column is-one-third">
                                <div className="box">
                                    <p className="title is-4">Total Journeys</p>
                                    <p className="subtitle is-6">1,234</p>
                                </div>
                            </div>
                            <div className="column is-one-third">
                                <div className="box">
                                    <p className="title is-4">Stations Covered</p>
                                    <p className="subtitle is-6">567</p>
                                </div>
                            </div>
                            <div className="column is-one-third">
                                <div className="box">
                                    <p className="title is-4">Active Users</p>
                                    <p className="subtitle is-6">890</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Stats;
