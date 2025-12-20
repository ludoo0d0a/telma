import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSidebar } from '../contexts/SidebarContext';
import { Icon } from '../utils/iconMapping';

interface BottomNavbarProps {
    onMoreClick: () => void;
}

const BottomNavbar: React.FC<BottomNavbarProps> = ({ onMoreClick }) => {
    return (
        <nav className='bottom-navbar' role='navigation' aria-label='main navigation'>
            <div className='bottom-navbar-menu'>
                <NavLink to='/' end className='bottom-navbar-item'>
                    <span className='icon'><Icon name='fa-home' size={20} /></span>
                    <span className='bottom-navbar-item-label'>Home</span>
                </NavLink>
                <NavLink to='/itinerary' className='bottom-navbar-item'>
                    <span className='icon'><Icon name='fa-route' size={20} /></span>
                    <span className='bottom-navbar-item-label'>Trajet</span>
                </NavLink>
                <NavLink to='/schedules' className='bottom-navbar-item'>
                    <span className='icon'><Icon name='fa-clock' size={20} /></span>
                    <span className='bottom-navbar-item-label'>Horaires</span>
                </NavLink>
                <NavLink to='/places' className='bottom-navbar-item'>
                    <span className='icon'><Icon name='fa-map-marker-alt' size={20} /></span>
                    <span className='bottom-navbar-item-label'>Lieux</span>
                </NavLink>
                <NavLink to='/favorites' className='bottom-navbar-item'>
                    <span className='icon'><Icon name='fa-star' size={20} /></span>
                    <span className='bottom-navbar-item-label'>Favoris</span>
                </NavLink>
            </div>
        </nav>
    );
}

export default BottomNavbar;
