import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { apiGet, openapiAdapter } from "../../api/connection";
import { TransactionClient } from "../../generated-ts-client";

const transactionClient = openapiAdapter(TransactionClient);

export function useAdminHeader() {
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState("players");
    const [adminName, setAdminName] = useState<string>("Loading...");
    const [hasPending, setHasPending] = useState<boolean>(false);

    // Load admin name
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

    // 🔔 Load pending transactions flag
    async function reloadPendingTransactions() {
        try {
            const pending = await transactionClient.getPending();
            setHasPending(pending.length > 0);
        } catch (e) {
            console.error("Failed to load pending transactions", e);
            setHasPending(false);
        }
    }

    // Load once on mount
    useEffect(() => {
        void reloadPendingTransactions();
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
        adminName,
        handleLogout,
        reloadPendingTransactions,
        tabs: [
            { id: "players", label: "Players" },
            { id: "game", label: "Game Control" },
            {
                id: "transactions",
                label: "Transactions",
                alert: hasPending
            },
            { id: "history", label: "History" }
        ]
    };
}
