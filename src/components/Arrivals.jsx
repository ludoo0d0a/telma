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
            const arrivals = response.data.arrivals.map((arrival) => {
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/9d3d7068-4952-4f99-89ae-6519e28eef00',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Arrivals.jsx:18',message:'Processing arrival',data:{linksCount:arrival.links?.length||0,links:arrival.links?.map(l=>l.type),linksIds:arrival.links?.map(l=>l.id)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
                // #endregion
                
                // Find vehicle_journey link instead of assuming it's at index 1
                const vehicleJourneyLink = arrival.links?.find(link => 
                    link.type === 'vehicle_journey' || link.id?.includes('vehicle_journey')
                );
                const vehicleJourneyId = vehicleJourneyLink?.id || arrival.links?.[1]?.id || arrival.links?.[0]?.id;
                
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/9d3d7068-4952-4f99-89ae-6519e28eef00',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Arrivals.jsx:26',message:'Extracted vehicle journey ID',data:{vehicleJourneyId,foundLink:!!vehicleJourneyLink,fallbackToIndex1:!vehicleJourneyLink},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
                // #endregion
                
                return {
                    id: vehicleJourneyId,
                    operator: '',
                    transportationMode: arrival.display_informations.network,
                    trainNumber: arrival.display_informations.headsign,
                    baseArrivalTime: parseUTCDate(arrival.stop_date_time.base_arrival_date_time),
                    realArrivalTime: parseUTCDate(arrival.stop_date_time.arrival_date_time),
                    destination: arrival.display_informations.direction.split(' (')[0]
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
            <Origin idArrival={arrival.id} />
        </div>
      ))}
    </div>
  )
}

export default Arrivals
