import React from 'react'
import { Outlet, useParams } from 'react-router-dom'
import Footer from '@/components/Footer'
import TrainStations from '@/components/TrainStations'
import stations from '@/gares.json'

const City: React.FC = () => {
    const { city } = useParams<{ city?: string }>()
    const cityName = city ? city.replace(/-/g, ' ') : 'Ville'

  return (
    <>
        <div className='city'>
          <h2 className='city__name'>{cityName}</h2>
          <TrainStations stations={stations[city as keyof typeof stations] as Record<string, string> | undefined} />
          <Outlet />
        </div>
        <Footer />
    </>
  )
}

export default City

