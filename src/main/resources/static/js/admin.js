const formUsuario = document.getElementById("formUsuario");
const formMascota = document.getElementById("formMascota");
const formReserva = document.getElementById("formReserva");

const tablaUsuarios = document.getElementById("tablaUsuarios");
const tablaMascotas = document.getElementById("tablaMascotas");
const tablaReservas = document.getElementById("tablaReservas");

const btnActualizarUsuarios = document.getElementById("btnActualizarUsuarios");
const btnActualizarMascotas = document.getElementById("btnActualizarMascotas");
const btnActualizarReservas = document.getElementById("btnActualizarReservas");

document.addEventListener("DOMContentLoaded", async () => {
    await inicializarPanel();
});

if (btnActualizarUsuarios) {
    btnActualizarUsuarios.addEventListener("click", cargarUsuarios);
}

if (btnActualizarMascotas) {
    btnActualizarMascotas.addEventListener("click", async () => {
        await cargarMascotas();
        await cargarMascotasEnSelect();
    });
}

if (btnActualizarReservas) {
    btnActualizarReservas.addEventListener("click", cargarReservas);
}

function mostrarMensaje(id, texto, tipo) {
    const caja = document.getElementById(id);
    if (!caja) return;
    caja.textContent = texto;
    caja.className = `mensaje ${tipo}`;
}

function limpiarMensaje(id) {
    const caja = document.getElementById(id);
    if (!caja) return;
    caja.textContent = "";
    caja.className = "mensaje";
}

function formatearPrecio(precio) {
    if (precio === null || precio === undefined || precio === "") {
        return "No indicado";
    }
    return `${precio} €`;
}

function obtenerClaseEstado(estado) {
    if (!estado) return "";
    const texto = estado.toLowerCase();

    if (texto === "pendiente") return "pendiente";
    if (texto === "confirmada") return "confirmada";
    if (texto === "cancelada") return "cancelada";

    return "";
}

function filaVacia(columnas, mensaje) {
    return `
        <tr>
            <td colspan="${columnas}" class="fila-vacia">${mensaje}</td>
        </tr>
    `;
}

async function inicializarPanel() {
    await cargarUsuarios();
    await cargarMascotas();
    await cargarMascotasEnSelect();
    await cargarReservas();
}

// =========================
// USUARIOS
// =========================
async function cargarUsuarios() {
    limpiarMensaje("mensajeUsuario");

    try {
        const usuarios = await obtenerUsuarios();

        if (!usuarios.length) {
            tablaUsuarios.innerHTML = filaVacia(7, "No hay usuarios registrados.");
            return;
        }

        tablaUsuarios.innerHTML = usuarios.map(u => `
            <tr>
                <td>${u.id ?? ""}</td>
                <td>${u.nombre ?? ""}</td>
                <td>${u.apellidos ?? ""}</td>
                <td>${u.email ?? ""}</td>
                <td>${u.telefono ?? ""}</td>
                <td>${u.direccion ?? ""}</td>
                <td class="acciones">
                    <button class="btn-danger" onclick="eliminarUsuario(${u.id})">Eliminar</button>
                </td>
            </tr>
        `).join("");

    } catch (error) {
        tablaUsuarios.innerHTML = filaVacia(7, "Error al cargar usuarios.");
        mostrarMensaje("mensajeUsuario", `Error cargando usuarios: ${error.message}`, "error");
    }
}

if (formUsuario) {
    formUsuario.addEventListener("submit", async function (e) {
        e.preventDefault();
        limpiarMensaje("mensajeUsuario");

        const usuario = {
            nombre: document.getElementById("nombreUsuario").value.trim(),
            apellidos: document.getElementById("apellidosUsuario").value.trim(),
            email: document.getElementById("emailUsuario").value.trim(),
            telefono: document.getElementById("telefonoUsuario").value.trim(),
            direccion: document.getElementById("direccionUsuario").value.trim()
        };

        if (!usuario.nombre) {
            mostrarMensaje("mensajeUsuario", "El nombre es obligatorio.", "error");
            return;
        }

        if (!usuario.email) {
            mostrarMensaje("mensajeUsuario", "El email es obligatorio.", "error");
            return;
        }

        try {
            await crearUsuario(usuario);
            mostrarMensaje("mensajeUsuario", "Usuario creado correctamente.", "ok");
            formUsuario.reset();
            await cargarUsuarios();
        } catch (error) {
            mostrarMensaje("mensajeUsuario", `Error al crear usuario: ${error.message}`, "error");
        }
    });
}

async function eliminarUsuario(id) {
    if (!confirm("¿Seguro que quieres eliminar este usuario?")) return;

    try {
        await borrarUsuario(id);
        mostrarMensaje("mensajeUsuario", "Usuario eliminado correctamente.", "ok");
        await cargarUsuarios();
    } catch (error) {
        mostrarMensaje("mensajeUsuario", `Error al eliminar usuario: ${error.message}`, "error");
    }
}

// =========================
// MASCOTAS
// =========================
async function cargarMascotas() {
    limpiarMensaje("mensajeMascota");

    try {
        const mascotas = await obtenerMascotas();

        if (!mascotas.length) {
            tablaMascotas.innerHTML = filaVacia(8, "No hay mascotas registradas.");
            return;
        }

        tablaMascotas.innerHTML = mascotas.map(m => `
            <tr>
                <td>${m.id ?? ""}</td>
                <td>${m.nombre ?? ""}</td>
                <td>${m.raza ?? ""}</td>
                <td>${m.pesoKg ?? ""}</td>
                <td>${m.edadAnios ?? ""}</td>
                <td>${m.observaciones ?? ""}</td>
                <td>${m.usuario?.nombre ?? m.usuario?.id ?? ""}</td>
                <td class="acciones">
                    <button class="btn-danger" onclick="eliminarMascota(${m.id})">Eliminar</button>
                </td>
            </tr>
        `).join("");

    } catch (error) {
        tablaMascotas.innerHTML = filaVacia(8, "Error al cargar mascotas.");
        mostrarMensaje("mensajeMascota", `Error cargando mascotas: ${error.message}`, "error");
    }
}

if (formMascota) {
    formMascota.addEventListener("submit", async function (e) {
        e.preventDefault();
        limpiarMensaje("mensajeMascota");

        const usuarioId = document.getElementById("usuarioIdMascota").value;
        const peso = document.getElementById("pesoMascota").value;
        const edad = document.getElementById("edadMascota").value;

        const mascota = {
            nombre: document.getElementById("nombreMascota").value.trim(),
            raza: document.getElementById("razaMascota").value.trim(),
            pesoKg: peso ? parseFloat(peso) : null,
            edadAnios: edad ? parseInt(edad, 10) : null,
            observaciones: document.getElementById("observacionesMascota").value.trim()
        };

        if (!usuarioId) {
            mostrarMensaje("mensajeMascota", "Debes indicar el ID del usuario.", "error");
            return;
        }

        if (!mascota.nombre) {
            mostrarMensaje("mensajeMascota", "El nombre de la mascota es obligatorio.", "error");
            return;
        }

        if (mascota.pesoKg !== null && mascota.pesoKg < 0) {
            mostrarMensaje("mensajeMascota", "El peso no puede ser negativo.", "error");
            return;
        }

        if (mascota.edadAnios !== null && mascota.edadAnios < 0) {
            mostrarMensaje("mensajeMascota", "La edad no puede ser negativa.", "error");
            return;
        }

        try {
            await crearMascota(usuarioId, mascota);
            mostrarMensaje("mensajeMascota", "Mascota creada correctamente.", "ok");
            formMascota.reset();
            await cargarMascotas();
            await cargarMascotasEnSelect();
        } catch (error) {
            mostrarMensaje("mensajeMascota", `Error al crear mascota: ${error.message}`, "error");
        }
    });
}

async function eliminarMascota(id) {
    if (!confirm("¿Seguro que quieres eliminar esta mascota?")) return;

    try {
        await borrarMascota(id);
        mostrarMensaje("mensajeMascota", "Mascota eliminada correctamente.", "ok");
        await cargarMascotas();
        await cargarMascotasEnSelect();
    } catch (error) {
        mostrarMensaje("mensajeMascota", `Error al eliminar mascota: ${error.message}`, "error");
    }
}

async function cargarMascotasEnSelect() {
    try {
        const mascotas = await obtenerMascotas();
        const selectMascota = document.getElementById("mascotaId");

        if (!selectMascota) return;

        selectMascota.innerHTML = `<option value="">Selecciona una mascota</option>`;

        mascotas.forEach(mascota => {
            const option = document.createElement("option");
            option.value = mascota.id;
            option.textContent = `${mascota.id} - ${mascota.nombre}`;
            selectMascota.appendChild(option);
        });
    } catch (error) {
        mostrarMensaje("mensajeReserva", `Error cargando mascotas en selector: ${error.message}`, "error");
    }
}

// =========================
// RESERVAS
// =========================
async function cargarReservas() {
    limpiarMensaje("mensajeReserva");

    try {
        const reservas = await obtenerReservas();

        if (!reservas.length) {
            tablaReservas.innerHTML = filaVacia(8, "No hay reservas registradas.");
            return;
        }

        tablaReservas.innerHTML = reservas.map(r => `
            <tr>
                <td>${r.id ?? ""}</td>
                <td>${r.mascota?.nombre ?? r.mascota?.id ?? ""}</td>
                <td>${r.fechaInicio ?? ""}</td>
                <td>${r.fechaFin ?? ""}</td>
                <td>${r.tipoEstancia ?? ""}</td>
                <td>${formatearPrecio(r.precioTotal)}</td>
                <td>
                    <span class="estado ${obtenerClaseEstado(r.estadoReserva)}">
                        ${r.estadoReserva ?? ""}
                    </span>
                </td>
                <td class="acciones">
                    <button class="btn-danger" onclick="eliminarReserva(${r.id})">Eliminar</button>
                </td>
            </tr>
        `).join("");

    } catch (error) {
        tablaReservas.innerHTML = filaVacia(8, "Error al cargar reservas.");
        mostrarMensaje("mensajeReserva", `Error cargando reservas: ${error.message}`, "error");
    }
}

if (formReserva) {
    formReserva.addEventListener("submit", async function (e) {
        e.preventDefault();
        limpiarMensaje("mensajeReserva");

        const mascotaId = parseInt(document.getElementById("mascotaId").value, 10);
        const fechaInicio = document.getElementById("fechaInicio").value;
        const fechaFin = document.getElementById("fechaFin").value;
        const tipoEstancia = document.getElementById("tipoEstancia").value.trim();
        const estadoReserva = document.getElementById("estadoReserva").value;
        const precioTexto = document.getElementById("precioTotal").value;

        const precioTotal = precioTexto ? parseFloat(precioTexto) : null;

        if (!mascotaId) {
            mostrarMensaje("mensajeReserva", "Debes seleccionar una mascota.", "error");
            return;
        }

        if (!fechaInicio || !fechaFin) {
            mostrarMensaje("mensajeReserva", "Debes indicar fecha de inicio y fecha de fin.", "error");
            return;
        }

        if (fechaFin < fechaInicio) {
            mostrarMensaje("mensajeReserva", "La fecha fin no puede ser menor que la fecha inicio.", "error");
            return;
        }

        if (precioTotal !== null && precioTotal < 0) {
            mostrarMensaje("mensajeReserva", "El precio no puede ser negativo.", "error");
            return;
        }

        const nuevaReserva = {
            fechaInicio,
            fechaFin,
            tipoEstancia,
            precioTotal,
            estadoReserva
        };

        try {
            await crearReserva(mascotaId, nuevaReserva);
            mostrarMensaje("mensajeReserva", "Reserva creada correctamente.", "ok");
            formReserva.reset();
            await cargarReservas();
        } catch (error) {
            mostrarMensaje("mensajeReserva", `Error al crear reserva: ${error.message}`, "error");
        }
    });
}

async function eliminarReserva(id) {
    if (!confirm("¿Seguro que quieres eliminar esta reserva?")) return;

    try {
        await borrarReserva(id);
        mostrarMensaje("mensajeReserva", "Reserva eliminada correctamente.", "ok");
        await cargarReservas();
    } catch (error) {
        mostrarMensaje("mensajeReserva", `Error al eliminar reserva: ${error.message}`, "error");
    }
}