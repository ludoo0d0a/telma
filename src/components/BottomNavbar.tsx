import React from 'react';
import { NavLink } from 'react-router-dom';

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
                <NavLink to='/schedules' className='bottom-navbar-item'>
                    <span className='icon'><i className='fas fa-clock'></i></span>
                    <span className='bottom-navbar-item-label'>Schedules</span>
                </NavLink>
                <NavLink to='/favorites' className='bottom-navbar-item'>
                    <span className='icon'><i className='fas fa-star'></i></span>
                    <span className='bottom-navbar-item-label'>Favorites</span>
                </NavLink>
                <button className='bottom-navbar-item' onClick={onMoreClick}>
                    <span className='icon'><i className='fas fa-ellipsis-h'></i></span>
                    <span className='bottom-navbar-item-label'>More</span>
                </button>
            </div>
        </nav>
    );
}

export default BottomNavbar;
