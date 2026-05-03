/**
 * Exam Autopsy — Complete JavaScript
 * Haptics, Micro-interactions, Dark/Light Mode, Animations
 */

'use strict';

// ==================== DOM ELEMENTS ====================
const DOM = {
  html: document.documentElement,
  body: document.body,
  header: document.querySelector('.header'),
  menuToggle: document.querySelector('.menu-toggle'),
  navLinks: document.querySelector('.nav-links'),
  themeToggle: document.querySelector('.theme-toggle'),
  searchToggle: document.querySelector('.search-toggle'),
  searchModal: document.querySelector('.search-modal'),
  searchInput: document.querySelector('.search-input'),
  searchClose: document.querySelector('.search-close'),
  searchResults: document.querySelector('.search-results'),
  backToTop: document.querySelector('.back-to-top'),
  toastContainer: document.querySelector('.toast-container'),
  revealElements: document.querySelectorAll('.reveal'),
  analysisBars: document.querySelectorAll('.analysis-bar-fill'),
  loader: document.querySelector('.loader'),
  btns: document.querySelectorAll('.btn'),
};

// ==================== STATE ====================
const state = {
  isDark: true,
  isMenuOpen: false,
  isSearchOpen: false,
  isScrolled: false,
  hapticsSupported: false,
};

// ==================== DEVICE FEATURE DETECTION ====================
const detectFeatures = () => {
  // Check for haptic feedback support
  state.hapticsSupported = 'vibrate' in navigator;
  
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    document.documentElement.style.setProperty('--transition-fast', '0ms');
    document.documentElement.style.setProperty('--transition-base', '0ms');
    document.documentElement.style.setProperty('--transition-slow', '0ms');
  }
};

// ==================== HAPTIC FEEDBACK ====================
const haptic = (pattern = 10) => {
  if (state.hapticsSupported) {
    navigator.vibrate(pattern);
  }
};

// ==================== THEME TOGGLE ====================
const initTheme = () => {
  // Check localStorage or system preference
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme) {
    state.isDark = savedTheme === 'dark';
  } else {
    state.isDark = prefersDark;
  }
  
  applyTheme();
};

const applyTheme = () => {
  DOM.html.setAttribute('data-theme', state.isDark ? 'dark' : 'light');
  localStorage.setItem('theme', state.isDark ? 'dark' : 'light');
};

const toggleTheme = () => {
  state.isDark = !state.isDark;
  applyTheme();
  haptic(15);
  
  // Add visual feedback
  DOM.themeToggle.style.transform = 'rotate(360deg)';
  setTimeout(() => {
    DOM.themeToggle.style.transform = '';
  }, 300);
};

// ==================== MOBILE MENU ====================
const toggleMenu = () => {
  state.isMenuOpen = !state.isMenuOpen;
  DOM.menuToggle.setAttribute('aria-expanded', state.isMenuOpen);
  DOM.navLinks.classList.toggle('active', state.isMenuOpen);
  haptic(5);
};

const closeMenu = () => {
  if (state.isMenuOpen) {
    state.isMenuOpen = false;
    DOM.menuToggle.setAttribute('aria-expanded', 'false');
    DOM.navLinks.classList.remove('active');
  }
};

// ==================== SEARCH MODAL ====================
const openSearch = () => {
  state.isSearchOpen = true;
  DOM.searchModal.classList.add('active');
  DOM.searchInput.focus();
  haptic(10);
  
  // Trap focus
  document.addEventListener('keydown', trapFocus);
};

const closeSearch = () => {
  state.isSearchOpen = false;
  DOM.searchModal.classList.remove('active');
  DOM.searchInput.value = '';
  DOM.searchResults.innerHTML = '';
  document.removeEventListener('keydown', trapFocus);
  haptic(5);
};

const trapFocus = (e) => {
  if (e.key === 'Escape') {
    closeSearch();
  }
};

// Search functionality
const searchItems = [
  { title: 'Smart Upload', section: 'features', description: 'Upload exams in PDF, images, or handwritten notes' },
  { title: 'Visual Analytics', section: 'features', description: 'Charts and graphs showing performance trends' },
  { title: 'AI Insights', section: 'features', description: 'Personalized suggestions based on your mistakes' },
  { title: 'Study Planner', section: 'features', description: 'Create customized study schedules' },
  { title: 'Collaboration', section: 'features', description: 'Share analyses with friends and study groups' },
  { title: 'Privacy First', section: 'features', description: 'Your exam data is encrypted and private' },
  { title: 'Three Steps', section: 'how-it-works', description: 'Upload, Mark, and Get Insights' },
  { title: 'About Us', section: 'about', description: 'Built by students, for students' },
];

const handleSearch = (query) => {
  if (!query.trim()) {
    DOM.searchResults.innerHTML = '';
    return;
  }
  
  const results = searchItems.filter(item => 
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.description.toLowerCase().includes(query.toLowerCase())
  );
  
  if (results.length === 0) {
    DOM.searchResults.innerHTML = `
      <div class="search-no-results">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <p>No results found for "${query}"</p>
      </div>
    `;
    return;
  }
  
  DOM.searchResults.innerHTML = results.map(item => `
    <a href="#${item.section}" class="search-result-item" onclick="closeSearch()">
      <span class="search-result-title">${item.title}</span>
      <span class="search-result-desc">${item.description}</span>
    </a>
  `).join('');
  
  haptic(8);
};

// ==================== SCROLL HANDLING ====================
const handleScroll = () => {
  const scrollY = window.scrollY;
  
  // Header scroll state
  state.isScrolled = scrollY > 50;
  DOM.header?.classList.toggle('scrolled', state.isScrolled);
  
  // Back to top button
  DOM.backToTop?.classList.toggle('visible', scrollY > 500);
  
  // Close menu on scroll
  if (state.isMenuOpen && scrollY > 100) {
    closeMenu();
  }
};

// ==================== SCROLL REVEAL ====================
const initScrollReveal = () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        
        // Trigger analysis bar animations
        if (entry.target.closest('.hero-card')) {
          triggerAnalysisAnimation();
        }
        
        // Unobserve after animation
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });
  
  DOM.revealElements.forEach(el => observer.observe(el));
};

// Analysis bar animation
const triggerAnalysisAnimation = () => {
  DOM.analysisBars.forEach(bar => {
    const width = bar.style.getPropertyValue('--width');
    bar.style.width = '0%';
    setTimeout(() => {
      bar.style.width = width;
    }, 300);
  });
};

// ==================== BACK TO TOP ====================
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
  haptic(10);
};

// ==================== TOAST NOTIFICATIONS ====================
const showToast = (options) => {
  const { type = 'info', title, message, duration = 4000 } = options;
  
  const icons = {
    success: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>',
    error: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',
    info: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'
  };
  
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <div class="toast-icon ${type}">${icons[type]}</div>
    <div class="toast-content">
      <span class="toast-title">${title}</span>
      ${message ? `<span class="toast-message">${message}</span>` : ''}
    </div>
    <button class="toast-close" aria-label="Close notification" type="button">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
  `;
  
  const closeBtn = toast.querySelector('.toast-close');
  const removeToast = () => {
    toast.classList.remove('show');
    haptic(3);
    setTimeout(() => toast.remove(), 300);
  };
  
  closeBtn.addEventListener('click', removeToast);
  DOM.toastContainer.appendChild(toast);
  
  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add('show');
    haptic(8);
  });
  
  // Auto remove
  if (duration > 0) {
    setTimeout(removeToast, duration);
  }
  
  return removeToast;
};

// ==================== BUTTON INTERACTIONS ====================
const initButtonInteractions = () => {
  DOM.btns.forEach(btn => {
    // Mouse events
    btn.addEventListener('mouseenter', () => {
      btn.style.transform = 'translateY(-2px)';
    });
    
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
    
    // Touch/click events
    btn.addEventListener('click', (e) => {
      // Haptic feedback
      haptic(10);
      
      // Ripple effect
      createRipple(btn, e);
      
      // Button specific actions
      if (btn.classList.contains('btn-primary') && btn.textContent.includes('Start')) {
        showToast({
          type: 'success',
          const initButtonInteractions = () => {
  DOM.btns.forEach(btn => {
    // Mouse events
    btn.addEventListener('mouseenter', () => {
      btn.style.transform = 'translateY(-2px)';
    });
    
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
    
    // Touch/click events
    btn.addEventListener('click', (e) => {
      // Haptic feedback
      haptic(10);
      
      // Ripple effect
      createRipple(btn, e);
      
      // Button specific actions
      if (btn.classList.contains('btn-primary') && btn.textContent.includes('Start')) {
        showToast({
          type: 'success',
          title: '🚀 Getting Started',
          message: 'Redirecting to analysis dashboard...'
        });
      }
      
      if (btn.classList.contains('btn-secondary') && btn.textContent.includes('Watch')) {
        showToast({
          type: 'info',
          title: '📺 Demo Video',
          message: 'Opening demo in modal...'
        });
      }
    });
  });
};

// Ripple effect
const createRipple = (element, event) => {
  const ripple = document.createElement('span');
  ripple.className = 'ripple';
  
  const rect = element.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;
  
  ripple.style.cssText = `
    position: absolute;
    width: ${size}px;
    height: ${size}px;
    left: ${x}px;
    top: ${y}px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    transform: scale(0);
    animation: rippleEffect 0.6s ease-out;
    pointer-events: none;
  `;
  
  element.style.position = 'relative';
  element.style.overflow = 'hidden';
  element.appendChild(ripple);
  
  setTimeout(() => ripple.remove(), 600);
};

// Add ripple animation to CSS dynamically
const addRippleStyles = () => {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes rippleEffect {
      to {
        transform: scale(2);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
};

// ==================== KEYBOARD NAVIGATION ====================
const initKeyboardNav = () => {
  // Tab visibility highlight
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      DOM.body.classList.add('keyboard-nav');
    }
  });
  
  document.addEventListener('mousedown', () => {
    DOM.body.classList.remove('keyboard-nav');
  });
  
  // Escape key handlers
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (state.isSearchOpen) closeSearch();
      if (state.isMenuOpen) closeMenu();
    }
  });
};

// ==================== SMOOTH SCROLL FOR ANCHOR LINKS ====================
const initSmoothScroll = () => {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;
      
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const headerHeight = DOM.header?.offsetHeight || 72;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
        
        haptic(5);
        
        // Close mobile menu after click
        closeMenu();
      }
    });
  });
};

// ==================== PARALLAX EFFECT (SUBTLE) ====================
const initParallax = () => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  
  let ticking = false;
  
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        
        // Parallax floating elements
        document.querySelectorAll('.float-element').forEach((el, i) => {
          const speed = 0.05 + (i * 0.02);
          el.style.transform = `translateY(${scrollY * speed}px)`;
        });
        
        // Parallax CTA circles
        document.querySelectorAll('.cta-circle').forEach((circle, i) => {
          const speed = 0.1 - (i * 0.03);
          circle.style.transform = `translate(${scrollY * speed * -0.5}px, ${scrollY * speed}px)`;
        });
        
        ticking = false;
      });
      ticking = true;
    }
  });
};

// ==================== MOUSEMOVE PARTICLE EFFECT ====================
const initMouseParticles = () => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.innerWidth < 1024) return; // Disable on mobile/tablet
  
  const hero = document.querySelector('.hero');
  if (!hero) return;
  
  const particles = [];
  const particleCount = 15;
  
  // Create particles
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'mouse-particle';
    particle.style.cssText = `
      position: absolute;
      width: 4px;
      height: 4px;
      background: var(--accent-primary);
      border-radius: 50%;
      pointer-events: none;
      opacity: 0.3;
      transition: opacity 0.3s ease;
    `;
    hero.appendChild(particle);
    particles.push({
      el: particle,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5
    });
  }
  
  // Mouse tracking
  let mouseX = 0, mouseY = 0;
  
  hero.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });
  
  // Animate particles
  const animateParticles = () => {
    particles.forEach(p => {
      // Subtle attraction to mouse
      const dx = mouseX - p.x;
      const dy = mouseY - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < 200) {
        p.vx += dx * 0.0001;
        p.vy += dy * 0.0001;
      }
      
      // Apply velocity with damping
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.99;
      p.vy *= 0.99;
      
      // Boundary check
      if (p.x < 0 || p.x > window.innerWidth) p.vx *= -1;
      if (p.y < 0 || p.y > window.innerHeight) p.vy *= -1;
      
      p.el.style.transform = `translate(${p.x}px, ${p.y}px)`;
    });
    
    requestAnimationFrame(animateParticles);
  };
  
  animateParticles();
};

// ==================== PAGE LOAD ANIMATION ====================
const initPageLoad = () => {
  // Add loaded class after animations complete
  setTimeout(() => {
    DOM.body.classList.remove('loading');
    DOM.loader?.classList.add('hidden');
    
    // Trigger initial reveal animations
    DOM.revealElements.forEach((el, i) => {
      setTimeout(() => {
        el.classList.add('visible');
      }, i * 100);
    });
    
    // Trigger analysis bars after hero is visible
    setTimeout(triggerAnalysisAnimation, 800);
  }, 800);
};

// ==================== PREFERS COLOR SCHEME LISTENER ====================
const initColorSchemeListener = () => {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      state.isDark = e.matches;
      applyTheme();
      showToast({
        type: 'info',
        title: '🎨 Theme Updated',
        message: `Switched to ${state.isDark ? 'dark' : 'light'} mode`
      });
    }
  });
};

// ==================== TOUCH SWIPE DETECTION ====================
const initTouchGestures = () => {
  let touchStartX = 0;
  let touchStartY = 0;
  
  DOM.body.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });
  
  DOM.body.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    
    // Horizontal swipe to close search
    if (Math.abs(deltaX) > 100 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (state.isSearchOpen && deltaX > 50) {
        closeSearch();
      }
    }
  }, { passive: true });
};

// ==================== RESIZE HANDLER ====================
const initResizeHandler = () => {
  let resizeTimeout;
  
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      // Close menu if viewport expands
      if (window.innerWidth >= 768 && state.isMenuOpen) {
        closeMenu();
      }
    }, 200);
  });
};

// ==================== SERVICE WORKER REGISTRATION ====================
const initServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js')
        .then(registration => {
          console.log('SW registered:', registration.scope);
        })
        .catch(error => {
          console.log('SW registration failed:', error);
        });
    });
  }
};

// ==================== MAIN INITIALIZATION ====================
const init = () => {
  console.log('🚀 Exam Autopsy initializing...');
  
  // Detect features
  detectFeatures();
  
  // Apply theme
  initTheme();
  
  // Add ripple styles
  addRippleStyles();
  
  // Event listeners
  DOM.themeToggle?.addEventListener('click', toggleTheme);
  DOM.menuToggle?.addEventListener('click', toggleMenu);
  DOM.searchToggle?.addEventListener('click', openSearch);
  DOM.searchClose?.addEventListener('click', closeSearch);
  DOM.backToTop?.addEventListener('click', scrollToTop);
  
  // Search input handler
  DOM.searchInput?.addEventListener('input', (e) => {
    handleSearch(e.target.value);
  });
  
  // Close search on backdrop click
  DOM.searchModal?.addEventListener('click', (e) => {
    if (e.target === DOM.searchModal) {
      closeSearch();
    }
  });
  
  // Scroll handler
  window.addEventListener('scroll', handleScroll, { passive: true });
  
  // Initialize all features
  initKeyboardNav();
  initSmoothScroll();
  initScrollReveal();
  initButtonInteractions();
  initParallax();
  initMouseParticles();
  initPageLoad();
  initColorSchemeListener();
  initTouchGestures();
  initResizeHandler();
  initServiceWorker();
  
  // Handle keyboard navigation styling
  const style = document.createElement('style');
  style.textContent = `
    .keyboard-nav *:focus-visible {
      outline: 3px solid var(--accent-primary) !important;
      outline-offset: 3px !important;
    }
  `;
  document.head.appendChild(style);
  
  console.log('✅ Exam Autopsy initialized!');
};

// Run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// ==================== EXPORTED API (For future use) ====================
window.ExamAutopsy = {
  showToast,
  toggleTheme,
  openSearch,
  closeSearch,
  scrollToTop,
  haptic
};
         
