import React from 'react';

export const Navbar = () => {
  return (
    <header className="navbar">
      <div className="container nav-content">
        <a href="#" className="brand-logo">
          <img 
            src="/images/logo.webp" 
            alt="DUDI Software" 
            className="logo-img"
            onError={(e) => { e.currentTarget.src = 'https://dudi-gioithieu.vercel.app/logo.webp'; }}
          />
          <div className="brand-text">
            <span className="brand-name">DUDI <span className="highlight">SOFTWARE</span></span>
            <span className="brand-tagline">Technology Solutions Hub</span>
          </div>
        </a>
      </div>
    </header>
  );
};
