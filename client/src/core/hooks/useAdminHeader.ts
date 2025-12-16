import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { apiGet } from "../../api/connection";

export function useAdminHeader() {
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState("players");
    const [adminName, setAdminName] = useState<string>("Loading...");

    useEffect(() => {
        const fetchAdmin = async () => {
            try {
                const res = await apiGet("/api/user/me");

                if (!res.ok) {
                    setAdminName("Admin");
                    return;
                }

                const text = await res.text();
                if (!text) {
                    setAdminName("Admin");
                    return;
                }

                const data = JSON.parse(text);
                setAdminName(data.fullName ?? "Admin");
            } catch {
                setAdminName("Admin");
            }
        };

        fetchAdmin();
    }, []);

    function handleLogout() {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("userId");
        navigate("/login");
    }

    return {
        activeTab,
        setActiveTab,
        adminName, // 👈 NEW
        handleLogout,
        tabs: [
            { id: "players", label: "Players" },
            { id: "game", label: "Game Control" },
            { id: "transactions", label: "Transactions" },
            { id: "history", label: "History" }
        ]
    };
}
