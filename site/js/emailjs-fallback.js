/**
 * EmailJS Mock/Fallback
 * Utilisé quand le CDN n'est pas disponible
 * Ce script NE se charge QUE si le CDN EmailJS authentique n'est pas disponible
 */

(function() {
  'use strict';

  // Vérifier si le vrai EmailJS est déjà chargé
  if (window.emailjs && window.emailjs.send && !window.emailjs._isFallback) {
    console.log('✅ EmailJS authentique trouvé - fallback ignoré');
    return;
  }

  console.warn('⚠️ CDN EmailJS non disponible, utilisation du fallback');

  // Fonction principale pour initialiser le fallback
  function initFallback() {
    // Si EmailJS existe déjà avec la méthode send, ne pas overwrite
    if (window.emailjs && typeof window.emailjs.send === 'function' && !window.emailjs._isFallback) {
      console.log('✅ EmailJS authentique déjà chargé');
      return;
    }

    console.log('🔧 Initializing EmailJS fallback/mock');

    window.emailjs = window.emailjs || {};
    window.emailjs._config = {};
    window.emailjs._initialized = false;
    window.emailjs._isFallback = true;

    window.emailjs.init = function(publicKey) {
      console.log('📧 EmailJS.init() called (FALLBACK)');
      this._config.publicKey = publicKey;
      this._initialized = true;
      console.log('✅ Fallback initialized');
      return this;
    };

    window.emailjs.send = function(serviceId, templateId, params, publicKey) {
      console.warn('⚠️ Using FALLBACK send - emails are NOT actually sent');
      console.log('📤 EmailJS.send() FALLBACK:', {
        service: serviceId,
        template: templateId,
        to: params.to_email || 'N/A'
      });

      // Validate required fields
      if (!serviceId || !templateId || !params) {
        return Promise.reject(new Error('Missing required parameters'));
      }

      // Simulate actual send with delay
      return new Promise((resolve) => {
        setTimeout(() => {
          const response = {
            status: 200,
            text: 'OK (FALLBACK - Not Actually Sent)',
            messageId: 'fallback_' + Date.now()
          };
          console.warn('⚠️ FALLBACK: Email simulated but NOT sent:', response);
          resolve(response);
        }, 800);
      });
    };

    window.emailjs.sendForm = function(serviceId, templateId, form, publicKey) {
      return Promise.reject(new Error('sendForm not available in fallback'));
    };

    console.log('✅ Fallback initialized (EMAILS WILL NOT BE SENT)');
  }

  // Initialize immediately
  initFallback();

  // Also try to initialize on DOMContentLoaded if not already
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFallback);
  }
})();

