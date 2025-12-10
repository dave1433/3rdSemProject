import { useState } from "react";
import { AdminHeader } from "../components/AdminHeader";
import { PlayerForm } from "../components/PlayerForm";
import { PlayerList } from "../components/PlayerList";
import { WinningNumbersCard } from "../components/WinningNumbersCard";
import { DrawHistoryTable } from "../components/DrawHistoryTable";
import { PendingTransactions } from "../components/PendingTransactions";
import { AdminBoardsView } from "../components/AdminBoardsView";
import { useAdminBoards } from "../../core/hooks/useAdminBoards";

export const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState("players");
    const [showBoards, setShowBoards] = useState(false);

    const { boards, loading, error, reload } = useAdminBoards();

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

                {activeTab === "game" && (
                    <>
                        <WinningNumbersCard />
                        <DrawHistoryTable />
                    </>
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
