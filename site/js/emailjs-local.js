/**
 * EmailJS Browser Library - Local Version
 * Implémentation fonctionnelle de EmailJS pour l'envoi d'emails côté serveur
 * Compatible avec: service_a4c9zyg, template_nt3p8kf
 */

(function(global) {
  'use strict';

  const EmailJS = {
    _config: {
      publicKey: '',
      serviceId: '',
      templateId: '',
      baseUrl: 'https://api.emailjs.com'
    },
    
    _initialized: false,

    /**
     * Initialize EmailJS with public key
     */
    init: function(publicKey) {
      if (!publicKey) {
        console.error('EmailJS: Public key is required');
        return this;
      }
      this._config.publicKey = publicKey;
      this._initialized = true;
      console.log('✅ EmailJS initialized locally with key:', publicKey.substring(0, 10) + '...');
      return this;
    },

    /**
     * Send email via EmailJS API
     */
    send: function(serviceId, templateId, params, publicKey) {
      const self = this;
      
      if (!serviceId || !templateId || !params) {
        return Promise.reject(new Error('EmailJS: Missing required parameters (serviceId, templateId, params)'));
      }

      // Use provided publicKey or fall back to initialized one
      const key = publicKey || self._config.publicKey;
      if (!key) {
        return Promise.reject(new Error('EmailJS: Public key not initialized. Call init() first.'));
      }

      console.log('📧 EmailJS.send() - Sending email via local API');
      console.log('   Service:', serviceId);
      console.log('   Template:', templateId);
      console.log('   To:', params.to_email || 'N/A');

      // Build the request
      const emailData = {
        service_id: serviceId,
        template_id: templateId,
        user_id: key,
        template_params: {
          to_email: params.to_email || '',
          from_name: params.from_name || 'Contact Form',
          from_email: params.from_email || '',
          subject: params.subject || 'Message',
          message: params.message || '',
          phone: params.phone || '',
          service: params.service || '',
          ...params
        }
      };

      // Send via EmailJS API
      return fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailData),
        mode: 'cors'
      })
      .then(response => {
        console.log('📊 Response status:', response.status);
        
        if (!response.ok) {
          // Try to get error details
          return response.text().then(text => {
            const error = new Error('EmailJS API error: ' + response.status);
            error.status = response.status;
            error.text = text;
            throw error;
          });
        }
        
        // Handle response - may be OK without JSON
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return response.json();
        } else {
          return response.text().then(text => ({ text: text }));
        }
      })
      .then(data => {
        console.log('✅ Email sent successfully!');
        console.log('   Response:', data);
        
        const response = {
          status: 200,
          text: 'OK',
          message_id: (data && data.message_id) || 'sent'
        };
        
        return response;
      })
      .catch(error => {
        console.error('❌ EmailJS send failed:');
        console.error('   Error:', error.message);
        
        // More detailed error info
        if (error.status === 400) {
          console.error('   → Service ID or Template ID might be incorrect');
          console.error('   → Check that to_email is provided in params');
        } else if (error.status === 401) {
          console.error('   → Public key is invalid or expired');
        } else if (error.status === 403) {
          console.error('   → Access denied - check your EmailJS account');
        } else if (error.status === 429) {
          console.error('   → Too many requests - rate limited');
        }
        
        throw error;
      });
    },

    /**
     * Send form data (alternative method)
     */
    sendForm: function(serviceId, templateId, form, publicKey) {
      if (!form || !(form instanceof HTMLFormElement)) {
        return Promise.reject(new Error('EmailJS: form must be an HTMLFormElement'));
      }

      // Extract form data
      const formData = new FormData(form);
      const params = Object.fromEntries(formData);

      return this.send(serviceId, templateId, params, publicKey);
    }
  };

  // Export to global scope
  global.emailjs = EmailJS;
  
  console.log('✅ EmailJS local library loaded');

})(typeof window !== 'undefined' ? window : global);
