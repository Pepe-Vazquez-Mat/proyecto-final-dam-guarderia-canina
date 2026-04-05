const API_BASE = "http://localhost:8081";

const RUTAS = {
    me: `${API_BASE}/api/auth/me`,
    logout: `${API_BASE}/api/auth/logout`,
    clienteMascotas: `${API_BASE}/api/cliente-mascotas`,
    clienteReservas: `${API_BASE}/api/cliente-reservas`
};

const usuarioLogueado = document.getElementById("usuarioLogueado");
const btnLogout = document.getElementById("btnLogout");

const formMascota = document.getElementById("formMascota");
const formReserva = document.getElementById("formReserva");

const btnRecargarMascotas = document.getElementById("btnRecargarMascotas");
const btnRecargarReservas = document.getElementById("btnRecargarReservas");
const btnRefrescarResumen = document.getElementById("btnRefrescarResumen");

const listaMascotas = document.getElementById("listaMascotas");
const listaReservas = document.getElementById("listaReservas");
const zonaMensajes = document.getElementById("zonaMensajes");

const selectMascotaReserva = document.getElementById("selectMascotaReserva");

const nombreMascota = document.getElementById("nombreMascota");
const razaMascota = document.getElementById("razaMascota");
const pesoMascota = document.getElementById("pesoMascota");
const edadMascota = document.getElementById("edadMascota");
const observacionesMascota = document.getElementById("observacionesMascota");
const mascotaIdEditar = document.getElementById("mascotaIdEditar");
const tituloFormMascota = document.getElementById("tituloFormMascota");
const btnGuardarMascota = document.getElementById("btnGuardarMascota");
const btnCancelarEdicionMascota = document.getElementById("btnCancelarEdicionMascota");

const fechaEntrada = document.getElementById("fechaEntrada");
const fechaSalida = document.getElementById("fechaSalida");
const tipoEstancia = document.getElementById("tipoEstancia");
const servicioRecogida = document.getElementById("servicioRecogida");
const servicioPeluqueria = document.getElementById("servicioPeluqueria");
const observacionesReserva = document.getElementById("observacionesReserva");
const reservaIdEditar = document.getElementById("reservaIdEditar");
const tituloFormReserva = document.getElementById("tituloFormReserva");
const btnGuardarReserva = document.getElementById("btnGuardarReserva");
const btnCancelarEdicionReserva = document.getElementById("btnCancelarEdicionReserva");

const contadorTotalReservas = document.getElementById("contadorTotalReservas");
const contadorPendientes = document.getElementById("contadorPendientes");
const contadorConfirmadas = document.getElementById("contadorConfirmadas");
const contadorCanceladas = document.getElementById("contadorCanceladas");
const contadorFinalizadas = document.getElementById("contadorFinalizadas");
const ultimaActualizacion = document.getElementById("ultimaActualizacion");

let mascotasCache = [];
let reservasCache = [];
let mapaEstadosReservas = {};
let intervaloAutoRefresh = null;

function mostrarMensaje(texto, tipo = "info") {
    const div = document.createElement("div");
    div.className = `mensaje ${tipo}`;
    div.textContent = texto;
    zonaMensajes.prepend(div);

    setTimeout(() => {
        div.remove();
    }, 4000);
}

function obtenerHoraActual() {
    return new Date().toLocaleTimeString("es-ES");
}

function actualizarUltimaActualizacion() {
    ultimaActualizacion.textContent = `Última actualización: ${obtenerHoraActual()}`;
}

function normalizarEstado(estado) {
    return (estado || "PENDIENTE").toUpperCase();
}

function obtenerClaseBadgeEstado(estado) {
    const valor = normalizarEstado(estado);

    if (valor === "PENDIENTE") return "estado-pendiente";
    if (valor === "CONFIRMADA") return "estado-confirmada";
    if (valor === "CANCELADA") return "estado-cancelada";
    if (valor === "FINALIZADA") return "estado-finalizada";

    return "estado-default";
}

function obtenerTextoEstado(estado) {
    const valor = normalizarEstado(estado);

    if (valor === "PENDIENTE") {
        return "Tu reserva está pendiente de revisión.";
    }

    if (valor === "CONFIRMADA") {
        return "Tu reserva ha sido confirmada.";
    }

    if (valor === "CANCELADA") {
        return "Tu reserva ha sido cancelada. Si lo necesitas, ponte en contacto con la guardería.";
    }

    if (valor === "FINALIZADA") {
        return "Tu reserva ya ha finalizado.";
    }

    return "Estado de la reserva actualizado.";
}

function obtenerClaseTextoEstado(estado) {
    const valor = normalizarEstado(estado);

    if (valor === "PENDIENTE") return "estado-texto--pendiente";
    if (valor === "CONFIRMADA") return "estado-texto--confirmada";
    if (valor === "CANCELADA") return "estado-texto--cancelada";
    if (valor === "FINALIZADA") return "estado-texto--finalizada";

    return "estado-texto--pendiente";
}

function formatearPrecio(precio) {
    if (precio === null || precio === undefined || precio === "") {
        return "-";
    }

    const numero = Number(precio);
    if (Number.isNaN(numero)) {
        return `${precio} €`;
    }

    return `${numero.toFixed(2)} €`;
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

    if (response.status === 401 || response.status === 403) {
        mostrarMensaje("Tu sesión ha caducado. Vuelve a iniciar sesión.", "error");
        window.location.href = "/login.html";
        throw new Error("Sesión no válida");
    }

    return response;
}

async function comprobarSesion() {
    try {
        const response = await fetchConSesion(RUTAS.me, {
            method: "GET"
        });

        if (!response.ok) {
            throw new Error("No se pudo obtener el usuario autenticado");
        }

        const usuario = await response.json();
        const nombre = usuario.nombre || usuario.email || "Usuario";
        usuarioLogueado.textContent = `Hola, ${nombre}`;
    } catch (error) {
        console.error(error);
        window.location.href = "/login.html";
    }
}

async function cargarMascotas() {
    try {
        const response = await fetchConSesion(RUTAS.clienteMascotas, {
            method: "GET"
        });

        if (!response.ok) {
            throw new Error("Error al cargar mascotas");
        }

        mascotasCache = await response.json();
        renderMascotas();
        renderSelectMascotas();
    } catch (error) {
        console.error(error);
        mostrarMensaje("No se pudieron cargar las mascotas.", "error");
    }
}

function renderMascotas() {
    listaMascotas.innerHTML = "";

    if (!mascotasCache.length) {
        listaMascotas.innerHTML = `<div class="card-item"><p>No tienes mascotas registradas todavía.</p></div>`;
        return;
    }

    mascotasCache.forEach(mascota => {
        const card = document.createElement("div");
        card.className = "card-item";

        card.innerHTML = `
            <h4>${mascota.nombre || "Sin nombre"}</h4>
            <p><strong>Raza:</strong> ${mascota.raza || "-"}</p>
            <p><strong>Peso:</strong> ${mascota.pesoKg ?? "-"} kg</p>
            <p><strong>Edad:</strong> ${mascota.edadAnios ?? "-"} años</p>
            <p><strong>Observaciones:</strong> ${mascota.observaciones || "-"}</p>
            <div class="card-actions">
                <button class="btn btn-warning" data-id="${mascota.id}" data-action="editar-mascota">Editar</button>
                <button class="btn btn-danger" data-id="${mascota.id}" data-action="eliminar-mascota">Eliminar</button>
            </div>
        `;

        listaMascotas.appendChild(card);
    });
}

function renderSelectMascotas() {
    const mascotaSeleccionada = selectMascotaReserva.value;
    selectMascotaReserva.innerHTML = `<option value="">Selecciona una mascota</option>`;

    mascotasCache.forEach(mascota => {
        const option = document.createElement("option");
        option.value = mascota.id;
        option.textContent = mascota.nombre;
        selectMascotaReserva.appendChild(option);
    });

    if (mascotaSeleccionada) {
        selectMascotaReserva.value = mascotaSeleccionada;
    }
}

async function guardarMascota(event) {
    event.preventDefault();

    const idEdicion = mascotaIdEditar.value;

    const body = {
        nombre: nombreMascota.value.trim(),
        raza: razaMascota.value.trim(),
        pesoKg: pesoMascota.value ? parseFloat(pesoMascota.value) : null,
        edadAnios: edadMascota.value ? parseInt(edadMascota.value) : null,
        observaciones: observacionesMascota.value.trim()
    };

    try {
        let response;

        if (idEdicion) {
            response = await fetchConSesion(`${RUTAS.clienteMascotas}/${idEdicion}`, {
                method: "PUT",
                body: JSON.stringify(body)
            });
        } else {
            response = await fetchConSesion(RUTAS.clienteMascotas, {
                method: "POST",
                body: JSON.stringify(body)
            });
        }

        if (!response.ok) {
            const texto = await response.text();
            throw new Error(texto || "No se pudo guardar la mascota");
        }

        mostrarMensaje(idEdicion ? "Mascota actualizada correctamente." : "Mascota guardada correctamente.", "ok");
        resetFormularioMascota();
        await cargarMascotas();
    } catch (error) {
        console.error(error);
        mostrarMensaje(`Error al guardar la mascota: ${error.message}`, "error");
    }
}

function editarMascota(id) {
    const mascota = mascotasCache.find(m => String(m.id) === String(id));

    if (!mascota) {
        mostrarMensaje("Mascota no encontrada para editar.", "error");
        return;
    }

    mascotaIdEditar.value = mascota.id;
    nombreMascota.value = mascota.nombre || "";
    razaMascota.value = mascota.raza || "";
    pesoMascota.value = mascota.pesoKg ?? "";
    edadMascota.value = mascota.edadAnios ?? "";
    observacionesMascota.value = mascota.observaciones || "";

    tituloFormMascota.textContent = "Editar mascota";
    btnGuardarMascota.textContent = "Actualizar mascota";
    btnCancelarEdicionMascota.classList.remove("oculto");

    window.scrollTo({ top: 0, behavior: "smooth" });
}

function resetFormularioMascota() {
    formMascota.reset();
    mascotaIdEditar.value = "";
    tituloFormMascota.textContent = "Mis mascotas";
    btnGuardarMascota.textContent = "Guardar mascota";
    btnCancelarEdicionMascota.classList.add("oculto");
}

async function eliminarMascota(id) {
    if (!confirm("¿Seguro que quieres eliminar esta mascota?")) {
        return;
    }

    try {
        const response = await fetchConSesion(`${RUTAS.clienteMascotas}/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            const texto = await response.text();
            throw new Error(texto || "No se pudo eliminar la mascota");
        }

        mostrarMensaje("Mascota eliminada correctamente.", "ok");
        resetFormularioMascota();
        await cargarMascotas();
        await cargarReservas(false);
    } catch (error) {
        console.error(error);
        mostrarMensaje(`No se pudo eliminar la mascota: ${error.message}`, "error");
    }
}

async function cargarReservas(mostrarAvisosCambio = true) {
    try {
        const response = await fetchConSesion(RUTAS.clienteReservas, {
            method: "GET"
        });

        if (!response.ok) {
            throw new Error("Error al cargar reservas");
        }

        const nuevasReservas = await response.json();

        if (mostrarAvisosCambio) {
            detectarCambiosDeEstado(nuevasReservas);
        }

        reservasCache = nuevasReservas;
        renderReservas();
        renderResumenReservas();
        actualizarUltimaActualizacion();
        reconstruirMapaEstados();
    } catch (error) {
        console.error(error);
        mostrarMensaje("No se pudieron cargar las reservas.", "error");
    }
}

function detectarCambiosDeEstado(nuevasReservas) {
    nuevasReservas.forEach(reserva => {
        const id = String(reserva.id);
        const nuevoEstado = normalizarEstado(reserva.estadoReserva);
        const estadoAnterior = mapaEstadosReservas[id];

        if (estadoAnterior && estadoAnterior !== nuevoEstado) {
            if (nuevoEstado === "CONFIRMADA") {
                mostrarMensaje(`La reserva #${reserva.id} ha sido confirmada.`, "aviso");
            } else if (nuevoEstado === "CANCELADA") {
                mostrarMensaje(`La reserva #${reserva.id} ha sido cancelada.`, "aviso");
            } else if (nuevoEstado === "FINALIZADA") {
                mostrarMensaje(`La reserva #${reserva.id} ha pasado a finalizada.`, "info");
            } else {
                mostrarMensaje(`La reserva #${reserva.id} ha cambiado de estado a ${nuevoEstado}.`, "info");
            }
        }
    });
}

function reconstruirMapaEstados() {
    mapaEstadosReservas = {};

    reservasCache.forEach(reserva => {
        mapaEstadosReservas[String(reserva.id)] = normalizarEstado(reserva.estadoReserva);
    });
}

function renderResumenReservas() {
    const total = reservasCache.length;
    const pendientes = reservasCache.filter(r => normalizarEstado(r.estadoReserva) === "PENDIENTE").length;
    const confirmadas = reservasCache.filter(r => normalizarEstado(r.estadoReserva) === "CONFIRMADA").length;
    const canceladas = reservasCache.filter(r => normalizarEstado(r.estadoReserva) === "CANCELADA").length;
    const finalizadas = reservasCache.filter(r => normalizarEstado(r.estadoReserva) === "FINALIZADA").length;

    contadorTotalReservas.textContent = total;
    contadorPendientes.textContent = pendientes;
    contadorConfirmadas.textContent = confirmadas;
    contadorCanceladas.textContent = canceladas;
    contadorFinalizadas.textContent = finalizadas;
}

function renderReservas() {
    listaReservas.innerHTML = "";

    if (!reservasCache.length) {
        listaReservas.innerHTML = `<div class="card-item"><p>No tienes reservas registradas todavía.</p></div>`;
        return;
    }

    reservasCache.forEach(reserva => {
        const nombreMascotaReserva = reserva.mascota?.nombre || `Mascota ID ${reserva.mascota?.id || "-"}`;
        cardHtmlReserva(reserva, nombreMascotaReserva);
    });
}

function cardHtmlReserva(reserva, nombreMascotaReserva) {
    const estado = normalizarEstado(reserva.estadoReserva);

    const card = document.createElement("div");
    card.className = "card-item";

    card.innerHTML = `
        <div class="card-header-reserva">
            <h4>Reserva #${reserva.id}</h4>
            <span class="estado-badge ${obtenerClaseBadgeEstado(estado)}">${estado}</span>
        </div>
        <p><strong>Mascota:</strong> ${nombreMascotaReserva}</p>
        <p><strong>Fecha entrada:</strong> ${reserva.fechaEntrada || "-"}</p>
        <p><strong>Fecha salida:</strong> ${reserva.fechaSalida || "-"}</p>
        <p><strong>Tipo estancia:</strong> ${reserva.tipoEstancia || "-"}</p>
        <p><strong>Recogida:</strong> ${reserva.servicioRecogida ? "Sí" : "No"}</p>
        <p><strong>Peluquería:</strong> ${reserva.servicioPeluqueria ? "Sí" : "No"}</p>
        <p><strong>Precio total:</strong> ${formatearPrecio(reserva.precioTotal)}</p>
        <p><strong>Observaciones:</strong> ${reserva.observaciones || "-"}</p>
        <div class="estado-texto ${obtenerClaseTextoEstado(estado)}">
            ${obtenerTextoEstado(estado)}
        </div>
        <div class="card-actions">
            <button class="btn btn-warning" data-id="${reserva.id}" data-action="editar-reserva">Editar</button>
            <button class="btn btn-danger" data-id="${reserva.id}" data-action="eliminar-reserva">Eliminar</button>
        </div>
    `;

    listaReservas.appendChild(card);
}

async function guardarReserva(event) {
    event.preventDefault();

    const idEdicion = reservaIdEditar.value;
    const mascotaId = selectMascotaReserva.value;

    if (!mascotaId && !idEdicion) {
        mostrarMensaje("Debes seleccionar una mascota.", "error");
        return;
    }

    if (!fechaEntrada.value || !fechaSalida.value) {
        mostrarMensaje("Debes indicar fecha de entrada y salida.", "error");
        return;
    }

    if (fechaSalida.value < fechaEntrada.value) {
        mostrarMensaje("La fecha de salida no puede ser anterior a la de entrada.", "error");
        return;
    }

    if (!tipoEstancia.value) {
        mostrarMensaje("Debes seleccionar el tipo de estancia.", "error");
        return;
    }

    const body = {
        fechaEntrada: fechaEntrada.value,
        fechaSalida: fechaSalida.value,
        tipoEstancia: tipoEstancia.value,
        servicioRecogida: servicioRecogida.checked,
        servicioPeluqueria: servicioPeluqueria.checked,
        observaciones: observacionesReserva.value.trim()
    };

    try {
        let response;

        if (idEdicion) {
            response = await fetchConSesion(`${RUTAS.clienteReservas}/${idEdicion}`, {
                method: "PUT",
                body: JSON.stringify(body)
            });
        } else {
            response = await fetchConSesion(`${RUTAS.clienteReservas}/mascota/${mascotaId}`, {
                method: "POST",
                body: JSON.stringify(body)
            });
        }

        if (!response.ok) {
            const texto = await response.text();
            throw new Error(texto || "No se pudo guardar la reserva");
        }

        mostrarMensaje(idEdicion ? "Reserva actualizada correctamente." : "Reserva creada correctamente.", "ok");
        resetFormularioReserva();
        await cargarReservas(false);
    } catch (error) {
        console.error(error);
        mostrarMensaje(`Error al guardar la reserva: ${error.message}`, "error");
    }
}

function editarReserva(id) {
    const reserva = reservasCache.find(r => String(r.id) === String(id));

    if (!reserva) {
        mostrarMensaje("Reserva no encontrada para editar.", "error");
        return;
    }

    reservaIdEditar.value = reserva.id;
    selectMascotaReserva.value = reserva.mascota?.id || "";
    selectMascotaReserva.disabled = true;
    fechaEntrada.value = reserva.fechaEntrada || "";
    fechaSalida.value = reserva.fechaSalida || "";
    tipoEstancia.value = reserva.tipoEstancia || "";
    servicioRecogida.checked = !!reserva.servicioRecogida;
    servicioPeluqueria.checked = !!reserva.servicioPeluqueria;
    observacionesReserva.value = reserva.observaciones || "";

    tituloFormReserva.textContent = "Editar reserva";
    btnGuardarReserva.textContent = "Actualizar reserva";
    btnCancelarEdicionReserva.classList.remove("oculto");

    window.scrollTo({ top: document.body.scrollHeight / 3, behavior: "smooth" });
}

function resetFormularioReserva() {
    formReserva.reset();
    reservaIdEditar.value = "";
    selectMascotaReserva.disabled = false;
    tituloFormReserva.textContent = "Mis reservas";
    btnGuardarReserva.textContent = "Crear reserva";
    btnCancelarEdicionReserva.classList.add("oculto");
}

async function eliminarReserva(id) {
    if (!confirm("¿Seguro que quieres eliminar esta reserva?")) {
        return;
    }

    try {
        const response = await fetchConSesion(`${RUTAS.clienteReservas}/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            const texto = await response.text();
            throw new Error(texto || "No se pudo eliminar la reserva");
        }

        mostrarMensaje("Reserva eliminada correctamente.", "ok");
        resetFormularioReserva();
        await cargarReservas(false);
    } catch (error) {
        console.error(error);
        mostrarMensaje(`No se pudo eliminar la reserva: ${error.message}`, "error");
    }
}

async function cerrarSesion() {
    try {
        const response = await fetchConSesion(RUTAS.logout, {
            method: "POST"
        });

        if (!response.ok) {
            throw new Error("No se pudo cerrar sesión");
        }

        window.location.href = "/login.html";
    } catch (error) {
        console.error(error);
        mostrarMensaje("Error al cerrar sesión.", "error");
    }
}

function escucharAccionesDinamicas() {
    document.addEventListener("click", async (event) => {
        const action = event.target.dataset.action;
        const id = event.target.dataset.id;

        if (!action || !id) {
            return;
        }

        if (action === "editar-mascota") {
            editarMascota(id);
        }

        if (action === "eliminar-mascota") {
            await eliminarMascota(id);
        }

        if (action === "editar-reserva") {
            editarReserva(id);
        }

        if (action === "eliminar-reserva") {
            await eliminarReserva(id);
        }
    });
}

function iniciarAutoRefreshReservas() {
    if (intervaloAutoRefresh) {
        clearInterval(intervaloAutoRefresh);
    }

    intervaloAutoRefresh = setInterval(async () => {
        await cargarReservas(true);
    }, 20000);
}

async function init() {
    await comprobarSesion();
    await cargarMascotas();
    await cargarReservas(false);
    escucharAccionesDinamicas();
    iniciarAutoRefreshReservas();
}

formMascota.addEventListener("submit", guardarMascota);
formReserva.addEventListener("submit", guardarReserva);
btnRecargarMascotas.addEventListener("click", cargarMascotas);
btnRecargarReservas.addEventListener("click", () => cargarReservas(true));
btnRefrescarResumen.addEventListener("click", () => cargarReservas(true));
btnLogout.addEventListener("click", cerrarSesion);
btnCancelarEdicionMascota.addEventListener("click", resetFormularioMascota);
btnCancelarEdicionReserva.addEventListener("click", resetFormularioReserva);

init();