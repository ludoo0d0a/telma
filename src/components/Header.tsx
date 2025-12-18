import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
    const [isActive, setIsActive] = useState<boolean>(false);

    return (
        <nav className='navbar is-primary' role='navigation' aria-label='main navigation'>
            <div className='navbar-brand'>
                <div className='navbar-item'>

                </div>
                <div className='navbar-item'>
                    <img 
                        src={`${import.meta.env.BASE_URL}favicons/favicon.svg`}
                        alt="Logo" 
                        style={{ height: '100px', width: '120px' }}
                    />
                </div>
                <a
                    role='button'
                    className={`navbar-burger ${isActive ? 'is-active' : ''}`}
                    aria-label='menu'
                    aria-expanded='false'
                    onClick={() => setIsActive(!isActive)}
                >
                    <span aria-hidden='true'></span>
                    <span aria-hidden='true'></span>
                    <span aria-hidden='true'></span>
                </a>
            </div>

            <div className={`navbar-menu ${isActive ? 'is-active' : ''}`}>
                <div className='navbar-start'>
                    <Link to='/' className='navbar-item' onClick={() => setIsActive(false)}>
                        Accueil
                    </Link>
                    <Link to='/journeys' className='navbar-item' onClick={() => setIsActive(false)}>
                        Itinéraires
                    </Link>
                    <Link to='/train' className='navbar-item' onClick={() => setIsActive(false)}>
                        🚂 Train
                    </Link>
                    <Link to='/trajet/bettembourg/metz' className='navbar-item has-text-secondary' onClick={() => setIsActive(false)}>
                        🚂 Bettembourg→Metz
                    </Link>
                    <Link to='/trajet/metz/thionville' className='navbar-item has-text-secondary' onClick={() => setIsActive(false)}>
                        🚂 Metz→Thionville
                    </Link>
                    <Link to='/places' className='navbar-item' onClick={() => setIsActive(false)}>
                        Lieux
                    </Link>
                    <Link to='/lines' className='navbar-item' onClick={() => setIsActive(false)}>
                        Lignes
                    </Link>
                    <Link to='/schedules' className='navbar-item' onClick={() => setIsActive(false)}>
                        Horaires
                    </Link>
                    <Link to='/reports' className='navbar-item' onClick={() => setIsActive(false)}>
                        Rapports
                    </Link>
                    <Link to='/coverage' className='navbar-item' onClick={() => setIsActive(false)}>
                        Couverture
                    </Link>
                    <Link to='/isochrones' className='navbar-item' onClick={() => setIsActive(false)}>
                        Isochrones
                    </Link>
                </div>
                <div className='navbar-end'>
                    <Link to='/favorites' className='navbar-item has-text-warning' onClick={() => setIsActive(false)}>
                        <span className='icon'><i className='fas fa-star'></i></span>
                        <span>Favoris</span>
                    </Link>
                    <Link to='/api-docs' className='navbar-item has-text-secondary' onClick={() => setIsActive(false)}>
                        📚 API Docs
                    </Link>
                </div>
        </div>
        </nav>
    )
}

export default Header;

