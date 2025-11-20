import { useState } from "react";
import { createPlayer } from "../api/players";

export default function CreatePlayerForm({ onCreated }) {
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");

    const savePlayer = async () => {
        if (!fullName.trim()) return;

        const player = await createPlayer({
            fullName,
            phone: phone || null,
            email: email || null
        });

        // return id to dashboard
        onCreated(player.id);

        setFullName("");
        setPhone("");
        setEmail("");
    };

    return (
        <div style={{ width: "300px" }}>
            <h2>Create Player</h2>

            <input
                type="text"
                placeholder="Full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={{ display: "block", width: "100%", marginBottom: "10px", padding: "10px" }}
            />

            <input
                type="text"
                placeholder="Phone (optional)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ display: "block", width: "100%", marginBottom: "10px", padding: "10px" }}
            />

            <input
                type="email"
                placeholder="Email (optional)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ display: "block", width: "100%", marginBottom: "10px", padding: "10px" }}
            />

            <button
                onClick={savePlayer}
                style={{
                    padding: "10px 20px",
                    background: "#4f46e5",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer"
                }}
            >
                Save
            </button>
        </div>
    );
}
