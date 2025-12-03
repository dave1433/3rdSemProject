import React, { useEffect, useState } from "react";
import "../../css/PlayerHistoryPage.css";
import { PlayerPageHeader } from "../../components/PlayerPageHeader";
import { PlayerMyRepeatsPage } from "./PlayerMyRepeatsPage";
import { BoardClient, PlayerClient } from "../../../generated-ts-client";
import type { BoardDto, PlayerResponse } from "../../../generated-ts-client";

type RecordStatus = "Pending" | "Complete";
type HistoryTab = "all" | "myRepeats";

interface PlayerRecord {
    id: string;
    createdAt: string;
    numbers: number[];
    times: number;
    status: RecordStatus;
    totalAmountDkk: number;
}

const boardClient = new BoardClient();
const playerClient = new PlayerClient();

export const PlayerHistoryPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<HistoryTab>("all");
    const [records, setRecords] = useState<PlayerRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [playerName, setPlayerName] = useState<string>("Player");

    const [selectedForRepeat, setSelectedForRepeat] =
        useState<PlayerRecord | null>(null);

    const CURRENT_PLAYER_ID = localStorage.getItem("userId") ?? "";

    // Force default to "ALL" on page load
    useEffect(() => {
        setActiveTab("all");
    }, []);

    useEffect(() => {
        if (!CURRENT_PLAYER_ID) {
            setError("No player is logged in. Please log in first.");
            return;
        }

        void (async () => {
            await Promise.all([
                loadRecords(CURRENT_PLAYER_ID),
                loadPlayer(CURRENT_PLAYER_ID),
            ]);
        })();
    }, [CURRENT_PLAYER_ID]);

    async function loadPlayer(playerId: string) {
        try {
            const players: PlayerResponse[] = await playerClient.getPlayers();
            const current = players.find((p) => p.id === playerId);
            if (current) {
                setPlayerName(current.fullName);
            }
        } catch (err) {
            console.error("Failed to load player", err);
        }
    }

    async function loadRecords(playerId: string) {
        try {
            setLoading(true);
            setError(null);

            const boards: BoardDto[] = await boardClient.getByPlayer(playerId);

            const mapped: PlayerRecord[] = boards.map((b) => {
                const totalAmount = b.price;
                const times = b.times ?? 1;

                const purchaseTx = b.transactions?.find(
                    (t) => t.type === "purchase"
                );

                let status: RecordStatus = "Pending";
                if (
                    purchaseTx &&
                    purchaseTx.status.toLowerCase() === "approved"
                ) {
                    status = "Complete";
                }

                return {
                    id: b.id,
                    createdAt: b.createdAt ?? new Date().toISOString(),
                    numbers: b.numbers,
                    times,
                    status,
                    totalAmountDkk: totalAmount,
                };
            });

            setRecords(mapped);
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
            return (
                <p className="history-status history-status-error">
                    {error}
                </p>
            );
        }
        if (!loading && !error && records.length === 0) {
            return (
                <p className="history-status">
                    You don’t have any history yet.
                </p>
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

                        return (
                            <tr key={r.id}>
                                <td>
                                    {new Date(r.createdAt).toLocaleDateString()}
                                </td>
                                <td>{r.numbers.join(", ")}</td>
                                <td>{fields}</td>
                                <td>{r.times}</td>
                                <td>{r.totalAmountDkk} DKK</td>
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
            <PlayerPageHeader userName={playerName} />

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
                            (activeTab === "all"
                                ? " history-tab-btn-active"
                                : "")
                        }
                        onClick={() => setActiveTab("all")}
                    >
                        ALL
                    </button>

                    <button
                        type="button"
                        className={
                            "history-tab-btn" +
                            (activeTab === "myRepeats"
                                ? " history-tab-btn-active"
                                : "")
                        }
                        onClick={() => setActiveTab("myRepeats")}
                    >
                        MY REPEATS
                    </button>
                </div>

                {/* Tab Content */}
                <div className="history-content">
                    {activeTab === "all"
                        ? renderAllTab()
                        : renderMyRepeatsTab()}
                </div>
            </div>
        </div>
    );
};
