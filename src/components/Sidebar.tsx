import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSidebar } from '../contexts/SidebarContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    <>
      {isOpen && (
        <div className="sidebar-backdrop" onClick={onClose}></div>
      )}
      <aside className={`sidebar ${isOpen ? 'is-open' : ''}`}>
        <div className="sidebar-header">
          <h3>More</h3>
          <button className="button is-ghost" onClick={onClose}>
              <span className="icon">
                  <i className="fas fa-times"></i>
              </span>
          </button>
        </div>
        <div className="sidebar-content">
          <ul className="sidebar-links">
            <li>
              <NavLink to='/' end className="sidebar-link" onClick={onClose}>
                <span className='icon'><i className='fas fa-home'></i></span>
                <span>Home</span>
              </NavLink>
            </li>
            <li>
              <NavLink to='/itinerary' className="sidebar-link" onClick={onClose}>
                <span className='icon'><i className='fas fa-route'></i></span>
                <span>Trajet</span>
              </NavLink>
            </li>
            <li>
              <NavLink to='/schedules' className="sidebar-link" onClick={onClose}>
                <span className='icon'><i className='fas fa-clock'></i></span>
                <span>Horaires</span>
              </NavLink>
            </li>
            <li>
              <NavLink to='/places' className="sidebar-link" onClick={onClose}>
                <span className='icon'><i className='fas fa-map-marker-alt'></i></span>
                <span>Lieux</span>
              </NavLink>
            </li>
            <li>
              <NavLink to='/location-detection' className="sidebar-link" onClick={onClose}>
                <span className='icon'><i className='fas fa-crosshairs'></i></span>
                <span>Détection de localisation</span>
              </NavLink>
            </li>
            <li>
              <NavLink to='/favorites' className="sidebar-link" onClick={onClose}>
                <span className='icon'><i className='fas fa-star'></i></span>
                <span>Favoris</span>
              </NavLink>
            </li>
            <li>
              <NavLink to='/train' className="sidebar-link" onClick={onClose}>
                <span className='icon'><i className='fas fa-train'></i></span>
                <span>Train</span>
              </NavLink>
            </li>
            <li>
              <NavLink to='/lines' className="sidebar-link" onClick={onClose}>
                <span className='icon'><i className='fas fa-route'></i></span>
                <span>Lignes</span>
              </NavLink>
            </li>
            <li>
              <NavLink to='/reports' className="sidebar-link" onClick={onClose}>
                <span className='icon'><i className='fas fa-chart-bar'></i></span>
                <span>Rapports</span>
              </NavLink>
            </li>
            <li>
              <NavLink to='/coverage' className="sidebar-link" onClick={onClose}>
                <span className='icon'><i className='fas fa-map'></i></span>
                <span>Couverture</span>
              </NavLink>
            </li>
            <li>
              <NavLink to='/isochrones' className="sidebar-link" onClick={onClose}>
                <span className='icon'><i className='fas fa-circle'></i></span>
                <span>Isochrones</span>
              </NavLink>
            </li>
            <li>
              <NavLink to='/commercial-modes' className="sidebar-link" onClick={onClose}>
                <span className='icon'><i className='fas fa-bus'></i></span>
                <span>Modes Commerciaux</span>
              </NavLink>
            </li>
            <li>
              <NavLink to='/api-docs' className="sidebar-link" onClick={onClose}>
                <span className='icon'><i className='fas fa-book'></i></span>
                <span>API Documentation</span>
              </NavLink>
            </li>
            <li>
              <NavLink to='/about' className="sidebar-link" onClick={onClose}>
                <span className='icon'><i className='fas fa-info-circle'></i></span>
                <span>About</span>
              </NavLink>
            </li>
          </ul>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
