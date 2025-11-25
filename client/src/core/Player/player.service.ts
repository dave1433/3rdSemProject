// /core/player/player.service.ts
import type {Player} from "./player.types";

export async function fetchPlayers(): Promise<Player[]> {
    const res = await fetch("http://localhost:5237/api/player");
    if (!res.ok) throw new Error("Failed to load players");
    return res.json();
}
