/**
 * ADMIN PANEL - SINERTIS STUDIO
 * Gestion centralisée de l'authentification et des emails
 */

// Configuration
const ADMIN_CONFIG = {
  password: 'sinertisafond', // ⚠️ À CHANGER en local!
  emailjs: {
    serviceId: 'service_a4c9zyg',
    templateId: 'template_nt3p8kf',
    publicKey: 'JlFndnem1HPuDIV3S',
    recipientEmail: 'contactsinertis@yahoo.com'
  }
};

// Global ADMIN object
const ADMIN = {
  config: ADMIN_CONFIG,
  
  isAuthenticated: function() {
    return sessionStorage.getItem('adminToken') === 'authenticated';
  },

  // Update lock icon color on ALL pages
  updateLockIcon: function() {
    const icons = document.querySelectorAll('#adminToggle');
    const isAuth = this.isAuthenticated();
    icons.forEach(icon => {
      icon.style.color = isAuth ? 'var(--accent)' : 'var(--primary)';
      icon.title = isAuth ? 'Admin connecté - Cliquez pour aller au panel' : 'Admin - Cliquez pour vous connecter';
      // Set data attribute for CSS animations
      icon.setAttribute('data-authenticated', isAuth ? 'true' : 'false');
    });
  },

  // Logout and redirect to home
  logout: function() {
    sessionStorage.removeItem('adminToken');
    this.updateLockIcon();
    window.location.href = 'index.html';
  },

  // Send email function
  sendEmail: function(templateParams) {
    return new Promise((resolve, reject) => {
      if (typeof emailjs === 'undefined') {
        reject(new Error('EmailJS not loaded'));
        return;
      }

      emailjs.send(
        ADMIN_CONFIG.emailjs.serviceId,
        ADMIN_CONFIG.emailjs.templateId,
        {
          to_email: ADMIN_CONFIG.emailjs.recipientEmail,
          from_name: templateParams.from_name || 'Contact Form',
          from_email: templateParams.from_email || 'noreply@example.com',
          subject: templateParams.subject || 'Nouveau message',
          message: templateParams.message || '',
          ...templateParams
        },
        ADMIN_CONFIG.emailjs.publicKey
      )
      .then(
        function(response) {
          console.log('✓ Email sent!', response.status, response.text);
          resolve(response);
        },
        function(error) {
          console.error('❌ Email failed:', error);
          reject(error);
        }
      );
    });
  }
};

// Initialize EmailJS when page loads
function initializeEmailJS() {
  // Check if already loaded from LOCAL or CDN
  if (window.emailjs && typeof window.emailjs.send === 'function') {
    console.log('✅ EmailJS found (local or CDN)');
    if (!window.emailjs._initialized) {
      try {
        emailjs.init(ADMIN_CONFIG.emailjs.publicKey);
        console.log('✅ EmailJS initialized');
        window.EMAILJS_READY = true;
      } catch (err) {
        console.log('EmailJS already initialized:', err.message);
      }
    }
    return Promise.resolve(true);
  }

  // Fallback: try to load from CDN
  console.warn('⚠️ EmailJS not found, trying CDN...');
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/index.min.js';
    script.type = 'text/javascript';
    script.async = true;
    
    script.onload = function() {
      console.log('✅ EmailJS loaded from CDN');
      setTimeout(() => {
        if (typeof emailjs !== 'undefined') {
          try {
            emailjs.init(ADMIN_CONFIG.emailjs.publicKey);
            console.log('✅ EmailJS initialized from CDN');
            window.EMAILJS_READY = true;
            resolve(true);
          } catch (err) {
            console.error('EmailJS init error:', err.message);
            resolve(true);
          }
        }
      }, 200);
    };
    
    script.onerror = function() {
      console.error('❌ CDN load failed');
      resolve(true);
    };
    
    document.head.appendChild(script);

    // Timeout after 5 seconds
    setTimeout(() => {
      if (typeof emailjs === 'undefined' || !emailjs.send) {
        console.warn('⏱️ CDN timeout, will use fallback');
        resolve(true);
      }
    }, 5000);
  });
}

// Load fallback EmailJS
function loadFallback() {
  console.log('🔧 Loading EmailJS fallback...');
  const script = document.createElement('script');
  script.src = 'js/emailjs-fallback.js';
  script.type = 'text/javascript';
  script.async = true;
  script.onload = function() {
    if (typeof emailjs !== 'undefined') {
      try {
        emailjs.init(ADMIN_CONFIG.emailjs.publicKey);
        console.log('✓ Fallback EmailJS initialized');
        if (typeof loadStats === 'function') {
          loadStats();
        }
      } catch (err) {
        console.error('Fallback init error:', err);
      }
    }
  };
  document.head.appendChild(script);
}

// Setup lock icon on all pages
function setupLockIcon() {
  document.addEventListener('DOMContentLoaded', function() {
    ADMIN.updateLockIcon();
  });
  
  // Update lock icon if DOM is already ready
  if (document.readyState !== 'loading') {
    ADMIN.updateLockIcon();
  }
}

// Wait for DOM and EmailJS to load
async function initializeSite() {
  try {
    // First try to use EmailJS if it's already available
    if (typeof emailjs === 'undefined') {
      // Load EmailJS dynamically
      console.log('📦 Loading EmailJS...');
      await initializeEmailJS();
    } else {
      // EmailJS was already on the page
      emailjs.init(ADMIN_CONFIG.emailjs.publicKey);
      console.log('✓ EmailJS was already available');
    }
    
    // Setup lock icon
    setupLockIcon();
    
    // Make sure it's really initialized
    if (typeof emailjs !== 'undefined') {
      console.log('✅ Site fully initialized');
    }
  } catch (err) {
    console.error('Initialization error:', err);
    setupLockIcon(); // Setup lock icon anyway
  }
}

// Initialize when document is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeSite);
} else {
  initializeSite();
}

// Final safety check
setTimeout(() => {
  if (typeof emailjs !== 'undefined') {
    try {
      emailjs.init(ADMIN_CONFIG.emailjs.publicKey);
    } catch (err) {
      console.log('EmailJS already initialized');
    }
  }
  ADMIN.updateLockIcon();
}, 2000);

// Check maintenance mode and show page if active
function checkMaintenanceMode() {
  const isMaintenanceOn = localStorage.getItem('maintenanceMode') === 'true';
  const isAdmin = ADMIN.isAuthenticated();
  const isAdminPage = window.location.pathname.includes('admin.html');
  
  console.log('[Maintenance] Mode:', isMaintenanceOn, '| Admin:', isAdmin, '| AdminPage:', isAdminPage);
  
  // Ne pas afficher la maintenance sur admin.html ou si admin connecté
  if (isMaintenanceOn && !isAdmin && !isAdminPage) {
    console.log('[Maintenance] ✓ Affichage de la page de maintenance');
    showMaintenancePage();
  } else if (isMaintenanceOn) {
    console.log('[Maintenance] Raison du non-affichage:', {
      isMaintenanceOn, 
      adminConnecte: isAdmin, 
      pageAdmin: isAdminPage
    });
  }
}

// Display maintenance page overlay
function showMaintenancePage() {
  const settings = JSON.parse(localStorage.getItem('siteSettings')) || {
    youtubeUrl: 'https://youtube.com/@sinertis',
    discordUrl: 'https://discord.gg/pxkpH2bsJD'
  };
  
  const html = `
    <div id="maintenanceOverlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(-45deg, #0456a8, #0d47a1, #1a3a7a, #0d47a1); background-size: 400% 400%; animation: gradientShift 20s ease infinite; display: flex; align-items: center; justify-content: center; z-index: 99999; cursor: auto; overflow: auto;">
      <canvas id="inkCanvas" style="position: fixed; top: 0; left: 0; z-index: 99998;"></canvas>
      
      <style>
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        .maintenance-icon-btn {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.15);
          border: 2.5px solid rgba(255, 255, 255, 0.4);
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: pulse 2s ease-in-out infinite;
          position: relative;
          z-index: 100001;
          backdrop-filter: blur(5px);
        }
        .maintenance-icon-btn:hover {
          transform: scale(1.2);
          box-shadow: 0 0 20px currentColor;
          border-color: currentColor;
          background: rgba(255, 255, 255, 0.25);
        }
        .maintenance-icon-btn img {
          width: 65%;
          height: 65%;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
        }
        .yt-btn { color: #FF0000; }
        .discord-btn { color: #5865F2; }
        .admin-btn { color: #FF6B35; }
        .maintenance-container {
          text-align: center;
          color: white;
          padding: 4rem 3rem;
          animation: float 4s ease-in-out infinite;
          position: relative;
          z-index: 100000;
          background: rgba(0, 0, 0, 0.35);
          border-radius: 16px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          max-width: 850px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.2);
        }
      </style>
      
      <div class="maintenance-container">
        <div style="font-size: 5rem; margin-bottom: 1.5rem; animation: float 3s ease-in-out infinite; text-shadow: 0 2px 8px rgba(0,0,0,0.6), 0 0 10px rgba(4,86,168,0.4);">⚙️</div>
        <h1 style="font-size: 3.2rem; margin-bottom: 1.5rem; font-weight: 900; letter-spacing: 0px; text-shadow: 0 4px 16px rgba(0,0,0,0.6), 0 0 30px rgba(4,86,168,0.3); margin-top: 0;">Maintenance en cours</h1>
        <p id="maintenanceMsg" style="font-size: 1.3rem; opacity: 1; max-width: 700px; line-height: 2; margin: 0 auto 2.5rem; text-shadow: 0 3px 10px rgba(0,0,0,0.6); font-weight: 500; letter-spacing: 0.3px;">
          Le site est temporairement indisponible pour maintenance. Nous serons bientôt de retour!
        </p>
        
        <div style="display: flex; gap: 2rem; justify-content: center; align-items: center; margin-top: 3rem; flex-wrap: wrap;">
          <!-- YouTube Icon -->
          <a href="${settings.youtubeUrl}" target="_blank" rel="noopener noreferrer" class="maintenance-icon-btn yt-btn" title="YouTube - Chaîne Sinertis" style="text-decoration: none;">
            <img src="icons/youtube.svg" alt="YouTube">
          </a>
          
          <!-- Discord Icon -->
          <a href="${settings.discordUrl}" target="_blank" rel="noopener noreferrer" class="maintenance-icon-btn discord-btn" title="Discord - Serveur Sinertis" style="text-decoration: none;">
            <img src="icons/discord.svg" alt="Discord">
          </a>
          
          <!-- Admin Icon -->
          <button class="maintenance-icon-btn admin-btn" title="Panel Admin" onclick="window.location.href='admin.html'" style="border: none; padding: 0; background: none; cursor: pointer;">
            <img src="icons/lock.svg" alt="Admin">
          </button>
        </div>
        
        <p style="margin-top: 3.5rem; margin-bottom: 0; opacity: 0.9; font-size: 1rem; text-shadow: 0 2px 8px rgba(0,0,0,0.6); font-weight: 500; letter-spacing: 1px;">✨ Merci de votre patience ✨</p>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', html);
  document.body.style.overflow = 'hidden';
  
  // Load custom message if exists
  const customMsg = localStorage.getItem('maintenanceMessage');
  if (customMsg) {
    document.getElementById('maintenanceMsg').textContent = customMsg;
  }
  
  // Initialize ink animation
  initializeInkAnimation();
}

// Squid Ink Animation on cursor with performance optimization
function initializeInkAnimation() {
  const canvas = document.getElementById('inkCanvas');
  const ctx = canvas.getContext('2d');
  
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  let mouseX = canvas.width / 2;
  let mouseY = canvas.height / 2;
  
  const particles = [];
  const maxParticles = 150; // Limit total particles
  const colors = [
    '#ff6b35', '#0456a8', '#7c4dff', '#10b981', 
    '#ffd700', '#ff1493', '#00d4ff', '#ff69b4'
  ];
  
  class Particle {
    constructor(x, y) {
      this.x = x + (Math.random() - 0.5) * 60;
      this.y = y + (Math.random() - 0.5) * 60;
      this.vx = (Math.random() - 0.5) * 6;
      this.vy = (Math.random() - 0.5) * 6 - 2;
      this.life = 1;
      this.decay = Math.random() * 0.025 + 0.015;
      this.size = Math.random() * 25 + 8;
      this.color = colors[Math.floor(Math.random() * colors.length)];
    }
    
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += 0.1; // gravity
      this.life -= this.decay;
      this.size *= 0.95;
    }
    
    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = this.life * 0.5;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
  
  let lastTime = Date.now();
  let particleCounter = 0;
  
  // Track mouse movement with throttling
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    particleCounter++;
    // Create particles only every 3rd movement event for performance
    if (particleCounter % 3 === 0 && particles.length < maxParticles) {
      for (let i = 0; i < 2; i++) {
        particles.push(new Particle(mouseX, mouseY));
      }
    }
  });
  
  // Animation loop with FPS control
  let frameCount = 0;
  function animate() {
    frameCount++;
    
    // Clear with very light background for trail effect
    ctx.fillStyle = 'rgba(4, 70, 168, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Update and draw particles
    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].update();
      particles[i].draw(ctx);
      
      if (particles[i].life <= 0) {
        particles.splice(i, 1);
      }
    }
    
    requestAnimationFrame(animate);
  }
  
  animate();
  
  // Handle window resize
  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
}

// ============================================
// WINDOW EXPORTS (for compatibility)
// ============================================
window.ADMIN = ADMIN;
window.initializeEmailJS = initializeEmailJS;
window.checkMaintenanceMode = checkMaintenanceMode;

// Check maintenance mode on page load
document.addEventListener('DOMContentLoaded', checkMaintenanceMode);

// Listen for maintenance mode changes (from other tabs)
window.addEventListener('storage', function(e) {
  if (e.key === 'maintenanceMode' || e.key === 'maintenanceToggleTime' || e.key === 'maintenanceMessage') {
    // Refresh maintenance status when changes occur
    setTimeout(() => {
      // Remove old overlay if exists
      const oldOverlay = document.getElementById('maintenanceOverlay');
      if (oldOverlay) {
        oldOverlay.remove();
      }
      // Check again
      checkMaintenanceMode();
    }, 100);
  }
});
