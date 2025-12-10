import type { Player } from "../../core/hooks/usePlayerList";
import { apiPatch } from "../../api/connection";

interface Props {
    players: Player[];
    loading: boolean;
}

export const PlayerListView = ({ players, loading }: Props) => {

    const activateUser = async (id: string) => {
        const res = await apiPatch(`/api/user/${id}/activate`);
        if (!res.ok) {
            console.error("Failed to activate user", await res.text());
            return;
        }
        window.dispatchEvent(new Event("player-updated"));
    };

    const deactivateUser = async (id: string) => {
        const res = await apiPatch(`/api/user/${id}/deactivate`);
        if (!res.ok) {
            console.error("Failed to deactivate user", await res.text());
            return;
        }
        window.dispatchEvent(new Event("player-updated"));
    };

    return (
        <div className="bg-white rounded-2xl shadow-md p-6 w-full h-[600px] overflow-y-auto">
            <h2 className="text-jerneNavy text-lg font-semibold mb-4">Players</h2>

            {loading ? (
                <p>Loading players…</p>
            ) : players.length === 0 ? (
                <p>No players found.</p>
            ) : (
                <div className="flex flex-col gap-4">
                    {players.map((player) => (
                        <div
                            key={player.id}
                            className="flex justify-between items-center border border-greyBorder rounded-lg px-4 py-3"
                        >
                            <div>
                                <p className="font-medium">{player.fullName}</p>
                                <p className="text-sm text-gray-600">{player.phone}</p>
                            </div>

                            <div className="flex items-center gap-4">
                                <span
                                    className={`px-3 py-1 text-xs rounded-full ${
                                        player.active
                                            ? "bg-green-100 text-green-700"
                                            : "bg-red-100 text-red-700"
                                    }`}
                                >
                                    {player.active ? "Active" : "Inactive"}
                                </span>

                                <span className="text-sm font-semibold">
                                    {player.balance} DKK
                                </span>

                                {!player.active ? (
                                    <button
                                        onClick={() => activateUser(player.id)}
                                        className="text-red-600 font-semibold hover:underline"
                                    >
                                        Activate
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => deactivateUser(player.id)}
                                        className="text-gray-600 font-semibold hover:underline"
                                    >
                                        Deactivate
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
