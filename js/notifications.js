// ===========================
// SISTEMA DE NOTIFICACIONES
// ===========================

class NotificationSystem {
  constructor() {
    this.notifications = [];
    this.container = null;
    this.panelOpen = false;
    this.init();
  }

  init() {
    this.createContainer();
    this.createPanel();
    this.loadNotifications();
  }

  createContainer() {
    const container = document.createElement('div');
    container.className = 'notifications-container';
    container.id = 'notificationsContainer';
    document.body.appendChild(container);
    this.container = container;
  }

  createPanel() {
    const overlay = document.createElement('div');
    overlay.className = 'notification-overlay';
    overlay.addEventListener('click', () => this.closePanel());
    
    const panel = document.createElement('div');
    panel.className = 'notification-panel';
    panel.innerHTML = `
      <div class="notification-panel-header">
        <h3><i class="fas fa-bell"></i> Notificaciones</h3>
        <div class="notification-panel-actions">
          <button class="notification-panel-btn" id="markAllRead">
            <i class="fas fa-check-double"></i> Marcar todas
          </button>
          <button class="notification-panel-btn" id="closePanel">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
      <div class="notification-panel-body" id="notificationPanelBody">
        <!-- Notifications list -->
      </div>
    `;
    
    document.body.appendChild(overlay);
    document.body.appendChild(panel);
    
    this.overlay = overlay;
    this.panel = panel;
    
    // Events
    panel.querySelector('#closePanel').addEventListener('click', () => this.closePanel());
    panel.querySelector('#markAllRead').addEventListener('click', () => this.markAllAsRead());
  }

  show(title, message, type = 'info', options = {}) {
    const id = Date.now();
    const notification = {
      id,
      title,
      message,
      type,
      time: new Date(),
      read: false,
      autoClose: options.autoClose !== false,
      duration: options.duration || 5000,
      actions: options.actions || []
    };
    
    this.notifications.unshift(notification);
    this.saveNotifications();
    
    // Create notification element
    const notifEl = document.createElement('div');
    notifEl.className = `notification ${type}`;
    notifEl.dataset.id = id;
    
    const icons = {
      success: 'fa-check-circle',
      error: 'fa-exclamation-circle',
      warning: 'fa-exclamation-triangle',
      info: 'fa-info-circle'
    };
    
    notifEl.innerHTML = `
      <div class="notification-icon">
        <i class="fas ${icons[type] || icons.info}"></i>
      </div>
      <div class="notification-content">
        <div class="notification-title">${this.escapeHtml(title)}</div>
        <div class="notification-message">${this.escapeHtml(message)}</div>
        ${notification.actions.length ? this.renderActions(notification.actions) : ''}
        <div class="notification-time">
          <i class="fas fa-clock"></i> ${this.formatTime(notification.time)}
        </div>
      </div>
      <button class="notification-close">
        <i class="fas fa-times"></i>
      </button>
      ${notification.autoClose ? '<div class="notification-progress"></div>' : ''}
    `;
    
    this.container.appendChild(notifEl);
    
    // Events
    notifEl.querySelector('.notification-close').addEventListener('click', () => {
      this.remove(id);
    });
    
    // Auto close
    if (notification.autoClose) {
      setTimeout(() => this.remove(id), notification.duration);
    }
    
    // Update panel
    this.updatePanel();
    
    // Play sound (optional)
    this.playSound();
    
    return id;
  }

  remove(id) {
    const notifEl = this.container.querySelector(`[data-id="${id}"]`);
    if (notifEl) {
      notifEl.classList.add('closing');
      setTimeout(() => {
        notifEl.remove();
      }, 300);
    }
  }

  renderActions(actions) {
    return `
      <div class="notification-actions">
        ${actions.map(action => `
          <button class="notification-action ${action.primary ? 'primary' : ''}"
                  onclick="${action.onClick}">
            ${action.label}
          </button>
        `).join('')}
      </div>
    `;
  }

  openPanel() {
    this.panelOpen = true;
    this.panel.classList.add('active');
    this.overlay.classList.add('active');
    this.updatePanel();
  }

  closePanel() {
    this.panelOpen = false;
    this.panel.classList.remove('active');
    this.overlay.classList.remove('active');
  }

  updatePanel() {
    const body = this.panel.querySelector('#notificationPanelBody');
    
    if (this.notifications.length === 0) {
      body.innerHTML = `
        <div class="notification-empty">
          <i class="fas fa-bell-slash"></i>
          <p>No hay notificaciones</p>
        </div>
      `;
      return;
    }
    
    body.innerHTML = this.notifications.map(notif => `
      <div class="notification-item ${notif.read ? '' : 'unread'}" 
           data-id="${notif.id}"
           onclick="notificationSystem.markAsRead(${notif.id})">
        <div class="notification-item-header">
          <div class="notification-item-title">
            <i class="fas ${this.getIcon(notif.type)}"></i> ${this.escapeHtml(notif.title)}
          </div>
          <div class="notification-item-time">${this.formatRelativeTime(notif.time)}</div>
        </div>
        <div class="notification-item-message">${this.escapeHtml(notif.message)}</div>
      </div>
    `).join('');
  }

  markAsRead(id) {
    const notif = this.notifications.find(n => n.id === id);
    if (notif) {
      notif.read = true;
      this.saveNotifications();
      this.updatePanel();
    }
  }

  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    this.saveNotifications();
    this.updatePanel();
  }

  getUnreadCount() {
    return this.notifications.filter(n => !n.read).length;
  }

  getIcon(type) {
    const icons = {
      success: 'fa-check-circle',
      error: 'fa-exclamation-circle',
      warning: 'fa-exclamation-triangle',
      info: 'fa-info-circle'
    };
    return icons[type] || icons.info;
  }

  formatTime(date) {
    const d = new Date(date);
    return d.toLocaleTimeString('es-AR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  formatRelativeTime(date) {
    const d = new Date(date);
    const now = new Date();
    const diff = Math.floor((now - d) / 1000); // seconds
    
    if (diff < 60) return 'Ahora';
    if (diff < 3600) return `Hace ${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `Hace ${Math.floor(diff / 3600)}h`;
    if (diff < 604800) return `Hace ${Math.floor(diff / 86400)}d`;
    
    return d.toLocaleDateString('es-AR');
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  saveNotifications() {
    try {
      localStorage.setItem('notifications', JSON.stringify(this.notifications));
    } catch (e) {
      console.error('Error saving notifications:', e);
    }
  }

  loadNotifications() {
    try {
      const saved = localStorage.getItem('notifications');
      if (saved) {
        this.notifications = JSON.parse(saved);
        this.updatePanel();
      }
    } catch (e) {
      console.error('Error loading notifications:', e);
    }
  }

  playSound() {
    // Optional: Play notification sound
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBil0x/DZiS8KEmyx6+qhUhELRp/g8r5tHwYpd8jx2oowEApyv+/zvGwhBSiBzvDciToIHW6/8OOf');
      audio.volume = 0.3;
      audio.play().catch(() => {});
    } catch (e) {}
  }

  // Convenience methods
  success(title, message, options) {
    return this.show(title, message, 'success', options);
  }

  error(title, message, options) {
    return this.show(title, message, 'error', options);
  }

  warning(title, message, options) {
    return this.show(title, message, 'warning', options);
  }

  info(title, message, options) {
    return this.show(title, message, 'info', options);
  }
}

// Initialize global notification system
window.notificationSystem = new NotificationSystem();

// Helper function for easy access
window.notify = (title, message, type = 'info', options = {}) => {
  return window.notificationSystem.show(title, message, type, options);
};
