import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSidebar } from '@/contexts/SidebarContext';
import { X, Home, Route, Clock, MapPin, Crosshair, Star, Train, BarChart3, Map, Circle, Bus, Book, Info } from 'lucide-react';

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
                  <X size={20} />
              </span>
          </button>
        </div>
        <div className="sidebar-content">
          <ul className="sidebar-links">
            <li>
              <NavLink to='/' end className="sidebar-link" onClick={onClose}>
                <span className='icon'><Home size={20} /></span>
                <span>Home</span>
              </NavLink>
            </li>
            <li>
              <NavLink to='/itinerary' className="sidebar-link" onClick={onClose}>
                <span className='icon'><Route size={20} /></span>
                <span>Trajet</span>
              </NavLink>
            </li>
            <li>
              <NavLink to='/schedules' className="sidebar-link" onClick={onClose}>
                <span className='icon'><Clock size={20} /></span>
                <span>Horaires</span>
              </NavLink>
            </li>
            <li>
              <NavLink to='/places' className="sidebar-link" onClick={onClose}>
                <span className='icon'><MapPin size={20} /></span>
                <span>Lieux</span>
              </NavLink>
            </li>
            <li>
              <NavLink to='/location-detection' className="sidebar-link" onClick={onClose}>
                <span className='icon'><Crosshair size={20} /></span>
                <span>Détection de localisation</span>
              </NavLink>
            </li>
            <li>
              <NavLink to='/favorites' className="sidebar-link" onClick={onClose}>
                <span className='icon'><Star size={20} /></span>
                <span>Favoris</span>
              </NavLink>
            </li>
            <li>
              <NavLink to='/train' className="sidebar-link" onClick={onClose}>
                <span className='icon'><Train size={20} /></span>
                <span>Train</span>
              </NavLink>
            </li>
            <li>
              <NavLink to='/lines' className="sidebar-link" onClick={onClose}>
                <span className='icon'><Route size={20} /></span>
                <span>Lignes</span>
              </NavLink>
            </li>
            <li>
              <NavLink to='/reports' className="sidebar-link" onClick={onClose}>
                <span className='icon'><BarChart3 size={20} /></span>
                <span>Rapports</span>
              </NavLink>
            </li>
            <li>
              <NavLink to='/coverage' className="sidebar-link" onClick={onClose}>
                <span className='icon'><Map size={20} /></span>
                <span>Couverture</span>
              </NavLink>
            </li>
            <li>
              <NavLink to='/isochrones' className="sidebar-link" onClick={onClose}>
                <span className='icon'><Circle size={20} /></span>
                <span>Isochrones</span>
              </NavLink>
            </li>
            <li>
              <NavLink to='/commercial-modes' className="sidebar-link" onClick={onClose}>
                <span className='icon'><Bus size={20} /></span>
                <span>Modes Commerciaux</span>
              </NavLink>
            </li>
            <li>
              <NavLink to='/api-docs' className="sidebar-link" onClick={onClose}>
                <span className='icon'><Book size={20} /></span>
                <span>API Documentation</span>
              </NavLink>
            </li>
            <li>
              <NavLink to='/about' className="sidebar-link" onClick={onClose}>
                <span className='icon'><Info size={20} /></span>
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
