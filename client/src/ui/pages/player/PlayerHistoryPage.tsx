import { useEffect, useState } from "react";
import { PlayerPageHeader } from "../../components/PlayerPageHeader";
import { PlayerMyRepeatsPage } from "./PlayerMyRepeatsPage";
import { apiGet } from "../../../api/connection";

export const PlayerHistoryPage = () => {
    const [records, setRecords] = useState<any[]>([]);
    const [playerName, setPlayerName] = useState("Player");
    const playerId = localStorage.getItem("userId") ?? "";

    useEffect(() => {
        Promise.all([
            apiGet(`/board/player/${playerId}`).then(r => r.json()),
            apiGet("/player").then(r => r.json())
        ]).then(([boards, players]) => {
            setRecords(boards);
            const me = players.find((p: any) => p.id === playerId);
            if (me) setPlayerName(me.fullName);
        });
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
