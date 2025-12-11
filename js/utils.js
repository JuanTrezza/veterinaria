// ===========================
// UTILIDADES GENERALES
// ===========================

// Helper function para mostrar toasts
window.showToast = function(message, type = 'info', duration = 3000) {
  const toast = document.createElement('div');
  toast.className = `custom-toast ${type}`;
  
  const icons = {
    success: 'fa-check-circle',
    error: 'fa-exclamation-circle',
    warning: 'fa-exclamation-triangle',
    info: 'fa-info-circle'
  };
  
  toast.innerHTML = `
    <i class="fas ${icons[type]}"></i>
    <span>${message}</span>
    <button class="toast-close">&times;</button>
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => toast.classList.add('show'), 100);
  
  const closeBtn = toast.querySelector('.toast-close');
  closeBtn.addEventListener('click', () => removeToast(toast));
  
  setTimeout(() => removeToast(toast), duration);
  
  function removeToast(element) {
    element.classList.remove('show');
    setTimeout(() => element.remove(), 300);
  }
};

// Format currency
window.formatCurrency = function(amount) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS'
  }).format(amount);
};

// Format date
window.formatDate = function(date, options = {}) {
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  
  return new Date(date).toLocaleDateString('es-AR', { ...defaultOptions, ...options });
};

// Debounce function
window.debounce = function(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Local Storage helpers
window.storage = {
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('Error saving to localStorage:', e);
      return false;
    }
  },
  
  get(key) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      console.error('Error reading from localStorage:', e);
      return null;
    }
  },
  
  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.error('Error removing from localStorage:', e);
      return false;
    }
  },
  
  clear() {
    try {
      localStorage.clear();
      return true;
    } catch (e) {
      console.error('Error clearing localStorage:', e);
      return false;
    }
  }
};

// API helpers
window.api = {
  baseURL: 'http://localhost/veterinaria/api',
  
  async request(endpoint, options = {}) {
    const token = storage.get('token');
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    };
    
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...defaultOptions,
        ...options,
        headers: { ...defaultOptions.headers, ...options.headers }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error en la petición');
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },
  
  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  },
  
  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  
  put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },
  
  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
};

// Form validation
window.validateForm = function(formId) {
  const form = document.getElementById(formId);
  if (!form) return false;
  
  const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
  let isValid = true;
  
  inputs.forEach(input => {
    if (!input.value.trim()) {
      input.classList.add('is-invalid');
      isValid = false;
    } else {
      input.classList.remove('is-invalid');
    }
  });
  
  return isValid;
};

// Copy to clipboard
window.copyToClipboard = function(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      showToast('Copiado al portapapeles', 'success');
    }).catch(() => {
      showToast('Error al copiar', 'error');
    });
  } else {
    // Fallback
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showToast('Copiado al portapapeles', 'success');
  }
};

// Generate random ID
window.generateId = function() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Check if mobile
window.isMobile = function() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Smooth scroll to element
window.scrollToElement = function(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }
};

// Console greeting
console.log(
  '%c🐾 Clínica Veterinaria %cv2.0',
  'color: #ff9800; font-size: 20px; font-weight: bold;',
  'color: #4caf50; font-size: 20px; font-weight: bold;'
);
console.log('%cSistema completamente funcional', 'color: #2196f3; font-size: 14px;');

// Export utilities
window.utils = {
  formatCurrency,
  formatDate,
  debounce,
  storage,
  api,
  validateForm,
  copyToClipboard,
  generateId,
  isMobile,
  scrollToElement,
  showToast
};
