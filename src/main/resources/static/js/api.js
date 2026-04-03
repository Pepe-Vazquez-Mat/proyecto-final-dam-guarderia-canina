const API_BASE_URL = "http://localhost:8081";

async function apiRequest(endpoint, options = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        },
        ...options
    });

    if (!response.ok) {
        let errorMessage = "Error en la petición al servidor";

        try {
            const errorText = await response.text();
            if (errorText) {
                errorMessage = errorText;
            }
        } catch (e) {
            // dejamos mensaje genérico
        }

        throw new Error(errorMessage);
    }

    if (response.status === 204) {
        return null;
    }

    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
        return await response.json();
    }

    return await response.text();
}

// =========================
// CLIENTE
// =========================
async function crearReservaCliente(datosReserva) {
    return apiRequest("/api/reservas", {
        method: "POST",
        body: JSON.stringify(datosReserva)
    });
}

// =========================
// USUARIOS
// =========================
async function obtenerUsuarios() {
    return apiRequest("/api/usuarios");
}

async function crearUsuario(usuario) {
    return apiRequest("/api/usuarios", {
        method: "POST",
        body: JSON.stringify(usuario)
    });
}

async function borrarUsuario(id) {
    return apiRequest(`/api/usuarios/${id}`, {
        method: "DELETE"
    });
}

// =========================
// MASCOTAS
// =========================
async function obtenerMascotas() {
    return apiRequest("/api/mascotas");
}

async function crearMascota(usuarioId, mascota) {
    return apiRequest(`/api/mascotas/usuario/${usuarioId}`, {
        method: "POST",
        body: JSON.stringify(mascota)
    });
}

async function borrarMascota(id) {
    return apiRequest(`/api/mascotas/${id}`, {
        method: "DELETE"
    });
}

// =========================
// RESERVAS
// =========================
async function obtenerReservas() {
    return apiRequest("/api/cliente-reservas");
}

async function crearReserva(mascotaId, reserva) {
    return apiRequest(`/api/cliente-reservas/mascota/${mascotaId}`, {
        method: "POST",
        body: JSON.stringify(reserva)
    });
}

async function borrarReserva(id) {
    return apiRequest(`/api/cliente-reservas/${id}`, {
        method: "DELETE"
    });
}