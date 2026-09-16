import React from 'react';
import { Search, X } from 'lucide-react';
import { CATEGORIES } from '../data/servicesData';

export const HeroSection = ({ 
  searchQuery, 
  setSearchQuery, 
  activeCategory, 
  setActiveCategory,
  categoryCounts
}) => {
  return (
    <div className="hero-box">
      <div className="badge-pill">
        <span className="pulse-dot"></span>
        <span>HỆ SINH THÁI GIẢI PHÁP SỐ DUDI SOFTWARE</span>
      </div>

      <h1 className="hero-title">
        <span className="gradient-text">Dịch vụ của chúng tôi</span>
      </h1>

      <p className="hero-subtitle">
        Chúng tôi cung cấp đa dạng các dịch vụ công nghệ đáp ứng mọi nhu cầu của doanh nghiệp.
      </p>

      {/* Search & Category Filter Controls */}
      <div className="filter-controls">
        {/* Search Bar */}
        <div className="search-box">
          <Search className="search-icon" size={18} />
          <input 
            type="text" 
            placeholder="Tìm kiếm dịch vụ, công nghệ, tính năng..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoComplete="off"
          />
          {searchQuery && (
            <button 
              className="btn-clear" 
              onClick={() => setSearchQuery('')}
              aria-label="Xóa tìm kiếm"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Category Tabs */}
        <div className="category-tabs">
          {CATEGORIES.map(cat => {
            const count = categoryCounts[cat.id] || 0;
            const isActive = activeCategory === cat.id;

            return (
              <button 
                key={cat.id}
                className={`tab-btn ${isActive ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                <span>{cat.name}</span>
                <span className="count-badge">{count}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
