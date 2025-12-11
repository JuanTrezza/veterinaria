// ===========================
// SISTEMA DE CHAT
// ===========================

class ChatSystem {
  constructor(options = {}) {
    this.isOpen = false;
    this.messages = [];
    this.unreadCount = 0;
    this.currentUser = options.currentUser || 'Usuario';
    this.botName = options.botName || 'Asistente Virtual';
    this.apiEndpoint = options.apiEndpoint || null;
    
    this.init();
  }

  init() {
    this.createChatButton();
    this.createChatContainer();
    this.loadMessages();
  }

  createChatButton() {
    const btn = document.createElement('button');
    btn.className = 'chat-float-btn';
    btn.innerHTML = `
      <i class="fas fa-comments"></i>
      <span class="badge" style="display: none;">0</span>
    `;
    btn.addEventListener('click', () => this.toggle());
    document.body.appendChild(btn);
    this.floatBtn = btn;
  }

  createChatContainer() {
    const container = document.createElement('div');
    container.className = 'chat-container';
    container.innerHTML = `
      <div class="chat-header">
        <div class="chat-header-info">
          <div class="chat-avatar">
            <i class="fas fa-user-md"></i>
          </div>
          <div class="chat-header-text">
            <h5>${this.botName}</h5>
            <p>En línea</p>
          </div>
        </div>
        <button class="chat-close">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="chat-messages" id="chatMessages"></div>
      
      <div class="chat-input-container">
        <button class="chat-attach">
          <i class="fas fa-paperclip"></i>
        </button>
        <textarea 
          class="chat-input" 
          placeholder="Escribe un mensaje..."
          rows="1"
          id="chatInput"
        ></textarea>
        <button class="chat-send" id="chatSend">
          <i class="fas fa-paper-plane"></i>
        </button>
      </div>
    `;
    
    document.body.appendChild(container);
    this.container = container;
    
    this.attachEvents();
  }

  attachEvents() {
    // Close button
    this.container.querySelector('.chat-close').addEventListener('click', () => {
      this.close();
    });
    
    // Send button
    const sendBtn = this.container.querySelector('#chatSend');
    const input = this.container.querySelector('#chatInput');
    
    sendBtn.addEventListener('click', () => this.sendMessage());
    
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });
    
    // Auto-resize textarea
    input.addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 80) + 'px';
    });
    
    // Attach file
    this.container.querySelector('.chat-attach').addEventListener('click', () => {
      this.showToast('Función de adjuntar archivos próximamente', 'info');
    });
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    this.isOpen = true;
    this.container.classList.add('active');
    this.floatBtn.style.display = 'none';
    this.unreadCount = 0;
    this.updateBadge();
    
    // Auto-focus input
    setTimeout(() => {
      this.container.querySelector('#chatInput').focus();
    }, 400);
    
    // Welcome message if empty
    if (this.messages.length === 0) {
      this.addBotMessage(`¡Hola ${this.currentUser}! 👋 Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?`);
    }
  }

  close() {
    this.isOpen = false;
    this.container.classList.remove('active');
    setTimeout(() => {
      this.floatBtn.style.display = 'flex';
    }, 400);
  }

  async sendMessage() {
    const input = this.container.querySelector('#chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message
    this.addMessage(message, 'sent');
    input.value = '';
    input.style.height = 'auto';
    
    // Show typing indicator
    this.showTyping();
    
    // Simulate bot response (or call API)
    setTimeout(() => {
      this.hideTyping();
      const response = this.getBotResponse(message);
      this.addBotMessage(response);
    }, 1500);
  }

  addMessage(text, type = 'received') {
    const messagesContainer = this.container.querySelector('#chatMessages');
    
    const messageEl = document.createElement('div');
    messageEl.className = `chat-message ${type}`;
    
    const avatar = type === 'sent' 
      ? this.currentUser.charAt(0).toUpperCase()
      : 'A';
    
    messageEl.innerHTML = `
      <div class="chat-message-avatar">${avatar}</div>
      <div class="chat-message-content">
        <div class="chat-message-bubble">${this.escapeHtml(text)}</div>
        <div class="chat-message-time">${this.formatTime(new Date())}</div>
      </div>
    `;
    
    messagesContainer.appendChild(messageEl);
    this.scrollToBottom();
    
    this.messages.push({ text, type, time: new Date() });
    this.saveMessages();
    
    if (!this.isOpen && type === 'received') {
      this.unreadCount++;
      this.updateBadge();
    }
  }

  addBotMessage(text) {
    this.addMessage(text, 'received');
  }

  showTyping() {
    const messagesContainer = this.container.querySelector('#chatMessages');
    const typingEl = document.createElement('div');
    typingEl.className = 'chat-message typing-indicator';
    typingEl.innerHTML = `
      <div class="chat-message-avatar">A</div>
      <div class="chat-typing">
        <span></span>
        <span></span>
        <span></span>
      </div>
    `;
    messagesContainer.appendChild(typingEl);
    this.scrollToBottom();
  }

  hideTyping() {
    const typing = this.container.querySelector('.typing-indicator');
    if (typing) typing.remove();
  }

  getBotResponse(message) {
    const msg = message.toLowerCase();
    
    if (msg.includes('turno') || msg.includes('cita')) {
      return '📅 Para agendar un turno, puedes ir a la sección "Pedir Turno" o decirme qué día prefieres y te ayudo a verificar disponibilidad.';
    }
    
    if (msg.includes('horario') || msg.includes('hora')) {
      return '🕐 Nuestro horario de atención es de Lunes a Viernes de 9:00 a 18:00 y Sábados de 9:00 a 13:00.';
    }
    
    if (msg.includes('precio') || msg.includes('costo')) {
      return '💰 Los precios varían según el servicio. Para consultar tarifas específicas, comunícate al (011) 4567-8900 o visita nuestra sección de servicios.';
    }
    
    if (msg.includes('emergencia') || msg.includes('urgencia')) {
      return '🚨 En caso de emergencia, comunícate inmediatamente al (011) 4567-8900 o acércate a nuestra clínica. Atendemos emergencias 24/7.';
    }
    
    if (msg.includes('hola') || msg.includes('buenos') || msg.includes('buenas')) {
      return '👋 ¡Hola! ¿En qué puedo ayudarte hoy? Puedo asistirte con turnos, horarios, servicios y más.';
    }
    
    if (msg.includes('gracias')) {
      return '😊 ¡De nada! Estoy aquí para ayudarte. Si necesitas algo más, no dudes en escribirme.';
    }
    
    return 'Entiendo tu consulta. Para brindarte información más específica, puedes contactarnos al (011) 4567-8900 o escribirnos a info@veterinaria.com';
  }

  scrollToBottom() {
    const messagesContainer = this.container.querySelector('#chatMessages');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  updateBadge() {
    const badge = this.floatBtn.querySelector('.badge');
    if (this.unreadCount > 0) {
      badge.textContent = this.unreadCount > 9 ? '9+' : this.unreadCount;
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  }

  formatTime(date) {
    return date.toLocaleTimeString('es-AR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  saveMessages() {
    try {
      localStorage.setItem('chatMessages', JSON.stringify(this.messages));
    } catch (e) {
      console.error('Error saving messages:', e);
    }
  }

  loadMessages() {
    try {
      const saved = localStorage.getItem('chatMessages');
      if (saved) {
        this.messages = JSON.parse(saved);
        // Render messages if needed
      }
    } catch (e) {
      console.error('Error loading messages:', e);
    }
  }

  showToast(message, type = 'info') {
    if (window.showToast) {
      window.showToast(message, type);
    }
  }
}

// Initialize chat when DOM is loaded
window.ChatSystem = ChatSystem;
