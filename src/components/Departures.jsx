import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getDepartures } from '../services/navitiaApi'
import { parseUTCDate, getFullMinutes, calculateDelay } from './Utils'
import Stops from './Stops'

const Departures = () => {

    const { codeStation } = useParams()
    const [nextDepartures, setNextDepartures] = useState([])

    useEffect(() => {
        (async function () {
            const response = await getDepartures(codeStation)
            console.log(response)
            
            // Extract disruptions from response
            const allDisruptions = response.data.disruptions || []
            
            const nextDeparturesApi = response.data.departures.map((departure) => {
                // Find vehicle_journey link instead of assuming it's at index 1
                const vehicleJourneyLink = departure.links?.find(link => 
                    link.type === 'vehicle_journey' || link.id?.includes('vehicle_journey')
                );
                const vehicleJourneyId = vehicleJourneyLink?.id || departure.links?.[1]?.id || departure.links?.[0]?.id;

                // Find disruption links in display_informations
                const disruptionLinks = departure.display_informations?.links?.filter(link => 
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
                    transportationMode: departure.display_informations.network,
                    trainNumber: departure.display_informations.headsign,
                    baseDepartureTime: parseUTCDate(departure.stop_date_time.base_departure_date_time),
                    realDepartureTime: parseUTCDate(departure.stop_date_time.departure_date_time),
                    destination: departure.display_informations.direction.split('(')[0],
                    disruptions: matchedDisruptions,
                };
            });
            setNextDepartures(nextDeparturesApi)
        })();
    }, [codeStation])

    const [isTimeDisplayed, setIsTimeDiplayed] = useState(true)

    useEffect(() => {
        const interval = setInterval(() => {
            setIsTimeDiplayed((prevIsTimeDisplayed) => !prevIsTimeDisplayed)
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
        <div className='departures'>
            {nextDepartures.map((departure, index) => (
                <div key={departure.id} className={`departure ${index % 2 ? '' : 'departure--light'}`}>
                    <p className='departure__operator'>{departure.operator}</p>
                    <p className='departure__train-type'>{departure.transportationMode}</p>
                    <p className='departure__train-number'>
                        <Link to={`/train/${encodeURIComponent(departure.id)}`} className='has-text-link'>
                            {departure.trainNumber}
                        </Link>
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
                    <Stops idDeparture={departure.id} />
                </div>
            ))}
        </div>
    )
}

export default Departures
