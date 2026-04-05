const API_BASE = "http://localhost:8081";

const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const mensaje = document.getElementById("mensaje");

function mostrarMensaje(texto, tipo = "error") {
    mensaje.textContent = texto;
    mensaje.className = `mensaje-login ${tipo}`;
}

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const body = {
        email: emailInput.value.trim(),
        password: passwordInput.value.trim()
    };

    try {
        const response = await fetch(`${API_BASE}/api/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const texto = await response.text();
            throw new Error(texto || "Credenciales incorrectas");
        }

        const data = await response.json();
        const rol = (data.rol || "").trim().toUpperCase();

        mostrarMensaje("Login correcto. Redirigiendo...", "ok");

        setTimeout(() => {
            if (rol === "ADMIN") {
                window.location.href = "/admin.html";
            } else {
                window.location.href = "/cliente.html";
            }
        }, 700);

    } catch (error) {
        console.error(error);
        mostrarMensaje(error.message || "Error al iniciar sesión", "error");
    }
});