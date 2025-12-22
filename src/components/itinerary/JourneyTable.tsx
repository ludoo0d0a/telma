import React from 'react';
import type { JourneyItem } from '@/client/models/journey-item';
import type { JourneyInfo } from '@/services/journeyService';
import type { Disruption } from '@/client/models/disruption';
import JourneyTableRow from './JourneyTableRow';

interface JourneyTableProps {
    journeys: JourneyItem[];
    getJourneyInfo: (journey: JourneyItem) => JourneyInfo;
    getJourneyDisruptions: (journey: JourneyItem, journeyInfo: JourneyInfo) => Disruption[];
    generateTripId: (journey: JourneyItem, journeyInfo: JourneyInfo) => string;
    onDetailClick: (journey: JourneyItem, journeyInfo: JourneyInfo, journeyDisruptions: Disruption[], tripId: string) => void;
}

const JourneyTable: React.FC<JourneyTableProps> = ({
    journeys,
    getJourneyInfo,
    getJourneyDisruptions,
    generateTripId,
    onDetailClick,
}) => {
    return (
        <div className='box'>
            <h2 className='title is-4 mb-5'>
                Trains disponibles <span className='tag is-primary is-medium'>{journeys.length}</span>
            </h2>
            <div className='table-container'>
                <table className='table is-fullwidth is-striped is-hoverable'>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Train</th>
                            <th>Départ</th>
                            <th>Arrivée</th>
                            <th>Retard</th>
                            <th>Perturbations</th>
                            <th>Durée</th>
                            <th>Wagons</th>
                            <th>Détails</th>
                        </tr>
                    </thead>
                    <tbody>
                        {journeys.map((journey, index) => {
                            const journeyInfo = getJourneyInfo(journey);
                            const journeyDisruptions = getJourneyDisruptions(journey, journeyInfo);
                            const tripId = generateTripId(journey, journeyInfo);

                            return (
                                <JourneyTableRow
                                    key={index}
                                    journey={journey}
                                    journeyInfo={journeyInfo}
                                    journeyDisruptions={journeyDisruptions}
                                    tripId={tripId}
                                    onDetailClick={() => onDetailClick(journey, journeyInfo, journeyDisruptions, tripId)}
                                />
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default JourneyTable;

