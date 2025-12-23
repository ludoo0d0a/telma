import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSidebar } from '@/contexts/SidebarContext';
import { Home, Star, LayoutDashboard, BarChart2, MessageSquareWarning } from 'lucide-react';

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
                <NavLink to='/dashboard' className='bottom-navbar-item'>
                    <span className='icon'><LayoutDashboard size={20} /></span>
                    <span className='bottom-navbar-item-label'>Dashboard</span>
                </NavLink>
                <NavLink to='/stats' className='bottom-navbar-item'>
                    <span className='icon'><BarChart2 size={20} /></span>
                    <span className='bottom-navbar-item-label'>Stats</span>
                </NavLink>
                <NavLink to='/raise-issue' className='bottom-navbar-item'>
                    <span className='icon'><MessageSquareWarning size={20} /></span>
                    <span className='bottom-navbar-item-label'>Issue</span>
                </NavLink>
                <NavLink to='/favorites' className='bottom-navbar-item'>
                    <span className='icon'><Star size={20} /></span>
                    <span className='bottom-navbar-item-label'>Favoris</span>
                </NavLink>
            </div>
        </nav>
    );
}

export default BottomNavbar;
