const API_BASE = "http://localhost:8081";

const RUTAS = {
    me: `${API_BASE}/api/auth/me`,
    actualizarPerfil: `${API_BASE}/api/auth/me`,
    logout: `${API_BASE}/api/auth/logout`,
    clienteMascotas: `${API_BASE}/api/cliente-mascotas`,
    clienteReservas: `${API_BASE}/api/cliente-reservas`,
    ocupacion: `${API_BASE}/api/ocupacion`
};

const usuarioLogueado = document.getElementById("usuarioLogueado");
const btnLogout = document.getElementById("btnLogout");

const perfilResumen = document.getElementById("perfilResumen");
const perfilResumenNombre = document.getElementById("perfilResumenNombre");
const perfilResumenEmail = document.getElementById("perfilResumenEmail");
const perfilResumenTelefono = document.getElementById("perfilResumenTelefono");
const btnEditarPerfil = document.getElementById("btnEditarPerfil");
const btnCancelarPerfil = document.getElementById("btnCancelarPerfil");

const formPerfil = document.getElementById("formPerfil");
const perfilNombre = document.getElementById("perfilNombre");
const perfilApellidos = document.getElementById("perfilApellidos");
const perfilEmail = document.getElementById("perfilEmail");
const perfilTelefono = document.getElementById("perfilTelefono");

const formMascota = document.getElementById("formMascota");
const formReserva = document.getElementById("formReserva");

const btnRecargarMascotas = document.getElementById("btnRecargarMascotas");
const btnRecargarReservas = document.getElementById("btnRecargarReservas");
const btnRefrescarResumen = document.getElementById("btnRefrescarResumen");
const btnMostrarTodasReservas = document.getElementById("btnMostrarTodasReservas");
const filtroReservasCliente = document.getElementById("filtroReservasCliente");

const listaMascotas = document.getElementById("listaMascotas");
const listaReservas = document.getElementById("listaReservas");
const zonaMensajes = document.getElementById("zonaMensajes");
const panelReservasCliente = document.getElementById("panelReservasCliente");
const textoFiltroReservas = document.getElementById("textoFiltroReservas");

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

const precioTipoEstancia = document.getElementById("precioTipoEstancia");
const precioDias = document.getElementById("precioDias");
const precioBase = document.getElementById("precioBase");
const precioRecogida = document.getElementById("precioRecogida");
const precioPeluqueria = document.getElementById("precioPeluqueria");
const precioTotalEstimado = document.getElementById("precioTotalEstimado");

const ocupacionReserva = document.getElementById("ocupacionReserva");
const ocupacionMensaje = document.getElementById("ocupacionMensaje");
const ocupacionPlazasDisponibles = document.getElementById("ocupacionPlazasDisponibles");
const ocupacionMaxima = document.getElementById("ocupacionMaxima");
const ocupacionCapacidad = document.getElementById("ocupacionCapacidad");
const ocupacionFechaMasOcupada = document.getElementById("ocupacionFechaMasOcupada");

let mascotasCache = [];
let reservasCache = [];
let mapaEstadosReservas = {};
let intervaloAutoRefresh = null;
let intervaloOcupacion = null;
let filtroEstadoActual = "TODAS";

function mostrarMensaje(texto, tipo = "info") {
    const div = document.createElement("div");
    div.className = `mensaje ${tipo}`;
    div.textContent = texto;
    zonaMensajes.prepend(div);

    setTimeout(() => {
        div.remove();
    }, 4000);
}

function obtenerHoyISO() {
    return new Date().toISOString().split("T")[0];
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

function normalizarTipoEstancia(tipo) {
    const valor = (tipo || "").toUpperCase().trim();

    if (valor === "DIA" || valor === "GUARDERIA" || valor === "GUARDERIA_DIA") {
        return "GUARDERIA_DIA";
    }

    if (valor === "LARGA_ESTANCIA" || valor === "ESTANCIA_LARGA" || valor === "ESTANCIA") {
        return "ESTANCIA";
    }

    return valor;
}

function obtenerTextoTipoEstancia(tipo) {
    const valor = normalizarTipoEstancia(tipo);

    if (valor === "GUARDERIA_DIA") return "Guardería diaria sin pernocta";
    if (valor === "ESTANCIA") return "Estancia con pernocta";

    return tipo || "-";
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

    if (valor === "PENDIENTE") return "Tu reserva está pendiente de revisión.";
    if (valor === "CONFIRMADA") return "Tu reserva ha sido confirmada.";
    if (valor === "CANCELADA") return "Tu reserva ha sido cancelada.";
    if (valor === "FINALIZADA") return "Tu reserva ya ha finalizado.";

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
    if (precio === null || precio === undefined || precio === "") return "-";

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

/* PERFIL */

function mostrarFormularioPerfil() {
    perfilResumen.classList.add("oculto");
    formPerfil.classList.remove("oculto");
}

function ocultarFormularioPerfil() {
    formPerfil.classList.add("oculto");
    perfilResumen.classList.remove("oculto");
}

async function cargarPerfil() {
    try {
        const response = await fetchConSesion(RUTAS.me, {
            method: "GET"
        });

        if (!response.ok) {
            throw new Error("No se pudo obtener el usuario autenticado");
        }

        const usuario = await response.json();

        perfilNombre.value = usuario.nombre || "";
        perfilApellidos.value = usuario.apellidos || "";
        perfilEmail.value = usuario.email || "";
        perfilTelefono.value = usuario.telefono || "";

        const nombreCompleto = `${usuario.nombre || ""} ${usuario.apellidos || ""}`.trim() || "Usuario";

        perfilResumenNombre.textContent = nombreCompleto;
        perfilResumenEmail.textContent = usuario.email || "-";
        perfilResumenTelefono.textContent = usuario.telefono || "No indicado";

        usuarioLogueado.textContent = `Hola, ${usuario.nombre || usuario.email || "Usuario"}`;
    } catch (error) {
        console.error(error);
        window.location.href = "/login.html";
    }
}

async function guardarPerfil(event) {
    event.preventDefault();

    const body = {
        nombre: perfilNombre.value.trim(),
        apellidos: perfilApellidos.value.trim(),
        telefono: perfilTelefono.value.trim()
    };

    try {
        const response = await fetchConSesion(RUTAS.actualizarPerfil, {
            method: "PUT",
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const texto = await response.text();
            throw new Error(texto || "No se pudo actualizar el perfil");
        }

        mostrarMensaje("Perfil actualizado correctamente.", "ok");
        await cargarPerfil();
        ocultarFormularioPerfil();
    } catch (error) {
        console.error(error);
        mostrarMensaje(`Error al actualizar perfil: ${error.message}`, "error");
    }
}

/* MASCOTAS */

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

/* RESERVAS */

function calcularDiasReserva() {
    if (!fechaEntrada.value || !fechaSalida.value) return 0;

    const entrada = new Date(fechaEntrada.value);
    const salida = new Date(fechaSalida.value);

    if (salida < entrada) return 0;

    const diferenciaMs = salida - entrada;
    const dias = Math.floor(diferenciaMs / (1000 * 60 * 60 * 24)) + 1;

    return dias < 1 ? 1 : dias;
}

function actualizarResumenPrecio() {
    const tipo = normalizarTipoEstancia(tipoEstancia.value);
    const dias = calcularDiasReserva();

    let precioDia = 0;
    let textoTipo = "-";

    if (tipo === "GUARDERIA_DIA") {
        precioDia = 18;
        textoTipo = "Guardería diaria sin pernocta";
    }

    if (tipo === "ESTANCIA") {
        precioDia = 25;
        textoTipo = "Estancia con pernocta";
    }

    const subtotal = dias > 0 ? precioDia * dias : 0;
    const transporte = servicioRecogida.checked ? 10 : 0;
    const peluqueria = servicioPeluqueria.checked ? 15 : 0;
    const total = subtotal + transporte + peluqueria;

    precioTipoEstancia.textContent = textoTipo;
    precioDias.textContent = dias > 0 ? `${dias} día(s)` : "-";
    precioBase.textContent = dias > 0 && precioDia > 0 ? `${precioDia} € x ${dias} = ${subtotal.toFixed(2)} €` : "-";
    precioRecogida.textContent = `${transporte.toFixed(2)} €`;
    precioPeluqueria.textContent = `${peluqueria.toFixed(2)} €`;
    precioTotalEstimado.textContent = `${total.toFixed(2)} €`;
}

function pintarOcupacionInicial() {
    ocupacionReserva.className = "ocupacion-resumen ocupacion-neutral";
    ocupacionMensaje.textContent = "Selecciona fecha de entrada y salida para consultar plazas.";
    ocupacionPlazasDisponibles.textContent = "-";
    ocupacionMaxima.textContent = "-";
    ocupacionCapacidad.textContent = "40";
    ocupacionFechaMasOcupada.textContent = "";
}

async function consultarOcupacionReserva() {
    if (!fechaEntrada.value || !fechaSalida.value) {
        pintarOcupacionInicial();
        return;
    }

    if (fechaSalida.value < fechaEntrada.value) {
        ocupacionReserva.className = "ocupacion-resumen ocupacion-error";
        ocupacionMensaje.textContent = "La fecha de salida no puede ser anterior a la fecha de entrada.";
        ocupacionPlazasDisponibles.textContent = "-";
        ocupacionMaxima.textContent = "-";
        ocupacionFechaMasOcupada.textContent = "";
        return;
    }

    try {
        const url = `${RUTAS.ocupacion}?fechaEntrada=${fechaEntrada.value}&fechaSalida=${fechaSalida.value}`;

        const response = await fetchConSesion(url, {
            method: "GET"
        });

        if (!response.ok) {
            const texto = await response.text();
            throw new Error(texto || "No se pudo consultar la ocupación");
        }

        const data = await response.json();

        ocupacionPlazasDisponibles.textContent = data.plazasDisponibles;
        ocupacionMaxima.textContent = data.ocupacionMaxima;
        ocupacionCapacidad.textContent = data.capacidadMaxima;
        ocupacionMensaje.textContent = data.mensaje || "Consulta de ocupación realizada.";

        ocupacionFechaMasOcupada.textContent = data.fechaMasOcupada
            ? `Fecha con mayor ocupación en el rango: ${data.fechaMasOcupada}.`
            : "";

        ocupacionReserva.className = data.hayPlazas
            ? "ocupacion-resumen ocupacion-ok"
            : "ocupacion-resumen ocupacion-error";

    } catch (error) {
        console.error(error);
        ocupacionReserva.className = "ocupacion-resumen ocupacion-error";
        ocupacionMensaje.textContent = "No se pudo consultar la disponibilidad.";
        ocupacionPlazasDisponibles.textContent = "-";
        ocupacionMaxima.textContent = "-";
        ocupacionFechaMasOcupada.textContent = "";
    }
}

function inicializarRestriccionesFechas() {
    const hoy = obtenerHoyISO();

    fechaEntrada.min = hoy;
    fechaSalida.min = hoy;

    fechaEntrada.addEventListener("change", async () => {
        fechaSalida.min = fechaEntrada.value || hoy;

        if (fechaSalida.value && fechaSalida.value < fechaEntrada.value) {
            fechaSalida.value = fechaEntrada.value;
        }

        actualizarResumenPrecio();
        await consultarOcupacionReserva();
    });

    fechaSalida.addEventListener("change", async () => {
        actualizarResumenPrecio();
        await consultarOcupacionReserva();
    });

    tipoEstancia.addEventListener("change", actualizarResumenPrecio);
    servicioRecogida.addEventListener("change", actualizarResumenPrecio);
    servicioPeluqueria.addEventListener("change", actualizarResumenPrecio);
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
        await consultarOcupacionReserva();
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
            mostrarMensaje(`La reserva #${reserva.id} ha cambiado a ${nuevoEstado}.`, "aviso");
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
    contadorTotalReservas.textContent = reservasCache.length;
    contadorPendientes.textContent = reservasCache.filter(r => normalizarEstado(r.estadoReserva) === "PENDIENTE").length;
    contadorConfirmadas.textContent = reservasCache.filter(r => normalizarEstado(r.estadoReserva) === "CONFIRMADA").length;
    contadorCanceladas.textContent = reservasCache.filter(r => normalizarEstado(r.estadoReserva) === "CANCELADA").length;
    contadorFinalizadas.textContent = reservasCache.filter(r => normalizarEstado(r.estadoReserva) === "FINALIZADA").length;
}

function obtenerReservasFiltradas() {
    if (filtroEstadoActual === "TODAS") {
        return reservasCache;
    }

    return reservasCache.filter(reserva => normalizarEstado(reserva.estadoReserva) === filtroEstadoActual);
}

function actualizarTextoFiltroReservas() {
    if (filtroEstadoActual === "TODAS") {
        textoFiltroReservas.textContent = "Mostrando todas tus reservas.";
        btnMostrarTodasReservas.classList.add("oculto");
        filtroReservasCliente.value = "TODAS";
        return;
    }

    textoFiltroReservas.textContent = `Mostrando reservas con estado: ${filtroEstadoActual}.`;
    btnMostrarTodasReservas.classList.remove("oculto");
    filtroReservasCliente.value = filtroEstadoActual;
}

function renderReservas() {
    listaReservas.innerHTML = "";

    actualizarTextoFiltroReservas();

    const reservasAMostrar = obtenerReservasFiltradas();

    if (!reservasAMostrar.length) {
        const texto = filtroEstadoActual === "TODAS"
            ? "No tienes reservas registradas todavía."
            : `No tienes reservas con estado ${filtroEstadoActual}.`;

        listaReservas.innerHTML = `<div class="card-item"><p>${texto}</p></div>`;
        return;
    }

    reservasAMostrar.forEach(reserva => {
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
        <p><strong>Tipo estancia:</strong> ${obtenerTextoTipoEstancia(reserva.tipoEstancia)}</p>
        <p><strong>Transporte recogida/entrega:</strong> ${reserva.servicioRecogida ? "Sí" : "No"}</p>
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

function aplicarFiltroReservas(estado) {
    filtroEstadoActual = estado || "TODAS";
    renderReservas();

    panelReservasCliente.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
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

    const hoy = obtenerHoyISO();

    if (fechaEntrada.value < hoy) {
        mostrarMensaje("No puedes reservar fechas pasadas.", "error");
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
        tipoEstancia: normalizarTipoEstancia(tipoEstancia.value),
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
        filtroEstadoActual = "TODAS";
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
    tipoEstancia.value = normalizarTipoEstancia(reserva.tipoEstancia);
    servicioRecogida.checked = !!reserva.servicioRecogida;
    servicioPeluqueria.checked = !!reserva.servicioPeluqueria;
    observacionesReserva.value = reserva.observaciones || "";

    tituloFormReserva.textContent = "Editar reserva";
    btnGuardarReserva.textContent = "Actualizar reserva";
    btnCancelarEdicionReserva.classList.remove("oculto");

    actualizarResumenPrecio();
    consultarOcupacionReserva();

    panelReservasCliente.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

function resetFormularioReserva() {
    formReserva.reset();
    reservaIdEditar.value = "";
    selectMascotaReserva.disabled = false;
    tituloFormReserva.textContent = "Mis reservas";
    btnGuardarReserva.textContent = "Crear reserva";
    btnCancelarEdicionReserva.classList.add("oculto");

    const hoy = obtenerHoyISO();
    fechaEntrada.min = hoy;
    fechaSalida.min = hoy;

    actualizarResumenPrecio();
    pintarOcupacionInicial();
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

/* SESIÓN / EVENTOS */

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
        const filtroReserva = event.target.closest("[data-filtro-reserva]");

        if (filtroReserva) {
            aplicarFiltroReservas(filtroReserva.dataset.filtroReserva);
            return;
        }

        if (!action || !id) return;

        if (action === "editar-mascota") editarMascota(id);
        if (action === "eliminar-mascota") await eliminarMascota(id);
        if (action === "editar-reserva") editarReserva(id);
        if (action === "eliminar-reserva") await eliminarReserva(id);
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

function iniciarAutoRefreshOcupacion() {
    if (intervaloOcupacion) {
        clearInterval(intervaloOcupacion);
    }

    intervaloOcupacion = setInterval(async () => {
        await consultarOcupacionReserva();
    }, 20000);
}

async function init() {
    inicializarRestriccionesFechas();
    actualizarResumenPrecio();
    pintarOcupacionInicial();

    await cargarPerfil();
    await cargarMascotas();
    await cargarReservas(false);

    escucharAccionesDinamicas();
    iniciarAutoRefreshReservas();
    iniciarAutoRefreshOcupacion();
}

formPerfil.addEventListener("submit", guardarPerfil);
formMascota.addEventListener("submit", guardarMascota);
formReserva.addEventListener("submit", guardarReserva);

btnEditarPerfil.addEventListener("click", mostrarFormularioPerfil);
btnCancelarPerfil.addEventListener("click", ocultarFormularioPerfil);

btnRecargarMascotas.addEventListener("click", cargarMascotas);
btnRecargarReservas.addEventListener("click", () => cargarReservas(true));
btnRefrescarResumen.addEventListener("click", () => cargarReservas(true));
btnLogout.addEventListener("click", cerrarSesion);
btnCancelarEdicionMascota.addEventListener("click", resetFormularioMascota);
btnCancelarEdicionReserva.addEventListener("click", resetFormularioReserva);
btnMostrarTodasReservas.addEventListener("click", () => aplicarFiltroReservas("TODAS"));

filtroReservasCliente.addEventListener("change", () => {
    aplicarFiltroReservas(filtroReservasCliente.value);
});

init();