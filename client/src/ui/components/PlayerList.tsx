// /ui/components/player/PlayerList.tsx
import { usePlayers } from "../../utils/hooks/usePlayers";

export const PlayerList = () => {
    const { players } = usePlayers(); // ← Hook provides real data

    return (
        <div className="bg-white rounded-2xl shadow-md p-6 w-full h-[600px] overflow-y-auto">
            <h2 className="text-jerneNavy text-lg font-semibold mb-4">Players</h2>

            {players.length === 0 ? (
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
                                    className={`px-2 py-1 text-xs rounded ${
                                        player.active
                                            ? "bg-green-200 text-green-800"
                                            : "bg-gray-200 text-gray-700"
                                    }`}
                                >
                                    {player.active ? "Active" : "Inactive"}
                                </span>

                                <button className="text-red-600 hover:underline text-sm">
                                    Edit
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};