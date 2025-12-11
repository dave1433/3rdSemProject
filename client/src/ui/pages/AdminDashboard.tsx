import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import { AdminHeader } from "../components/AdminHeader";
import { PlayerForm } from "../components/PlayerForm";
import { PlayerList } from "../components/PlayerList";
import { WinningNumbersCard } from "../components/WinningNumbersCard";
import { DrawHistoryTable } from "../components/DrawHistoryTable";
import { PendingTransactions } from "../components/PendingTransactions";
import { AdminBoardsView } from "../components/AdminBoardsView";

import { useAdminBoards } from "../../core/hooks/useAdminBoards";

export const AdminDashboard = () => {
    const navigate = useNavigate();

    const [authorized, setAuthorized] = useState<boolean | null>(null);
    const [activeTab, setActiveTab] = useState("players");
    const [showBoards, setShowBoards] = useState(false);

    const { boards, loading, error, reload } = useAdminBoards();

    useEffect(() => {
        const verify = () => {
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
        };

        verify();
    }, [navigate]);

    if (authorized === null) return null;

    return (
        <>
            {/* Top Navbar / Tabs */}
            <AdminHeader activeTab={activeTab} onChangeTab={setActiveTab} />

            {/* Page Content */}
            <div className="p-6">

                {/* --- PLAYERS TAB --- */}
                {activeTab === "players" && (
                    <div className="flex flex-col lg:flex-row gap-6">

                        {/* LEFT SIDE — CREATE USER FORM */}
                        <div className="w-full lg:w-1/2">
                            <PlayerForm />
                        </div>

                        {/* RIGHT SIDE — PLAYER LIST */}
                        <div className="w-full lg:w-1/2">
                            <PlayerList />
                        </div>

                    </div>
                )}

                {/* --- GAME CONTROL TAB --- */}
                {activeTab === "game" && (
                    <div className="flex flex-col gap-6">
                        <WinningNumbersCard />
                        <DrawHistoryTable />
                    </div>
                )}

                {/* --- TRANSACTIONS TAB --- */}
                {activeTab === "transactions" && (
                    <PendingTransactions />
                )}

                {/* --- HISTORY TAB --- */}
                {activeTab === "history" && (
                    <AdminBoardsView
                        boards={boards}
                        loading={loading}
                        error={error}
                        reload={reload}
                        visible={showBoards}
                        onToggle={() => setShowBoards((s) => !s)}
                    />
                )}

            </div>
        </>
    );
};