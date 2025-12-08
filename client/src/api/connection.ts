export const API_BASE_URL = import.meta.env.VITE_API_URL + "/api";

function authHeaders(): HeadersInit {
    const token = localStorage.getItem("token");

    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

export function apiGet(path: string) {
    return fetch(`${API_BASE_URL}${path}`, {
        headers: authHeaders(),
    });
}

export function apiPost(path: string, body: unknown) {
    return fetch(`${API_BASE_URL}${path}`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(body),
    });
}

export function apiDelete(path: string) {
    return fetch(`${API_BASE_URL}${path}`, {
        method: "DELETE",
        headers: authHeaders(),
    });
}
