const API_URL = "/api/mascotas";

const listaMascotas = document.getElementById("listaMascotas");
const formMascota = document.getElementById("formMascota");
const mensaje = document.getElementById("mensaje");
const btnRecargar = document.getElementById("btnRecargar");

document.addEventListener("DOMContentLoaded", () => {
    cargarMascotas();
});

btnRecargar.addEventListener("click", cargarMascotas);

formMascota.addEventListener("submit", async (e) => {
    e.preventDefault();
    limpiarMensaje();

    const usuarioId = document.getElementById("usuarioId").value;

    const nuevaMascota = {
        nombre: document.getElementById("nombre").value,
        raza: document.getElementById("raza").value,
        pesoKg: parseFloat(document.getElementById("pesoKg").value),
        edadAnios: parseInt(document.getElementById("edadAnios").value),
        observaciones: document.getElementById("observaciones").value
    };

    try {
        const response = await fetch(`${API_URL}/usuario/${usuarioId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(nuevaMascota)
        });

        if (!response.ok) {
            const errorTexto = await response.text();
            throw new Error(errorTexto || "Error al crear mascota");
        }

        mostrarMensaje("Mascota creada correctamente", "ok");
        formMascota.reset();
        cargarMascotas();

    } catch (error) {
        mostrarMensaje("Error: " + error.message, "error");
    }
});

async function cargarMascotas() {
    listaMascotas.innerHTML = "<p>Cargando mascotas...</p>";

    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("No se pudieron cargar las mascotas");
        }

        const mascotas = await response.json();

        if (!mascotas || mascotas.length === 0) {
            listaMascotas.innerHTML = "<p>No hay mascotas registradas.</p>";
            return;
        }

        listaMascotas.innerHTML = "";

        mascotas.forEach(m => {
            const card = document.createElement("div");
            card.className = "card-reserva";

            card.innerHTML = `
                <h3>${m.nombre}</h3>
                <p><strong>ID:</strong> ${m.id}</p>
                <p><strong>Raza:</strong> ${m.raza ?? "No indicada"}</p>
                <p><strong>Peso:</strong> ${m.pesoKg ?? "-"} kg</p>
                <p><strong>Edad:</strong> ${m.edadAnios ?? "-"} años</p>
                <p><strong>Observaciones:</strong> ${m.observaciones ?? "-"}</p>
            `;

            listaMascotas.appendChild(card);
        });

    } catch (error) {
        listaMascotas.innerHTML = `<p style="color:red;">${error.message}</p>`;
    }
}

function mostrarMensaje(texto, tipo) {
    mensaje.textContent = texto;
    mensaje.className = "mensaje " + tipo;
}

function limpiarMensaje() {
    mensaje.textContent = "";
    mensaje.className = "mensaje";
}