const BASE_URL = "http://localhost:5237/api/admin/players";

export interface PlayerResponse {
    id: string;
    fullName: string;
    phone: string | null;
    email: string | null;
    active: boolean;
    balance: number;
    createdAt: string | null;
}

export interface CreatePlayerRequest {
    fullName: string;
    phone: string | null;
    email: string | null;
}

export async function createPlayer(data: CreatePlayerRequest): Promise<PlayerResponse> {
    const res = await fetch(BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    if (!res.ok) {
        console.error(await res.text());
        throw new Error("Failed to create player");
    }

    return res.json();
}


export async function getPlayerById(id: string): Promise<PlayerResponse> {
    const res = await fetch(`${BASE_URL}/${id}`);
    if (!res.ok) {
        throw new Error("Failed to load player");
    }
    return res.json();
}

export async function getPlayers(): Promise<PlayerResponse[]> {
    const res = await fetch(BASE_URL);
    if (!res.ok) {
        throw new Error("Failed to load players");
    }
    return res.json();
}
