import React from 'react'
import { Route, Routes } from 'react-router-dom'
import TrainStation from './components/TrainStation'
import City from './pages/City'
import Home from './pages/Home'
import CommercialModes from './pages/CommercialModes'
import Journeys from './pages/Journeys'
import Coverage from './pages/Coverage'
import Places from './pages/Places'
import Schedules from './pages/Schedules'
import Reports from './pages/Reports'
import Lines from './pages/Lines'
import Isochrones from './pages/Isochrones'
import SwaggerUIPage from './pages/SwaggerUI'
import MetzBettembourg from './pages/MetzBettembourg'
import Trajet from './pages/Trajet'
import Favorites from './pages/Favorites'
import Snowfall from 'react-snowfall'

function App() {
    return (
        <div className='App'>
              { /*  <Snowfall
                style={{
                    position: 'fixed',
                    width: '100vw',
                    height: '100vh',
                }}
            />*/ }
            <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/commercial-modes' element={<CommercialModes />} />
                <Route path='/journeys' element={<Journeys />} />
                <Route path='/coverage' element={<Coverage />} />
                <Route path='/places' element={<Places />} />
                <Route path='/schedules' element={<Schedules />} />
                <Route path='/reports' element={<Reports />} />
                <Route path='/lines' element={<Lines />} />
                <Route path='/isochrones' element={<Isochrones />} />
                <Route path='/api-docs' element={<SwaggerUIPage />} />
                <Route path='/metz-bettembourg' element={<MetzBettembourg />} />
                <Route path='/:from/:to' element={<Trajet />} />
                <Route path='/favorites' element={<Favorites />} />
                <Route path='/:city' element={<City />}>
                    <Route path=':codeStation' element={<TrainStation />} />
                </Route>
            </Routes>
        </div>
    )
}

export default App
