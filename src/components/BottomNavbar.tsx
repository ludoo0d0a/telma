import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSidebar } from '../contexts/SidebarContext';

interface BottomNavbarProps {
    onMoreClick: () => void;
}

const BottomNavbar: React.FC<BottomNavbarProps> = ({ onMoreClick }) => {
    return (
        <nav className='bottom-navbar' role='navigation' aria-label='main navigation'>
            <div className='bottom-navbar-menu'>
                <NavLink to='/' end className='bottom-navbar-item'>
                    <span className='icon'><i className='fas fa-home'></i></span>
                    <span className='bottom-navbar-item-label'>Home</span>
                </NavLink>
                <NavLink to='/itinerary' className='bottom-navbar-item'>
                    <span className='icon'><i className='fas fa-route'></i></span>
                    <span className='bottom-navbar-item-label'>Trajet</span>
                </NavLink>
                <NavLink to='/schedules' className='bottom-navbar-item'>
                    <span className='icon'><i className='fas fa-clock'></i></span>
                    <span className='bottom-navbar-item-label'>Horaires</span>
                </NavLink>
                <NavLink to='/places' className='bottom-navbar-item'>
                    <span className='icon'><i className='fas fa-map-marker-alt'></i></span>
                    <span className='bottom-navbar-item-label'>Lieux</span>
                </NavLink>
                <NavLink to='/favorites' className='bottom-navbar-item'>
                    <span className='icon'><i className='fas fa-star'></i></span>
                    <span className='bottom-navbar-item-label'>Favoris</span>
                </NavLink>
            </div>
        </nav>
    );
}

export default BottomNavbar;
