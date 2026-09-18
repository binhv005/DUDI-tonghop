import React, { useState, useEffect } from 'react';
import { Phone, ArrowUp } from 'lucide-react';
import { ChatWidget } from './ChatWidget';

export const FloatingWidget = () => {
  const [showTop, setShowTop] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const servicesSection = document.getElementById('services') || document.querySelector('main');
      if (servicesSection) {
        const rect = servicesSection.getBoundingClientRect();
        setShowTop(rect.top <= window.innerHeight * 0.5);
      } else {
        setShowTop(window.scrollY > 1500);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const toggleChat = () => {
    setIsChatOpen((prev) => !prev);
  };

  return (
    <>
      {/* AI Chatbot Window */}
      <ChatWidget isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      <div className="floating-widget-group">
        {/* 1. Robot Head Mascot Widget (Opens Chatbot) */}
        <button 
          type="button" 
          className={`floating-btn btn-robot-mascot ${isChatOpen ? 'is-active' : ''}`}
          title="Trò chuyện với AI Chatbot"
          aria-label="Trò chuyện với AI Chatbot"
          onClick={toggleChat}
        >
          {/* Hiệu ứng loang hào quang sóng xung quanh nhân vật */}
          <div className="robot-loang-ring ring-wave-1"></div>
          <div className="robot-loang-ring ring-wave-2"></div>
          <div className="robot-loang-glow"></div>

          <img 
            src="/images/robot-mascot.webp" 
            alt="DUDI Robot" 
            className="robot-widget-avatar" 
          />
        </button>

      {/* 2. Hotline Call Button */}
      <a 
        href="tel:0909163821" 
        className="floating-btn btn-call" 
        title="Gọi hotline: 0909 163 821"
        aria-label="Gọi điện thoại"
      >
        <div className="pulse-ring"></div>
        <Phone size={22} className="widget-icon" />
      </a>

      {/* 3. Zalo Chat Button */}
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

      {/* 4. Scroll to Top Button (Only rendered when scrolled past Hero) */}
      {showTop && (
        <button 
          type="button" 
          className="floating-btn btn-scroll-top-widget visible"
          onClick={scrollToTop}
          title="Lên đầu trang"
          aria-label="Lên đầu trang"
        >
          <ArrowUp size={20} className="widget-icon" />
        </button>
      )}
    </div>
    </>
  );
};

export default FloatingWidget;
