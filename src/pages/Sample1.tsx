import React, { useState } from 'react';
import { Header, SearchCard, FlightList } from '@/components/skytrip';
import './Sample1.scss';

const Sample1: React.FC = () => {
    const [activeTab, setActiveTab] = useState('one-way');

    const tabs = [
        { label: 'One-Way', value: 'one-way' },
        { label: 'Round Trip', value: 'round-trip' },
        { label: 'Multi-City', value: 'multi-city' }
    ];

    const flights = [
        {
            from: { code: 'DPS', city: 'Bali' },
            to: { code: 'CGK', city: 'Banten' },
            departureTime: '10:00 AM',
            arrivalTime: '11:45 AM',
            duration: '1h 45m',
            airline: 'Garuda Indonesia',
            price: '$140'
        }
    ];

    return (
        <div className="sample1-page">
            <Header />

            <main className="main-content">
                <SearchCard
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    onSearch={() => console.log('Search clicked')}
                />

                <div className="results-section">
                    <FlightList
                        flights={flights}
                        title="Results"
                        showSeeAll={true}
                    />
                </div>
            </main>
        </div>
    );
};

export default Sample1;
