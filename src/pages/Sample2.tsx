import React, { useState } from 'react';
import { PageHeader, Tabs, FlightCard } from '@/components/skytrip';
import { PlaneTakeoff, Bookmark } from 'lucide-react';
import './Sample2.scss';

const Sample2: React.FC = () => {
  const [activeTab, setActiveTab] = useState('active');

  const tabs = [
    { label: 'Active', value: 'active' },
    { label: 'Expired', value: 'expired' }
  ];

  const flights = [
    {
      from: { code: 'JFK', city: 'New York' },
      to: { code: 'HKG', city: 'HKG' },
      departureTime: '09:30',
      arrivalTime: '21:45',
      duration: '12h 15m',
      airline: 'Cathay Pacific',
      flightType: 'Direct',
      header: (
        <>
          <div className="airline">
            <PlaneTakeoff size={20} />
            <span>Cathay Pacific</span>
          </div>
          <Bookmark size={20} />
        </>
      ),
      footer: (
        <>
          <span className="date">Mon, Dec 18 2023</span>
          <button className="status-button">Active</button>
        </>
      )
    },
    {
      from: { code: 'JFK', city: 'New York' },
      to: { code: 'HKG', city: 'HKG' },
      departureTime: '09:30',
      arrivalTime: '21:45',
      duration: '12h 15m',
      airline: 'Cathay Pacific',
      flightType: 'Direct',
      header: (
        <>
          <div className="airline">
            <PlaneTakeoff size={20} />
            <span>Cathay Pacific</span>
          </div>
          <Bookmark size={20} />
        </>
      ),
      footer: (
        <>
          <span className="date">Mon, Dec 18 2023</span>
          <button className="status-button">Active</button>
        </>
      )
    },
    {
      from: { code: 'JFK', city: 'New York' },
      to: { code: 'HKG', city: 'HKG' },
      departureTime: '09:30',
      arrivalTime: '21:45',
      duration: '12h 15m',
      airline: 'Cathay Pacific',
      flightType: 'Direct',
      header: (
        <>
          <div className="airline">
            <PlaneTakeoff size={20} />
            <span>Cathay Pacific</span>
          </div>
          <Bookmark size={20} />
        </>
      ),
      footer: (
        <>
          <span className="date">Mon, Dec 18 2023</span>
          <button className="status-button">Active</button>
        </>
      )
    }
  ];

  return (
    <div className="sample2-page">
      <PageHeader
        title="Saved Flights"
        backUrl="/"
        showSearch={true}
      />
      <main>
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          variant="rounded"
        />
        <div className="flight-list">
          {flights.map((flight, index) => (
            <FlightCard
              key={index}
              from={flight.from}
              to={flight.to}
              departureTime={flight.departureTime}
              arrivalTime={flight.arrivalTime}
              duration={flight.duration}
              airline={flight.airline}
              variant="saved"
              showTimeline={false}
              header={flight.header}
              footer={flight.footer}
              flightType={flight.flightType}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Sample2;
