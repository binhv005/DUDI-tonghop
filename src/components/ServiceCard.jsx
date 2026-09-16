import React, { useRef } from 'react';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { DynamicIcon } from './DynamicIcon';

export const ServiceCard = ({ service }) => {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (window.innerWidth < 768 || (window.matchMedia && !window.matchMedia('(hover: hover)').matches)) return;
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -4;
    const rotateY = ((x - centerX) / centerX) * 4;
    
    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
  };

  const handleMouseLeave = () => {
    if (cardRef.current) {
      cardRef.current.style.transform = '';
    }
  };

  return (
    <article 
      ref={cardRef}
      className="service-card"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Top: Hero Image Preview */}
      <div className="card-image-wrap">
        <img 
          src={service.image} 
          alt={service.title} 
          className="card-img"
          loading="lazy"
          style={{
            objectPosition: service.imagePosition || 'center'
          }}
          onError={(e) => {
            if (service.fallbackImage) {
              e.currentTarget.src = service.fallbackImage;
            }
          }}
        />
        <div className="image-overlay"></div>
        {service.badge && (
          <span className="badge-price">{service.badge}</span>
        )}
        <a 
          href={service.url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="link-overlay"
          aria-label={`Mở trang ${service.title}`}
        >
          <ArrowUpRight size={18} />
        </a>
      </div>

      {/* Bottom: Information & Action Details */}
      <div className="card-body">
        <div className="card-meta">
          <span className="meta-tag">{service.categoryName}</span>
          <span className="meta-status">
            <CheckCircle2 size={13} className="text-emerald" /> Hoạt Động
          </span>
        </div>

        <h2 className="card-title">
          <a href={service.url} target="_blank" rel="noopener noreferrer">
            {service.title}
          </a>
        </h2>

        <p className="card-desc">
          {service.description}
        </p>

        {service.features && (
          <div className="feature-tags">
            {service.features.map((feat, idx) => (
              <span key={idx} className="tag">
                <DynamicIcon name={feat.icon} size={13} /> {feat.text}
              </span>
            ))}
          </div>
        )}

        {/* Action Row: "Truy cập trang web" */}
        <div className="card-actions">
          <a 
            href={service.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn btn-detail"
            title={`Truy cập ${service.title}`}
          >
            <span>Truy cập trang web</span>
            <ArrowUpRight size={16} className="btn-icon" />
          </a>
        </div>
      </div>
    </article>
  );
};
