import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane } from 'lucide-react';
import { DateSelector, FlightList } from '@/components/skytrip';
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
            from: { code: 'DPS', city: 'Bali' },
            to: { code: 'CGK', city: 'Banten' },
            departureTime: '10:00 AM',
            arrivalTime: '11:45 AM',
            duration: '1h 45m',
            airline: 'Garuda Indonesia',
            price: '$140'
        },
        {
            from: { code: 'DPS', city: 'Bali' },
            to: { code: 'CGK', city: 'Banten' },
            departureTime: '02:00 PM',
            arrivalTime: '02:45 AM',
            duration: '45m',
            airline: 'Garuda Indonesia',
            price: '$340'
        }
    ];

    return (
        <div className="app-flight">
            <main>
                <DateSelector
                    dates={dates}
                    selectedDate={selectedDate}
                    onDateSelect={setSelectedDate}
                />

                <FlightList
                    flights={flights}
                    variant="detailed"
                    title="Airlines"
                />
            </main>
        </div>
    );
};

export default Sample3;
