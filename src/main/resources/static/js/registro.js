const API_BASE = "http://localhost:8081";

const form = document.getElementById("registroForm");
const nombre = document.getElementById("nombre");
const email = document.getElementById("email");
const password = document.getElementById("password");
const mensaje = document.getElementById("mensaje");

function mostrarMensaje(texto, tipo = "error") {
    mensaje.textContent = texto;
    mensaje.className = `mensaje-registro ${tipo}`;
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const body = {
        nombre: nombre.value.trim(),
        email: email.value.trim(),
        password: password.value.trim()
    };

    try {
        const response = await fetch(`${API_BASE}/api/auth/registro`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const texto = await response.text();
            throw new Error(texto || "Error en el registro");
        }

        mostrarMensaje("Registro correcto. Redirigiendo al login...", "ok");

        setTimeout(() => {
            window.location.href = "/login.html";
        }, 800);

    } catch (error) {
        console.error(error);
        mostrarMensaje(error.message, "error");
    }
});