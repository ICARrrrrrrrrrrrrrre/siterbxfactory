/**
 * Main.js - Sinertis Studio
 * Gestion des interactions, navigation, animations et formulaires
 */

document.addEventListener('DOMContentLoaded', function () {
  setupSidebar();
  setupActiveNavigation();
  setupScrollAnimations();
  initFormHandlers();
  setupPageTransitions();
});

// ============================================
// SIDEBAR MANAGEMENT
// ============================================

function setupSidebar() {
  const menuBtn = document.querySelector('.menu-btn');
  const closeBtn = document.querySelector('.sidebar-close');
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.overlay');

  if (!menuBtn || !sidebar) return;

  // Open sidebar
  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
    document.body.classList.toggle('sidebar-open');
  });

  // Close sidebar
  closeBtn?.addEventListener('click', () => {
    closeSidebar();
  });

  // Close on overlay click
  overlay?.addEventListener('click', () => {
    closeSidebar();
  });

  // Close on nav link click
  document.querySelectorAll('.sidebar-nav a').forEach(link => {
    link.addEventListener('click', () => {
      closeSidebar();
    });
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebar?.classList.contains('active')) {
      closeSidebar();
    }
  });

  // Close when window resizes to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && sidebar?.classList.contains('active')) {
      closeSidebar();
    }
  });
}

function closeSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.overlay');

  sidebar?.classList.remove('active');
  overlay?.classList.remove('active');
  document.body.classList.remove('sidebar-open');
}

// ============================================
// ACTIVE NAVIGATION
// ============================================

function setupActiveNavigation() {
  const currentPath = window.location.pathname;
  const currentPage = currentPath.split('/').pop() || 'index.html';

  // Desktop nav
  document.querySelectorAll('.nav-menu a').forEach(link => {
    const href = link.getAttribute('href');
    const isActive = href === currentPage || (currentPage === '' && href === 'index.html');
    
    if (isActive) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Sidebar nav
  document.querySelectorAll('.sidebar-nav a').forEach(link => {
    const href = link.getAttribute('href').split('#')[0];
    const isActive = href === currentPage || (currentPage === '' && href === 'index.html');
    
    if (isActive) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// ============================================
// SCROLL ANIMATIONS
// ============================================

function setupScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  };

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        entry.target.classList.add('animated');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe all animatable elements
  document.querySelectorAll('.feature-item, .service-card, .portfolio-card, .pricing-card').forEach((el, index) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    el.style.transitionDelay = (index * 0.05) + 's';
    observer.observe(el);
  });
}

// ============================================
// PAGE TRANSITIONS
// ============================================

function setupPageTransitions() {
  // Smooth page fade in
  document.body.style.opacity = '0';
  setTimeout(() => {
    document.body.style.opacity = '1';
    document.body.style.transition = 'opacity 0.5s ease';
  }, 50);
}

// ============================================
// FORM HANDLERS
// ============================================

function initFormHandlers() {
  const contactForm = document.getElementById('contactForm');
  
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      handleContactForm();
    });
  }
}

function handleContactForm() {
  const form = document.getElementById('contactForm');
  const name = document.getElementById('name')?.value.trim();
  const email = document.getElementById('email')?.value.trim();
  const phone = document.getElementById('phone')?.value.trim();
  const service = document.getElementById('service')?.value;
  const subject = document.getElementById('subject')?.value.trim();
  const message = document.getElementById('message')?.value.trim();

  // Basic validation
  if (!name || !email || !subject || !message || !service) {
    showFormStatus('error', 'Veuillez remplir tous les champs obligatoires');
    return;
  }

  if (!isValidEmail(email)) {
    showFormStatus('error', 'Email invalide');
    return;
  }

  // Create formatted message
  const mailtoBody = `
Nom: ${name}
Email: ${email}
Téléphone: ${phone || 'Non fourni'}
Service: ${service}
Sujet: ${subject}

Message:
${message}

---
Envoyé via le formulaire Sinertis Studio
  `.trim();

  // Create mailto link
  const mailtoLink = `mailto:contactsinertis@yahoo.com?subject=${encodeURIComponent('Demande: ' + subject)}&body=${encodeURIComponent(mailtoBody)}`;
  
  // Show success and reset
  showFormStatus('success', 'Message préparé! Cliquez pour envoyer par email...');
  
  setTimeout(() => {
    window.location.href = mailtoLink;
    form.reset();
    document.getElementById('formStatus').style.display = 'none';
  }, 1000);
}

function showFormStatus(type, message) {
  const statusDiv = document.getElementById('formStatus');
  if (!statusDiv) return;

  if (type === 'success') {
    statusDiv.style.background = 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05))';
    statusDiv.style.borderLeft = '4px solid #10b981';
    statusDiv.style.color = '#047857';
  } else {
    statusDiv.style.background = 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05))';
    statusDiv.style.borderLeft = '4px solid #ef4444';
    statusDiv.style.color = '#991b1b';
  }

  statusDiv.innerHTML = `<strong>${type === 'success' ? '✓' : '✗'} ${message}</strong>`;
  statusDiv.style.display = 'block';
}

function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Smooth scroll to elements
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href !== '#') {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  });
});

// Add scroll event for navbar effects
let lastScrollTop = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  
  if (scrollTop > 100) {
    navbar?.style.boxShadow = 'var(--shadow)';
  } else {
    navbar?.style.boxShadow = 'var(--shadow-sm)';
  }
  
  lastScrollTop = scrollTop;
});

// Animate numbers on scroll (for stats/counters if added)
function animateCounter(element, target, duration = 1000) {
  let current = 0;
  const increment = target / (duration / 16);
  
  const counter = setInterval(() => {
    current += increment;
    if (current >= target) {
      element.textContent = target;
      clearInterval(counter);
    } else {
      element.textContent = Math.floor(current);
    }
  }, 16);
}

// Export for use in other scripts
window.Sinertis = {
  closeSidebar,
  showFormStatus,
  animateCounter
};

