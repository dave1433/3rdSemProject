import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";   // ✅ add this
import { getPlayers, PlayerResponse } from "../api/players";
import CreatePlayerForm from "../components/CreatePlayerForm";

export default function DashboardPage() {
    const [players, setPlayers] = useState<PlayerResponse[]>([]);
    const navigate = useNavigate();   // ✅ for routing

    async function loadPlayers() {
        try {
            const data = await getPlayers();
            setPlayers(data);
        } catch (err) {
            console.error("Failed to load players", err);
        }
    }

    useEffect(() => {
        loadPlayers();
    }, []);

    return (
        <div style={{ display: "flex", gap: "60px", marginTop: "40px", padding: "20px" }}>

            {/* LEFT SIDE — Create Player */}
            <CreatePlayerForm onCreated={loadPlayers} />

            {/* RIGHT SIDE — Player List */}
            <div style={{ flex: 1 }}>
                <h2>Players</h2>

                <ul style={{ listStyle: "none", paddingLeft: 0 }}>
                    {players.map((p) => (
                        <li
                            key={p.id}
                            style={{
                                padding: "10px",
                                background: "#f3f4f6",
                                marginBottom: "8px",
                                borderRadius: "4px"
                            }}
                        >
                            <strong>{p.fullName}</strong>
                            <br />
                            <small>{p.email || "No email"}</small>
                            <br />
                            <small>{p.phone || "No phone"}</small>
                        </li>
                    ))}
                </ul>

                {/* ✅ SELECT NUMBER button */}
                <button
                    onClick={() => navigate("/player-board")}
                    style={{
                        marginTop: "20px",
                        padding: "12px 24px",
                        background: "#4f46e5",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "1rem"
                    }}
                >
                    Select Number
                </button>
            </div>

        </div>
    );
}
