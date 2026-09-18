import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { StorytellingSection } from './components/StorytellingSection';
import { HeroSection } from './components/HeroSection';
import { ServiceCard } from './components/ServiceCard';
import { FloatingWidget } from './components/FloatingWidget';
import { SERVICES_DATA } from './data/servicesData';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function App() {
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const sliderRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);

  // Check scroll position for slider arrows
  const checkSliderScroll = () => {
    if (!sliderRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkSliderScroll();
    const currentSlider = sliderRef.current;
    if (currentSlider) {
      currentSlider.addEventListener('scroll', checkSliderScroll);
      window.addEventListener('resize', checkSliderScroll);
    }
    return () => {
      if (currentSlider) {
        currentSlider.removeEventListener('scroll', checkSliderScroll);
      }
      window.removeEventListener('resize', checkSliderScroll);
    };
  }, []);

  const handleScrollSlider = (direction) => {
    if (!sliderRef.current) return;
    const firstItem = sliderRef.current.querySelector('.slider-item');
    const computedGap = parseFloat(window.getComputedStyle(sliderRef.current).gap) || 24;
    const scrollAmount = firstItem ? (firstItem.offsetWidth + computedGap) : 410;
    sliderRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  // Drag to scroll functionality
  const handleMouseDown = (e) => {
    // Only left click
    if (e.button !== 0 || !sliderRef.current) return;
    isDragging.current = true;
    startX.current = e.pageX - sliderRef.current.offsetLeft;
    scrollLeftStart.current = sliderRef.current.scrollLeft;
    sliderRef.current.style.cursor = 'grabbing';
    sliderRef.current.style.userSelect = 'none';
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current || !sliderRef.current) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5; // Drag sensitivity
    sliderRef.current.scrollLeft = scrollLeftStart.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    if (!sliderRef.current) return;
    isDragging.current = false;
    sliderRef.current.style.cursor = 'grab';
    sliderRef.current.style.removeProperty('user-select');
  };

  return (
    <div className="app-wrapper">
      {/* Ambient Glows */}
      <div className="ambient-glow glow-1"></div>
      <div className="ambient-glow glow-2"></div>
      <div className="ambient-glow glow-3"></div>

      <Navbar />

      {/* Hero Scroll-Driven Storytelling Section (25 Frames + 8 Projects) */}
      <StorytellingSection />

      <main>
        <section className="hero-section" id="services">
          <div className="container">
            <HeroSection />

            {/* Slider Navigation Bar */}
            <div className="slider-header-controls">
              <span className="slider-hint">
                <span className="dot-active"></span>
                Kéo hoặc trượt sang ngang để xem tất cả {SERVICES_DATA.length} dịch vụ
              </span>

              <div className="slider-nav-buttons">
                <button 
                  className={`btn-slider-arrow ${!canScrollLeft ? 'disabled' : ''}`}
                  onClick={() => handleScrollSlider('left')}
                  disabled={!canScrollLeft}
                  aria-label="Trượt sang trái"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  className={`btn-slider-arrow ${!canScrollRight ? 'disabled' : ''}`}
                  onClick={() => handleScrollSlider('right')}
                  disabled={!canScrollRight}
                  aria-label="Trượt sang phải"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            {/* 1 Row Horizontal Carousel/Slider */}
            <div 
              ref={sliderRef}
              className="services-slider"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUpOrLeave}
              onMouseLeave={handleMouseUpOrLeave}
            >
              {SERVICES_DATA.map(service => (
                <div key={service.id} className="slider-item">
                  <ServiceCard service={service} />
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Floating Action Buttons Widget (Call, Zalo, Scroll-to-top) */}
      <FloatingWidget />
    </div>
  );
}

export default App;
