import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { cleanLocationName } from './Utils'

interface OriginProps {
    idArrival: string | undefined;
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

const Origin: React.FC<OriginProps> = ({ idArrival}) => {
    const [stops, setStops] = useState<string[]>([])

    useEffect(() => {
        if (!idArrival) return;
        
        axios.get<VehicleJourneyResponse>(`https://api.sncf.com/v1/coverage/sncf/vehicle_journeys/${idArrival}`, {
            headers: {
                'Authorization': `${import.meta.env.VITE_API_KEY}`
            },
        })
        .then((response) => {
            const stopsApi = response.data.vehicle_journeys[0]?.stop_times.map(
                (stop) => cleanLocationName(stop.stop_point.name) || ''
            ) || []
            setStops(stopsApi)
        })
        .catch((error) => {
            console.error('Error fetching origin stops:', error);
        })
    }, [idArrival])

  return (
    <>
      <p className='arrival__origin'>{stops[0] || ''}</p>
      <div className='arrival__stops'>
        <ul className='stops'>
            {stops.map((stop, index) => (
                <li className='stops__station' key={`${stop}-${index}`}>
                    {stop}
                    <img src='https://via.placeholder.com/10x10/FFD700/FFD700.png' alt='yellow point' style={{
                        display: `${index === stops.length - 1 ? 'none' : 'inline'}`
                    }}/>
                </li>
            ))}
        </ul>
      </div>
    </>
  )
}

export default Origin

