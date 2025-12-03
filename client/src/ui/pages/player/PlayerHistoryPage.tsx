import { useEffect, useState } from "react";
import { PlayerPageHeader } from "../../components/PlayerPageHeader";
import { PlayerMyRepeatsPage } from "./PlayerMyRepeatsPage";
import { apiGet } from "../../../api/connection";

export const PlayerHistoryPage = () => {
    const [records, setRecords] = useState<any[]>([]);
    const [playerName, setPlayerName] = useState("Player");
    const playerId = localStorage.getItem("userId") ?? "";

    useEffect(() => {
        const load = async () => {
            try {
                const [boardsRes, usersRes] = await Promise.all([
                    apiGet(`/board/user/${playerId}`),
                    apiGet("/user"),
                ]);

                let boards: any[] = [];
                let users: any[] = [];

                if (boardsRes.ok) {
                    boards = await boardsRes.json();
                } else {
                    const txt = await boardsRes.text();
                    console.error(
                        "Failed to load boards",
                        boardsRes.status,
                        txt
                    );
                }

                if (usersRes.ok) {
                    users = await usersRes.json();
                } else {
                    const txt = await usersRes.text();
                    console.error(
                        "Failed to load users",
                        usersRes.status,
                        txt
                    );
                }

                setRecords(boards);

                const me = users.find((u: any) => u.id === playerId);
                if (me) setPlayerName(me.fullName);
            } catch (err) {
                console.error("History load error:", err);
            }
        };

        load();
    }, [playerId]);

    return (
        <div>
            <PlayerPageHeader userName={playerName} />
            <table>
                <tbody>
                {records.map(r => (
                    <tr key={r.id}>
                        <td>{r.numbers.join(", ")}</td>
                        <td>{r.price} DKK</td>
                    </tr>
                ))}
                </tbody>
            </table>
            <PlayerMyRepeatsPage />
        </div>
    );
};
