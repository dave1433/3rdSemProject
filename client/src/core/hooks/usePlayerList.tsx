import { useEffect, useState } from "react";
import { apiGet } from "../../api/connection";

export interface Player {
    id: string;
    fullName: string;
    phone: string;
    active: boolean;
    balance: number;
}

export const usePlayerList = () => {
    const [players, setPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);

    const loadPlayers = async () => {
        try {
            setLoading(true);

            const res = await apiGet("/api/user");
            if (!res.ok) {
                console.error("Failed to load players");
                return;
            }

            const data = await res.json();
            setPlayers(data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // initial load
        void loadPlayers();

        // 🔥 listen for player updates (activate/deactivate)
        const handler = () => loadPlayers();
        window.addEventListener("player-updated", handler);

        return () => {
            window.removeEventListener("player-updated", handler);
        };
    }, []);

    return {
        players,
        loading,
        reload: loadPlayers, // exposed for manual refresh if needed
    };
};
