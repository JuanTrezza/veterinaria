const API = "http://127.0.0.1/veterinaria/api";
let token = localStorage.getItem("token") || "";
let mascotasUsuario = [];

// ========== AUTO LOGIN ==========
document.addEventListener("DOMContentLoaded", () => {
  if (token) {
    loadPerfil();
    loadTurnos();
    loadMisTurnos();
    loadHistorialTurnos(); // 🔑 Cargamos historial también
  }
});

// ========== REGISTRO ==========
function register() {
  const email = document.getElementById("reg-email").value.trim();
  const password = document.getElementById("reg-pass").value.trim();

  if (!email || !password) {
    showMessage("Completa todos los campos de registro", "error");
    return;
  }

  fetch(`${API}/usuarios/registro`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  })
    .then(res => res.json())
    .then(() => {
      showMessage("Registro exitoso ✅ Ahora inicia sesión", "success");
    })
    .catch(err => {
      console.error("Error en registro:", err);
      showMessage("Error en el registro", "error");
    });
}

// ========== LOGIN ==========
function login() {
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-pass").value.trim();

  if (!email || !password) {
    showMessage("Completa todos los campos de login", "error");
    return;
  }

  fetch(`${API}/usuarios/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  })
    .then(res => res.json())
    .then(data => {
      if (data.token) {
        token = data.token;
        localStorage.setItem("token", token); // 🔑 Guardar token
        showMessage("Login correcto ✅", "success");
        loadPerfil();
        loadTurnos();
        loadMisTurnos();
        loadHistorialTurnos();
      } else {
        showMessage("Login fallido: credenciales incorrectas", "error");
      }
    })
    .catch(err => {
      console.error("Error en login:", err);
      showMessage("Error en el login", "error");
    });
}

// ========== PERFIL ==========
function loadPerfil() {
  fetch(`${API}/usuarios/perfil`, {
    headers: { "Authorization": `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(data => {
      document.getElementById("perfil-info").innerHTML = `
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Nombre:</strong> ${data.nombre || "No definido"}</p>
      `;
      loadMisMascotas();
      loadMisTurnos();
      loadHistorialTurnos();
    })
    .catch(err => {
      console.error("Error en perfil:", err);
      showMessage("Error al cargar el perfil", "error");
    });
}

function logout() {
  token = "";
  localStorage.removeItem("token"); // 🔑 Borrar token
  showMessage("Sesión cerrada", "success");
  setTimeout(() => location.reload(), 1000);
}

// ========== MASCOTAS ==========
function addPet() {
  const nombre = document.getElementById("pet-name").value.trim();
  const especie = document.getElementById("pet-type").value;

  if (!nombre) {
    showMessage("Debes ingresar un nombre para la mascota", "error");
    return;
  }

  fetch(`${API}/mascotas`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ nombre, especie, edad: 1 })
  })
    .then(res => res.json())
    .then(() => {
      showMessage("Mascota registrada ✅", "success");
      loadMisMascotas();
    })
    .catch(err => {
      console.error("Error en registrar mascota:", err);
      showMessage("Error al registrar mascota", "error");
    });
}

function loadMisMascotas() {
  fetch(`${API}/mascotas`, {
    headers: { "Authorization": `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(data => {
      mascotasUsuario = data; // Guardamos las mascotas para agendar turnos
      const lista = document.getElementById("mis-mascotas");
      lista.innerHTML = "";
      data.forEach(m => {
        const div = document.createElement("div");
        div.className = "card";
        div.innerHTML = `<h4>${m.nombre} (${m.especie})</h4>`;
        lista.appendChild(div);
      });
    })
    .catch(err => console.error("Error en mascotas:", err));
}

// ========== TURNOS DISPONIBLES ==========
function loadTurnos() {
  fetch(`${API}/turnos/disponibles`, {
    headers: { "Authorization": `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(data => {
      const lista = document.getElementById("turnos-list");
      lista.innerHTML = "";
      data.forEach(turno => {
        const div = document.createElement("div");
        div.className = "card turno";
        div.innerHTML = `
          <strong>${turno.fecha} - ${turno.hora}</strong><br>
          <select id="mascota-turno-${turno.id}">
            ${mascotasUsuario.map(m => `<option value="${m.id}">${m.nombre}</option>`).join("")}
          </select>
          <button onclick="agendarTurno(${turno.id})">Agendar</button>
        `;
        lista.appendChild(div);
      });
    })
    .catch(err => console.error("Error al cargar turnos:", err));
}

function agendarTurno(turnoId) {
  const selectMascota = document.getElementById(`mascota-turno-${turnoId}`);
  const idMascota = selectMascota ? selectMascota.value : null;

  if (!idMascota) {
    showMessage("Debes seleccionar una mascota", "error");
    return;
  }

  fetch(`${API}/turnos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ id_turno_disponible: turnoId, id_mascota: idMascota })
  })
    .then(res => res.json())
    .then(() => {
      showMessage("Turno agendado ✅", "success");
      loadTurnos();
      loadMisTurnos();
      loadHistorialTurnos();
    })
    .catch(err => {
      console.error("Error al agendar turno:", err);
      showMessage("Error al agendar turno", "error");
    });
}

// ========== TURNOS DEL USUARIO ==========
function loadMisTurnos() {
  fetch(`${API}/turnos/mis-turnos`, {
    headers: { "Authorization": `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(data => {
      const lista = document.getElementById("mis-turnos-list");
      lista.innerHTML = "";

      // Filtrar pendientes
      const pendientes = data.filter(t => t.estado === "pendiente");

      if (pendientes.length === 0) {
        lista.innerHTML = "<p>No tienes turnos pendientes.</p>";
      }

      pendientes.forEach(turno => {
        const div = document.createElement("div");
        div.className = "card mis-turno";
        div.innerHTML = `
          <h4>${turno.fecha} - ${turno.hora}</h4>
          <p><strong>Estado:</strong> ${turno.estado}</p>
          <button onclick="cancelarTurno(${turno.id})">Cancelar</button>
        `;
        lista.appendChild(div);
      });

      // 🔑 Cargar historial después
      loadHistorialTurnos();
    })
    .catch(err => console.error("Error al cargar mis turnos:", err));
}

// ========== HISTORIAL DE TURNOS ==========
function loadHistorialTurnos() {
  fetch(`${API}/turnos/mis-turnos`, {
    headers: { "Authorization": `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(data => {
      const lista = document.getElementById("historial-turnos");
      if (!lista) return;

      lista.innerHTML = "";
      const historial = data.filter(t => t.estado !== "pendiente");

      if (historial.length === 0) {
        lista.innerHTML = "<p>No tienes turnos en el historial.</p>";
        return;
      }

      historial.forEach(turno => {
        const div = document.createElement("div");
        div.className = `card historial-turno ${turno.estado}`;
        div.innerHTML = `
          <h4>${turno.fecha} - ${turno.hora}</h4>
          <p><strong>Estado:</strong> ${turno.estado}</p>
          ${turno.descripcion ? `<p>${turno.descripcion}</p>` : ""}
        `;
        lista.appendChild(div);
      });
    })
    .catch(err => console.error("Error al cargar historial de turnos:", err));
}

// ========== CANCELAR TURNO ==========
function cancelarTurno(idTurno) {
  fetch(`${API}/turnos/${idTurno}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }
  })
    .then(res => res.json())
    .then(() => {
      showMessage("Turno cancelado ❌", "success");
      loadMisTurnos();
      loadHistorialTurnos();
    })
    .catch(err => {
      console.error("Error al cancelar turno:", err);
      showMessage("Error al cancelar turno", "error");
    });
}

// ========== MENSAJES ==========
function showMessage(msg, type) {
  const div = document.createElement("div");
  div.className = type === "error" ? "error-message" : "success-message";
  div.textContent = msg;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 3000);
}





