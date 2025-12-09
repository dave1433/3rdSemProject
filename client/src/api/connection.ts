// --------------------------------------------------
// BASE URL — must come from .env (Vite injects on build)
// --------------------------------------------------
export const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5237";

// local: http://localhost:5237
// prod:  https://deadpigeons-api-project.fly.dev


// --------------------------------------------------
// AUTH HEADERS
// --------------------------------------------------
export function authHeaders(): HeadersInit {
    const token = localStorage.getItem("token");

    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}


// --------------------------------------------------
// RAW FETCH HELPERS (MANUAL ENDPOINTS MUST INCLUDE /api/...)
// --------------------------------------------------
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


// --------------------------------------------------
// OPENAPI CLIENT ADAPTER
// Your `generated-ts-client` already builds URLs like:
//     `${baseUrl}/api/Transaction/...`
// So DO NOT add /api manually.
// --------------------------------------------------
export function openapiAdapter(ClientClass: any) {
    const http = {
        fetch: (url: string, options: any) =>
            fetch(url, {
                ...options,
                headers: {
                    ...options?.headers,
                    ...authHeaders(),
                },
            }),
    };

    // BASE URL HAS **NO /api**
    return new ClientClass(API_BASE_URL, http);
}
