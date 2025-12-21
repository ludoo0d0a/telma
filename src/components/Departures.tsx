import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getDepartures } from '../services/navitiaApi'
import { extractVehicleJourneyId } from '../services/vehicleJourneyService'
import { parseUTCDate, getFullMinutes } from './Utils'
import { encodeVehicleJourneyId } from '../utils/uriUtils'
import { calculateDelay } from '../services/delayService'
import { matchDisruptionsForDepartureArrival } from '../services/disruptionService'
import { AlertTriangle, Ban, Info, Clock } from 'lucide-react'
import Stops from './Stops'
import type { Disruption } from '../client/models/disruption'
import type { Departure } from '../client/models/departure'

interface ProcessedDeparture {
    id: string | undefined;
    operator: string;
    transportationMode: string | undefined;
    trainNumber: string | undefined;
    baseDepartureTime: Date;
    realDepartureTime: Date;
    destination: string;
    disruptions: Disruption[];
}

interface DisruptionSeverityInfo {
    tagClass: string;
    icon: React.ComponentType<{ size?: number | string; className?: string }>;
    severityText: string;
}

const Departures: React.FC = () => {
    const { codeStation } = useParams<{ codeStation?: string }>()
    const [nextDepartures, setNextDepartures] = useState<ProcessedDeparture[]>([])

    useEffect(() => {
        if (!codeStation) return;
        
        (async function () {
            const response = await getDepartures(codeStation)
            console.log(response)
            
            // Extract disruptions from response
            const allDisruptions = response.data.disruptions || []
            
            const nextDeparturesApi: ProcessedDeparture[] = (response.data.departures || []).map((departure: Departure) => {
                // Find vehicle_journey link instead of assuming it's at index 1
                const vehicleJourneyLink = departure.links?.find(link => 
                    link.type === 'vehicle_journey' || link.id?.includes('vehicle_journey')
                );
                // Extract the ID properly (handles full URLs and plain IDs)
                const rawVehicleJourneyId = vehicleJourneyLink?.id || vehicleJourneyLink?.href || departure.links?.[1]?.id || departure.links?.[0]?.id;
                const vehicleJourneyId = extractVehicleJourneyId(rawVehicleJourneyId) || undefined;

                // Find disruption links in departure.links
                const disruptionLinks = departure.links?.filter(link => 
                    link.type === 'disruption'
                ) || []
                
                // Get trip ID and stop point ID
                const tripLink = departure.links?.find(link => 
                    link.type === 'trip' || link.id?.includes('trip')
                );
                const tripId = tripLink?.id;
                const departureStopPointId = departure.stop_point?.id;
                
                // Match disruptions using shared function
                const matchedDisruptions = matchDisruptionsForDepartureArrival(
                    allDisruptions,
                    disruptionLinks,
                    tripId,
                    departureStopPointId
                );

                // Handle stop_date_time - it might be a string or an object in the actual response
                const stopDateTime = departure.stop_date_time as unknown as {
                    base_departure_date_time?: string;
                    departure_date_time?: string;
                } | string | undefined;

                const baseDepartureTimeStr = typeof stopDateTime === 'object' && stopDateTime?.base_departure_date_time
                    ? stopDateTime.base_departure_date_time
                    : typeof stopDateTime === 'string' ? stopDateTime : '';
                
                const realDepartureTimeStr = typeof stopDateTime === 'object' && stopDateTime?.departure_date_time
                    ? stopDateTime.departure_date_time
                    : typeof stopDateTime === 'string' ? stopDateTime : baseDepartureTimeStr;

                return {
                    id: vehicleJourneyId,
                    operator: '',
                    transportationMode: departure.display_informations?.network,
                    trainNumber: departure.display_informations?.headsign,
                    baseDepartureTime: parseUTCDate(baseDepartureTimeStr),
                    realDepartureTime: parseUTCDate(realDepartureTimeStr),
                    destination: departure.display_informations?.direction?.split('(')[0] || '',
                    disruptions: matchedDisruptions,
                };
            });
            setNextDepartures(nextDeparturesApi)
        })();
    }, [codeStation])

    const [isTimeDisplayed, setIsTimeDiplayed] = useState<boolean>(true)

    useEffect(() => {
        const interval = setInterval(() => {
            setIsTimeDiplayed((prevIsTimeDisplayed) => !prevIsTimeDisplayed)
        }, 5000)
        return () => {
            clearInterval(interval)
        }
    }, [])

    // Helper function to get disruption severity styling
    const getDisruptionSeverity = (disruption: Disruption): DisruptionSeverityInfo => {
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
        let IconComponent = AlertTriangle;
        
        if (severityLevel.includes('blocking') || severityLevel.includes('blocked') || severityLevel.includes('suspended')) {
            tagClass = 'is-danger';
            IconComponent = Ban;
        } else if (severityLevel.includes('information') || severityLevel.includes('info')) {
            tagClass = 'is-info';
            IconComponent = Info;
        } else if (severityLevel.includes('delay') || severityLevel.includes('retard')) {
            tagClass = 'is-warning';
            IconComponent = Clock;
        }
        
        return { tagClass, icon: IconComponent, severityText };
    }

    return (
        <div className='departures'>
            {nextDepartures.map((departure, index) => (
                <div key={departure.id || index} className={`departure ${index % 2 ? '' : 'departure--light'}`}>
                    <p className='departure__operator'>{departure.operator}</p>
                    <p className='departure__train-type'>{departure.transportationMode}</p>
                    <p className='departure__train-number'>
                        {departure.id && (
                            <Link to={`/train/${encodeVehicleJourneyId(departure.id)}`} className='has-text-link'>
                                {departure.trainNumber}
                            </Link>
                        )}
                        {!departure.id && <span>{departure.trainNumber}</span>}
                    </p>
                    <p className={`departure__time ${isTimeDisplayed ? '' : 'departure__time--disappear'}`}>
                        {departure.baseDepartureTime.getHours()}h
                        {getFullMinutes(departure.baseDepartureTime)}
                    </p>
                    <p className={`departure__delay ${isTimeDisplayed ? 'departure__delay--disappear' : ''}`}>
                        {calculateDelay(
                            departure.baseDepartureTime,
                            departure.realDepartureTime
                        )}
                    </p>
                    <p className='departure_destination'>{departure.destination}</p>
                    {/* Display disruptions */}
                    {departure.disruptions && departure.disruptions.length > 0 && (
                        <div className='departure__disruptions mt-2'>
                            <div className='tags'>
                                {departure.disruptions.map((disruption, disIndex) => {
                                    const { tagClass, icon, severityText } = getDisruptionSeverity(disruption);
                                    const message = disruption.messages && disruption.messages.length > 0 
                                        ? disruption.messages[0].text || (disruption.messages[0] as { message?: string }).message 
                                        : disruption.message || 'Perturbation';
                                    
                                    const IconComponent = icon;
                                    return (
                                        <span key={disIndex} className={`tag ${tagClass} is-small mr-1`} title={message}>
                                            <span className='icon is-small mr-1'>
                                                <IconComponent size={14} />
                                            </span>
                                            <span>{severityText !== 'unknown' ? severityText : 'Perturbation'}</span>
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                    {departure.id && <Stops idDeparture={departure.id} />}
                </div>
            ))}
        </div>
    )
}

export default Departures

