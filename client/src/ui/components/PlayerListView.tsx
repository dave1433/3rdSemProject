import type { Player } from "../../core/hooks/usePlayerList";
import { apiPatch } from "../../api/connection";
import { useState } from "react";

interface Props {
    players: Player[];
    loading: boolean;
}

export const PlayerListView = ({ players, loading }: Props) => {
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const toggleUserStatus = async (player: Player) => {
        if (updatingId) return;

        setUpdatingId(player.id);

        const endpoint = player.active
            ? `/api/user/${player.id}/deactivate`
            : `/api/user/${player.id}/activate`;

        try {
            const res = await apiPatch(endpoint);
            if (!res.ok) {
                console.error("Failed to update user", await res.text());
            }
        } finally {
            setUpdatingId(null);
            window.dispatchEvent(new Event("player-updated"));
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-md p-6 w-full h-[600px] overflow-y-auto">
            <h2 className="text-jerneNavy text-lg font-semibold mb-4">
                Users
            </h2>

            {loading ? (
                <p>Loading players…</p>
            ) : players.length === 0 ? (
                <p>No players found.</p>
            ) : (
                <div className="flex flex-col gap-4">
                    {players.map(player => {
                        const disabled = updatingId === player.id;

                        return (
                            <div
                                key={player.id}
                                className="flex justify-between items-center border border-greyBorder rounded-lg px-4 py-3"
                            >
                                {/* USER INFO */}
                                <div>
                                    <p className="font-medium">{player.fullName}</p>

                                    {/* PHONE */}
                                    <p className="text-sm text-gray-600">{player.phone}</p>

                                    {/* EMAIL BELOW PHONE */}
                                    <p className="text-sm text-gray-600">{player.email}</p>
                                    
                                </div>

                                {/* ACTIONS */}
                                <div className="flex items-center gap-6">

                                    {/* ROLE OR BALANCE */}
                                    {player.role === 1 ? (
                                        <span className="px-2 py-1 text-xs rounded bg-red-600 text-white">
                                            Admin
                                        </span>
                                    ) : (
                                        <span className="text-sm font-semibold">
                                            {player.balance} DKK
                                        </span>
                                    )}

                                    {/* TOGGLE — ADMINS CAN BE DEACTIVATED NOW */}
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={player.active}
                                            disabled={disabled}
                                            onChange={() => toggleUserStatus(player)}
                                        />

                                        <div
                                            className={`
                                                w-11 h-6 rounded-full transition
                                                ${player.active ? "bg-green-500" : "bg-gray-300"}
                                                ${disabled ? "opacity-50 cursor-not-allowed" : ""}
                                            `}
                                        />

                                        <span
                                            className={`
                                                absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition
                                                ${player.active ? "translate-x-5" : ""}
                                            `}
                                        />
                                    </label>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
