const API_MASCOTAS = "http://localhost:8081/api/cliente-mascotas";
const API_RESERVAS = "http://localhost:8081/api/cliente-reservas";

const saludoUsuario = document.getElementById("saludoUsuario");
const btnCerrarSesion = document.getElementById("btnCerrarSesion");

const formMascota = document.getElementById("formMascota");
const mascotaIdInput = document.getElementById("mascotaId");
const nombreMascotaInput = document.getElementById("nombreMascota");
const razaMascotaInput = document.getElementById("razaMascota");
const pesoMascotaInput = document.getElementById("pesoMascota");
const edadMascotaInput = document.getElementById("edadMascota");
const observacionesMascotaInput = document.getElementById("observacionesMascota");
const tituloFormularioMascota = document.getElementById("tituloFormularioMascota");
const btnGuardarMascota = document.getElementById("btnGuardarMascota");
const btnCancelarEdicion = document.getElementById("btnCancelarEdicion");
const mensajeMascota = document.getElementById("mensajeMascota");
const contenedorMascotas = document.getElementById("contenedorMascotas");

const formReserva = document.getElementById("formReserva");
const mascotaReservaSelect = document.getElementById("mascotaReserva");
const fechaEntradaInput = document.getElementById("fechaEntrada");
const fechaSalidaInput = document.getElementById("fechaSalida");
const tipoReservaInput = document.getElementById("tipoReserva");
const observacionesReservaInput = document.getElementById("observacionesReserva");
const mensajeReserva = document.getElementById("mensajeReserva");
const contenedorReservas = document.getElementById("contenedorReservas");

const usuarioLogueado = JSON.parse(localStorage.getItem("usuarioLogueado"));

if (!usuarioLogueado || !usuarioLogueado.id) {
    window.location.href = "login.html";
}

saludoUsuario.textContent = `Bienvenido, ${usuarioLogueado.nombre || "cliente"}`;

document.addEventListener("DOMContentLoaded", () => {
    cargarMascotas();
    cargarReservas();
});

btnCerrarSesion.addEventListener("click", () => {
    localStorage.removeItem("usuarioLogueado");
    window.location.href = "login.html";
});

btnCancelarEdicion.addEventListener("click", () => {
    resetearFormularioMascota();
});

formMascota.addEventListener("submit", async (e) => {
    e.preventDefault();

    const mascota = {
        nombre: nombreMascotaInput.value.trim(),
        raza: razaMascotaInput.value.trim(),
        pesoKg: pesoMascotaInput.value ? parseFloat(pesoMascotaInput.value) : null,
        edadAnios: edadMascotaInput.value ? parseInt(edadMascotaInput.value) : null,
        observaciones: observacionesMascotaInput.value.trim()
    };

    if (!mascota.nombre) {
        mostrarMensaje(mensajeMascota, "El nombre de la mascota es obligatorio.", "error");
        return;
    }

    try {
        const idMascota = mascotaIdInput.value;

        if (idMascota) {
            await actualizarMascota(idMascota, mascota);
            mostrarMensaje(mensajeMascota, "Mascota actualizada correctamente.", "ok");
        } else {
            await crearMascota(mascota);
            mostrarMensaje(mensajeMascota, "Mascota creada correctamente.", "ok");
        }

        resetearFormularioMascota();
        await cargarMascotas();
        await cargarReservas();

    } catch (error) {
        mostrarMensaje(mensajeMascota, error.message || "Error al guardar la mascota.", "error");
    }
});

formReserva.addEventListener("submit", async (e) => {
    e.preventDefault();

    const mascotaId = mascotaReservaSelect.value;
    const fechaEntrada = fechaEntradaInput.value;
    const fechaSalida = fechaSalidaInput.value;

    if (!mascotaId) {
        mostrarMensaje(mensajeReserva, "Debes seleccionar una mascota.", "error");
        return;
    }

    if (!fechaEntrada || !fechaSalida) {
        mostrarMensaje(mensajeReserva, "Debes indicar fecha de entrada y salida.", "error");
        return;
    }

    if (fechaSalida < fechaEntrada) {
        mostrarMensaje(mensajeReserva, "La fecha de salida no puede ser anterior a la fecha de entrada.", "error");
        return;
    }

    const reserva = {
        fechaEntrada: fechaEntrada,
        fechaSalida: fechaSalida,
        tipoReserva: tipoReservaInput.value,
        observaciones: observacionesReservaInput.value.trim(),
        estadoReserva: "PENDIENTE"
    };

    try {
        await crearReserva(mascotaId, reserva);
        formReserva.reset();
        mostrarMensaje(mensajeReserva, "Reserva creada correctamente.", "ok");
        await cargarReservas();
    } catch (error) {
        mostrarMensaje(mensajeReserva, error.message || "Error al crear la reserva.", "error");
    }
});

async function cargarMascotas() {
    contenedorMascotas.innerHTML = `<p class="texto-suave">Cargando mascotas...</p>`;

    try {
        const response = await fetch(`${API_MASCOTAS}/usuario/${usuarioLogueado.id}`);

        if (!response.ok) {
            throw new Error("No se pudieron cargar las mascotas.");
        }

        const mascotas = await response.json();
        pintarMascotas(mascotas);
        cargarMascotasEnSelect(mascotas);

    } catch (error) {
        contenedorMascotas.innerHTML = `<p class="texto-suave">Error al cargar mascotas.</p>`;
        mascotaReservaSelect.innerHTML = `<option value="">No disponible</option>`;
    }
}

function pintarMascotas(mascotas) {
    if (!mascotas || mascotas.length === 0) {
        contenedorMascotas.innerHTML = `<p class="texto-suave">Todavía no has registrado ninguna mascota.</p>`;
        return;
    }

    contenedorMascotas.innerHTML = "";

    mascotas.forEach(mascota => {
        const card = document.createElement("div");
        card.className = "mascota-card";

        card.innerHTML = `
            <h3>${escapeHTML(mascota.nombre)}</h3>
            <div class="mascota-detalles">
                <p><strong>Raza:</strong> ${escapeHTML(mascota.raza || "No indicada")}</p>
                <p><strong>Peso:</strong> ${mascota.pesoKg != null ? mascota.pesoKg + " kg" : "No indicado"}</p>
                <p><strong>Edad:</strong> ${mascota.edadAnios != null ? mascota.edadAnios + " años" : "No indicada"}</p>
                <p><strong>Observaciones:</strong> ${escapeHTML(mascota.observaciones || "Sin observaciones")}</p>
            </div>
            <div class="mascota-acciones">
                <button class="btn btn-editar" data-id="${mascota.id}">Editar</button>
                <button class="btn btn-eliminar" data-id="${mascota.id}">Eliminar</button>
            </div>
        `;

        const btnEditar = card.querySelector(".btn-editar");
        const btnEliminar = card.querySelector(".btn-eliminar");

        btnEditar.addEventListener("click", () => cargarMascotaEnFormulario(mascota));
        btnEliminar.addEventListener("click", () => confirmarEliminarMascota(mascota.id, mascota.nombre));

        contenedorMascotas.appendChild(card);
    });
}

function cargarMascotasEnSelect(mascotas) {
    mascotaReservaSelect.innerHTML = `<option value="">Selecciona una mascota</option>`;

    if (!mascotas || mascotas.length === 0) {
        return;
    }

    mascotas.forEach(mascota => {
        const option = document.createElement("option");
        option.value = mascota.id;
        option.textContent = mascota.nombre;
        mascotaReservaSelect.appendChild(option);
    });
}

function cargarMascotaEnFormulario(mascota) {
    mascotaIdInput.value = mascota.id || "";
    nombreMascotaInput.value = mascota.nombre || "";
    razaMascotaInput.value = mascota.raza || "";
    pesoMascotaInput.value = mascota.pesoKg != null ? mascota.pesoKg : "";
    edadMascotaInput.value = mascota.edadAnios != null ? mascota.edadAnios : "";
    observacionesMascotaInput.value = mascota.observaciones || "";

    tituloFormularioMascota.textContent = "Editar mascota";
    btnGuardarMascota.textContent = "Guardar cambios";
    btnCancelarEdicion.classList.remove("oculto");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function resetearFormularioMascota() {
    formMascota.reset();
    mascotaIdInput.value = "";
    tituloFormularioMascota.textContent = "Añadir mascota";
    btnGuardarMascota.textContent = "Guardar mascota";
    btnCancelarEdicion.classList.add("oculto");
    ocultarMensaje(mensajeMascota);
}

async function crearMascota(mascota) {
    const response = await fetch(`${API_MASCOTAS}/usuario/${usuarioLogueado.id}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(mascota)
    });

    if (!response.ok) {
        const texto = await response.text();
        throw new Error(texto || "No se pudo crear la mascota.");
    }

    return await response.json();
}

async function actualizarMascota(idMascota, mascota) {
    const response = await fetch(`${API_MASCOTAS}/${idMascota}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(mascota)
    });

    if (!response.ok) {
        const texto = await response.text();
        throw new Error(texto || "No se pudo actualizar la mascota.");
    }

    return await response.json();
}

async function eliminarMascota(idMascota) {
    const response = await fetch(`${API_MASCOTAS}/${idMascota}`, {
        method: "DELETE"
    });

    if (!response.ok) {
        const texto = await response.text();
        throw new Error(texto || "No se pudo eliminar la mascota.");
    }

    return await response.text();
}

async function confirmarEliminarMascota(idMascota, nombreMascota) {
    const confirmacion = confirm(`¿Seguro que quieres eliminar a ${nombreMascota}?`);

    if (!confirmacion) {
        return;
    }

    try {
        await eliminarMascota(idMascota);
        mostrarMensaje(mensajeMascota, "Mascota eliminada correctamente.", "ok");
        resetearFormularioMascota();
        await cargarMascotas();
        await cargarReservas();
    } catch (error) {
        mostrarMensaje(mensajeMascota, error.message || "No se pudo eliminar la mascota.", "error");
    }
}

async function crearReserva(mascotaId, reserva) {
    const response = await fetch(`${API_RESERVAS}/mascota/${mascotaId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(reserva)
    });

    if (!response.ok) {
        const texto = await response.text();
        throw new Error(texto || "No se pudo crear la reserva.");
    }

    return await response.json();
}

async function cargarReservas() {
    contenedorReservas.innerHTML = `<p class="texto-suave">Cargando reservas...</p>`;

    try {
        const response = await fetch(`${API_RESERVAS}/usuario/${usuarioLogueado.id}`);

        if (!response.ok) {
            throw new Error("No se pudieron cargar las reservas.");
        }

        const reservas = await response.json();
        pintarReservas(reservas);

    } catch (error) {
        contenedorReservas.innerHTML = `<p class="texto-suave">Error al cargar reservas.</p>`;
    }
}

function pintarReservas(reservas) {
    if (!reservas || reservas.length === 0) {
        contenedorReservas.innerHTML = `<p class="texto-suave">Todavía no has realizado ninguna reserva.</p>`;
        return;
    }

    contenedorReservas.innerHTML = "";

    reservas.forEach(reserva => {
        const nombreMascota = reserva.mascota?.nombre || "Mascota";
        const fechaEntrada = formatearFecha(reserva.fechaEntrada);
        const fechaSalida = formatearFecha(reserva.fechaSalida);
        const tipoReserva = reserva.tipoReserva || "No indicado";
        const observaciones = reserva.observaciones || "Sin observaciones";
        const estadoReserva = reserva.estadoReserva || "PENDIENTE";

        const card = document.createElement("div");
        card.className = "reserva-card";

        card.innerHTML = `
            <h3>${escapeHTML(nombreMascota)}</h3>
            <span class="estado-reserva">${escapeHTML(estadoReserva)}</span>
            <div class="reserva-detalles">
                <p><strong>Entrada:</strong> ${escapeHTML(fechaEntrada)}</p>
                <p><strong>Salida:</strong> ${escapeHTML(fechaSalida)}</p>
                <p><strong>Tipo:</strong> ${escapeHTML(tipoReserva)}</p>
                <p><strong>Observaciones:</strong> ${escapeHTML(observaciones)}</p>
            </div>
            <div class="reserva-acciones">
                <button class="btn btn-eliminar">Eliminar reserva</button>
            </div>
        `;

        const btnEliminar = card.querySelector(".btn-eliminar");
        btnEliminar.addEventListener("click", () => confirmarEliminarReserva(reserva.id, nombreMascota));

        contenedorReservas.appendChild(card);
    });
}

async function eliminarReserva(reservaId) {
    const response = await fetch(`${API_RESERVAS}/${reservaId}`, {
        method: "DELETE"
    });

    if (!response.ok) {
        const texto = await response.text();
        throw new Error(texto || "No se pudo eliminar la reserva.");
    }

    return await response.text();
}

async function confirmarEliminarReserva(reservaId, nombreMascota) {
    const confirmacion = confirm(`¿Seguro que quieres eliminar la reserva de ${nombreMascota}?`);

    if (!confirmacion) {
        return;
    }

    try {
        await eliminarReserva(reservaId);
        mostrarMensaje(mensajeReserva, "Reserva eliminada correctamente.", "ok");
        await cargarReservas();
    } catch (error) {
        mostrarMensaje(mensajeReserva, error.message || "No se pudo eliminar la reserva.", "error");
    }
}

function mostrarMensaje(elemento, texto, tipo) {
    elemento.textContent = texto;
    elemento.className = `mensaje ${tipo}`;
}

function ocultarMensaje(elemento) {
    elemento.textContent = "";
    elemento.className = "mensaje";
}

function formatearFecha(fecha) {
    if (!fecha) {
        return "No disponible";
    }

    const partes = fecha.split("-");
    if (partes.length !== 3) {
        return fecha;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function escapeHTML(texto) {
    if (texto === null || texto === undefined) {
        return "";
    }

    return texto
        .toString()
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}