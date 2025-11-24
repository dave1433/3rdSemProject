// EMPTY backend connection (placeholder)

const API_URL = "http://localhost:5237";

// Basic empty GET wrapper (does nothing yet)
export async function apiGet(path) {
    return fetch(`${API_URL}${path}`);
}

// Basic empty POST wrapper (does nothing yet)
export async function apiPost(path, body) {
    return fetch(`${API_URL}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
}

// You can add more functions here later (PUT, DELETE, auth, etc.)
