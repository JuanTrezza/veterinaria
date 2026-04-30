/**
 * main.js — Lógica específica de cada página
 * Detecta la página actual y ejecuta el módulo correspondiente.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Inicializar componentes comunes (navbar, footer, fade-in)
  initComponents();

  // Detectar página actual
  const pagina = window.location.pathname.split('/').pop() || 'index.html';

  if (pagina === 'index.html' || pagina === '') {
    initIndex();
  } else if (pagina === 'login.html') {
    initLogin();
  } else if (pagina === 'mascotas.html') {
    initMascotas();
  } else if (pagina === 'turnos.html') {
    initTurnos();
  } else if (pagina === 'misturnos.html') {
    initMisTurnos();
  } else if (pagina === 'micuenta.html') {
    initMiCuenta();
  }
});

/* ══════════════════════════════════════════════
   INDEX.HTML
══════════════════════════════════════════════ */
function initIndex() {
  const sesion = getSesion();

  // Personalizar hero según sesión
  const heroBienvenida = document.getElementById('heroBienvenida');
  const heroCtaSesion  = document.getElementById('heroCtaSesion');
  const heroCtaPublico = document.getElementById('heroCtaPublico');

  if (sesion && heroBienvenida) {
    heroBienvenida.textContent = `¡Bienvenido, ${sesion.email.split('@')[0]}!`;
    heroCtaSesion?.classList.remove('hidden');
    heroCtaPublico?.classList.add('hidden');
  }

  // Contador animado de estadísticas
  const contadores = document.querySelectorAll('[data-counter]');
  const observerCounter = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const objetivo = parseInt(el.dataset.counter);
      const duracion = 1800;
      const inicio = performance.now();

      const animar = (ahora) => {
        const progreso = Math.min((ahora - inicio) / duracion, 1);
        el.textContent = Math.floor(progreso * objetivo).toLocaleString('es-AR');
        if (progreso < 1) requestAnimationFrame(animar);
        else el.textContent = objetivo.toLocaleString('es-AR') + (el.dataset.suffix || '');
      };
      requestAnimationFrame(animar);
      observerCounter.unobserve(el);
    });
  }, { threshold: 0.5 });

  contadores.forEach(el => observerCounter.observe(el));
}

/* ══════════════════════════════════════════════
   LOGIN.HTML
══════════════════════════════════════════════ */
function initLogin() {
  // Si ya hay sesión, redirigir al inicio
  if (getSesion()) {
    window.location.href = 'index.html';
    return;
  }

  // Tabs login / registro
  const tabLogin   = document.getElementById('tabLogin');
  const tabRegistro = document.getElementById('tabRegistro');
  const panelLogin  = document.getElementById('panelLogin');
  const panelRegistro = document.getElementById('panelRegistro');

  tabLogin?.addEventListener('click', () => {
    tabLogin.classList.add('active');
    tabRegistro.classList.remove('active');
    panelLogin.classList.remove('hidden');
    panelRegistro.classList.add('hidden');
  });

  tabRegistro?.addEventListener('click', () => {
    tabRegistro.classList.add('active');
    tabLogin.classList.remove('active');
    panelRegistro.classList.remove('hidden');
    panelLogin.classList.add('hidden');
  });

  // Toggle mostrar/ocultar contraseña
  document.querySelectorAll('.toggle-pass').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      const input = document.getElementById(targetId);
      if (!input) return;
      const oculto = input.type === 'password';
      input.type = oculto ? 'text' : 'password';
      btn.querySelector('i').className = oculto ? 'fa fa-eye-slash' : 'fa fa-eye';
    });
  });

  // ── Validación en tiempo real (al salir del campo) ──
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  _validarAlSalir('loginEmail', v => emailRegex.test(v), 'Ingresá un email válido.');
  _validarAlSalir('regEmail',   v => emailRegex.test(v), 'Ingresá un email válido.');
  _validarAlSalir('regPass',    v => v.length >= 6,      'Mínimo 6 caracteres.');

  // Validar confirmación cuando el usuario sale del campo
  document.getElementById('regConfirm')?.addEventListener('blur', () => {
    const pass    = document.getElementById('regPass')?.value || '';
    const confirm = document.getElementById('regConfirm');
    if (!confirm || !confirm.value) return;
    const ok = confirm.value === pass;
    _setFieldState(confirm, ok, ok ? '' : 'Las contraseñas no coinciden.');
  });

  // Formulario LOGIN
  const formLogin  = document.getElementById('formLogin');
  const loginMsg   = document.getElementById('loginMsg');
  formLogin?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email    = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPass').value;
    const btn      = formLogin.querySelector('button[type=submit]');

    _setLoading(btn, true);
    loginMsg.innerHTML = '';

    // Simular micro-delay para UX
    setTimeout(() => {
      const resultado = iniciarSesion(email, password);
      _setLoading(btn, false);

      if (resultado.ok) {
        mostrarToast('¡Sesión iniciada! Redirigiendo...');
        setTimeout(() => window.location.href = 'index.html', 900);
      } else {
        loginMsg.innerHTML = _msgError(resultado.error);
      }
    }, 400);
  });

  // Formulario REGISTRO
  const formRegistro = document.getElementById('formRegistro');
  const registroMsg  = document.getElementById('registroMsg');
  formRegistro?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email    = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPass').value;
    const confirm  = document.getElementById('regConfirm').value;
    const btn      = formRegistro.querySelector('button[type=submit]');

    registroMsg.innerHTML = '';

    // Validaciones
    if (password.length < 6) {
      registroMsg.innerHTML = _msgError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (password !== confirm) {
      registroMsg.innerHTML = _msgError('Las contraseñas no coinciden.');
      return;
    }

    _setLoading(btn, true);
    setTimeout(() => {
      const resultado = registrarUsuario(email, password);
      _setLoading(btn, false);

      if (resultado.ok) {
        mostrarToast('¡Cuenta creada exitosamente! Bienvenido 🐾');
        iniciarSesion(email, password);
        setTimeout(() => window.location.href = 'index.html', 900);
      } else {
        registroMsg.innerHTML = _msgError(resultado.error);
      }
    }, 400);
  });
}

/* ══════════════════════════════════════════════
   MASCOTAS.HTML
══════════════════════════════════════════════ */
function initMascotas() {
  requireAuth();
  const sesion = getSesion();
  const contenedor = document.getElementById('contenedorMascotas');
  const formMascota = document.getElementById('formMascota');
  const preview = document.getElementById('previewFoto');
  const fotoInput = document.getElementById('fotoMascota');
  const formMsg = document.getElementById('formMascotaMsg');

  // Preview de foto
  fotoInput?.addEventListener('change', () => {
    const file = fotoInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      preview.src = e.target.result;
      preview.style.display = 'block';
    };
    reader.readAsDataURL(file);
  });

  // Renderizar mascotas
  function renderMascotas() {
    const mascotas = getMascotas(sesion.email);
    if (mascotas.length === 0) {
      contenedor.innerHTML = `
        <div class="empty-state fade-in">
          <div class="empty-icon">🐾</div>
          <h3>Aún no registraste ninguna mascota</h3>
          <p>Usá el formulario de arriba para agregar tu primera mascota.</p>
        </div>`;
      activarFadeIn();
      return;
    }

    contenedor.innerHTML = mascotas.map(m => `
      <div class="col-mascota fade-in">
        <div class="mascota-card">
          <div class="mascota-foto">
            ${m.foto
              ? `<img src="${m.foto}" alt="${m.nombre}">`
              : `<div class="mascota-avatar">${_avatarEmoji(m.tipo)}</div>`}
          </div>
          <div class="mascota-info">
            <h3>${m.nombre}</h3>
            <p><span class="badge badge-success">${m.tipo}</span></p>
            <p>${m.edad} año${m.edad !== 1 ? 's' : ''}</p>
          </div>
          <button class="btn btn-danger-custom btn-sm btn-eliminar" data-id="${m.id}" data-nombre="${m.nombre}">
            <i class="fa fa-trash"></i> Eliminar
          </button>
        </div>
      </div>
    `).join('');

    // Botones eliminar
    contenedor.querySelectorAll('.btn-eliminar').forEach(btn => {
      btn.addEventListener('click', () => {
        const id     = Number(btn.dataset.id);
        const nombre = btn.dataset.nombre;
        mostrarModalConfirmacion(
          'Eliminar mascota',
          `¿Estás seguro de eliminar a <strong>${nombre}</strong>? Esta acción no se puede deshacer.`,
          () => {
            deleteMascota(sesion.email, id);
            renderMascotas();
          }
        );
      });
    });

    activarFadeIn();
  }

  renderMascotas();

  // Agregar mascota
  formMascota?.addEventListener('submit', (e) => {
    e.preventDefault();
    formMsg.innerHTML = '';

    const nombre = document.getElementById('nombreMascota').value.trim();
    const tipo   = document.getElementById('tipoMascota').value;
    const edad   = Number(document.getElementById('edadMascota').value);

    if (!nombre || !tipo || !edad) {
      formMsg.innerHTML = _msgError('Nombre, tipo y edad son obligatorios.');
      return;
    }

    const btn = formMascota.querySelector('button[type=submit]');
    _setLoading(btn, true);

    const procesarGuardado = (fotoBase64) => {
      const mascota = { id: Date.now(), nombre, tipo, edad, foto: fotoBase64 };
      saveMascota(sesion.email, mascota);
      formMascota.reset();
      preview.style.display = 'none';
      preview.src = '';
      mostrarToast('¡Mascota agregada correctamente! 🐾');
      formMsg.innerHTML = '';
      _setLoading(btn, false);
      renderMascotas();
    };

    const file = fotoInput?.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => procesarGuardado(e.target.result);
      reader.readAsDataURL(file);
    } else {
      procesarGuardado(null);
    }
  });
}

/* ══════════════════════════════════════════════
   TURNOS.HTML
══════════════════════════════════════════════ */
function initTurnos() {
  requireAuth();
  const sesion    = getSesion();
  const contenedor = document.getElementById('contenedorTurnos');
  const msgTurnos  = document.getElementById('msgTurnos');

  // Mostrar loader
  contenedor.innerHTML = `<div class="page-loader"><div class="spinner-circle"></div></div>`;
  msgTurnos.textContent = '';

  setTimeout(() => {
    const turnos  = getTurnos();
    const grupos  = agruparTurnosPorFecha(turnos);
    const reservados = getTurnosReservados(sesion.email).map(t => t.id);

    contenedor.innerHTML = '';

    Object.entries(grupos).forEach(([fecha, turnosDia]) => {
      const seccion = document.createElement('div');
      seccion.className = 'dia-seccion fade-in';

      const fechaFormateada = _capitalizar(formatearFechaES(fecha));

      seccion.innerHTML = `
        <h3 class="dia-titulo">${fechaFormateada}</h3>
        <div class="turnos-grid">
          ${turnosDia.map(t => {
            const yaReservadoPorMi = reservados.includes(t.id);
            const estado = yaReservadoPorMi ? 'mine' : (t.disponible ? 'disponible' : 'ocupado');
            return `
              <div class="turno-card turno-${estado}">
                <div class="turno-hora"><i class="fa fa-clock"></i> ${t.hora}</div>
                ${yaReservadoPorMi
                  ? `<span class="badge badge-success"><i class="fa fa-check"></i> Ya reservado</span>`
                  : t.disponible
                    ? `<button class="btn btn-primary btn-sm btn-reservar" data-id="${t.id}" data-fecha="${t.fecha}" data-hora="${t.hora}">
                         Reservar
                       </button>`
                    : `<span class="badge badge-muted">Ocupado</span>`
                }
              </div>
            `;
          }).join('')}
        </div>
      `;
      contenedor.appendChild(seccion);
    });

    activarFadeIn();

    // Botones reservar
    contenedor.querySelectorAll('.btn-reservar').forEach(btn => {
      btn.addEventListener('click', () => {
        const turno = { id: btn.dataset.id, fecha: btn.dataset.fecha, hora: btn.dataset.hora };
        _abrirModalReserva(turno, sesion, () => initTurnos());
      });
    });
  }, 300);
}

/**
 * Abre el modal para seleccionar una mascota y confirmar reserva.
 */
function _abrirModalReserva(turno, sesion, onSuccess) {
  const mascotas = getMascotas(sesion.email);
  document.getElementById('modalReserva')?.remove();

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay active';
  overlay.id = 'modalReserva';

  if (mascotas.length === 0) {
    overlay.innerHTML = `
      <div class="modal-box">
        <h3>Sin mascotas registradas</h3>
        <p>Primero registrá una mascota para poder reservar un turno.</p>
        <div class="modal-actions">
          <button class="btn btn-outline btn-sm" id="btnCerrarModalReserva">Cancelar</button>
          <a href="mascotas.html" class="btn btn-primary btn-sm">Ir a Mascotas</a>
        </div>
      </div>`;
  } else {
    const opts = mascotas.map(m => `<option value="${m.nombre}">${m.nombre} (${m.tipo})</option>`).join('');
    overlay.innerHTML = `
      <div class="modal-box">
        <h3>Reservar turno</h3>
        <p><i class="fa fa-calendar" style="color:var(--color-accent)"></i> 
           ${_capitalizar(formatearFechaES(turno.fecha))} a las <strong>${turno.hora}</strong>
        </p>
        <div class="form-group">
          <label>Seleccioná tu mascota</label>
          <select class="form-select" id="selectMascotaModal">${opts}</select>
        </div>
        <div class="modal-actions">
          <button class="btn btn-outline btn-sm" id="btnCerrarModalReserva">Cancelar</button>
          <button class="btn btn-primary btn-sm" id="btnConfirmarReserva">Confirmar reserva</button>
        </div>
        <div id="modalReservaMsg" style="margin-top:12px"></div>
      </div>`;
  }

  document.body.appendChild(overlay);

  // Accesibilidad: aria, ESC, focus trap
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Reservar turno');

  const elementoAnterior = document.activeElement;
  const cerrarReserva = () => { overlay.remove(); elementoAnterior?.focus(); };

  document.getElementById('btnCerrarModalReserva')?.addEventListener('click', cerrarReserva);
  overlay.addEventListener('click', e => { if (e.target === overlay) cerrarReserva(); });
  overlay.addEventListener('keydown', e => { if (e.key === 'Escape') cerrarReserva(); });

  _trapFocus(overlay);
  // Enfocar el primer interactivo del modal
  setTimeout(() => overlay.querySelector('button, select, a')?.focus(), 50);

  document.getElementById('btnConfirmarReserva')?.addEventListener('click', () => {
    const mascotaNombre = document.getElementById('selectMascotaModal').value;
    const resultado = reservarTurno(sesion.email, { ...turno, mascotaNombre });
    if (resultado.ok) {
      cerrarReserva();
      mostrarToast('¡Turno reservado correctamente! Revisá "Mis turnos".');
      onSuccess();
    } else {
      document.getElementById('modalReservaMsg').innerHTML = _msgError(resultado.error);
    }
  });
}

/* ══════════════════════════════════════════════
   MISTURNOS.HTML
══════════════════════════════════════════════ */
function initMisTurnos() {
  requireAuth();
  const sesion = getSesion();
  const contenedor = document.getElementById('contenedorMisTurnos');

  function renderMisTurnos() {
    const turnos = getTurnosReservados(sesion.email)
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

    if (turnos.length === 0) {
      contenedor.innerHTML = `
        <div class="empty-state fade-in">
          <div class="empty-icon">📅</div>
          <h3>No tenés turnos agendados</h3>
          <p>Reservá un turno disponible para tu mascota.</p>
          <a href="turnos.html" class="btn btn-primary" style="margin-top:16px">Ver turnos disponibles</a>
        </div>`;
      activarFadeIn();
      return;
    }

    const ahora = new Date();

    contenedor.innerHTML = turnos.map(t => {
      const fechaTurno = new Date(t.fecha + 'T' + t.hora + ':00');
      const pasado     = fechaTurno < ahora;
      const estadoLabel = pasado ? 'Completado' : 'Pendiente';
      const estadoBadge = pasado ? 'badge-muted' : 'badge-success';

      return `
        <div class="mi-turno-card fade-in">
          <div class="mi-turno-info">
            <div class="mi-turno-fecha">
              <i class="fa fa-calendar-alt" style="color:var(--color-accent)"></i>
              ${_capitalizar(formatearFechaES(t.fecha))} — ${t.hora}
            </div>
            <div class="mi-turno-mascota">
              <i class="fa fa-paw" style="color:var(--color-accent)"></i> ${t.mascotaNombre}
            </div>
          </div>
          <div class="mi-turno-estado">
            <span class="badge ${estadoBadge}">${estadoLabel}</span>
            ${!pasado
              ? `<button class="btn btn-danger-custom btn-sm btn-cancelar" data-id="${t.id}" data-fecha="${_capitalizar(formatearFechaES(t.fecha))}" style="margin-top:10px">
                   <i class="fa fa-times"></i> Cancelar
                 </button>`
              : ''}
          </div>
        </div>
      `;
    }).join('');

    // Botones cancelar
    contenedor.querySelectorAll('.btn-cancelar').forEach(btn => {
      btn.addEventListener('click', () => {
        const id    = btn.dataset.id;
        const fecha = btn.dataset.fecha;
        mostrarModalConfirmacion(
          'Cancelar turno',
          `¿Confirmás la cancelación del turno del <strong>${fecha}</strong>?`,
          () => { cancelarTurno(sesion.email, id); mostrarToast('Turno cancelado.', 'info'); renderMisTurnos(); }
        );
      });
    });

    activarFadeIn();
  }

  renderMisTurnos();
}

/* ══════════════════════════════════════════════
   MICUENTA.HTML
══════════════════════════════════════════════ */
function initMiCuenta() {
  requireAuth();
  const sesion = getSesion();

  // Datos del usuario
  document.getElementById('cuentaEmail').textContent = sesion.email;
  document.getElementById('cuentaFecha').textContent = new Date(sesion.fechaRegistro)
    .toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' });
  document.getElementById('cuentaMascotas').textContent = getMascotas(sesion.email).length;
  document.getElementById('cuentaTurnos').textContent   = getTurnosReservados(sesion.email).length;

  // Cambiar contraseña
  const formPass = document.getElementById('formCambiarPass');
  const passMsg  = document.getElementById('cambiarPassMsg');

  formPass?.addEventListener('submit', (e) => {
    e.preventDefault();
    passMsg.innerHTML = '';

    const actual   = document.getElementById('passActual').value;
    const nueva    = document.getElementById('passNueva').value;
    const confirmar = document.getElementById('passConfirmar').value;

    if (nueva.length < 6) {
      passMsg.innerHTML = _msgError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (nueva !== confirmar) {
      passMsg.innerHTML = _msgError('Las contraseñas nuevas no coinciden.');
      return;
    }

    const resultado = cambiarPassword(actual, nueva);
    if (resultado.ok) {
      mostrarToast('¡Contraseña actualizada correctamente!');
      passMsg.innerHTML = '';
      formPass.reset();
    } else {
      passMsg.innerHTML = _msgError(resultado.error);
    }
  });

  // Cerrar sesión
  document.getElementById('btnCerrarSesion')?.addEventListener('click', () => {
    mostrarModalConfirmacion(
      'Cerrar sesión',
      '¿Estás seguro que querés cerrar sesión?',
      cerrarSesion
    );
  });

  // ── Validación en tiempo real para cambio de contraseña ──
  document.getElementById('passNueva')?.addEventListener('blur', () => {
    const input = document.getElementById('passNueva');
    if (!input?.value) return;
    _setFieldState(input, input.value.length >= 6, 'Mínimo 6 caracteres.');
  });
  document.getElementById('passConfirmar')?.addEventListener('blur', () => {
    const nueva = document.getElementById('passNueva')?.value || '';
    const conf  = document.getElementById('passConfirmar');
    if (!conf?.value) return;
    _setFieldState(conf, conf.value === nueva, 'Las contraseñas no coinciden.');
  });

  // Toggle contraseñas en micuenta
  document.querySelectorAll('.toggle-pass').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = document.getElementById(btn.dataset.target);
      if (!input) return;
      const oculto = input.type === 'password';
      input.type = oculto ? 'text' : 'password';
      btn.querySelector('i').className = oculto ? 'fa fa-eye-slash' : 'fa fa-eye';
    });
  });
}

/* ══════════════════════════════════════════════
   HELPERS INTERNOS
══════════════════════════════════════════════ */

/** Genera HTML de mensaje de error */
function _msgError(texto) {
  return `<div class="field-error"><i class="fa fa-exclamation-circle"></i> ${texto}</div>`;
}

/** Genera HTML de mensaje de éxito */
function _msgExito(texto) {
  return `<div class="field-success"><i class="fa fa-check-circle"></i> ${texto}</div>`;
}

/** Activa/desactiva estado loading en un botón */
function _setLoading(btn, estado) {
  if (!btn) return;
  btn.disabled = estado;
  const spinner = btn.querySelector('.spinner');
  const texto   = btn.querySelector('.btn-text');
  if (spinner) spinner.style.display = estado ? 'inline-block' : 'none';
  if (texto)   texto.style.opacity   = estado ? '.6' : '1';
}

/** Retorna emoji avatar según tipo de mascota */
function _avatarEmoji(tipo) {
  const map = { Perro: '🐶', Gato: '🐱', Otro: '🐾' };
  return map[tipo] || '🐾';
}

/** Capitaliza la primera letra de un string */
function _capitalizar(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Agrega validación blur a un input por id.
 * @param {string} id — id del input
 * @param {Function} validar — función que recibe el valor y retorna true/false
 * @param {string} mensajeError — mensaje si no es válido
 */
function _validarAlSalir(id, validar, mensajeError) {
  const input = document.getElementById(id);
  if (!input) return;
  input.addEventListener('blur', () => {
    if (!input.value) return; // No mostrar error si está vacío al salir
    const ok = validar(input.value);
    _setFieldState(input, ok, ok ? '' : mensajeError);
  });
  // Limpiar estado al volver a escribir
  input.addEventListener('input', () => {
    input.classList.remove('error', 'success');
    const hint = input.parentElement?.querySelector('.field-hint') ||
                 input.closest('.form-group')?.querySelector('.field-hint');
    if (hint) hint.textContent = '';
  });
}

/**
 * Aplica estado visual de válido/inválido a un input y muestra un hint.
 * @param {HTMLInputElement} input
 * @param {boolean} ok
 * @param {string} mensaje — vacío si ok
 */
function _setFieldState(input, ok, mensaje) {
  input.classList.toggle('error',   !ok);
  input.classList.toggle('success',  ok);

  // Buscar o crear el elemento hint debajo del input-wrapper
  const wrapper = input.closest('.form-group');
  if (!wrapper) return;
  let hint = wrapper.querySelector('.field-hint');
  if (!hint) {
    hint = document.createElement('div');
    hint.className = 'field-hint';
    wrapper.appendChild(hint);
  }
  hint.className = 'field-hint ' + (ok ? 'ok-hint' : 'error-hint');
  hint.innerHTML = mensaje
    ? `<i class="fa ${ok ? 'fa-check' : 'fa-exclamation-circle'}"></i> ${mensaje}`
    : '';
}
