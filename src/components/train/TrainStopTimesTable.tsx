import React from 'react';
import { parseUTCDate, formatTime } from '@/utils/dateUtils';
import { calculateDelay } from '@/services/delayService';
import type { ExtendedVehicleJourney } from './types';

interface TrainStopTimesTableProps {
    stopTimes: NonNullable<ExtendedVehicleJourney['stop_times']>;
}

const TrainStopTimesTable: React.FC<TrainStopTimesTableProps> = ({ stopTimes }) => {
    if (stopTimes.length === 0) {
        return null;
    }

    return (
        <div className='box'>
            <h3 className='title is-4 mb-4'>Arrêts et horaires</h3>
            <div className='table-container'>
                <table className='table is-fullwidth is-striped is-hoverable'>
                    <thead>
                        <tr>
                            <th>Gare</th>
                            <th>Horaire prévu</th>
                            <th>Horaire réel</th>
                            <th>Retard</th>
                            <th>Quai/Voie</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stopTimes.map((stop, index) => {
                            const extendedStop = stop as NonNullable<ExtendedVehicleJourney['stop_times']>[0];
                            const baseArrival = extendedStop?.base_arrival_date_time;
                            const realArrival = extendedStop?.arrival_date_time;
                            const baseDeparture = extendedStop?.base_departure_date_time;
                            const realDeparture = extendedStop?.departure_date_time;
                            
                            // Use arrival for intermediate stops, departure for last stop
                            const baseTime = index === stopTimes.length - 1 ? baseDeparture : baseArrival;
                            const realTime = index === stopTimes.length - 1 ? realDeparture : realArrival;

                            // Only calculate delay if both times are available
                            let delay: string | null = null;
                            if (baseTime && realTime) {
                                try {
                                    delay = calculateDelay(
                                        parseUTCDate(baseTime),
                                        parseUTCDate(realTime)
                                    );
                                } catch (err) {
                                    delay = null;
                                }
                            }

                            const stopPoint = extendedStop?.stop_point || {};
                            const stopArea = (stopPoint as { stop_area?: { name?: string | null } }).stop_area || {};
                            const stopName = (stopPoint as { name?: string | null }).name || stopArea?.name || 'Gare inconnue';
                            const platform = (stopPoint as { label?: string | null }).label || 'N/A';

                            return (
                                <tr key={index}>
                                    <td>
                                        <strong>{stopName}</strong>
                                        {index === 0 && (
                                            <span className='tag is-success is-dark ml-2'>Départ</span>
                                        )}
                                        {index === stopTimes.length - 1 && (
                                            <span className='tag is-danger is-dark ml-2'>Arrivée</span>
                                        )}
                                    </td>
                                    <td>{baseTime ? formatTime(parseUTCDate(baseTime)) : 'N/A'}</td>
                                    <td>
                                        {realTime && realTime !== baseTime ? (
                                            <span className='has-text-danger'>{formatTime(parseUTCDate(realTime))}</span>
                                        ) : baseTime ? (
                                            formatTime(parseUTCDate(baseTime))
                                        ) : (
                                            'N/A'
                                        )}
                                    </td>
                                    <td>
                                        {delay ? (
                                            delay !== 'À l\'heure' && delay !== 'à l\'heure' ? (
                                                <span className='tag is-danger'>{delay}</span>
                                            ) : (
                                                <span className='tag is-success'>À l'heure</span>
                                            )
                                        ) : (
                                            <span className='tag is-dark'>N/A</span>
                                        )}
                                    </td>
                                    <td>{platform}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TrainStopTimesTable;

