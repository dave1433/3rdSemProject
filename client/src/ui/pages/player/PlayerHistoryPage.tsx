import React, { useEffect, useState } from "react";
//import { api } from "../../core/api"; //
import "../../css/PlayerHistoryPage.css";
import { PlayerPageHeader } from "../../components/PlayerPageHeader";
import { PlayerMyRepeatsPage } from "./PlayerMyRepeatsPage";

type RecordStatus = "Pending" | "Complete";
type HistoryTab = "all" | "myRepeats";

interface PlayerRecord {
    id: string;
    createdAt: string;
    numbers: number[];
    times: number;
    status: RecordStatus;
}

export const PlayerHistoryPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<HistoryTab>("all");
    const [records, setRecords] = useState<PlayerRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // when clicking "Reorder" we remember that row and pass its numbers to MyRepeats
    const [selectedForRepeat, setSelectedForRepeat] =
        useState<PlayerRecord | null>(null);

    useEffect(() => {
        void loadRecords();
    }, []);

    async function loadRecords() {
        try {
            setLoading(true);
            setError(null);

            // TODO: change "/MyRecords" to your real endpoint
            //const res = await api.get<PlayerRecord[]>("/MyRecords");
            //setRecords(res.data);

            // For testing without backend, below are fake data. Remove the fake data after connecting to backend
            const fake: PlayerRecord[] = [
              {
                id: "1",
                createdAt: new Date().toISOString(),
                numbers: [1, 4, 7, 9, 12],
                times: 5,
                status: "Complete",
              },
              {
                id: "2",
                createdAt: new Date().toISOString(),
                numbers: [2, 5, 8, 13, 16],
                times: 2,
                status: "Pending",
              },
            ];
            setRecords(fake);

        } catch (err) {
            console.error(err);
            const message =
                err instanceof Error ? err.message : "Failed to load history";
            setError(message);
        } finally {
            setLoading(false);
        }
    }

    function handleReorderClick(record: PlayerRecord) {
        setSelectedForRepeat(record);
        setActiveTab("myRepeats");
    }

    function renderAllTab() {
        if (loading) {
            return <p className="history-status">Loading…</p>;
        }
        if (error) {
            return <p className="history-status history-status-error">{error}</p>;
        }
        if (!loading && !error && records.length === 0) {
            return (
                <p className="history-status">You don’t have any history yet.</p>
            );
        }

        return (
            <div className="history-table-wrapper">
                <table className="history-table">
                    <thead>
                    <tr>
                        <th>Date</th>
                        <th>Numbers</th>
                        <th>Fields</th>
                        <th>Times</th>
                        <th>Ttl Amount</th>
                        <th>Status</th>
                        <th className="history-action-header">Action</th>
                    </tr>
                    </thead>
                    <tbody>
                    {records.map((r) => {
                        const fields = r.numbers.length;
                        const totalAmount = fields * r.times * 20; // numbers * times * 20 DKK

                        return (
                            <tr key={r.id}>
                                <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                                <td>{r.numbers.join(", ")}</td>
                                <td>{fields}</td>
                                <td>{r.times}</td>
                                <td>{totalAmount} DKK</td>
                                <td>
                                  <span
                                      className={
                                          "history-status-badge " +
                                          (r.status === "Complete"
                                              ? "history-status-badge--complete"
                                              : "history-status-badge--pending")
                                      }
                                  >
                                    {r.status}
                                  </span>
                                </td>

                                <td className="history-actions-cell">
                                    <button
                                        type="button"
                                        className="history-action-btn"
                                        onClick={() => handleReorderClick(r)}
                                    >
                                        Reorder
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>
        );
    }

    function renderMyRepeatsTab() {
        return (
            <div className="history-myrepeats-wrapper">
                <PlayerMyRepeatsPage
                    initialNumbers={selectedForRepeat?.numbers}
                />
            </div>
        );
    }

    return (
        <div className="history-page">
            <PlayerPageHeader userName="Mads Andersen" />

            <div className="history-inner">
                <h1 className="history-title">History</h1>
                <p className="history-subtitle">
                    Overview of my past boards and repeat orders.
                </p>

                {/* Tabs */}
                <div className="history-tabs">
                    <button
                        type="button"
                        className={
                            "history-tab-btn" +
                            (activeTab === "all" ? " history-tab-btn-active" : "")
                        }
                        onClick={() => setActiveTab("all")}
                    >
                        All
                    </button>
                    <button
                        type="button"
                        className={
                            "history-tab-btn" +
                            (activeTab === "myRepeats" ? " history-tab-btn-active" : "")
                        }
                        onClick={() => setActiveTab("myRepeats")}
                    >
                        My repeats
                    </button>
                </div>

                {/* Tab content */}
                <div className="history-content">
                    {activeTab === "all" ? renderAllTab() : renderMyRepeatsTab()}
                </div>
            </div>
        </div>
    );
};
