import React from 'react';
import { NavLink } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
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
            <NavLink to='/places' className="sidebar-link" onClick={onClose}>Lieux</NavLink>
          </li>
          <li>
            <NavLink to='/lines' className="sidebar-link" onClick={onClose}>Lignes</NavLink>
          </li>
          <li>
            <NavLink to='/schedules' className="sidebar-link" onClick={onClose}>Horaires</NavLink>
          </li>
          <li>
            <NavLink to='/reports' className="sidebar-link" onClick={onClose}>Rapports</NavLink>
          </li>
          <li>
            <NavLink to='/coverage' className="sidebar-link" onClick={onClose}>Couverture</NavLink>
          </li>
          <li>
            <NavLink to='/isochrones' className="sidebar-link" onClick={onClose}>Isochrones</NavLink>
          </li>
          <li>
            <NavLink to='/api-docs' className="sidebar-link" onClick={onClose}>API Docs</NavLink>
          </li>
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
