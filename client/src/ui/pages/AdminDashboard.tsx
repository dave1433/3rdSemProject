import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { AdminHeader } from "../components/AdminHeader";
import { PlayerForm } from "../components/PlayerForm.tsx";
import { PlayerList } from "../components/PlayerList";
import { WinningNumbersCard } from "../components/WinningNumbersCard";
import { DrawHistoryTable } from "../components/DrawHistoryTable";
import {PendingTransactions} from "../components/PendingTransactions.tsx";

export const AdminDashboard = () => {
    const navigate = useNavigate();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");

        if (!token) {
            navigate("/login");
            return;
        }

        if (role !== "1") {
            navigate("/player");
            return;
        }

        setAuthorized(true);
    }, [navigate]);

    if (!authorized) return null;

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
