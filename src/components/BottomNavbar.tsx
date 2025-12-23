import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSidebar } from '@/contexts/SidebarContext';
import { Home, Route, Clock, Star, MoreHorizontal } from 'lucide-react';

interface BottomNavbarProps {
    onMoreClick: () => void;
}

const BottomNavbar: React.FC<BottomNavbarProps> = ({ onMoreClick }) => {
    return (
        <nav className='bottom-navbar' role='navigation' aria-label='main navigation'>
            <div className='bottom-navbar-menu'>
                <NavLink to='/' end className='bottom-navbar-item'>
                    <span className='icon'><Home size={20} /></span>
                    <span className='bottom-navbar-item-label'>Home</span>
                </NavLink>
                <NavLink to='/itinerary' className='bottom-navbar-item'>
                    <span className='icon'><Route size={20} /></span>
                    <span className='bottom-navbar-item-label'>Trajet</span>
                </NavLink>
                <NavLink to='/schedules' className='bottom-navbar-item'>
                    <span className='icon'><Clock size={20} /></span>
                    <span className='bottom-navbar-item-label'>Horaires</span>
                </NavLink>
                <button className='bottom-navbar-item' onClick={onMoreClick}>
                    <span className='icon'><MoreHorizontal size={20} /></span>
                    <span className='bottom-navbar-item-label'>More</span>
                </button>
                <NavLink to='/favorites' className='bottom-navbar-item'>
                    <span className='icon'><Star size={20} /></span>
                    <span className='bottom-navbar-item-label'>Favoris</span>
                </NavLink>
            </div>
        </nav>
    );
}

export default BottomNavbar;
