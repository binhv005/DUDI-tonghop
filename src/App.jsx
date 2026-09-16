import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { StorytellingSection } from './components/StorytellingSection';
import { HeroSection } from './components/HeroSection';
import { ServiceCard } from './components/ServiceCard';
import { Footer } from './components/Footer';
import { FloatingWidget } from './components/FloatingWidget';
import { SERVICES_DATA } from './data/servicesData';
import { SearchX, ChevronLeft, ChevronRight } from 'lucide-react';

export function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const sliderRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);

  // Category counts calculation
  const categoryCounts = useMemo(() => {
    const counts = { all: SERVICES_DATA.length, web: 0, maintenance: 0, seo: 0, pricing: 0 };
    SERVICES_DATA.forEach(item => {
      if (counts[item.category] !== undefined) {
        counts[item.category]++;
      }
    });
    return counts;
  }, []);

  // Filtered services
  const filteredServices = useMemo(() => {
    return SERVICES_DATA.filter(service => {
      const matchesCategory = activeCategory === 'all' || service.category === activeCategory;
      const cleanQuery = searchQuery.trim().toLowerCase();
      
      const matchesSearch = !cleanQuery || 
        service.title.toLowerCase().includes(cleanQuery) ||
        service.description.toLowerCase().includes(cleanQuery) ||
        service.keywords.toLowerCase().includes(cleanQuery) ||
        service.categoryName.toLowerCase().includes(cleanQuery);

      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, activeCategory]);

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
  }, [filteredServices]);

  const handleScrollSlider = (direction) => {
    if (!sliderRef.current) return;
    const firstItem = sliderRef.current.querySelector('.slider-item');
    const scrollAmount = firstItem ? (firstItem.offsetWidth + 24) : 410;
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

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setActiveCategory('all');
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
            <HeroSection 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              categoryCounts={categoryCounts}
            />

            {/* Slider Navigation Bar */}
            {filteredServices.length > 0 && (
              <div className="slider-header-controls">
                <span className="slider-hint">
                  <span className="dot-active"></span>
                  Kéo hoặc trượt sang ngang để xem tất cả {filteredServices.length} dịch vụ
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
            )}

            {/* 1 Row Horizontal Carousel/Slider */}
            {filteredServices.length > 0 ? (
              <div 
                ref={sliderRef}
                className="services-slider"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUpOrLeave}
                onMouseLeave={handleMouseUpOrLeave}
              >
                {filteredServices.map(service => (
                  <div key={service.id} className="slider-item">
                    <ServiceCard service={service} />
                  </div>
                ))}
              </div>
            ) : (
              /* No Results */
              <div className="no-results">
                <div className="no-results-icon">
                  <SearchX size={32} />
                </div>
                <h3>Không tìm thấy dịch vụ phù hợp</h3>
                <p>Thử tìm kiếm với từ khóa khác như "Landing page", "Bảo trì", "Website", "SEO" hoặc xóa bộ lọc.</p>
                <button className="btn btn-outline" onClick={handleResetFilters}>
                  Xem tất cả dịch vụ
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer onScrollToTop={handleScrollToTop} />

      {/* Floating Action Buttons Widget (Call, Zalo, Scroll-to-top) */}
      <FloatingWidget />
    </div>
  );
}

export default App;
