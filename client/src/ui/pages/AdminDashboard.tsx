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
import { useAdminHeader } from "../../core/hooks/useAdminHeader";

export const AdminDashboard = () => {
    const navigate = useNavigate();

    const [authorized, setAuthorized] = useState<boolean | null>(null);
    const [activeTab, setActiveTab] = useState("players");
    const [showBoards, setShowBoards] = useState(false);

    // ✅ SINGLE SOURCE OF TRUTH FOR HEADER + NOTIFICATIONS
    const adminHeader = useAdminHeader();

    const { boards, loading, error, reload } = useAdminBoards();

    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");

        if (!token) {
            navigate("/login");
            setAuthorized(false);
            return;
        }

        if (role !== "1") {
            navigate("/player");
            setAuthorized(false);
            return;
        }

        setAuthorized(true);
    }, [navigate]);

    // ⛔ WAIT FOR AUTH CHECK
    if (authorized === null) {
        return <div className="p-6 text-gray-600">Checking admin permissions…</div>;
    }

    if (!authorized) return null;

    return (
        <>
            <AdminHeader
                activeTab={activeTab}
                onChangeTab={setActiveTab}
                headerState={adminHeader}
            />

            <div className="p-6">
                {activeTab === "players" && (
                    <div className="flex flex-col lg:flex-row gap-6">
                        <div className="w-full lg:w-1/2">
                            <PlayerForm />
                        </div>
                        <div className="w-full lg:w-1/2">
                            <PlayerList />
                        </div>
                    </div>
                )}

                {activeTab === "game" && (
                    <div className="flex flex-col gap-6">
                        <WinningNumbersCard authorized />
                        <DrawHistoryTable authorized />
                    </div>
                )}

                {activeTab === "transactions" && (
                    <PendingTransactions
                        onStatusChange={adminHeader.reloadPendingTransactions}
                    />
                )}

                {activeTab === "history" && (
                    <AdminBoardsView
                        boards={boards}
                        loading={loading}
                        error={error}
                        reload={reload}
                        visible={showBoards}
                        onToggle={() => setShowBoards(s => !s)}
                    />
                )}
            </div>
        </>
    );
};
