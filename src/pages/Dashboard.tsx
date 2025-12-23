import React from 'react';
import { Header } from '@/components/skytrip';

const Dashboard: React.FC = () => {
    // Placeholder for favorite stations
    const favoriteStations = [
        { name: 'Gare de Lyon', city: 'Paris' },
        { name: 'Gare du Nord', city: 'Paris' },
        { name: 'Gare de Marseille-Saint-Charles', city: 'Marseille' },
    ];

    return (
        <div className="app-flight">
            <Header />

            <main>
                <div className="container" style={{ padding: '20px' }}>
                    <h2 className="title is-2">Your Dashboard</h2>
                    <h3 className="title is-4">Favorite Stations</h3>
                    <div className="columns is-multiline">
                        {favoriteStations.map((station, index) => (
                            <div className="column is-one-third" key={index}>
                                <div className="box">
                                    <p className="title is-5">{station.name}</p>
                                    <p className="subtitle is-6">{station.city}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
