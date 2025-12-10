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
                setAuthorized(false);
                return;
            }

            if (role !== "1") {
                navigate("/player");
                setAuthorized(false);
                return;
            }

            // ✅ now we are sure -> allow rendering
            setAuthorized(true);
        };

        verify();
    }, [navigate]);

    // ⛔ DO NOT RENDER ANY DASHBOARD CONTENT UNTIL AUTH IS DECIDED
    if (authorized === null) {
        return <div className="p-6 text-gray-600">Checking admin permissions…</div>;
    }

    // If authorization failed, redirect already happened
    if (!authorized) return null;

    // ✅ SAFE: everything below only renders if admin is authenticated
    return (
        <>
            <AdminHeader activeTab={activeTab} onChangeTab={setActiveTab} />

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

                {activeTab === "game" && authorized && (
                    <div className="flex flex-col gap-6">
                        <WinningNumbersCard authorized={authorized} />
                        <DrawHistoryTable authorized={authorized} />
                    </div>
                )}

                {activeTab === "transactions" && <PendingTransactions />}

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
