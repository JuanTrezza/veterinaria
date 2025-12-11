// Service Worker para PWA
const CACHE_NAME = 'veterinaria-v1.0.0';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/login.html',
  '/mascotas.html',
  '/turnos.html',
  '/misturnos.html',
  '/micuenta.html',
  '/admin.html',
  '/styles/global.css',
  '/styles/animations.css',
  '/styles/responsive.css',
  '/styles/features.css',
  '/styles/calendar.css',
  '/styles/dashboard.css',
  '/styles/chat.css',
  '/styles/skeleton.css',
  '/styles/breadcrumbs.css',
  '/styles/filters.css',
  '/styles/timeline.css',
  '/styles/export.css',
  '/imagenes/logoMascota.png',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/aos@2.3.4/dist/aos.css'
];

// Instalación del Service Worker
self.addEventListener('install', event => {
  console.log('[Service Worker] Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Cacheando archivos');
        return cache.addAll(URLS_TO_CACHE);
      })
      .catch(err => {
        console.error('[Service Worker] Error al cachear:', err);
      })
  );
  self.skipWaiting();
});

// Activación del Service Worker
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activando...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Eliminando cache antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Estrategia de caché: Network First, fallback to Cache
self.addEventListener('fetch', event => {
  // Ignorar solicitudes que no sean GET
  if (event.request.method !== 'GET') return;
  
  // Ignorar solicitudes a la API (siempre buscar en red)
  if (event.request.url.includes('/api/')) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Si la respuesta es válida, clonarla y guardarla en caché
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Si falla la red, buscar en caché
        return caches.match(event.request).then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Si no está en caché, mostrar página offline
          if (event.request.headers.get('accept').includes('text/html')) {
            return caches.match('/offline.html');
          }
        });
      })
  );
});

// Sincronización en segundo plano
self.addEventListener('sync', event => {
  console.log('[Service Worker] Sincronizando en segundo plano');
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  try {
    // Aquí puedes sincronizar datos pendientes
    console.log('[Service Worker] Datos sincronizados');
  } catch (error) {
    console.error('[Service Worker] Error al sincronizar:', error);
  }
}

// Notificaciones Push
self.addEventListener('push', event => {
  console.log('[Service Worker] Push recibido');
  
  const options = {
    body: event.data ? event.data.text() : 'Nueva notificación',
    icon: '/imagenes/logoMascota.png',
    badge: '/imagenes/logoMascota.png',
    vibrate: [200, 100, 200],
    tag: 'veterinaria-notification',
    actions: [
      { action: 'view', title: 'Ver', icon: '/imagenes/view-icon.png' },
      { action: 'close', title: 'Cerrar', icon: '/imagenes/close-icon.png' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Clínica Veterinaria', options)
  );
});

// Clic en notificación
self.addEventListener('notificationclick', event => {
  console.log('[Service Worker] Notificación clickeada');
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/misturnos.html')
    );
  }
});

// Mensaje del cliente
self.addEventListener('message', event => {
  console.log('[Service Worker] Mensaje recibido:', event.data);
  
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
  
  if (event.data.action === 'clearCache') {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      })
    );
  }
});
