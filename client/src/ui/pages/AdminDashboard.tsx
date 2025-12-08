import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import { AdminHeader } from "../components/AdminHeader";
import { PlayerForm } from "../components/PlayerForm";
import { PlayerList } from "../components/PlayerList";
import { WinningNumbersCard } from "../components/WinningNumbersCard";
import { DrawHistoryTable } from "../components/DrawHistoryTable";
import { PendingTransactions } from "../components/PendingTransactions";

export const AdminDashboard = () => {
    const navigate = useNavigate();
    const [authorized, setAuthorized] = useState<boolean | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");

        // 🚫 Not logged in → send to login
        if (!token) {
            navigate("/login");
            return;
        }

        // 🚫 Logged in but NOT admin → redirect to player dashboard
        if (role !== "1") {
            navigate("/player");
            return;
        }

        // ✅ Admin confirmed
        setAuthorized(true);
    }, [navigate]);

    // Prevent flicker while verifying auth
    if (authorized === null) return null;

    return (
        <>
            <AdminHeader />
            <PlayerForm />
            <PlayerList />
            <WinningNumbersCard />
            <DrawHistoryTable />
            <PendingTransactions />
        </>
    );
};
