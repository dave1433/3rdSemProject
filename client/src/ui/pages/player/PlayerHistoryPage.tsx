import React, { useEffect, useState } from "react";
import "../../css/PlayerHistoryPage.css";

import { PlayerPageHeader } from "../../components/PlayerPageHeader";
import { CreateRepeatForm } from "./CreateRepeatForm";
import { PlayerMyRepeatsPage } from "./PlayerMyRepeatsPage";

import { openapiAdapter, apiGet } from "../../../api/connection";

import {
    BoardClient,
    RepeatClient,
    BoardPriceClient,
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
    createdAt: string;
    weekLabel: string;
    numbers: number[];
    times: number;
    totalAmountDkk: number;
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

// -----------------------------------------------------------
// ISO WEEK LABEL HELPER
// -----------------------------------------------------------
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

    return `Week ${weekNo}, ${date.getUTCFullYear()}`;
}

// -----------------------------------------------------------
// MAIN COMPONENT
// -----------------------------------------------------------
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

    // -----------------------------------------------------------
    // LOAD PLAYER NAME (no userClient)
    // -----------------------------------------------------------
    async function loadPlayerName() {
        try {
            const res = await apiGet("/api/user");
            const users: UserResponse[] = await res.json();

            const me = users.find((u) => u.id === CURRENT_PLAYER_ID);
            if (me) setPlayerName(me.fullName);
        } catch (err) {
            console.error("Failed to load username", err);
        }
    }

    // -----------------------------------------------------------
    // LOAD HISTORY + REPEATS + PRICES
    // -----------------------------------------------------------
    async function loadAllForUser(userId: string) {
        try {
            setLoading(true);
            setLoadError(null);

            // 1) Boards (required)
            const boards = (await boardClient.getByUser(userId)) ?? [];
            const mappedRecords: PlayerRecord[] = boards.map(
                (b: BoardDtoResponse) => ({
                    id: b.id!,
                    createdAt: b.createdAt ?? new Date().toISOString(),
                    numbers: b.numbers ?? [],
                    times: b.times ?? 1,
                    totalAmountDkk: b.price ?? 0,
                    weekLabel: getIsoWeekLabel(b.createdAt),
                })
            );
            setRecords(mappedRecords);

            // 2) Repeats (optional)
            try {
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
                console.warn("Failed to load repeats, continuing with boards only", err);
                setRepeats([]);
            }

            // 3) Board prices (optional)
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

    // -----------------------------------------------------------
    // INITIAL LOAD
    // -----------------------------------------------------------
    useEffect(() => {
        if (!CURRENT_PLAYER_ID) {
            setLoadError("No player logged in.");
            return;
        }

        void loadPlayerName();
        void loadAllForUser(CURRENT_PLAYER_ID);
    }, [CURRENT_PLAYER_ID]);

    // -----------------------------------------------------------
    // INTERACTIONS
    // -----------------------------------------------------------
    function openRepeatModal(record: PlayerRecord) {
        setRepeatNumbers(record.numbers);
        setShowRepeatForm(true);
    }

    function closeRepeatModal() {
        setShowRepeatForm(false);
        setRepeatNumbers(null);
    }

    async function handleRepeatCreated() {
        if (!CURRENT_PLAYER_ID) return;
        await loadAllForUser(CURRENT_PLAYER_ID);
    }

    function handleStopAutoRenew(id: string) {
        console.log("Stop auto-renew for repeat:", id);
        // TODO: call API when you have endpoint
    }

    // -----------------------------------------------------------
    // RENDER: ALL HISTORY TAB (cards like repeat cards)
    // -----------------------------------------------------------
    function renderAllTab() {
        if (loading) return <p className="history-status">Loading…</p>;
        if (loadError)
            return (
                <p className="history-status history-status-error">{loadError}</p>
            );
        if (records.length === 0)
            return <p className="history-status">No history yet.</p>;

        return (
            <div className="repeat-card-list">
                {records.map((r) => (
                    <div key={r.id} className="repeat-card">
                        {/* HEADER ROW */}
                        <div className="repeat-card-header">
                            {/* Badge – always PLAYED (per Q3: no winner logic) */}
                            <span className="repeat-badge">PLAYED</span>

                            <span className="repeat-week-label">{r.weekLabel}</span>

                            <span className="repeat-type">History game</span>
                        </div>

                        {/* NUMBERS AS PILLS */}
                        <div className="repeat-card-numbers">
                            {r.numbers.map((n, i) => (
                                <span key={i} className="repeat-number-pill">
                  {n}
                </span>
                            ))}
                        </div>

                        {/* META ROW */}
                        <div className="repeat-card-meta">
                            <span>Fields: {r.numbers.length}</span>
                            <span>Times: {r.times}</span>
                            <span>Total: {r.totalAmountDkk} DKK</span>
                        </div>

                        {/* ACTION ROW */}
                        <div className="repeat-card-action-row">
                            <button
                                type="button"
                                className="repeat-stop-btn"
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

    // -----------------------------------------------------------
    // RENDER: REPEAT TAB
    // -----------------------------------------------------------
    function renderRepeatTab() {
        return (
            <PlayerMyRepeatsPage
                repeats={repeats}
                priceMap={priceMap}
                onStopAutoRenew={handleStopAutoRenew}
            />
        );
    }

    // -----------------------------------------------------------
    // MAIN RENDER
    // -----------------------------------------------------------
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
                        className={`history-tab-btn ${
                            activeTab === "all" ? "history-tab-btn-active" : ""
                        }`}
                        onClick={() => setActiveTab("all")}
                    >
                        ALL
                    </button>
                    <button
                        className={`history-tab-btn ${
                            activeTab === "myRepeats" ? "history-tab-btn-active" : ""
                        }`}
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
