/**
 * components.js — Componentes reutilizables: Navbar y Footer
 * Se insertan mediante innerHTML en todas las páginas.
 */

/* ══════════════════════════════
   NAVBAR
══════════════════════════════ */

/**
 * Inserta el navbar en el elemento con id="navbar-placeholder".
 * Detecta la sesión activa para mostrar "Mi cuenta" o "Iniciar sesión".
 * Marca como activo el link de la página actual.
 */
function insertarNavbar() {
  const placeholder = document.getElementById('navbar-placeholder');
  if (!placeholder) return;

  const sesion = getSesion();
  const paginaActual = window.location.pathname.split('/').pop() || 'index.html';

  // Determina si un link es el activo
  const activo = (pagina) => paginaActual === pagina ? 'active' : '';

  // Botón de autenticación según sesión
  const btnAuth = sesion
    ? `<a href="micuenta.html" class="btn-nav-auth btn-nav-login ${activo('micuenta.html')}">
         <i class="fa fa-user"></i> ${sesion.email.split('@')[0]}
       </a>`
    : `<a href="login.html" class="btn-nav-auth btn-nav-login">
         <i class="fa fa-sign-in-alt"></i> Iniciar sesión
       </a>`;

  // Links privados solo si hay sesión
  const linksPrivados = sesion ? `
    <li><a href="mascotas.html" class="${activo('mascotas.html')}">Mascotas</a></li>
    <li class="nav-dropdown">
      <a href="#" class="${activo('turnos.html') || activo('misturnos.html')}">
        Turnos <i class="fa fa-chevron-down" style="font-size:.7rem"></i>
      </a>
      <ul class="nav-dropdown-menu">
        <li><a href="turnos.html" class="${activo('turnos.html')}">Pedir turno</a></li>
        <li><a href="misturnos.html" class="${activo('misturnos.html')}">Mis turnos</a></li>
      </ul>
    </li>
  ` : '';

  placeholder.innerHTML = `
    <nav class="navbar" id="mainNavbar">
      <div class="container">
        <a class="navbar-brand" href="index.html">
          <img src="imagenes/logoMascota.png" alt="Logo Clínica Veterinaria">
          <span>Clínica Veterinaria</span>
        </a>

        <button class="nav-toggle" id="navToggle" aria-label="Menú">
          <span></span><span></span><span></span>
        </button>

        <div class="nav-menu" id="navMenu">
          <ul class="nav-links">
            <li><a href="index.html" class="${activo('index.html') || activo('')}">Inicio</a></li>
            ${linksPrivados}
          </ul>
          ${btnAuth}
        </div>
      </div>
    </nav>
  `;

  // Añadir padding al body para compensar el navbar fijo
  document.body.style.paddingTop = '68px';

  // Sombra al hacer scroll
  window.addEventListener('scroll', () => {
    const nav = document.getElementById('mainNavbar');
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 10);
  });

  // Hamburger menu
  const toggle = document.getElementById('navToggle');
  const menu   = document.getElementById('navMenu');
  toggle?.addEventListener('click', () => {
    toggle.classList.toggle('open');
    menu.classList.toggle('open');
  });

  // Dropdown en mobile (tap para abrir)
  document.querySelectorAll('.nav-dropdown > a').forEach(link => {
    link.addEventListener('click', (e) => {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        link.parentElement.classList.toggle('open');
      }
    });
  });
}

/* ══════════════════════════════
   FOOTER
══════════════════════════════ */

/**
 * Inserta el footer en el elemento con id="footer-placeholder".
 * El año del copyright se genera dinámicamente.
 */
function insertarFooter() {
  const placeholder = document.getElementById('footer-placeholder');
  if (!placeholder) return;

  const anio = new Date().getFullYear();

  placeholder.innerHTML = `
    <footer class="footer">
      <div class="container">
        <div class="footer-top">
          <div class="footer-brand">
            <img src="imagenes/logoMascota.png" alt="Logo Clínica Veterinaria">
            <h3>Clínica Veterinaria</h3>
            <p>Cuidado profesional y cercano para tus mascotas. Atención veterinaria con amor y experiencia.</p>
          </div>
          <div>
            <h4>Contacto</h4>
            <ul class="footer-links">
              <li><a href="#"><i class="fa fa-map-marker-alt" style="margin-right:6px;color:var(--color-accent)"></i> Av. Principal 1234, CABA</a></li>
              <li><a href="tel:+541112345678"><i class="fa fa-phone" style="margin-right:6px;color:var(--color-accent)"></i> +54 11 1234-5678</a></li>
              <li><a href="mailto:info@veterinaria.com"><i class="fa fa-envelope" style="margin-right:6px;color:var(--color-accent)"></i> info@veterinaria.com</a></li>
              <li><i class="fa fa-clock" style="margin-right:6px;color:var(--color-accent)"></i> Lun–Vie: 9:00–18:00</li>
            </ul>
          </div>
          <div>
            <h4>Síguenos</h4>
            <div class="social-links">
              <a href="#" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
              <a href="#" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
              <a href="#" aria-label="WhatsApp"><i class="fab fa-whatsapp"></i></a>
            </div>
            <ul class="footer-links" style="margin-top:20px">
              <li><a href="index.html">Inicio</a></li>
              <li><a href="login.html">Iniciar sesión</a></li>
              <li><a href="mascotas.html">Mis mascotas</a></li>
              <li><a href="turnos.html">Pedir turno</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-divider"></div>
        <div class="footer-bottom">
          <p>© ${anio} Clínica Veterinaria — Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  `;
}

/* ══════════════════════════════
   UTILIDADES UI COMPARTIDAS
══════════════════════════════ */

/**
 * Muestra un modal de confirmación genérico.
 * @param {string} titulo
 * @param {string} mensaje
 * @param {Function} onConfirmar — callback al confirmar
 */
function mostrarModalConfirmacion(titulo, mensaje, onConfirmar) {
  // Eliminar modal anterior si existe
  document.getElementById('modalConfirmGlobal')?.remove();

  // Guardar el elemento enfocado antes de abrir para restaurarlo al cerrar
  const elementoAnterior = document.activeElement;

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay active';
  overlay.id = 'modalConfirmGlobal';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-labelledby', 'modalConfirmTitulo');

  overlay.innerHTML = `
    <div class="modal-box">
      <h3 id="modalConfirmTitulo">${titulo}</h3>
      <p>${mensaje}</p>
      <div class="modal-actions">
        <button class="btn btn-outline btn-sm" id="btnCancelarModal">Cancelar</button>
        <button class="btn btn-danger-custom btn-sm" id="btnConfirmarModal">Confirmar</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  const cerrar = () => {
    overlay.remove();
    elementoAnterior?.focus(); // Restaurar foco al elemento previo
  };

  document.getElementById('btnCancelarModal').addEventListener('click', cerrar);
  document.getElementById('btnConfirmarModal').addEventListener('click', () => {
    overlay.remove();
    elementoAnterior?.focus();
    onConfirmar();
  });

  // Cerrar al clic fuera del box y con tecla ESC
  overlay.addEventListener('click', (e) => { if (e.target === overlay) cerrar(); });
  overlay.addEventListener('keydown', (e) => { if (e.key === 'Escape') cerrar(); });

  // Focus trap: mantener el foco dentro del modal
  _trapFocus(overlay);

  // Enfocar el botón cancelar al abrir
  document.getElementById('btnCancelarModal')?.focus();
}

/**
 * Muestra una notificación toast temporal en la esquina inferior derecha.
 * @param {string} mensaje — Texto a mostrar
 * @param {'success'|'error'|'info'} tipo — Tipo de toast
 * @param {number} duracion — Milisegundos antes de ocultar (default: 3500)
 */
function mostrarToast(mensaje, tipo = 'success', duracion = 3500) {
  // Crear o reutilizar el contenedor de toasts
  let contenedor = document.getElementById('toastContainer');
  if (!contenedor) {
    contenedor = document.createElement('div');
    contenedor.className = 'toast-container';
    contenedor.id = 'toastContainer';
    document.body.appendChild(contenedor);
  }

  // Íconos según tipo
  const iconos = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle' };
  const icono  = iconos[tipo] || iconos.success;

  const toast = document.createElement('div');
  toast.className = `toast toast-${tipo}`;
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.innerHTML = `<i class="fa ${icono} toast-icon"></i><span>${mensaje}</span>`;
  contenedor.appendChild(toast);

  // Ocultar y eliminar después del tiempo indicado
  setTimeout(() => {
    toast.classList.add('hiding');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  }, duracion);
}

/**
 * Inserta el botón "Volver arriba" y lo muestra al hacer scroll.
 */
function insertarBackToTop() {
  const btn = document.createElement('button');
  btn.className = 'back-to-top';
  btn.id = 'backToTop';
  btn.setAttribute('aria-label', 'Volver arriba');
  btn.title = 'Volver arriba';
  btn.innerHTML = '<i class="fa fa-arrow-up"></i>';
  document.body.appendChild(btn);

  // Mostrar u ocultar según posición de scroll
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/**
 * Atrapa el foco dentro de un elemento (accesibilidad en modales).
 * @param {HTMLElement} elemento
 */
function _trapFocus(elemento) {
  const focusables = elemento.querySelectorAll(
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );
  if (!focusables.length) return;
  const primero = focusables[0];
  const ultimo  = focusables[focusables.length - 1];

  elemento.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    if (e.shiftKey) {
      if (document.activeElement === primero) { e.preventDefault(); ultimo.focus(); }
    } else {
      if (document.activeElement === ultimo)  { e.preventDefault(); primero.focus(); }
    }
  });
}

/**
 * Activa el fade-in de elementos con clase .fade-in al hacer scroll.
 */
function activarFadeIn() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
}

/**
 * Inicializa los componentes comunes de cada página.
 * Llamar al inicio de cada página.
 */
function initComponents() {
  insertarNavbar();
  insertarFooter();
  activarFadeIn();
  insertarBackToTop();
}
