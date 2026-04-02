const API_URL = "/api/cliente-reservas";
const API_MASCOTAS = "/api/mascotas";

const listaReservas = document.getElementById("listaReservas");
const formReserva = document.getElementById("formReserva");
const mensaje = document.getElementById("mensaje");
const btnRecargar = document.getElementById("btnRecargar");
const selectMascota = document.getElementById("mascotaId");

document.addEventListener("DOMContentLoaded", () => {
    cargarMascotasEnSelect();
    cargarReservas();
});

btnRecargar.addEventListener("click", cargarReservas);

formReserva.addEventListener("submit", async (e) => {
    e.preventDefault();
    limpiarMensaje();

    const mascotaId = parseInt(document.getElementById("mascotaId").value);
    const fechaInicio = document.getElementById("fechaInicio").value;
    const fechaFin = document.getElementById("fechaFin").value;
    const tipoEstancia = document.getElementById("tipoEstancia").value;
    const precioTotalTexto = document.getElementById("precioTotal").value;
    const estadoReserva = document.getElementById("estadoReserva").value;

    const precioTotal = precioTotalTexto ? parseFloat(precioTotalTexto) : null;

    if (!mascotaId) {
        mostrarMensaje("Debes seleccionar una mascota", "error");
        return;
    }

    if (!fechaInicio || !fechaFin) {
        mostrarMensaje("Debes indicar fecha de inicio y fecha de fin", "error");
        return;
    }

    if (fechaFin < fechaInicio) {
        mostrarMensaje("La fecha fin no puede ser menor que la fecha inicio", "error");
        return;
    }

    if (precioTotal !== null && precioTotal < 0) {
        mostrarMensaje("El precio no puede ser negativo", "error");
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
        const response = await fetch(`${API_URL}/mascota/${mascotaId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(nuevaReserva)
        });

        if (!response.ok) {
            const errorTexto = await response.text();
            throw new Error(errorTexto || "Error al crear la reserva");
        }

        mostrarMensaje("Reserva creada correctamente", "ok");
        formReserva.reset();
        cargarReservas();

    } catch (error) {
        mostrarMensaje("Error: " + error.message, "error");
    }
});

async function cargarMascotasEnSelect() {
    try {
        const response = await fetch(API_MASCOTAS);

        if (!response.ok) {
            throw new Error("No se pudieron cargar las mascotas");
        }

        const mascotas = await response.json();

        selectMascota.innerHTML = `<option value="">Selecciona una mascota</option>`;

        mascotas.forEach(mascota => {
            const option = document.createElement("option");
            option.value = mascota.id;
            option.textContent = `${mascota.id} - ${mascota.nombre}`;
            selectMascota.appendChild(option);
        });

    } catch (error) {
        mostrarMensaje("Error cargando mascotas: " + error.message, "error");
    }
}

async function cargarReservas() {
    listaReservas.innerHTML = "<p>Cargando reservas...</p>";

    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("No se pudieron cargar las reservas");
        }

        const reservas = await response.json();

        if (!reservas || reservas.length === 0) {
            listaReservas.innerHTML = "<p>No hay reservas registradas.</p>";
            return;
        }

        listaReservas.innerHTML = "";

        reservas.forEach(reserva => {
            const card = document.createElement("div");
            card.className = "card-reserva";

            card.innerHTML = `
                <h3>Reserva #${reserva.id ?? "Sin ID"}</h3>
                <p><strong>Fecha inicio:</strong> ${formatearFecha(reserva.fechaInicio)}</p>
                <p><strong>Fecha fin:</strong> ${formatearFecha(reserva.fechaFin)}</p>
                <p><strong>Tipo estancia:</strong> ${reserva.tipoEstancia ?? "No indicado"}</p>
                <p><strong>Precio total:</strong> ${formatearPrecio(reserva.precioTotal)}</p>
                <p>
                    <strong>Estado:</strong>
                    <span class="badge ${obtenerClaseEstado(reserva.estadoReserva)}">
                        ${reserva.estadoReserva ?? "No indicado"}
                    </span>
                </p>
                <button onclick="eliminarReserva(${reserva.id})">Eliminar reserva</button>
            `;

            listaReservas.appendChild(card);
        });

    } catch (error) {
        listaReservas.innerHTML = `<p style="color:red;">${error.message}</p>`;
    }
}

async function eliminarReserva(id) {
    if (!confirm("¿Seguro que quieres eliminar esta reserva?")) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            const errorTexto = await response.text();
            throw new Error(errorTexto || "Error al eliminar la reserva");
        }

        mostrarMensaje("Reserva eliminada correctamente", "ok");
        cargarReservas();

    } catch (error) {
        mostrarMensaje("Error al eliminar: " + error.message, "error");
    }
}

function formatearFecha(fecha) {
    if (!fecha) return "No indicada";
    return fecha;
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

function mostrarMensaje(texto, tipo) {
    mensaje.textContent = texto;
    mensaje.className = "mensaje " + tipo;
}

function limpiarMensaje() {
    mensaje.textContent = "";
    mensaje.className = "mensaje";
}