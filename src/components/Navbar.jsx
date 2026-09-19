import React from 'react';
import { LayoutDashboard, Compass } from 'lucide-react';

export const Navbar = ({ currentView = 'home', onViewChange }) => {
  return (
    <header className="navbar">
      <div className="container nav-content">
        <a 
          href="#home" 
          className="brand-logo"
          onClick={(e) => {
            e.preventDefault();
            if (onViewChange) onViewChange('home');
          }}
        >
          <div className="brand-text">
            <span className="brand-name">DUDI <span className="highlight">SOFTWARE</span></span>
            <span className="brand-tagline">Technology Solutions Hub</span>
          </div>
        </a>

        {/* Right Action Button at the end of header */}
        <div className="nav-actions-right">
          {currentView === 'home' ? (
            <button 
              className="btn-nav-primary"
              onClick={() => onViewChange && onViewChange('dashboard')}
            >
              <LayoutDashboard size={15} />
              <span>Vào Dashboard</span>
            </button>
          ) : (
            <button 
              className="btn-nav-secondary"
              onClick={() => onViewChange && onViewChange('home')}
            >
              <Compass size={15} />
              <span>Về Trang Dịch Vụ</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
