# 🚀 Guía Rápida de Uso - Clínica Veterinaria v2.0

## 📋 Inicio Rápido

### 1. Acceder al Sistema
```
http://localhost/veterinaria/index.html
```

### 2. Explorar Implementaciones
```
http://localhost/veterinaria/implementaciones.html
```

### 3. Ver Dashboard
```
http://localhost/veterinaria/dashboard.html
```

---

## 💡 Funcionalidades Principales

### 📅 **Calendario Interactivo**
```javascript
// Uso en turnos.html o cualquier página
const calendar = new InteractiveCalendar('calendarioContainer', {
  availableDates: ['2024-12-20', '2024-12-21', '2024-12-22'],
  timeSlots: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
  onDateSelect: (date) => {
    console.log('Fecha seleccionada:', date);
  },
  onTimeSelect: (date, time) => {
    console.log('Turno:', date, time);
    // Aquí puedes hacer el POST a la API
  }
});
```

### 💬 **Sistema de Chat**
El chat se inicializa automáticamente en `index.html`. Para usarlo:
- Click en el botón flotante de chat (esquina inferior derecha)
- Escribe tu mensaje
- Recibe respuestas automáticas inteligentes

**Personalizar:**
```javascript
const chat = new ChatSystem({
  currentUser: 'Nombre Usuario',
  botName: 'Asistente Veterinario',
  apiEndpoint: '/api/chat' // opcional
});
```

### 🔔 **Notificaciones**
```javascript
// Forma simple
notify('Título', 'Mensaje', 'success');

// Con todas las opciones
notificationSystem.show('Turno Agendado', 'Tu turno fue confirmado', 'success', {
  duration: 5000,
  autoClose: true,
  actions: [
    {
      label: 'Ver Detalles',
      primary: true,
      onClick: 'window.location.href="misturnos.html"'
    }
  ]
});

// Tipos disponibles
notificationSystem.success('Título', 'Mensaje');
notificationSystem.error('Título', 'Mensaje');
notificationSystem.warning('Título', 'Mensaje');
notificationSystem.info('Título', 'Mensaje');
```

### 📱 **PWA - Progressive Web App**
La PWA se registra automáticamente. Características:
- ✅ Funciona offline
- ✅ Se puede instalar en el dispositivo
- ✅ Recibe notificaciones push
- ✅ Sincroniza datos en segundo plano

**Instalar:**
1. Abre el sitio en Chrome/Edge
2. Espera el prompt de instalación (aparece automáticamente)
3. Click en "Instalar"

---

## 🎨 Componentes CSS Disponibles

### Breadcrumbs
```html
<div class="breadcrumb-container">
  <nav>
    <ol class="breadcrumb">
      <li class="breadcrumb-item"><a href="index.html">Inicio</a></li>
      <li class="breadcrumb-item active">Turnos</li>
    </ol>
  </nav>
</div>
```

### Skeleton Loaders
```html
<!-- Card skeleton -->
<div class="skeleton-card">
  <div class="skeleton-card-header">
    <div class="skeleton-avatar"></div>
    <div style="flex:1">
      <div class="skeleton-text"></div>
      <div class="skeleton-text short"></div>
    </div>
  </div>
  <div class="skeleton-card-body">
    <div class="skeleton-text"></div>
    <div class="skeleton-text"></div>
    <div class="skeleton-text medium"></div>
  </div>
</div>
```

### Timeline Médico
```html
<div class="timeline-container">
  <div class="timeline">
    <div class="timeline-item">
      <div class="timeline-marker success">
        <i class="fas fa-check"></i>
      </div>
      <div class="timeline-content success">
        <div class="timeline-header">
          <h4 class="timeline-title">Consulta General</h4>
          <span class="timeline-date">15/12/2024</span>
        </div>
        <p class="timeline-description">Control de rutina completado.</p>
      </div>
    </div>
  </div>
</div>
```

### Filtros Avanzados
```html
<div class="filters-container">
  <div class="filters-header">
    <h4>Filtros</h4>
    <button class="filters-toggle">Mostrar/Ocultar</button>
  </div>
  <div class="filters-body">
    <div class="filter-group">
      <label class="filter-label">Fecha</label>
      <input type="date" class="filter-input">
    </div>
    <div class="filter-group">
      <label class="filter-label">Estado</label>
      <select class="filter-select">
        <option>Todos</option>
        <option>Completado</option>
        <option>Pendiente</option>
      </select>
    </div>
  </div>
  <div class="filters-actions">
    <button class="filter-apply">Aplicar</button>
    <button class="filter-clear">Limpiar</button>
  </div>
</div>
```

---

## 🛠️ Utilidades JavaScript

### API Helpers
```javascript
// GET
const turnos = await api.get('/turnos');

// POST
const nuevoTurno = await api.post('/turnos', {
  id_turno_disponible: 123
});

// PUT
await api.put('/mascotas/1', { nombre: 'Max' });

// DELETE
await api.delete('/turnos/1');
```

### Storage Helpers
```javascript
// Guardar
storage.set('usuario', { nombre: 'Juan', email: 'juan@email.com' });

// Obtener
const usuario = storage.get('usuario');

// Eliminar
storage.remove('usuario');

// Limpiar todo
storage.clear();
```

### Otras Utilidades
```javascript
// Formatear moneda
formatCurrency(12500); // "$12.500,00"

// Formatear fecha
formatDate('2024-12-15'); // "15 de diciembre de 2024"

// Copiar al portapapeles
copyToClipboard('Texto a copiar');

// Validar formulario
if (validateForm('miFormulario')) {
  // Formulario válido
}

// Scroll suave
scrollToElement('seccionContacto');

// Detectar móvil
if (isMobile()) {
  console.log('Usuario en móvil');
}

// Debounce
const buscar = debounce((texto) => {
  console.log('Buscando:', texto);
}, 500);
```

---

## 🎯 Casos de Uso Comunes

### Agendar un Turno
```javascript
// 1. Inicializar calendario
const calendar = new InteractiveCalendar('calendario', {
  availableDates: await api.get('/turnos/disponibles'),
  timeSlots: ['09:00', '10:00', '11:00'],
  onTimeSelect: async (date, time) => {
    try {
      await api.post('/turnos', { fecha: date, hora: time });
      notify('¡Turno agendado!', 'success');
    } catch (error) {
      notify('Error al agendar', 'error');
    }
  }
});
```

### Mostrar Historial Médico
```html
<div class="timeline-container">
  <div class="timeline" id="historial"></div>
</div>

<script>
  async function cargarHistorial() {
    const historial = await api.get('/historial/mascota/1');
    const timeline = document.getElementById('historial');
    
    historial.forEach(item => {
      timeline.innerHTML += `
        <div class="timeline-item">
          <div class="timeline-marker success">
            <i class="fas fa-stethoscope"></i>
          </div>
          <div class="timeline-content">
            <h4>${item.tipo}</h4>
            <p>${item.descripcion}</p>
            <span>${formatDate(item.fecha)}</span>
          </div>
        </div>
      `;
    });
  }
</script>
```

### Dashboard con Gráficos
```html
<canvas id="miGrafico"></canvas>

<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
<script>
  const ctx = document.getElementById('miGrafico').getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
      datasets: [{
        label: 'Turnos',
        data: [12, 19, 15, 22, 18, 25],
        borderColor: '#ff9800',
        backgroundColor: 'rgba(255, 152, 0, 0.1)'
      }]
    }
  });
</script>
```

---

## 🔧 Troubleshooting

### El Service Worker no se registra
```javascript
// Abrir DevTools > Application > Service Workers
// Si hay error, verificar que el path sea correcto
```

### Las notificaciones no funcionan
```javascript
// Verificar permisos
if (Notification.permission !== 'granted') {
  await Notification.requestPermission();
}
```

### Los estilos no se aplican
```html
<!-- Verificar que todos los CSS estén linkeados -->
<link rel="stylesheet" href="styles/global.css">
<!-- Limpiar cache: Ctrl + Shift + R -->
```

### El chat no responde
```javascript
// Verificar que el chat esté inicializado
console.log(window.chatSystem);

// Reinicializar si es necesario
const chat = new ChatSystem({});
```

---

## 📞 Soporte

Para cualquier duda o problema:
1. Revisar la consola del navegador (F12)
2. Verificar que XAMPP esté corriendo
3. Revisar el archivo `IMPLEMENTACIONES.md` para documentación completa

---

**¡Todo está listo para usar! 🎉**

Abre `http://localhost/veterinaria/index.html` y explora todas las funcionalidades.
