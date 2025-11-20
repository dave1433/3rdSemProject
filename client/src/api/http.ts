export const API_URL = "http://localhost:5237";

export async function api<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(API_URL + url, {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        ...options
    });

    if (!response.ok) {
        throw new Error("API Error: " + response.statusText);
    }

    return response.json();
}
