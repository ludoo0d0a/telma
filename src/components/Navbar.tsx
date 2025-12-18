import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Player } from '@lottiefiles/react-lottie-player';
import animation from '../95504-bullet-train.json';

const Navbar: React.FC = () => {
    const [isActive, setIsActive] = useState<boolean>(false);
    const [isDropdownActive, setDropdownActive] = useState<boolean>(false);

    const toggleDropdown = (): void => {
        setDropdownActive(!isDropdownActive);
    }

    return (
        <nav className='navbar is-primary' role='navigation' aria-label='main navigation'>
            <div className='navbar-brand'>
                <Link to='/' className='navbar-item'>
                    <Player
                        autoplay
                        loop
                        src={animation}
                        style={{ height: '50px', width: '60px' }}
                    />
                </Link>
                <button
                    className={`navbar-burger button is-primary ${isActive ? 'is-active' : ''}`}
                    aria-label='menu'
                    aria-expanded='false'
                    onClick={() => setIsActive(!isActive)}
                >
                    <span aria-hidden='true'></span>
                    <span aria-hidden='true'></span>
                    <span aria-hidden='true'></span>
                </button>
            </div>

            <div className={`navbar-menu ${isActive ? 'is-active' : ''}`}>
                <div className='navbar-start'>
                    <Link to='/' className='navbar-item' onClick={() => setIsActive(false)}>
                        Accueil
                    </Link>
                    <Link to='/journeys' className='navbar-item' onClick={() => setIsActive(false)}>
                        Itinéraires
                    </Link>
                    <Link to='/metz-bettembourg' className='navbar-item has-text-secondary' onClick={() => setIsActive(false)}>
                        🚂 Metz→Bettembourg
                    </Link>
                    <Link to='/metz/thionville' className='navbar-item has-text-secondary' onClick={() => setIsActive(false)}>
                        🚂 Metz→Thionville
                    </Link>
                    <div className={`navbar-item has-dropdown ${isDropdownActive ? 'is-active' : ''}`}>
                        <button className='navbar-link' onClick={toggleDropdown}>
                            Plus
                        </button>
                        <div className='navbar-dropdown'>
                            <Link to='/places' className='navbar-item' onClick={() => { setIsActive(false); setDropdownActive(false); }}>
                                Lieux
                            </Link>
                            <Link to='/lines' className='navbar-item' onClick={() => { setIsActive(false); setDropdownActive(false); }}>
                                Lignes
                            </Link>
                            <Link to='/schedules' className='navbar-item' onClick={() => { setIsActive(false); setDropdownActive(false); }}>
                                Horaires
                            </Link>
                            <Link to='/reports' className='navbar-item' onClick={() => { setIsActive(false); setDropdownActive(false); }}>
                                Rapports
                            </Link>
                            <Link to='/coverage' className='navbar-item' onClick={() => { setIsActive(false); setDropdownActive(false); }}>
                                Couverture
                            </Link>
                            <Link to='/isochrones' className='navbar-item' onClick={() => { setIsActive(false); setDropdownActive(false); }}>
                                Isochrones
                            </Link>
                        </div>
                    </div>
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

export default Navbar;

