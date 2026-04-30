/**
 * auth.js — Módulo de autenticación con localStorage
 * Clínica Veterinaria
 */

/**
 * Registrar un usuario nuevo.
 * Guarda { email, passwordHash, fechaRegistro } en localStorage.
 * @param {string} email
 * @param {string} password
 * @returns {{ ok: boolean, error?: string }}
 */
function registrarUsuario(email, password) {
  // Validación básica
  if (!email || !password) {
    return { ok: false, error: 'Email y contraseña son obligatorios.' };
  }

  // Normalizar email a minúsculas para evitar duplicados por mayúsculas
  const emailNorm = email.trim().toLowerCase();

  // Verificar si el email ya está registrado
  const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
  const existe = usuarios.find(u => u.email === emailNorm);
  if (existe) {
    return { ok: false, error: 'El email ya está registrado.' };
  }

  // Crear y guardar el nuevo usuario
  const nuevoUsuario = {
    email: emailNorm,
    passwordHash: btoa(password),      // Hash simple en base64
    fechaRegistro: new Date().toISOString()
  };
  usuarios.push(nuevoUsuario);
  localStorage.setItem('usuarios', JSON.stringify(usuarios));

  return { ok: true };
}

/**
 * Iniciar sesión verificando credenciales.
 * Si son correctas, guarda la sesión activa en localStorage.
 * @param {string} email
 * @param {string} password
 * @returns {{ ok: boolean, error?: string }}
 */
function iniciarSesion(email, password) {
  const emailNorm = email.trim().toLowerCase();
  const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
  const usuario = usuarios.find(u => u.email === emailNorm);

  if (!usuario) {
    return { ok: false, error: 'El email no está registrado.' };
  }

  // Comparar contraseña usando el mismo hash base64
  if (usuario.passwordHash !== btoa(password)) {
    return { ok: false, error: 'Contraseña incorrecta.' };
  }

  // Guardar sesión activa (sin el hash de contraseña por seguridad)
  const sesion = { email: usuario.email, fechaRegistro: usuario.fechaRegistro };
  localStorage.setItem('sesionActiva', JSON.stringify(sesion));

  return { ok: true };
}

/**
 * Cerrar sesión: elimina sesionActiva y redirige a login.
 */
function cerrarSesion() {
  localStorage.removeItem('sesionActiva');
  window.location.href = 'login.html';
}

/**
 * Obtener la sesión activa actual.
 * @returns {{ email: string, fechaRegistro: string } | null}
 */
function getSesion() {
  const raw = localStorage.getItem('sesionActiva');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Proteger una página privada.
 * Si no hay sesión activa, redirige automáticamente a login.html.
 */
function requireAuth() {
  if (!getSesion()) {
    window.location.href = 'login.html';
  }
}

/**
 * Cambiar la contraseña del usuario activo.
 * @param {string} passwordActual
 * @param {string} passwordNueva
 * @returns {{ ok: boolean, error?: string }}
 */
function cambiarPassword(passwordActual, passwordNueva) {
  const sesion = getSesion();
  if (!sesion) return { ok: false, error: 'No hay sesión activa.' };

  const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
  const idx = usuarios.findIndex(u => u.email === sesion.email);
  if (idx === -1) return { ok: false, error: 'Usuario no encontrado.' };

  // Verificar contraseña actual
  if (usuarios[idx].passwordHash !== btoa(passwordActual)) {
    return { ok: false, error: 'La contraseña actual es incorrecta.' };
  }

  // Actualizar contraseña
  usuarios[idx].passwordHash = btoa(passwordNueva);
  localStorage.setItem('usuarios', JSON.stringify(usuarios));

  return { ok: true };
}
