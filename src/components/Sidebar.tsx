import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSidebar } from '../contexts/SidebarContext';
import { Icon } from '../utils/iconMapping';

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
                  <Icon name="fa-times" size={20} />
              </span>
          </button>
        </div>
        <div className="sidebar-content">
          <ul className="sidebar-links">
            <li>
              <NavLink to='/' end className="sidebar-link" onClick={onClose}>
                <span className='icon'><Icon name='fa-home' size={20} /></span>
                <span>Home</span>
              </NavLink>
            </li>
            <li>
              <NavLink to='/itinerary' className="sidebar-link" onClick={onClose}>
                <span className='icon'><Icon name='fa-route' size={20} /></span>
                <span>Trajet</span>
              </NavLink>
            </li>
            <li>
              <NavLink to='/schedules' className="sidebar-link" onClick={onClose}>
                <span className='icon'><Icon name='fa-clock' size={20} /></span>
                <span>Horaires</span>
              </NavLink>
            </li>
            <li>
              <NavLink to='/places' className="sidebar-link" onClick={onClose}>
                <span className='icon'><Icon name='fa-map-marker-alt' size={20} /></span>
                <span>Lieux</span>
              </NavLink>
            </li>
            <li>
              <NavLink to='/location-detection' className="sidebar-link" onClick={onClose}>
                <span className='icon'><Icon name='fa-crosshairs' size={20} /></span>
                <span>Détection de localisation</span>
              </NavLink>
            </li>
            <li>
              <NavLink to='/favorites' className="sidebar-link" onClick={onClose}>
                <span className='icon'><Icon name='fa-star' size={20} /></span>
                <span>Favoris</span>
              </NavLink>
            </li>
            <li>
              <NavLink to='/train' className="sidebar-link" onClick={onClose}>
                <span className='icon'><Icon name='fa-train' size={20} /></span>
                <span>Train</span>
              </NavLink>
            </li>
            <li>
              <NavLink to='/lines' className="sidebar-link" onClick={onClose}>
                <span className='icon'><Icon name='fa-route' size={20} /></span>
                <span>Lignes</span>
              </NavLink>
            </li>
            <li>
              <NavLink to='/reports' className="sidebar-link" onClick={onClose}>
                <span className='icon'><Icon name='fa-chart-bar' size={20} /></span>
                <span>Rapports</span>
              </NavLink>
            </li>
            <li>
              <NavLink to='/coverage' className="sidebar-link" onClick={onClose}>
                <span className='icon'><Icon name='fa-map' size={20} /></span>
                <span>Couverture</span>
              </NavLink>
            </li>
            <li>
              <NavLink to='/isochrones' className="sidebar-link" onClick={onClose}>
                <span className='icon'><Icon name='fa-circle' size={20} /></span>
                <span>Isochrones</span>
              </NavLink>
            </li>
            <li>
              <NavLink to='/commercial-modes' className="sidebar-link" onClick={onClose}>
                <span className='icon'><Icon name='fa-bus' size={20} /></span>
                <span>Modes Commerciaux</span>
              </NavLink>
            </li>
            <li>
              <NavLink to='/api-docs' className="sidebar-link" onClick={onClose}>
                <span className='icon'><Icon name='fa-book' size={20} /></span>
                <span>API Documentation</span>
              </NavLink>
            </li>
            <li>
              <NavLink to='/about' className="sidebar-link" onClick={onClose}>
                <span className='icon'><Icon name='fa-info-circle' size={20} /></span>
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
