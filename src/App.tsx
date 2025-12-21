import React, { useEffect } from 'react'
import { Route, Routes, useLocation, Navigate } from 'react-router-dom'
import TrainStation from './components/TrainStation'
import City from './pages/City'
import Home from './pages/Home'
import CommercialModes from './pages/CommercialModes'
import Coverage from './pages/Coverage'
import Places from './pages/Places'
import Schedules from './pages/Schedules'
import Reports from './pages/Reports'
import Lines from './pages/Lines'
import Isochrones from './pages/Isochrones'
import SwaggerUIPage from './pages/SwaggerUI'
import Trajet from './pages/Trajet'
import Favorites from './pages/Favorites'
import Train from './pages/Train'
import Trip from './pages/Trip'
import About from './pages/About'
import LocationDetection from './pages/LocationDetection'
import Sample1 from './pages/Sample1'
import Sample2 from './pages/Sample2'
import Sample3 from './pages/Sample3'
import Snowfall from 'react-snowfall'
import { trackPageView } from './utils/analytics'
import BottomNavbar from './components/BottomNavbar'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import { SidebarProvider, useSidebar } from './contexts/SidebarContext'

const AppContent: React.FC = () => {
    const location = useLocation()
    const { isOpen, toggleSidebar, closeSidebar } = useSidebar();
    const useMobileView = location.pathname === '/sample1' || location.pathname === '/sample2' || location.pathname === '/sample3';

    useEffect(() => {
        // Track page view on route change
        trackPageView(location.pathname + location.search)
    }, [location])

    return (
        <div className='App'>
            {!useMobileView && <Sidebar isOpen={isOpen} onClose={closeSidebar} />}
            {!useMobileView && <Header />}
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
                <Route path='/coverage' element={<Coverage />} />
                <Route path='/places' element={<Places />} />
                <Route path='/schedules' element={<Schedules />} />
                <Route path='/reports' element={<Reports />} />
                <Route path='/lines' element={<Lines />} />
                <Route path='/isochrones' element={<Isochrones />} />
                <Route path='/api-docs' element={<SwaggerUIPage />} />
                <Route path='/itinerary' element={<Trajet />} />
                <Route path='/itinerary/:from/:to' element={<Trajet />} />
                <Route path='/train/:id' element={<Train />} />
                <Route path='/train' element={<Train />} />
                <Route path='/trip/:tripId' element={<Trip />} />
                <Route path='/favorites' element={<Favorites />} />
                <Route path='/location-detection' element={<LocationDetection />} />
                <Route path='/city/:city' element={<City />}>
                    <Route path=':codeStation' element={<TrainStation />} />
                </Route>
                <Route path='/about' element={<About />} />
                <Route path='/sample1' element={<Sample1 />} />
                <Route path='/sample2' element={<Sample2 />} />
                <Route path='/sample3' element={<Sample3 />} />
                <Route path='*' element={<Navigate to='/' replace />} />
            </Routes>
            {!useMobileView && <BottomNavbar onMoreClick={toggleSidebar} />}
        </div>
    )
}

const App: React.FC = () => {
    return (
        <SidebarProvider>
            <AppContent />
        </SidebarProvider>
    )
}

export default App
