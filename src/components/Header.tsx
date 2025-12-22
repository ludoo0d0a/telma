
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSidebar } from '@/contexts/SidebarContext';
import LoginButton from './LoginButton';
import { X, Menu } from 'lucide-react';

const Header: React.FC = () => {
    const { toggleSidebar, isOpen } = useSidebar();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <nav className='navbar is-primary' role='navigation' aria-label='main navigation'>
            <div className='navbar-brand'>
                <button
                    type='button'
                    className='navbar-burger sidebar-toggle'
                    aria-label='menu'
                    aria-expanded={isOpen}
                    onClick={toggleSidebar}
                    style={{ 
                        background: 'none', 
                        border: 'none', 
                        padding: '0.5rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white'
                    }}
                >
                    {isOpen ? <X size={24} style={{ color: 'white' }} /> : <Menu size={24} style={{ color: 'white' }} />}
                </button>
                <div className='navbar-item'>
                    <img 
                        src={`${import.meta.env.BASE_URL}favicons/favicon.svg`}
                        alt="Logo" 
                        style={{ height: '100px', width: '120px' }}
                    />
                </div>
                <Link to='/' className='navbar-item'>
                    <span className='title is-4 has-text-white'>Telma</span>
                </Link>
            </div>

            <div className={`navbar-menu ${isMenuOpen ? 'is-active' : ''}`}>
                <div className='navbar-start'>
                    <Link to='/' className='navbar-item'>
                        Accueil
                    </Link>
                    <Link to='/train' className='navbar-item'>
                        🚂 Train
                    </Link>
                    <Link to='/itinerary/bettembourg/metz' className='navbar-item has-text-secondary'>
                        🚂 Bettembourg→Metz
                    </Link>
                    <Link to='/itinerary/metz/thionville' className='navbar-item has-text-secondary'>
                        🚂 Metz→Thionville
                    </Link>
                    <Link to='/places' className='navbar-item'>
                        Lieux
                    </Link>
                    <Link to='/lines' className='navbar-item'>
                        Lignes
                    </Link>
                    <Link to='/schedules' className='navbar-item'>
                        Horaires
                    </Link>
                    <Link to='/reports' className='navbar-item'>
                        Rapports
                    </Link>
                    <Link to='/coverage' className='navbar-item'>
                        Couverture
                    </Link>
                    <Link to='/isochrones' className='navbar-item'>
                        Isochrones
                    </Link>
                </div>
                <div className="navbar-end">
                    <div className="navbar-item">
                        <div className="buttons">
                            <LoginButton />
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    )
}

export default Header;
