import React, { useEffect, useState } from "react";
import "../../css/PlayerHistoryPage.css";

import { PlayerPageHeader } from "../../components/PlayerPageHeader";
import { PlayerMyRepeatsPage } from "./PlayerMyRepeatsPage";

import { openapiAdapter, apiGet } from "../../../api/connection";

import {
    BoardClient
} from "../../../generated-ts-client";

import type {
    UserResponse,
    BoardDtoResponse
} from "../../../generated-ts-client";


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

const boardClient = openapiAdapter(BoardClient);

export const PlayerHistoryPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<HistoryTab>("all");
    const [records, setRecords] = useState<PlayerRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [playerName, setPlayerName] = useState("");

    const [selectedForRepeat, setSelectedForRepeat] =
        useState<PlayerRecord | null>(null);

    const CURRENT_PLAYER_ID = localStorage.getItem("userId") ?? "";

    useEffect(() => {
        if (!CURRENT_PLAYER_ID) {
            setError("No player logged in.");
            return;
        }

        void (async () => {
            await Promise.all([
                loadRecords(CURRENT_PLAYER_ID),
                loadPlayerName(),
            ]);
        })();
    }, [CURRENT_PLAYER_ID]);

    // ------------------------------------------------
    // LOAD PLAYER NAME (FIXED: no userClient)
    // ------------------------------------------------
    async function loadPlayerName() {
        try {
            const res = await apiGet("/api/user");
            const users: UserResponse[] = await res.json();

            const me = users.find(u => u.id === CURRENT_PLAYER_ID);
            if (me) setPlayerName(me.fullName);
        } catch (err) {
            console.error("Failed to load player name", err);
        }
    }

    // ------------------------------------------------
    // LOAD PLAYER HISTORY
    // ------------------------------------------------
    async function loadRecords(userId: string) {
        try {
            setLoading(true);
            setError(null);

            const boards: BoardDtoResponse[] = await boardClient.getByUser(userId);

            const mapped = boards.map(b => {
                const purchaseTx = b.transactions?.find(
                    t => t.type?.toLowerCase() === "purchase"
                );

                const status: RecordStatus =
                    purchaseTx?.status?.toLowerCase() === "approved"
                        ? "Complete"
                        : "Pending";

                return {
                    id: b.id,
                    createdAt: b.createdAt ?? new Date().toISOString(),
                    numbers: b.numbers ?? [],
                    times: b.times ?? 1,
                    status,
                    totalAmountDkk: b.price,
                };
            });

            setRecords(mapped);
        } catch (err) {
            console.error("Failed to load history", err);
            setError("Failed to load history");
        } finally {
            setLoading(false);
        }
    }

    function handleReorder(record: PlayerRecord) {
        setSelectedForRepeat(record);
        setActiveTab("myRepeats");
    }

    // ------------------------------------------------
    // RENDER: ALL HISTORY TAB
    // ------------------------------------------------
    function renderAllTab() {
        if (loading) return <p className="history-status">Loading…</p>;
        if (error) return <p className="history-status history-status-error">{error}</p>;
        if (records.length === 0)
            return <p className="history-status">No history yet.</p>;

        return (
            <div className="history-table-wrapper">
                <table className="history-table">
                    <thead>
                    <tr>
                        <th>Date</th>
                        <th>Numbers</th>
                        <th>Fields</th>
                        <th>Times</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                    </thead>

                    <tbody>
                    {records.map(r => (
                        <tr key={r.id}>
                            <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                            <td>{r.numbers.join(", ")}</td>
                            <td>{r.numbers.length}</td>
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
                            <td>
                                <button
                                    className="history-action-btn"
                                    onClick={() => handleReorder(r)}
                                >
                                    Reorder
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        );
    }

    // ------------------------------------------------
    // RENDER: REPEAT TAB
    // ------------------------------------------------
    function renderRepeatTab() {
        return (
            <PlayerMyRepeatsPage
                initialNumbers={selectedForRepeat?.numbers ?? []}
            />
        );
    }

    // ------------------------------------------------
    // MAIN RENDER
    // ------------------------------------------------
    return (
        <div className="history-page">
            <PlayerPageHeader userName={playerName} />

            <div className="history-inner">
                <h1 className="history-title">History</h1>
                <p className="history-subtitle">Your previous boards and repeats.</p>

                <div className="history-tabs">
                    <button
                        className={`history-tab-btn ${activeTab === "all" ? "history-tab-btn-active" : ""}`}
                        onClick={() => setActiveTab("all")}
                    >
                        All
                    </button>

                    <button
                        className={`history-tab-btn ${activeTab === "myRepeats" ? "history-tab-btn-active" : ""}`}
                        onClick={() => setActiveTab("myRepeats")}
                    >
                        My repeats
                    </button>
                </div>

                {activeTab === "all" ? renderAllTab() : renderRepeatTab()}
            </div>
        </div>
    );
};
