import { useEffect, useState } from "react";

export default function PlayersList({ refresh }) {
    const [players, setPlayers] = useState([]);

    const loadPlayers = async () => {
        const res = await fetch("http://localhost:5237/api/admin/players");
        const data = await res.json();
        setPlayers(data);
    };

    // Reload list when refresh changes
    useEffect(() => {
        loadPlayers();
    }, [refresh]);

    return (
        <div>
            <h3>Players</h3>
            <ul>
                {players.map((p) => (
                    <li key={p.id}>{p.fullName}</li>
                ))}
            </ul>
        </div>
    );
}
