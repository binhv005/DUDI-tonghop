import React, { useState, useEffect } from 'react';
import { Phone, ArrowUp } from 'lucide-react';

export const FloatingWidget = () => {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowTop(window.scrollY > 250);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className="floating-widget-group">
      {/* 1. Hotline Call Button */}
      <a 
        href="tel:0909163821" 
        className="floating-btn btn-call" 
        title="Gọi hotline: 0909 163 821"
        aria-label="Gọi điện thoại"
      >
        <div className="pulse-ring"></div>
        <Phone size={22} className="widget-icon" />
      </a>

      {/* 2. Zalo Chat Button */}
      <a 
        href="https://zalo.me/0909163821" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="floating-btn btn-zalo" 
        title="Chat Zalo: 0909 163 821"
        aria-label="Chat qua Zalo"
      >
        <span className="zalo-text">Zalo</span>
      </a>

      {/* 3. Scroll to Top Button */}
      <button 
        type="button" 
        className={`floating-btn btn-scroll-top-widget ${showTop ? 'visible' : ''}`}
        onClick={scrollToTop}
        title="Lên đầu trang"
        aria-label="Lên đầu trang"
      >
        <ArrowUp size={20} className="widget-icon" />
      </button>
    </div>
  );
};

export default FloatingWidget;
