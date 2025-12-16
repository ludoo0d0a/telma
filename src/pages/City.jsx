import React from 'react'
import { Outlet, useParams } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import TrainStations from '../components/TrainStations'
import stations from '../gares.json'

const City = () => {

    const {city} = useParams()

  return (
    <>
    <Header />
    <div className='city'>
      <h2 className='city__name'>{city}</h2>
      <TrainStations stations={stations[city]} />
      <Outlet />
    </div>
    <Footer />
    </>
  )
}

export default City
