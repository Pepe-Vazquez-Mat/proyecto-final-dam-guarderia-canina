const API_URL = "http://localhost:8080/api";

export async function getReservas() {
    const res = await fetch(`${API_URL}/reservas`);
    return res.json();
}

export async function crearReserva(data) {
    const res = await fetch(`${API_URL}/reservas`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });
    return res.json();
}