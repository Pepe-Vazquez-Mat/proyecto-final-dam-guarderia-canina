const API_URL = "http://localhost:8081/api/auth";

const tabLogin = document.getElementById("tabLogin");
const tabRegistro = document.getElementById("tabRegistro");

const formLogin = document.getElementById("formLogin");
const formRegistro = document.getElementById("formRegistro");

const mensaje = document.getElementById("mensaje");

function mostrarMensaje(texto, tipo = "ok") {
    mensaje.textContent = texto;
    mensaje.className = "mensaje " + tipo;
}

function limpiarMensaje() {
    mensaje.textContent = "";
    mensaje.className = "mensaje";
}

function activarLogin() {
    tabLogin.classList.add("activa");
    tabRegistro.classList.remove("activa");
    formLogin.classList.add("activo");
    formRegistro.classList.remove("activo");
    limpiarMensaje();
}

function activarRegistro() {
    tabRegistro.classList.add("activa");
    tabLogin.classList.remove("activa");
    formRegistro.classList.add("activo");
    formLogin.classList.remove("activo");
    limpiarMensaje();
}

tabLogin.addEventListener("click", activarLogin);
tabRegistro.addEventListener("click", activarRegistro);

formRegistro.addEventListener("submit", async (e) => {
    e.preventDefault();
    limpiarMensaje();

    const nuevoUsuario = {
        nombre: document.getElementById("registroNombre").value.trim(),
        apellidos: document.getElementById("registroApellidos").value.trim(),
        email: document.getElementById("registroEmail").value.trim(),
        telefono: document.getElementById("registroTelefono").value.trim(),
        password: document.getElementById("registroPassword").value
    };

    try {
        const response = await fetch(`${API_URL}/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(nuevoUsuario)
        });

        const data = await response.json();

        if (!response.ok) {
            mostrarMensaje(data.error || "No se pudo registrar el usuario", "error");
            return;
        }

        mostrarMensaje("Registro completado. Ya puedes iniciar sesión.", "ok");
        formRegistro.reset();
        activarLogin();

    } catch (error) {
        mostrarMensaje("Error de conexión con el servidor", "error");
        console.error(error);
    }
});

formLogin.addEventListener("submit", async (e) => {
    e.preventDefault();
    limpiarMensaje();

    const credenciales = {
        email: document.getElementById("loginEmail").value.trim(),
        password: document.getElementById("loginPassword").value
    };

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(credenciales)
        });

        const data = await response.json();

        if (!response.ok) {
            mostrarMensaje(data.error || "Email o contraseña incorrectos", "error");
            return;
        }

        localStorage.setItem("usuarioLogueado", JSON.stringify(data));

        mostrarMensaje("Login correcto. Redirigiendo...", "ok");

        setTimeout(() => {
            window.location.href = "cliente.html";
        }, 800);

    } catch (error) {
        mostrarMensaje("Error de conexión con el servidor", "error");
        console.error(error);
    }
});