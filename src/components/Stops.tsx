import React, { useEffect, useState} from 'react'
import axios from 'axios'
import { cleanLocationName } from '../services/locationService'

interface StopsProps {
    idDeparture: string | undefined;
}

interface VehicleJourneyResponse {
    vehicle_journeys: Array<{
        stop_times: Array<{
            stop_point: {
                name: string | null | undefined;
            };
        }>;
    }>;
}

const Stops: React.FC<StopsProps> = ({idDeparture}) => {
    const [nextStops, setNextStops] = useState<string[]>([])

    useEffect(() => {
        if (!idDeparture) return;
        
        axios.get<VehicleJourneyResponse>(`https://api.sncf.com/v1/coverage/sncf/vehicle_journeys/${idDeparture}`,{
            headers: {
                'Authorization': `${import.meta.env.VITE_API_KEY}`,
            },
        })
        .then((response) => {
            const stops = response.data.vehicle_journeys[0]?.stop_times.map(
                (stop) => cleanLocationName(stop.stop_point.name) || ''
            ) || []
            setNextStops(stops)
        })
        .catch((error) => {
            console.error('Error fetching stops:', error);
        })
    }, [idDeparture])

  return (
    <div className='departure__stops'>
      <ul className='stops'>
        {nextStops.map((stop, index) => (
            <li className='stops__station' key={`${stop}-${index}`}>
                {stop}
                <img src='https://via.placeholder.com/10x10/FFD700/FFD700.png' alt='yellow point' style={{
                    display: `${index === nextStops.length - 1 ? 'none' : 'inline'}`
                }} />
            </li>
        ))}
      </ul>
    </div>
  )
}

export default Stops

