/**
 * DUDI Software Hub - Main Interactive Script
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // DOM Elements
  const searchInput = document.getElementById('searchInput');
  const clearSearchBtn = document.getElementById('clearSearch');
  const categoryTabs = document.getElementById('categoryTabs');
  const tabButtons = categoryTabs.querySelectorAll('.tab-btn');
  const servicesGrid = document.getElementById('servicesGrid');
  const serviceCards = servicesGrid.querySelectorAll('.service-card');
  const noResults = document.getElementById('noResults');
  const resetSearchBtn = document.getElementById('resetSearchBtn');
  const scrollToTopBtn = document.getElementById('scrollToTop');

  let activeCategory = 'all';
  let searchQuery = '';

  // Filter Function
  function filterServices() {
    let visibleCount = 0;

    serviceCards.forEach(card => {
      const cardCategory = card.getAttribute('data-category');
      const cardKeywords = (card.getAttribute('data-keywords') || '').toLowerCase();
      const cardTitle = (card.querySelector('.card-title')?.textContent || '').toLowerCase();
      const cardDesc = (card.querySelector('.card-desc')?.textContent || '').toLowerCase();

      const matchesCategory = (activeCategory === 'all' || cardCategory === activeCategory);
      
      const cleanQuery = searchQuery.trim().toLowerCase();
      const matchesSearch = !cleanQuery || 
        cardTitle.includes(cleanQuery) || 
        cardDesc.includes(cleanQuery) || 
        cardKeywords.includes(cleanQuery);

      if (matchesCategory && matchesSearch) {
        card.style.display = 'flex';
        card.style.animation = 'fadeInCard 0.35s ease forwards';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    // Toggle No Results
    if (visibleCount === 0) {
      noResults.style.display = 'block';
      if (window.lucide) window.lucide.createIcons();
    } else {
      noResults.style.display = 'none';
    }
  }

  // Category Tab Click Handler
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.getAttribute('data-category');
      filterServices();
    });
  });

  // Search Input Handler
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    clearSearchBtn.style.display = searchQuery ? 'flex' : 'none';
    filterServices();
  });

  // Clear Search Handler
  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    clearSearchBtn.style.display = 'none';
    searchInput.focus();
    filterServices();
  });

  // Reset Search from No Results
  resetSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    clearSearchBtn.style.display = 'none';
    activeCategory = 'all';
    tabButtons.forEach(b => {
      if (b.getAttribute('data-category') === 'all') {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    });
    filterServices();
  });

  // Scroll to Top Handler
  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      scrollToTopBtn.classList.add('visible');
    } else {
      scrollToTopBtn.classList.remove('visible');
    }
  });

  scrollToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  // Interactive 3D tilt micro-animation on desktop cards
  serviceCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -4;
      const rotateY = ((x - centerX) / centerX) * 4;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
});

// Keyframe Animation Injection
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes fadeInCard {
    from {
      opacity: 0;
      transform: translateY(12px) scale(0.98);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
`;
document.head.appendChild(styleSheet);
