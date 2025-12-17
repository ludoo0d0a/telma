import React from 'react'
import { NavLink } from 'react-router-dom'

function TrainStations ({ stations }){
    // Handle case where stations is undefined, null, or not an object
    if (!stations || typeof stations !== 'object') {
        return (
            <div className='train-stations'>
                <p className='has-text-grey'>Aucune gare disponible pour cette ville.</p>
            </div>
        )
    }

    const stationKeys = Object.keys(stations)
    
    if (stationKeys.length === 0) {
        return (
            <div className='train-stations'>
                <p className='has-text-grey'>Aucune gare disponible pour cette ville.</p>
            </div>
        )
    }

    return (
        <div className='train-stations'>
            {stationKeys.map((stationName) => (
                <NavLink
                    className={({ isActive }) => `train-stations__link ${isActive ? 'train-stations__link--active' : ''}`}
                    key={stationName}
                    to={`${stations[stationName]}`}
                >
                <span>{stationName}</span>
                </NavLink>
            ))}
        </div>
    )
}

export default TrainStations
