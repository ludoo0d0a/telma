import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Box, Chip } from '@mui/material'
import { getDepartures } from '@/services/navitiaApi'
import { extractVehicleJourneyId } from '@/services/vehicleJourneyService'
import { parseUTCDate, getFullMinutes } from '@/utils/dateUtils'
import { encodeVehicleJourneyId } from '@/utils/uriUtils'
import { calculateDelay } from '@/services/delayService'
import { matchDisruptionsForDepartureArrival } from '@/services/disruptionService'
import { AlertTriangle, Ban, Info, Clock } from 'lucide-react'
import Stops from './Stops'
import type { Disruption } from '@/client/models/disruption'
import type { Departure } from '@/client/models/departure'

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
    chipColor: 'error' | 'warning' | 'info';
    icon: React.ComponentType<{ size?: number | string; className?: string }>;
    severityText: string;
}

const Departures: React.FC = () => {
    const { codeStation } = useParams<{ codeStation?: string }>()
    const [nextDepartures, setNextDepartures] = useState<ProcessedDeparture[]>([])

    useEffect(() => {
        if (!codeStation) return;
        
        (async function () {
            const data = await getDepartures(codeStation)
            console.log(data)
            
            // Extract disruptions from response
            const allDisruptions = data.disruptions || []
            
            const nextDeparturesApi: ProcessedDeparture[] = (data.departures || []).map((departure: Departure) => {
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
        let chipColor: 'error' | 'warning' | 'info' = 'warning';
        let IconComponent = AlertTriangle;
        
        if (severityLevel.includes('blocking') || severityLevel.includes('blocked') || severityLevel.includes('suspended')) {
            chipColor = 'error';
            IconComponent = Ban;
        } else if (severityLevel.includes('information') || severityLevel.includes('info')) {
            chipColor = 'info';
            IconComponent = Info;
        } else if (severityLevel.includes('delay') || severityLevel.includes('retard')) {
            chipColor = 'warning';
            IconComponent = Clock;
        }
        
        return { chipColor, icon: IconComponent, severityText };
    }

    return (
        <div className='departures'>
            {nextDepartures.map((departure, index) => (
                <div key={departure.id || index} className={`departure ${index % 2 ? '' : 'departure--light'}`}>
                    <p className='departure__operator'>{departure.operator}</p>
                    <p className='departure__train-type'>{departure.transportationMode}</p>
                    <p className='departure__train-number'>
                        {departure.id && (
                            <Link to={`/train/${encodeVehicleJourneyId(departure.id)}`} style={{ color: '#b3d4fc', textDecoration: 'underline' }}>
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
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {departure.disruptions.map((disruption, disIndex) => {
                                    const { chipColor, icon: IconComponent, severityText } = getDisruptionSeverity(disruption);
                                    const message = disruption.messages && disruption.messages.length > 0 
                                        ? disruption.messages[0].text || (disruption.messages[0] as { message?: string }).message 
                                        : disruption.message || 'Perturbation';
                                    return (
                                        <Chip
                                            key={disIndex}
                                            size="small"
                                            color={chipColor}
                                            icon={<IconComponent size={14} />}
                                            label={severityText !== 'unknown' ? severityText : 'Perturbation'}
                                            title={message}
                                            sx={{ mr: 0.5 }}
                                        />
                                    );
                                })}
                            </Box>
                        </div>
                    )}
                    {departure.id && <Stops idDeparture={departure.id} />}
                </div>
            ))}
        </div>
    )
}

export default Departures

