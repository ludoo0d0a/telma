import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getArrivals } from '../services/navitiaApi'
import { extractVehicleJourneyId } from '../services/vehicleJourneyService'
import { encodeVehicleJourneyId } from '../utils/uriUtils'
import Origin from './Origin'
import { getFullMinutes, parseUTCDate } from './Utils'
import { calculateDelay } from '../services/delayService'
import { matchDisruptionsForDepartureArrival } from '../services/disruptionService'
import { AlertTriangle, Ban, Info, Clock } from 'lucide-react'
import type { Disruption } from '../client/models/disruption'
import type { Arrival } from '../client/models/arrival'

interface ProcessedArrival {
    id: string | undefined;
    operator: string;
    transportationMode: string | undefined;
    trainNumber: string | undefined;
    baseArrivalTime: Date;
    realArrivalTime: Date;
    destination: string;
    disruptions: Disruption[];
}

interface DisruptionSeverityInfo {
    tagClass: string;
    icon: React.ComponentType<{ size?: number | string; className?: string }>;
    severityText: string;
}

const Arrivals: React.FC = () => {
    const { codeStation } = useParams<{ codeStation?: string }>()
    const [nextArrivals, setNextArrivals] = useState<ProcessedArrival[]>([])

    useEffect(() => {
        if (!codeStation) return;
        
        (async function () {
            const response = await getArrivals(codeStation)
            
            // Extract disruptions from response
            const allDisruptions = response.data.disruptions || []
            
            const arrivals: ProcessedArrival[] = (response.data.arrivals || []).map((arrival: Arrival) => {
                // Find vehicle_journey link instead of assuming it's at index 1
                const vehicleJourneyLink = arrival.links?.find(link => 
                    link.type === 'vehicle_journey' || link.id?.includes('vehicle_journey')
                );
                // Extract the ID properly (handles full URLs and plain IDs)
                const rawVehicleJourneyId = vehicleJourneyLink?.id || vehicleJourneyLink?.href || arrival.links?.[1]?.id || arrival.links?.[0]?.id;
                const vehicleJourneyId = extractVehicleJourneyId(rawVehicleJourneyId) || undefined;

                // Find disruption links in arrival.links
                const disruptionLinks = arrival.links?.filter(link => 
                    link.type === 'disruption'
                ) || []
                
                // Get trip ID and stop point ID
                const tripLink = arrival.links?.find(link => 
                    link.type === 'trip' || link.id?.includes('trip')
                );
                const tripId = tripLink?.id;
                const arrivalStopPointId = arrival.stop_point?.id;
                
                // Match disruptions using shared function
                const matchedDisruptions = matchDisruptionsForDepartureArrival(
                    allDisruptions,
                    disruptionLinks,
                    tripId,
                    arrivalStopPointId
                );

                // Handle stop_date_time - it might be a string or an object in the actual response
                const stopDateTime = arrival.stop_date_time as unknown as {
                    base_arrival_date_time?: string;
                    arrival_date_time?: string;
                } | string | undefined;

                const baseArrivalTimeStr = typeof stopDateTime === 'object' && stopDateTime?.base_arrival_date_time
                    ? stopDateTime.base_arrival_date_time
                    : typeof stopDateTime === 'string' ? stopDateTime : '';
                
                const realArrivalTimeStr = typeof stopDateTime === 'object' && stopDateTime?.arrival_date_time
                    ? stopDateTime.arrival_date_time
                    : typeof stopDateTime === 'string' ? stopDateTime : baseArrivalTimeStr;

                return {
                    id: vehicleJourneyId,
                    operator: '',
                    transportationMode: arrival.display_informations?.network,
                    trainNumber: arrival.display_informations?.headsign,
                    baseArrivalTime: parseUTCDate(baseArrivalTimeStr),
                    realArrivalTime: parseUTCDate(realArrivalTimeStr),
                    destination: arrival.display_informations?.direction?.split(' (')[0] || '',
                    disruptions: matchedDisruptions,
                };
            });
            setNextArrivals(arrivals)
        })()
    }, [codeStation])

    const [isTimeDisplayed, setIsTimeDisplayed] = useState<boolean>(true)

    useEffect(() => {
        const interval = setInterval(() => {
            setIsTimeDisplayed((prevIsTimeDisplayed: boolean) => !prevIsTimeDisplayed)
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
    <div className='arrivals'>
      {nextArrivals.map((arrival, index) => (
        <div key={arrival.id || index} className={`arrival ${index % 2 ? '' : 'arrival--light'}`}>
            <p className='arrival__operator'>{arrival.operator}</p>
            <p className='arrival__train-type'>{arrival.transportationMode}</p>
            <p className='arrival__train-number'>
                {arrival.id && (
                    <Link to={`/train/${encodeVehicleJourneyId(arrival.id)}`} className='has-text-link'>
                        {arrival.trainNumber}
                    </Link>
                )}
                {!arrival.id && <span>{arrival.trainNumber}</span>}
            </p>
            <p className={`arrival__time ${isTimeDisplayed ? '' : 'arrival__time--disappear'}`}>
                {arrival.baseArrivalTime.getHours()}h{getFullMinutes(arrival.baseArrivalTime)}
            </p>
            <p className={`arrival__delay ${isTimeDisplayed ? 'arrival__delay--disappear' : ''}`}>
                {calculateDelay(arrival.baseArrivalTime, arrival.realArrivalTime)}
            </p>
            {/* Display disruptions */}
            {arrival.disruptions && arrival.disruptions.length > 0 && (
                <div className='arrival__disruptions mt-2'>
                    <div className='tags'>
                        {arrival.disruptions.map((disruption, disIndex) => {
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
            {arrival.id && <Origin idArrival={arrival.id} />}
        </div>
      ))}
    </div>
  )
}

export default Arrivals

