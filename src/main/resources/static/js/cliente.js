const tipoEstancia = document.getElementById("tipoEstancia");
const fechaInicio = document.getElementById("fechaInicio");
const fechaFin = document.getElementById("fechaFin");
const diasInput = document.getElementById("dias");
const totalPrecio = document.getElementById("totalPrecio");
const formReserva = document.getElementById("formReserva");
const mensajeOk = document.getElementById("mensajeOk");

const extraBano = document.getElementById("extraBano");
const extraPeluqueria = document.getElementById("extraPeluqueria");
const extraRecogida = document.getElementById("extraRecogida");
const extraEntrega = document.getElementById("extraEntrega");

function calcularDias() {
    if (!fechaInicio || !fechaFin || !diasInput) return 1;

    if (!fechaInicio.value || !fechaFin.value) {
        diasInput.value = 1;
        return 1;
    }

    const inicio = new Date(fechaInicio.value);
    const fin = new Date(fechaFin.value);

    const diferenciaMs = fin - inicio;
    const dias = Math.ceil(diferenciaMs / (1000 * 60 * 60 * 24));
    const totalDias = dias <= 0 ? 1 : dias;

    diasInput.value = totalDias;
    return totalDias;
}

function obtenerPrecioBase() {
    if (!tipoEstancia) return 0;

    if (tipoEstancia.value === "DIA") {
        return 20;
    }

    if (tipoEstancia.value === "LARGA_ESTANCIA") {
        return 35;
    }

    return 0;
}

function calcularExtras() {
    let totalExtras = 0;

    if (extraBano?.checked) totalExtras += Number(extraBano.value || 0);
    if (extraPeluqueria?.checked) totalExtras += Number(extraPeluqueria.value || 0);
    if (extraRecogida?.checked) totalExtras += Number(extraRecogida.value || 0);
    if (extraEntrega?.checked) totalExtras += Number(extraEntrega.value || 0);

    return totalExtras;
}

function calcularTotal() {
    if (!totalPrecio) return;

    const precioBase = obtenerPrecioBase();
    const numeroDias = calcularDias();
    const totalExtras = calcularExtras();

    const total = (precioBase * numeroDias) + totalExtras;
    totalPrecio.textContent = `${total.toFixed(2)} €`;
}

function mostrarMensaje(texto, tipo) {
    if (!mensajeOk) return;

    mensajeOk.textContent = texto;
    mensajeOk.className = `message ${tipo}`;
    mensajeOk.style.display = "block";
}

function limpiarMensaje() {
    if (!mensajeOk) return;

    mensajeOk.textContent = "";
    mensajeOk.className = "message";
    mensajeOk.style.display = "none";
}

function obtenerDatosFormulario() {
    return {
        nombreCliente: document.getElementById("nombreCliente")?.value.trim() || "",
        apellidosCliente: document.getElementById("apellidosCliente")?.value.trim() || "",
        email: document.getElementById("email")?.value.trim() || "",
        telefono: document.getElementById("telefono")?.value.trim() || "",
        nombreMascota: document.getElementById("nombreMascota")?.value.trim() || "",
        raza: document.getElementById("raza")?.value.trim() || "",
        edad: document.getElementById("edad")?.value
            ? Number(document.getElementById("edad").value)
            : null,
        peso: document.getElementById("peso")?.value
            ? Number(document.getElementById("peso").value)
            : null,
        fechaInicio: fechaInicio?.value || "",
        fechaFin: fechaFin?.value || "",
        tipoEstancia: tipoEstancia?.value || "",
        dias: diasInput?.value ? Number(diasInput.value) : 1,
        observaciones: document.getElementById("observaciones")?.value.trim() || "",
        bano: extraBano?.checked || false,
        peluqueria: extraPeluqueria?.checked || false,
        recogida: extraRecogida?.checked || false,
        entrega: extraEntrega?.checked || false,
        totalEstimado: totalPrecio
            ? Number(totalPrecio.textContent.replace(" €", ""))
            : 0
    };
}

if (tipoEstancia) {
    tipoEstancia.addEventListener("change", calcularTotal);
}

if (fechaInicio) {
    fechaInicio.addEventListener("change", calcularTotal);
}

if (fechaFin) {
    fechaFin.addEventListener("change", calcularTotal);
}

if (extraBano) {
    extraBano.addEventListener("change", calcularTotal);
}

if (extraPeluqueria) {
    extraPeluqueria.addEventListener("change", calcularTotal);
}

if (extraRecogida) {
    extraRecogida.addEventListener("change", calcularTotal);
}

if (extraEntrega) {
    extraEntrega.addEventListener("change", calcularTotal);
}

if (formReserva) {
    formReserva.addEventListener("submit", async function (e) {
        e.preventDefault();
        limpiarMensaje();
        calcularTotal();

        const datos = obtenerDatosFormulario();

        if (!datos.nombreCliente || !datos.email || !datos.nombreMascota) {
            mostrarMensaje("Completa al menos nombre, email y nombre de la mascota.", "error");
            return;
        }

        if (!datos.fechaInicio || !datos.fechaFin) {
            mostrarMensaje("Debes indicar fecha de inicio y fecha de fin.", "error");
            return;
        }

        if (datos.fechaFin < datos.fechaInicio) {
            mostrarMensaje("La fecha fin no puede ser menor que la fecha inicio.", "error");
            return;
        }

        try {
            await crearReservaCliente(datos);

            mostrarMensaje(
                "Reserva enviada correctamente. Hemos recibido tu solicitud.",
                "success"
            );

            formReserva.reset();

            if (diasInput) diasInput.value = 1;
            if (totalPrecio) totalPrecio.textContent = "0.00 €";
        } catch (error) {
            mostrarMensaje(
                error.message || "Hubo un error al enviar la reserva.",
                "error"
            );
        }
    });
}

calcularTotal();