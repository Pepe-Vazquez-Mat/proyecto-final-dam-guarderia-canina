const API_BASE = "http://localhost:8081";

const RUTAS = {
    me: `${API_BASE}/api/auth/me`,
    logout: `${API_BASE}/api/auth/logout`,
    usuarios: `${API_BASE}/api/usuarios`,
    mascotas: `${API_BASE}/api/mascotas`,
    reservas: `${API_BASE}/api/reservas`
};

let usuariosData = [];
let mascotasData = [];
let reservasData = [];
let intervaloReservas = null;

// ============================
// ELEMENTOS
// ============================
const usuarioLogueado = document.getElementById("usuarioLogueado");
const btnCerrarSesion = document.getElementById("btnCerrarSesion");
const btnRefrescarTodo = document.getElementById("btnRefrescarTodo");

const tablaUsuarios = document.getElementById("tablaUsuarios");
const tablaMascotas = document.getElementById("tablaMascotas");
const tablaReservas = document.getElementById("tablaReservas");

const statUsuarios = document.getElementById("statUsuarios");
const statMascotas = document.getElementById("statMascotas");
const statReservas = document.getElementById("statReservas");
const statPendientes = document.getElementById("statPendientes");

const buscarUsuarios = document.getElementById("buscarUsuarios");
const buscarMascotas = document.getElementById("buscarMascotas");
const buscarReservas = document.getElementById("buscarReservas");
const filtroEstadoReserva = document.getElementById("filtroEstadoReserva");

const btnActualizarUsuarios = document.getElementById("btnActualizarUsuarios");
const btnActualizarMascotas = document.getElementById("btnActualizarMascotas");
const btnActualizarReservas = document.getElementById("btnActualizarReservas");

const toast = document.getElementById("toast");

// MODAL MASCOTA
const modalMascota = document.getElementById("modalMascota");
const cerrarModalMascota = document.getElementById("cerrarModalMascota");
const cancelarModalMascota = document.getElementById("cancelarModalMascota");
const formEditarMascota = document.getElementById("formEditarMascota");

const editMascotaId = document.getElementById("editMascotaId");
const editMascotaNombre = document.getElementById("editMascotaNombre");
const editMascotaRaza = document.getElementById("editMascotaRaza");
const editMascotaPeso = document.getElementById("editMascotaPeso");
const editMascotaEdad = document.getElementById("editMascotaEdad");
const editMascotaObservaciones = document.getElementById("editMascotaObservaciones");

// MODAL RESERVA
const modalReserva = document.getElementById("modalReserva");
const cerrarModalReserva = document.getElementById("cerrarModalReserva");
const cancelarModalReserva = document.getElementById("cancelarModalReserva");
const formEditarReserva = document.getElementById("formEditarReserva");

const editReservaId = document.getElementById("editReservaId");
const editReservaFechaEntrada = document.getElementById("editReservaFechaEntrada");
const editReservaFechaSalida = document.getElementById("editReservaFechaSalida");
const editReservaTipoEstancia = document.getElementById("editReservaTipoEstancia");
const editReservaEstado = document.getElementById("editReservaEstado");
const editReservaRecogida = document.getElementById("editReservaRecogida");
const editReservaPeluqueria = document.getElementById("editReservaPeluqueria");
const editReservaObservaciones = document.getElementById("editReservaObservaciones");

// ============================
// UTILIDADES
// ============================
function mostrarToast(mensaje, ms = 2500) {
    if (!toast) return;
    toast.textContent = mensaje;
    toast.classList.remove("hidden");

    setTimeout(() => {
        toast.classList.add("hidden");
    }, ms);
}

function obtenerTextoSeguro(valor) {
    return valor === null || valor === undefined || valor === "" ? "-" : valor;
}

function formatearFecha(fecha) {
    return fecha || "-";
}

function formatearPrecio(precio) {
    if (precio === null || precio === undefined || precio === "") return "-";
    const numero = Number(precio);
    if (Number.isNaN(numero)) return `${precio} €`;
    return `${numero.toFixed(2)} €`;
}

function obtenerNombreUsuario(usuario) {
    if (!usuario) return "-";
    const nombre = usuario.nombre || "";
    const apellidos = usuario.apellidos || "";
    const nombreCompleto = `${nombre} ${apellidos}`.trim();
    return nombreCompleto || usuario.email || "-";
}

function obtenerNombreMascota(mascota) {
    if (!mascota) return "-";
    return mascota.nombre || `Mascota ${mascota.id || ""}`;
}

function obtenerBadgeEstado(estado) {
    const valor = (estado || "").toUpperCase();

    if (valor === "PENDIENTE") {
        return `<span class="badge badge-pendiente">PENDIENTE</span>`;
    }
    if (valor === "CONFIRMADA") {
        return `<span class="badge badge-confirmada">CONFIRMADA</span>`;
    }
    if (valor === "CANCELADA") {
        return `<span class="badge badge-cancelada">CANCELADA</span>`;
    }
    if (valor === "FINALIZADA") {
        return `<span class="badge badge-finalizada">FINALIZADA</span>`;
    }

    return `<span class="badge">${obtenerTextoSeguro(estado)}</span>`;
}

async function fetchConSesion(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        }
    });

    return response;
}

// ============================
// SEGURIDAD
// ============================
async function comprobarSesionAdmin() {
    try {
        console.log("Comprobando sesión admin...");
        const response = await fetchConSesion(RUTAS.me, { method: "GET" });

        if (response.status === 401) {
            window.location.href = "/login.html";
            return false;
        }

        if (!response.ok) {
            throw new Error("No se pudo comprobar la sesión");
        }

        const usuario = await response.json();
        console.log("Usuario /me:", usuario);

        const rolUsuario = (usuario.rol || "").trim().toUpperCase();

        if (rolUsuario !== "ADMIN") {
            window.location.href = "/cliente.html";
            return false;
        }

        if (usuarioLogueado) {
            usuarioLogueado.textContent = `Admin: ${usuario.nombre || usuario.email || "Usuario"}`;
        }

        return true;
    } catch (error) {
        console.error("Error comprobando sesión admin:", error);
        window.location.href = "/login.html";
        return false;
    }
}

// ============================
// CARGA DE DATOS
// ============================
async function cargarUsuarios() {
    try {
        const response = await fetchConSesion(RUTAS.usuarios, { method: "GET" });

        if (response.status === 401) {
            window.location.href = "/login.html";
            return;
        }

        if (!response.ok) {
            throw new Error("No se pudieron cargar los usuarios");
        }

        usuariosData = await response.json();
        pintarUsuarios();
        actualizarEstadisticas();
    } catch (error) {
        console.error("Error cargando usuarios:", error);
        if (tablaUsuarios) {
            tablaUsuarios.innerHTML = `<tr><td colspan="6" class="empty-cell">No se pudieron cargar los usuarios</td></tr>`;
        }
    }
}

async function cargarMascotas() {
    try {
        const response = await fetchConSesion(RUTAS.mascotas, { method: "GET" });

        if (response.status === 401) {
            window.location.href = "/login.html";
            return;
        }

        if (!response.ok) {
            throw new Error("No se pudieron cargar las mascotas");
        }

        mascotasData = await response.json();
        pintarMascotas();
        actualizarEstadisticas();
    } catch (error) {
        console.error("Error cargando mascotas:", error);
        if (tablaMascotas) {
            tablaMascotas.innerHTML = `<tr><td colspan="8" class="empty-cell">No se pudieron cargar las mascotas</td></tr>`;
        }
    }
}

async function cargarReservas() {
    try {
        const response = await fetchConSesion(RUTAS.reservas, { method: "GET" });

        if (response.status === 401) {
            window.location.href = "/login.html";
            return;
        }

        if (!response.ok) {
            throw new Error("No se pudieron cargar las reservas");
        }

        reservasData = await response.json();
        pintarReservas();
        actualizarEstadisticas();
    } catch (error) {
        console.error("Error cargando reservas:", error);
        if (tablaReservas) {
            tablaReservas.innerHTML = `<tr><td colspan="11" class="empty-cell">No se pudieron cargar las reservas</td></tr>`;
        }
    }
}

async function cargarTodo() {
    await Promise.allSettled([
        cargarUsuarios(),
        cargarMascotas(),
        cargarReservas()
    ]);
}

// ============================
// PINTADO
// ============================
function pintarUsuarios() {
    if (!tablaUsuarios) return;

    const texto = (buscarUsuarios?.value || "").trim().toLowerCase();

    const filtrados = usuariosData.filter(usuario => {
        const nombre = (usuario.nombre || "").toLowerCase();
        const apellidos = (usuario.apellidos || "").toLowerCase();
        const email = (usuario.email || "").toLowerCase();
        return nombre.includes(texto) || apellidos.includes(texto) || email.includes(texto);
    });

    if (!filtrados.length) {
        tablaUsuarios.innerHTML = `<tr><td colspan="6" class="empty-cell">No hay usuarios para mostrar</td></tr>`;
        return;
    }

    tablaUsuarios.innerHTML = filtrados.map(usuario => `
        <tr>
            <td>${obtenerTextoSeguro(usuario.id)}</td>
            <td>${obtenerTextoSeguro(usuario.nombre)}</td>
            <td>${obtenerTextoSeguro(usuario.apellidos)}</td>
            <td>${obtenerTextoSeguro(usuario.email)}</td>
            <td>${obtenerTextoSeguro(usuario.telefono)}</td>
            <td>${obtenerTextoSeguro(usuario.rol)}</td>
        </tr>
    `).join("");
}

function pintarMascotas() {
    if (!tablaMascotas) return;

    const texto = (buscarMascotas?.value || "").trim().toLowerCase();

    const filtradas = mascotasData.filter(mascota => {
        const nombre = (mascota.nombre || "").toLowerCase();
        const raza = (mascota.raza || "").toLowerCase();
        const duenio = obtenerNombreUsuario(mascota.usuario).toLowerCase();
        return nombre.includes(texto) || raza.includes(texto) || duenio.includes(texto);
    });

    if (!filtradas.length) {
        tablaMascotas.innerHTML = `<tr><td colspan="8" class="empty-cell">No hay mascotas para mostrar</td></tr>`;
        return;
    }

    tablaMascotas.innerHTML = filtradas.map(mascota => `
        <tr>
            <td>${obtenerTextoSeguro(mascota.id)}</td>
            <td>${obtenerTextoSeguro(mascota.nombre)}</td>
            <td>${obtenerTextoSeguro(mascota.raza)}</td>
            <td>${obtenerTextoSeguro(mascota.pesoKg)}</td>
            <td>${obtenerTextoSeguro(mascota.edadAnios)}</td>
            <td>${obtenerNombreUsuario(mascota.usuario)}</td>
            <td class="observaciones-cell">${obtenerTextoSeguro(mascota.observaciones)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-warning btn-sm" onclick="abrirEditarMascota(${mascota.id})">Editar</button>
                    <button class="btn btn-danger btn-sm" onclick="eliminarMascota(${mascota.id})">Eliminar</button>
                </div>
            </td>
        </tr>
    `).join("");
}

function pintarReservas() {
    if (!tablaReservas) return;

    const texto = (buscarReservas?.value || "").trim().toLowerCase();
    const estadoFiltro = (filtroEstadoReserva?.value || "").trim().toUpperCase();

    const filtradas = reservasData.filter(reserva => {
        const mascota = obtenerNombreMascota(reserva.mascota).toLowerCase();
        const estado = (reserva.estadoReserva || "").toLowerCase();
        const tipo = (reserva.tipoEstancia || "").toLowerCase();

        const coincideTexto =
            mascota.includes(texto) ||
            estado.includes(texto) ||
            tipo.includes(texto);

        const coincideEstado =
            !estadoFiltro || (reserva.estadoReserva || "").toUpperCase() === estadoFiltro;

        return coincideTexto && coincideEstado;
    });

    if (!filtradas.length) {
        tablaReservas.innerHTML = `<tr><td colspan="11" class="empty-cell">No hay reservas para mostrar</td></tr>`;
        return;
    }

    tablaReservas.innerHTML = filtradas.map(reserva => `
        <tr>
            <td>${obtenerTextoSeguro(reserva.id)}</td>
            <td>${obtenerNombreMascota(reserva.mascota)}</td>
            <td>${formatearFecha(reserva.fechaEntrada)}</td>
            <td>${formatearFecha(reserva.fechaSalida)}</td>
            <td>${obtenerTextoSeguro(reserva.tipoEstancia)}</td>
            <td>${reserva.servicioRecogida ? "Sí" : "No"}</td>
            <td>${reserva.servicioPeluqueria ? "Sí" : "No"}</td>
            <td>${obtenerBadgeEstado(reserva.estadoReserva)}</td>
            <td>${formatearPrecio(reserva.precioTotal)}</td>
            <td class="observaciones-cell">${obtenerTextoSeguro(reserva.observaciones)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-warning btn-sm" onclick="abrirEditarReserva(${reserva.id})">Editar</button>
                    <button class="btn btn-danger btn-sm" onclick="eliminarReserva(${reserva.id})">Eliminar</button>
                </div>
            </td>
        </tr>
    `).join("");
}

function actualizarEstadisticas() {
    if (statUsuarios) statUsuarios.textContent = usuariosData.length;
    if (statMascotas) statMascotas.textContent = mascotasData.length;
    if (statReservas) statReservas.textContent = reservasData.length;

    const pendientes = reservasData.filter(r => (r.estadoReserva || "").toUpperCase() === "PENDIENTE").length;
    if (statPendientes) statPendientes.textContent = pendientes;
}

// ============================
// ACCIONES MASCOTAS
// ============================
window.abrirEditarMascota = function (id) {
    const mascota = mascotasData.find(m => Number(m.id) === Number(id));
    if (!mascota || !modalMascota) return;

    editMascotaId.value = mascota.id || "";
    editMascotaNombre.value = mascota.nombre || "";
    editMascotaRaza.value = mascota.raza || "";
    editMascotaPeso.value = mascota.pesoKg ?? "";
    editMascotaEdad.value = mascota.edadAnios ?? "";
    editMascotaObservaciones.value = mascota.observaciones || "";

    modalMascota.classList.remove("hidden");
};

window.eliminarMascota = async function (id) {
    const confirmado = confirm("¿Seguro que quieres eliminar esta mascota?");
    if (!confirmado) return;

    try {
        const response = await fetchConSesion(`${RUTAS.mascotas}/${id}`, { method: "DELETE" });

        if (!response.ok) {
            const texto = await response.text();
            throw new Error(texto || "No se pudo eliminar la mascota");
        }

        mostrarToast("Mascota eliminada correctamente");
        await cargarMascotas();
        await cargarReservas();
    } catch (error) {
        console.error(error);
        mostrarToast(error.message || "No se pudo eliminar la mascota");
    }
};

if (formEditarMascota) {
    formEditarMascota.addEventListener("submit", async (e) => {
        e.preventDefault();

        const id = editMascotaId.value;
        const mascotaOriginal = mascotasData.find(m => Number(m.id) === Number(id));

        if (!mascotaOriginal) {
            mostrarToast("No se encontró la mascota");
            return;
        }

        const payload = {
            id: Number(id),
            nombre: editMascotaNombre.value.trim(),
            raza: editMascotaRaza.value.trim(),
            pesoKg: editMascotaPeso.value ? Number(editMascotaPeso.value) : null,
            edadAnios: editMascotaEdad.value ? Number(editMascotaEdad.value) : null,
            observaciones: editMascotaObservaciones.value.trim(),
            usuario: mascotaOriginal.usuario
        };

        try {
            const response = await fetchConSesion(`${RUTAS.mascotas}/${id}`, {
                method: "PUT",
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const texto = await response.text();
                throw new Error(texto || "No se pudo actualizar la mascota");
            }

            cerrarModalMascotaFn();
            mostrarToast("Mascota actualizada correctamente");
            await cargarMascotas();
        } catch (error) {
            console.error(error);
            mostrarToast(error.message || "No se pudo actualizar la mascota");
        }
    });
}

// ============================
// ACCIONES RESERVAS
// ============================
window.abrirEditarReserva = function (id) {
    const reserva = reservasData.find(r => Number(r.id) === Number(id));
    if (!reserva || !modalReserva) return;

    editReservaId.value = reserva.id || "";
    editReservaFechaEntrada.value = reserva.fechaEntrada || "";
    editReservaFechaSalida.value = reserva.fechaSalida || "";
    editReservaTipoEstancia.value = reserva.tipoEstancia || "DIA";
    editReservaEstado.value = reserva.estadoReserva || "PENDIENTE";
    editReservaRecogida.checked = !!reserva.servicioRecogida;
    editReservaPeluqueria.checked = !!reserva.servicioPeluqueria;
    editReservaObservaciones.value = reserva.observaciones || "";

    modalReserva.classList.remove("hidden");
};

window.eliminarReserva = async function (id) {
    const confirmado = confirm("¿Seguro que quieres eliminar esta reserva?");
    if (!confirmado) return;

    try {
        const response = await fetchConSesion(`${RUTAS.reservas}/${id}`, { method: "DELETE" });

        if (!response.ok) {
            const texto = await response.text();
            throw new Error(texto || "No se pudo eliminar la reserva");
        }

        mostrarToast("Reserva eliminada correctamente");
        await cargarReservas();
    } catch (error) {
        console.error(error);
        mostrarToast(error.message || "No se pudo eliminar la reserva");
    }
};

if (formEditarReserva) {
    formEditarReserva.addEventListener("submit", async (e) => {
        e.preventDefault();

        const id = editReservaId.value;
        const reservaOriginal = reservasData.find(r => Number(r.id) === Number(id));

        if (!reservaOriginal) {
            mostrarToast("No se encontró la reserva");
            return;
        }

        const payload = {
            id: Number(id),
            fechaEntrada: editReservaFechaEntrada.value,
            fechaSalida: editReservaFechaSalida.value,
            tipoEstancia: editReservaTipoEstancia.value,
            servicioRecogida: editReservaRecogida.checked,
            servicioPeluqueria: editReservaPeluqueria.checked,
            observaciones: editReservaObservaciones.value.trim(),
            estadoReserva: editReservaEstado.value,
            precioTotal: reservaOriginal.precioTotal,
            mascota: reservaOriginal.mascota
        };

        try {
            const response = await fetchConSesion(`${RUTAS.reservas}/${id}`, {
                method: "PUT",
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const texto = await response.text();
                throw new Error(texto || "No se pudo actualizar la reserva");
            }

            cerrarModalReservaFn();
            mostrarToast("Reserva actualizada correctamente");
            await cargarReservas();
        } catch (error) {
            console.error(error);
            mostrarToast(error.message || "No se pudo actualizar la reserva");
        }
    });
}

// ============================
// MODALES
// ============================
function cerrarModalMascotaFn() {
    if (!modalMascota || !formEditarMascota) return;
    modalMascota.classList.add("hidden");
    formEditarMascota.reset();
}

function cerrarModalReservaFn() {
    if (!modalReserva || !formEditarReserva) return;
    modalReserva.classList.add("hidden");
    formEditarReserva.reset();
}

cerrarModalMascota?.addEventListener("click", cerrarModalMascotaFn);
cancelarModalMascota?.addEventListener("click", cerrarModalMascotaFn);
cerrarModalReserva?.addEventListener("click", cerrarModalReservaFn);
cancelarModalReserva?.addEventListener("click", cerrarModalReservaFn);

modalMascota?.addEventListener("click", (e) => {
    if (e.target === modalMascota) cerrarModalMascotaFn();
});

modalReserva?.addEventListener("click", (e) => {
    if (e.target === modalReserva) cerrarModalReservaFn();
});

// ============================
// SESIÓN
// ============================
async function cerrarSesion() {
    try {
        await fetchConSesion(RUTAS.logout, { method: "POST" });
    } catch (error) {
        console.error("Error cerrando sesión:", error);
    } finally {
        window.location.href = "/login.html";
    }
}

btnCerrarSesion?.addEventListener("click", cerrarSesion);

// ============================
// FILTROS
// ============================
buscarUsuarios?.addEventListener("input", pintarUsuarios);
buscarMascotas?.addEventListener("input", pintarMascotas);
buscarReservas?.addEventListener("input", pintarReservas);
filtroEstadoReserva?.addEventListener("change", pintarReservas);

btnActualizarUsuarios?.addEventListener("click", cargarUsuarios);
btnActualizarMascotas?.addEventListener("click", cargarMascotas);
btnActualizarReservas?.addEventListener("click", cargarReservas);
btnRefrescarTodo?.addEventListener("click", cargarTodo);

// ============================
// AUTOREFRESH
// ============================
function iniciarAutoRefreshReservas() {
    if (intervaloReservas) {
        clearInterval(intervaloReservas);
    }

    intervaloReservas = setInterval(() => {
        cargarReservas();
    }, 20000);
}

// ============================
// INIT
// ============================
async function init() {
    console.log("INIT admin");
    const accesoValido = await comprobarSesionAdmin();
    if (!accesoValido) return;

    await cargarTodo();
    iniciarAutoRefreshReservas();
}

init();