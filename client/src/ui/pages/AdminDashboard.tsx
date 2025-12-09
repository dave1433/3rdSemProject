// src/ui/pages/AdminDashboard.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import { AdminHeader } from "../components/AdminHeader";
import { PlayerForm } from "../components/PlayerForm";
import { PlayerList } from "../components/PlayerList";
import { WinningNumbersCard } from "../components/WinningNumbersCard";
import { DrawHistoryTable } from "../components/DrawHistoryTable";
import { PendingTransactions } from "../components/PendingTransactions";

import { useAdminBoards } from "../../core/hooks/useAdminBoards";
import { AdminBoardsView } from "../components/AdminBoardsView";

export const AdminDashboard = () => {
    const navigate = useNavigate();

    const [authorized, setAuthorized] = useState<boolean | null>(null);
    const [showBoards, setShowBoards] = useState(false);

    const { boards, loading, error, reload } = useAdminBoards();

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

    if (authorized === null) return null;

    return (
        <>
            <AdminHeader />

            <PlayerForm />
            <PlayerList />
            <WinningNumbersCard />
            <DrawHistoryTable />
            <PendingTransactions />

            {/* ✅ PURCHASED BOARDS SECTION */}
            <AdminBoardsView
                boards={boards}
                loading={loading}
                error={error}
                reload={reload}
                visible={showBoards}
                onToggle={() => setShowBoards((s) => !s)}
            />
        </>
    );
};
