/**
 * storage.js — Módulo de datos con localStorage
 * Gestiona mascotas y turnos de la Clínica Veterinaria
 */

/* ══════════════════════════════
   MASCOTAS
══════════════════════════════ */

/**
 * Obtener todas las mascotas del usuario.
 * @param {string} email
 * @returns {Array}
 */
function getMascotas(email) {
  const key = `mascotas_${email.toLowerCase()}`;
  return JSON.parse(localStorage.getItem(key) || '[]');
}

/**
 * Guardar una mascota nueva para el usuario.
 * @param {string} email
 * @param {{ id: number, nombre: string, tipo: string, edad: number, foto: string|null }} mascota
 */
function saveMascota(email, mascota) {
  const key = `mascotas_${email.toLowerCase()}`;
  const mascotas = getMascotas(email);
  mascotas.push(mascota);
  localStorage.setItem(key, JSON.stringify(mascotas));
}

/**
 * Eliminar una mascota del usuario por id.
 * @param {string} email
 * @param {number} id
 */
function deleteMascota(email, id) {
  const key = `mascotas_${email.toLowerCase()}`;
  const mascotas = getMascotas(email).filter(m => m.id !== id);
  localStorage.setItem(key, JSON.stringify(mascotas));
}

/* ══════════════════════════════
   TURNOS
══════════════════════════════ */

/**
 * Obtener todos los turnos disponibles (ya generados o generarlos).
 * @returns {Array}
 */
function getTurnos() {
  return generarTurnosDisponibles();
}

/**
 * Obtener los turnos reservados por un usuario.
 * @param {string} email
 * @returns {Array}
 */
function getTurnosReservados(email) {
  const key = `turnos_${email.toLowerCase()}`;
  return JSON.parse(localStorage.getItem(key) || '[]');
}

/**
 * Reservar un turno para el usuario.
 * @param {string} email
 * @param {{ id: string, fecha: string, hora: string, mascotaNombre: string }} turno
 * @returns {{ ok: boolean, error?: string }}
 */
function reservarTurno(email, turno) {
  // Verificar que el turno no esté ya reservado por otro usuario
  const todosReservados = _getTodosLosReservados();
  const yaReservado = todosReservados.find(r => r.id === turno.id);
  if (yaReservado) {
    return { ok: false, error: 'Este turno ya fue reservado.' };
  }

  // Guardar en la lista del usuario
  const key = `turnos_${email.toLowerCase()}`;
  const reservados = getTurnosReservados(email);
  reservados.push({ ...turno, reservadoEn: new Date().toISOString() });
  localStorage.setItem(key, JSON.stringify(reservados));

  return { ok: true };
}

/**
 * Cancelar un turno reservado del usuario.
 * @param {string} email
 * @param {string} id
 */
function cancelarTurno(email, id) {
  const key = `turnos_${email.toLowerCase()}`;
  const reservados = getTurnosReservados(email).filter(t => t.id !== id);
  localStorage.setItem(key, JSON.stringify(reservados));
}

/* ── Internos ── */

/**
 * Obtiene TODOS los turnos reservados por cualquier usuario,
 * para marcar ocupados en la vista de disponibles.
 * @returns {Array}
 */
function _getTodosLosReservados() {
  const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
  let todos = [];
  for (const u of usuarios) {
    const key = `turnos_${u.email.toLowerCase()}`;
    const reservados = JSON.parse(localStorage.getItem(key) || '[]');
    todos = todos.concat(reservados);
  }
  return todos;
}

/**
 * Genera los turnos disponibles para los próximos 7 días hábiles.
 * Horarios: 09:00-12:00 y 14:00-18:00 (cada hora).
 * Excluye sábados (6) y domingos (0).
 * Marca ocupados los ya reservados por cualquier usuario.
 * @returns {Array<{ id: string, fecha: string, hora: string, disponible: boolean }>}
 */
function generarTurnosDisponibles() {
  const horarios = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
  const todosReservados = _getTodosLosReservados();
  const idsOcupados = new Set(todosReservados.map(r => r.id));

  const turnos = [];
  let diasAgregados = 0;
  let diaOffset = 0;

  // Generar hasta 7 días hábiles futuros (partiendo desde hoy)
  while (diasAgregados < 7) {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + diaOffset);
    diaOffset++;

    const diaSemana = fecha.getDay(); // 0=dom, 6=sab
    if (diaSemana === 0 || diaSemana === 6) continue;

    const fechaStr = fecha.toISOString().split('T')[0]; // YYYY-MM-DD

    for (const hora of horarios) {
      const id = `${fechaStr}_${hora}`;
      turnos.push({
        id,
        fecha: fechaStr,
        hora,
        disponible: !idsOcupados.has(id)
      });
    }
    diasAgregados++;
  }

  return turnos;
}

/**
 * Agrupa un array de turnos por fecha.
 * @param {Array} turnos
 * @returns {Object} — { "YYYY-MM-DD": [turno, ...], ... }
 */
function agruparTurnosPorFecha(turnos) {
  return turnos.reduce((acc, turno) => {
    if (!acc[turno.fecha]) acc[turno.fecha] = [];
    acc[turno.fecha].push(turno);
    return acc;
  }, {});
}

/**
 * Formatea una fecha ISO en español.
 * Ej: "2025-05-05" → "Lunes 5 de mayo de 2025"
 * @param {string} fechaStr — YYYY-MM-DD
 * @returns {string}
 */
function formatearFechaES(fechaStr) {
  // Se agrega T00:00:00 para evitar desfase de zona horaria
  const fecha = new Date(fechaStr + 'T00:00:00');
  return fecha.toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}
