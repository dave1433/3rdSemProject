import React, { useEffect, useState } from "react";
import "../../css/PlayerHistoryPage.css";

import { PlayerPageHeader } from "../../components/PlayerPageHeader";
import { CreateRepeatForm } from "./CreateRepeatForm";
import { PlayerMyRepeatsPage } from "./PlayerMyRepeatsPage";

import { openapiAdapter, apiGet } from "../../../api/connection";

import {
    BoardClient
} from "../../../generated-ts-client";

import type {
    UserResponse,
    BoardDtoResponse,
    RepeatDtoResponse,
    BoardPriceDtoResponse,
} from "../../../generated-ts-client";

type HistoryTab = "all" | "myRepeats";

interface PlayerRecord {
    id: string;
    weekLabel: string;
    numbers: number[];
    times: number;
    totalAmountDkk: number;
    isRepeat: boolean;
}

interface RepeatRecord {
    id: string;
    numbers: number[];
    pricePerWeek: number;
    remainingWeeks: number;
    optOut: boolean;
    createdAt: string;
}

const boardClient = openapiAdapter(BoardClient);
const repeatClient = openapiAdapter(RepeatClient);
const boardPriceClient = openapiAdapter(BoardPriceClient);

// ---- helpers -------------------------------------------------

function getIsoWeekLabel(dateString?: string | null): string {
    if (!dateString) return "";
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return "";

    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const day = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - day);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(
        ((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
    );
    const year = date.getUTCFullYear();
    return `Week ${weekNo}, ${year}`;
}

export const PlayerHistoryPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<HistoryTab>("all");

    const [records, setRecords] = useState<PlayerRecord[]>([]);
    const [repeats, setRepeats] = useState<RepeatRecord[]>([]);
    const [priceMap, setPriceMap] = useState<Record<number, number>>({});

    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);

    const [playerName, setPlayerName] = useState("");

    // modal state
    const [showRepeatForm, setShowRepeatForm] = useState(false);
    const [repeatNumbers, setRepeatNumbers] = useState<number[] | null>(null);

    const CURRENT_PLAYER_ID = localStorage.getItem("userId") ?? "";

    // ---------------------------------------------------------
    // helper: load history + repeats + prices
    // ---------------------------------------------------------
    async function loadAllForUser(userId: string) {
        try {
            setLoading(true);
            setLoadError(null);

            // 1) User + boards = required
            const [users, boards] = await Promise.all([
                userClient.getUser(),
                boardClient.getByUser(userId),
            ]);

    // ------------------------------------------------
    // LOAD PLAYER NAME (FIXED: no userClient)
    // ------------------------------------------------
    async function loadPlayerName() {
        try {
            const res = await apiGet("/api/user");
            const users: UserResponse[] = await res.json();

            const me = users.find(u => u.id === CURRENT_PLAYER_ID);
            if (me) setPlayerName(me.fullName);

    // ------------------------------------------------
    // LOAD PLAYER HISTORY
    // ------------------------------------------------
    async function loadRecords(userId: string) {
        try {
            setLoading(true);
            setError(null);

            // 2) Repeats = optional (don’t break page if fails)
            try {
                // 🔹 RepeatClient only has getMine(), not getByUser
                const repeatDtos = await repeatClient.getMine();

                const mappedRepeats: RepeatRecord[] = (repeatDtos ?? []).map(
                    (r: RepeatDtoResponse) => ({
                        id: r.id,
                        numbers: r.numbers ?? [],
                        pricePerWeek: r.price ?? 0,
                        remainingWeeks: r.remainingWeeks ?? 0,
                        optOut: r.optOut ?? false,
                        createdAt: r.createdAt ?? new Date().toISOString(),
                    })
                );

                setRepeats(mappedRepeats);
            } catch (err) {
                console.warn(
                    "Failed to load repeats, continuing with boards only",
                    err
                );
                setRepeats([]);
            }

            // 3) Board prices = optional as well
            try {
                const prices = await boardPriceClient.getAll();
                const priceMapLocal: Record<number, number> = {};
                (prices ?? []).forEach((p: BoardPriceDtoResponse) => {
                    priceMapLocal[p.fieldsCount] = p.price;
                });
                setPriceMap(priceMapLocal);
            } catch (err) {
                console.warn("Failed to load board prices", err);
                setPriceMap({});
            }
        } catch (e) {
            console.error("Failed to load history", e);
            setLoadError("Failed to load history.");
        } finally {
            setLoading(false);
        }
    }

    // ---------------------------------------------------------
    // initial load
    // ---------------------------------------------------------
    useEffect(() => {
        if (!CURRENT_PLAYER_ID) {
            setLoadError("No player logged in.");
            return;
        }

        void loadAllForUser(CURRENT_PLAYER_ID);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [CURRENT_PLAYER_ID]);

    // ---------------------------------------------------------
    // interactions
    // ---------------------------------------------------------

    function openRepeatModal(record: PlayerRecord) {
        setRepeatNumbers(record.numbers);
        setShowRepeatForm(true);
    }

    function closeRepeatModal() {
        setShowRepeatForm(false);
        setRepeatNumbers(null);
    }

    async function handleRepeatCreated() {
        // after creating a repeat, refresh history + repeats
        if (!CURRENT_PLAYER_ID) return;
        try {
            await loadAllForUser(CURRENT_PLAYER_ID);
        } catch (e) {
            console.error("Failed to refresh after repeat create", e);
        }
    }

    // ------------------------------------------------
    // RENDER: ALL HISTORY TAB
    // ------------------------------------------------
    function renderAllTab() {
        if (loading) return <p className="history-status">Loading…</p>;
        if (loadError)
            return (
                <p className="history-status history-status-error">
                    {loadError}
                </p>
            );
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
                                    {n}
                                </span>
                            ))}
                        </div>

                        {/* meta + repeat button on the same row */}
                        <div className="history-card-meta-row">
                            <div className="history-card-meta">
                                <span>Fields: {r.numbers.length}</span>
                                <span>Times: {r.times}</span>
                                <span>Total: {r.totalAmountDkk} DKK</span>
                            </div>

                            <button
                                type="button"
                                className="history-repeat-btn"
                                onClick={() => openRepeatModal(r)}
                            >
                                Repeat
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    // ------------------------------------------------
    // RENDER: REPEAT TAB
    // ------------------------------------------------
    function renderRepeatTab() {
        return (
            <PlayerMyRepeatsPage
                repeats={repeats}
                priceMap={priceMap}
                onStopAutoRenew={handleStopAutoRenew}
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
                <p className="history-subtitle">
                    Your previous boards and repeats.
                </p>

                {/* tabs */}
                <div className="history-tabs">
                    <button
                        className={`history-tab-btn ${activeTab === "all" ? "history-tab-btn-active" : ""}`}
                        onClick={() => setActiveTab("all")}
                    >
                        ALL
                    </button>
                    <button
                        className={`history-tab-btn ${activeTab === "myRepeats" ? "history-tab-btn-active" : ""}`}
                        onClick={() => setActiveTab("myRepeats")}
                    >
                        MY REPEATS
                    </button>
                </div>

                <div className="history-content">
                    {activeTab === "all" ? renderAllTab() : renderRepeatTab()}
                </div>
            </div>

            {/* Repeat modal */}
            {showRepeatForm && repeatNumbers && (
                <div className="repeat-modal-backdrop">
                    <div className="repeat-modal-dialog">
                        <CreateRepeatForm
                            numbers={repeatNumbers}
                            onClose={closeRepeatModal}
                            onCreated={handleRepeatCreated}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
