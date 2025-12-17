import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getArrivals } from '../services/navitiaApi'
import Origin from './Origin'
import { calculateDelay, getFullMinutes, parseUTCDate } from './Utils'

const Arrivals = () => {

    const { codeStation } = useParams()
    const [nextArrivals, setNextArrivals] = useState([])

    useEffect(() => {
        (async function () {
            const response = await getArrivals(codeStation)
            
            // Extract disruptions from response
            const allDisruptions = response.data.disruptions || []
            
            const arrivals = response.data.arrivals.map((arrival) => {
                // Find vehicle_journey link instead of assuming it's at index 1
                const vehicleJourneyLink = arrival.links?.find(link => 
                    link.type === 'vehicle_journey' || link.id?.includes('vehicle_journey')
                );
                const vehicleJourneyId = vehicleJourneyLink?.id || arrival.links?.[1]?.id || arrival.links?.[0]?.id;

                // Find disruption links in display_informations
                const disruptionLinks = arrival.display_informations?.links?.filter(link => 
                    link.type === 'disruption'
                ) || []
                
                // Match disruptions using display_informations.links[type=disruption].id = disruptions[].id
                const matchedDisruptions = disruptionLinks
                    .map(link => allDisruptions.find(disruption => 
                        disruption.id === link.id || 
                        disruption.disruption_id === link.id ||
                        disruption.disruption_uri === link.id
                    ))
                    .filter(Boolean) // Remove undefined values

                return {
                    id: vehicleJourneyId,
                    operator: '',
                    transportationMode: arrival.display_informations.network,
                    trainNumber: arrival.display_informations.headsign,
                    baseArrivalTime: parseUTCDate(arrival.stop_date_time.base_arrival_date_time),
                    realArrivalTime: parseUTCDate(arrival.stop_date_time.arrival_date_time),
                    destination: arrival.display_informations.direction.split(' (')[0],
                    disruptions: matchedDisruptions,
                };
            });
            setNextArrivals(arrivals)
        })()
    }, [codeStation])

    const [isTimeDisplayed, setIsTimeDisplayed] = useState(true)

    useEffect(() => {
        const interval = setInterval(() => {
            setIsTimeDisplayed((prevIsTimeDisplayed => !prevIsTimeDisplayed))
        }, 5000)
        return () => {
            clearInterval(interval)
        }
    }, [])

  // Helper function to get disruption severity styling
  const getDisruptionSeverity = (disruption) => {
    let severityText = 'unknown';
    if (typeof disruption.severity === 'string') {
        severityText = disruption.severity;
    } else if (disruption.severity && typeof disruption.severity === 'object') {
        severityText = disruption.severity.name || disruption.severity.label || 'Perturbation';
    }
    
    const severityLevel = severityText.toLowerCase();
    let tagClass = 'is-warning';
    let icon = 'fa-exclamation-triangle';
    
    if (severityLevel.includes('blocking') || severityLevel.includes('blocked') || severityLevel.includes('suspended')) {
        tagClass = 'is-danger';
        icon = 'fa-ban';
    } else if (severityLevel.includes('information') || severityLevel.includes('info')) {
        tagClass = 'is-info';
        icon = 'fa-info-circle';
    } else if (severityLevel.includes('delay') || severityLevel.includes('retard')) {
        tagClass = 'is-warning';
        icon = 'fa-clock';
    }
    
    return { tagClass, icon, severityText };
  }

  return (
    <div className='arrivals'>
      {nextArrivals.map((arrival, index) => (
        <div key={arrival.id} className={`arrival ${index % 2 ? '' : 'arrival--light'}`}>
            <p className='arrival__operator'>{arrival.operator}</p>
            <p className='arrival__train-type'>{arrival.transportationMode}</p>
            <p className='arrival__train-number'>
                <Link to={`/train/${encodeURIComponent(arrival.id)}`} className='has-text-link'>
                    {arrival.trainNumber}
                </Link>
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
                                ? disruption.messages[0].text || disruption.messages[0].message 
                                : disruption.message || 'Perturbation';
                            
                            return (
                                <span key={disIndex} className={`tag ${tagClass} is-small mr-1`} title={message}>
                                    <span className='icon is-small mr-1'>
                                        <i className={`fas ${icon}`}></i>
                                    </span>
                                    <span>{severityText !== 'unknown' ? severityText : 'Perturbation'}</span>
                                </span>
                            );
                        })}
                    </div>
                </div>
            )}
            <Origin idArrival={arrival.id} />
        </div>
      ))}
    </div>
  )
}

export default Arrivals
