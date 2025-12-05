import { useEffect, useState } from "react";
import { apiGet } from "../../api/connection";

interface Player {
    id: string;
    fullName: string;
    phone: string;
    active: boolean;
    balance: number;
}

export const PlayerList = () => {
    const [players, setPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);

    async function loadPlayers() {
        try {
            setLoading(true);

            const res = await apiGet("/user");
            if (!res.ok) {
                console.error("Failed to load players");
                return;
            }

            const data = await res.json();
            setPlayers(data);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadPlayers();
        window.addEventListener("player-updated", loadPlayers);
        return () =>
            window.removeEventListener("player-updated", loadPlayers);
    }, []);

    return (
        <div className="bg-white rounded-2xl shadow-md p-6 w-full h-[600px] overflow-y-auto">
            <h2 className="text-jerneNavy text-lg font-semibold mb-4">
                Players
            </h2>

            {loading ? (
                <p>Loading players…</p>
            ) : players.length === 0 ? (
                <p>No players found.</p>
            ) : (
                <div className="flex flex-col gap-4">
                    {players.map(player => (
                        <div
                            key={player.id}
                            className="flex justify-between items-center border border-greyBorder rounded-lg px-4 py-3"
                        >
                            <div>
                                <p className="font-medium">{player.fullName}</p>
                                <p className="text-sm text-gray-600">
                                    {player.phone}
                                </p>
                            </div>

                            <div className="flex items-center gap-4">
                                <span
                                    className={`px-2 py-1 text-xs rounded ${
                                        player.active
                                            ? "bg-green-200 text-green-800"
                                            : "bg-gray-200 text-gray-700"
                                    }`}
                                >
                                    {player.active ? "Active" : "Inactive"}
                                </span>

                                <span className="text-sm font-semibold">
                                    €{player.balance}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
