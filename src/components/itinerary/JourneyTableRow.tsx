import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Info, Train as TrainIcon } from 'lucide-react';
import type { JourneyItem } from '@/client/models/journey-item';
import type { JourneyInfo } from '@/services/journeyService';
import type { Disruption } from '@/client/models/disruption';
import { parseUTCDate, formatTime, formatDate } from '@/utils/dateUtils';
import { getDelay, getMaxDelay } from '@/services/delayService';
import { encodeVehicleJourneyId } from '@/utils/uriUtils';

interface JourneyTableRowProps {
    journey: JourneyItem;
    journeyInfo: JourneyInfo;
    journeyDisruptions: Disruption[];
    tripId: string;
    onDetailClick: () => void;
}

const JourneyTableRow: React.FC<JourneyTableRowProps> = ({
    journey,
    journeyInfo,
    journeyDisruptions,
    tripId,
    onDetailClick,
}) => {
    const depDate = parseUTCDate(journeyInfo.departureTime);
    const arrDate = parseUTCDate(journeyInfo.arrivalTime);
    const depDelay = getDelay(journeyInfo.baseDepartureTime, journeyInfo.realDepartureTime);
    const arrDelay = getDelay(journeyInfo.baseArrivalTime, journeyInfo.realArrivalTime);
    const maxDelay = getMaxDelay(
        depDelay,
        arrDelay,
        journeyInfo.baseDepartureTime,
        journeyInfo.realDepartureTime,
        journeyInfo.baseArrivalTime,
        journeyInfo.realArrivalTime
    );

    return (
        <tr>
            <td>
                <span className='tag is-dark has-text-weight-semibold'>{formatDate(depDate, 'short')}</span>
            </td>
            <td>
                <div>
                    <div className='is-flex is-align-items-center mb-2'>
                        <span className={`icon ${journeyInfo.transportColor} mr-2`}>
                            <journeyInfo.transportIcon size={20} />
                        </span>
                        {journeyInfo.vehicleJourneyId ? (() => {
                            // Ensure we have a string ID, not an object
                            let trainId = journeyInfo.vehicleJourneyId;
                            if (typeof trainId === 'object' && trainId !== null) {
                                trainId = (trainId as { id?: string; href?: string }).id || (trainId as { id?: string; href?: string }).href || null;
                            }
                            return trainId ? (
                                <Link
                                    to={`/train/${encodeVehicleJourneyId(trainId)}`}
                                    className='has-text-primary has-text-weight-bold'
                                >
                                    {journeyInfo.trainNumber}
                                </Link>
                            ) : (
                                <strong className='has-text-primary'>{journeyInfo.trainNumber}</strong>
                            );
                        })() : (
                            <strong className='has-text-primary'>{journeyInfo.trainNumber}</strong>
                        )}
                    </div>
                    <span className={`tag ${journeyInfo.transportTagColor} is-dark`}>
                        {journeyInfo.transportLabel}
                    </span>
                    {journeyInfo.network && journeyInfo.network !== journeyInfo.commercialMode && (
                        <>
                            <br />
                            <small className='has-text-grey'>{journeyInfo.network}</small>
                        </>
                    )}
                </div>
            </td>
            <td>
                <div>
                    <strong className='has-text-info'>{journeyInfo.departureStation}</strong>
                    <br />
                    <span className='is-size-5'>{formatTime(parseUTCDate(journeyInfo.baseDepartureTime))}</span>
                    {depDelay && depDelay !== 'À l\'heure' && (
                        <>
                            <br />
                            <span className='has-text-danger'>{formatTime(parseUTCDate(journeyInfo.realDepartureTime))}</span>
                        </>
                    )}
                    {depDelay && (
                        <>
                            <br />
                            <span className={`tag is-small ${depDelay !== 'À l\'heure' ? 'is-danger' : 'is-success'}`}>
                                {depDelay}
                            </span>
                        </>
                    )}
                </div>
            </td>
            <td>
                <div>
                    <strong className='has-text-info'>{journeyInfo.arrivalStation}</strong>
                    <br />
                    <span className='is-size-5'>{formatTime(parseUTCDate(journeyInfo.baseArrivalTime))}</span>
                    {arrDelay && arrDelay !== 'À l\'heure' && (
                        <>
                            <br />
                            <span className='has-text-danger'>{formatTime(parseUTCDate(journeyInfo.realArrivalTime))}</span>
                        </>
                    )}
                    {arrDelay && (
                        <>
                            <br />
                            <span className={`tag is-small ${arrDelay !== 'À l\'heure' ? 'is-danger' : 'is-success'}`}>
                                {arrDelay}
                            </span>
                        </>
                    )}
                </div>
            </td>
            <td>
                {maxDelay && maxDelay !== 'À l\'heure' ? (
                    <span className='tag is-danger'>{maxDelay}</span>
                ) : (
                    <span className='tag is-success'>À l'heure</span>
                )}
            </td>
            <td>
                {journeyDisruptions.length > 0 ? (
                    <div className='tags'>
                        {journeyDisruptions.map((disruption, disIndex) => {
                            let severityText = 'unknown';
                            if (typeof disruption.severity === 'string') {
                                severityText = disruption.severity;
                            } else if (disruption.severity && typeof disruption.severity === 'object') {
                                severityText = (disruption.severity as { name?: string; label?: string }).name ||
                                              (disruption.severity as { name?: string; label?: string }).label ||
                                              'Perturbation';
                            }

                            const severityLevel = severityText.toLowerCase();
                            let tagClass = 'is-warning';
                            if (severityLevel.includes('blocking') || severityLevel.includes('blocked') || severityLevel.includes('suspended')) {
                                tagClass = 'is-danger';
                            } else if (severityLevel.includes('information') || severityLevel.includes('info')) {
                                tagClass = 'is-info';
                            } else if (severityLevel.includes('delay') || severityLevel.includes('retard')) {
                                tagClass = 'is-warning';
                            }

                            const message = disruption.messages && disruption.messages.length > 0
                                ? disruption.messages[0].text || (disruption.messages[0] as { message?: string }).message
                                : disruption.message || severityText;

                            return (
                                <span
                                    key={disIndex}
                                    className={`tag ${tagClass} is-small`}
                                    title={message}
                                >
                                    <span className='icon mr-1'>
                                        <AlertTriangle size={20} />
                                    </span>
                                    {message.length > 30 ? message.substring(0, 30) + '...' : message}
                                </span>
                            );
                        })}
                    </div>
                ) : (
                    <span className='has-text-grey' style={{fontStyle: 'italic'}}>-</span>
                )}
            </td>
            <td>
                <span className='tag is-dark has-text-weight-semibold'>{Math.floor(journeyInfo.duration / 60)}min</span>
            </td>
            <td>
                {journeyInfo.wagonCount ? (
                    <span className='tag is-info is-dark'>
                        <span className='icon mr-1'><TrainIcon size={16} /></span>
                        {journeyInfo.wagonCount}
                    </span>
                ) : (
                    <span className='has-text-grey' style={{fontStyle: 'italic'}}>N/A</span>
                )}
            </td>
            <td>
                <Link
                    to={`/trip/${tripId}`}
                    className='button is-small is-info is-light'
                    onClick={onDetailClick}
                    title='Voir les détails du trajet'
                >
                    <span className='icon'>
                        <Info size={16} />
                    </span>
                </Link>
            </td>
        </tr>
    );
};

export default JourneyTableRow;

