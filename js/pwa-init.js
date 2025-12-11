// ===========================
// PWA INITIALIZATION
// ===========================

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/veterinaria/service-worker.js')
      .then(registration => {
        console.log('✅ Service Worker registrado:', registration.scope);
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available
              if (window.notify) {
                window.notify(
                  'Actualización Disponible',
                  'Hay una nueva versión de la aplicación. Recarga para actualizar.',
                  'info',
                  {
                    autoClose: false,
                    actions: [
                      {
                        label: 'Actualizar',
                        primary: true,
                        onClick: 'window.location.reload()'
                      }
                    ]
                  }
                );
              }
            }
          });
        });
      })
      .catch(error => {
        console.error('❌ Error al registrar Service Worker:', error);
      });
  });
}

// Install PWA prompt
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  
  // Show install button
  showInstallPromotion();
});

function showInstallPromotion() {
  // Create install button
  const installBtn = document.createElement('button');
  installBtn.className = 'pwa-install-btn';
  installBtn.innerHTML = `
    <i class="fas fa-download"></i>
    <span>Instalar App</span>
  `;
  installBtn.style.cssText = `
    position: fixed;
    bottom: 80px;
    right: 20px;
    background: linear-gradient(135deg, #ff9800, #4caf50);
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 50px;
    font-weight: 600;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    cursor: pointer;
    z-index: 1000;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    animation: slideInUp 0.5s ease;
  `;
  
  installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('✅ Usuario aceptó instalar la PWA');
      if (window.notify) {
        window.notify('¡Instalado!', 'La aplicación se instaló correctamente', 'success');
      }
    }
    
    deferredPrompt = null;
    installBtn.remove();
  });
  
  document.body.appendChild(installBtn);
  
  // Remove after 10 seconds if not clicked
  setTimeout(() => {
    if (installBtn.parentNode) {
      installBtn.style.animation = 'slideOutDown 0.5s ease';
      setTimeout(() => installBtn.remove(), 500);
    }
  }, 10000);
}

// Detect if app is running as PWA
function isPWA() {
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.navigator.standalone ||
         document.referrer.includes('android-app://');
}

if (isPWA()) {
  console.log('📱 Ejecutándose como PWA');
  document.body.classList.add('pwa-mode');
}

// Online/Offline status
window.addEventListener('online', () => {
  if (window.notify) {
    window.notify('Conectado', 'Conexión a internet restaurada', 'success');
  }
  document.body.classList.remove('offline-mode');
});

window.addEventListener('offline', () => {
  if (window.notify) {
    window.notify('Sin Conexión', 'Trabajando en modo offline', 'warning', { autoClose: false });
  }
  document.body.classList.add('offline-mode');
});

// Check connection status on load
if (!navigator.onLine) {
  document.body.classList.add('offline-mode');
}

// Request notification permission
async function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('✅ Permisos de notificación otorgados');
      
      // Show test notification
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
          registration.showNotification('Clínica Veterinaria', {
            body: '¡Notificaciones activadas correctamente!',
            icon: '/veterinaria/imagenes/logoMascota.png',
            badge: '/veterinaria/imagenes/logoMascota.png',
            vibrate: [200, 100, 200]
          });
        });
      }
    }
  }
}

// Auto request after 5 seconds
setTimeout(requestNotificationPermission, 5000);

// Background sync for offline data
if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
  navigator.serviceWorker.ready.then(registration => {
    // Register sync event
    document.addEventListener('data-updated', () => {
      registration.sync.register('sync-data').catch(err => {
        console.error('Sync registration failed:', err);
      });
    });
  });
}

// Add to homescreen styles
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(100px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes slideOutDown {
    from {
      opacity: 1;
      transform: translateY(0);
    }
    to {
      opacity: 0;
      transform: translateY(100px);
    }
  }
  
  .pwa-mode {
    /* Estilos específicos para cuando la app corre como PWA */
  }
  
  .offline-mode::after {
    content: 'Modo Offline';
    position: fixed;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    background: #ffa726;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
    z-index: 9999;
    animation: slideInDown 0.3s ease;
  }
  
  @keyframes slideInDown {
    from {
      opacity: 0;
      transform: translate(-50%, -20px);
    }
    to {
      opacity: 1;
      transform: translate(-50%, 0);
    }
  }
`;
document.head.appendChild(style);

console.log('🚀 PWA inicializada correctamente');
