// /utils/hooks/usePlayers.ts
import { useEffect, useState } from "react";
import { fetchPlayers } from "../../core/Player/player.service.ts";
import type {Player} from "../../core/Player/player.types.ts";

export function usePlayers() {
    const [players, setPlayers] = useState<Player[]>([]);

    async function loadPlayers() {
        const data = await fetchPlayers();
        setPlayers(data);
    }

    useEffect(() => {
        (async () => {
           await loadPlayers();
        })();

        // react to PlayerForm refresh event
        window.addEventListener("player-updated", loadPlayers);
        return () => window.removeEventListener("player-updated", loadPlayers);
    }, []);

    return { players };
}
