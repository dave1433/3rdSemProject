import { useNavigate } from "react-router";
import { useState } from "react";

export function useAdminHeader() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("players");

    function handleLogout() {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("userId");
        navigate("/login");
    }

    return {
        activeTab,
        setActiveTab,
        handleLogout,
        tabs: [
            { id: "players", label: "Players" },
            { id: "game", label: "Game Control" },
            { id: "transactions", label: "Transactions" },
            { id: "history", label: "History" }
        ]
    };
}
