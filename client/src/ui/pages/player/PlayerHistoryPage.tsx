import React, { useEffect, useMemo, useState } from "react";
import "../../css/PlayerHistoryPage.css";

import { openapiAdapter } from "../../../api/connection";
import { useCurrentUser } from "../../../core/hooks/useCurrentUser";

import {
    BoardClient,
    RepeatClient,
} from "../../../generated-ts-client";

import type {
    BoardDtoResponse,
    RepeatDtoResponse,
} from "../../../generated-ts-client";

// ----------------------------------
// TYPES
// ----------------------------------
interface PlayerRecord {
    id: string;
    createdAt?: string | null;

    weekLabel: string;
    numbers: number[];
    times: number;
    totalAmountDkk: number;

    autoRepeat: boolean;
    repeatId?: string;
    repeatOptOut: boolean;
}

// ----------------------------------
// CLIENTS
// ----------------------------------
const boardClient = openapiAdapter(BoardClient);
const repeatClient = openapiAdapter(RepeatClient);

// ----------------------------------
// HELPERS
// ----------------------------------
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

// ----------------------------------
// COMPONENT
// ----------------------------------
export const PlayerHistoryPage: React.FC = () => {
    const { user } = useCurrentUser();

    const [records, setRecords] = useState<PlayerRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);

    const CURRENT_PLAYER_ID = user?.id ?? "";

    // ----------------------------------
    // LOAD HISTORY
    // ----------------------------------
    async function loadHistory(userId: string) {
        try {
            setLoading(true);
            setLoadError(null);

            const [boards, repeats] = await Promise.all([
                boardClient.getByUser(userId),
                repeatClient.getMine(),
            ]);

            const repMap = new Map<string, RepeatDtoResponse>();
            (repeats ?? []).forEach(r => repMap.set(r.id, r));

            const mapped: PlayerRecord[] = (boards ?? []).map(
                (b: BoardDtoResponse) => {
                    const rid = b.repeatId ?? undefined;
                    const rep = rid ? repMap.get(rid) : undefined;

                    return {
                        id: b.id,
                        createdAt: b.createdAt ?? null,
                        weekLabel: getIsoWeekLabel(b.createdAt),
                        numbers: b.numbers ?? [],
                        times: b.times ?? 1,
                        totalAmountDkk: b.price ?? 0,
                        autoRepeat: !!b.autoRepeat,
                        repeatId: rid,
                        repeatOptOut: rep ? !!rep.optOut : false,
                    };
                }
            );

            setRecords(mapped);
        } catch (err) {
            console.error("Failed to load history:", err);
            setLoadError("Failed to load history.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (!CURRENT_PLAYER_ID) return;
        void loadHistory(CURRENT_PLAYER_ID);
    }, [CURRENT_PLAYER_ID]);

    // ----------------------------------
    // FIND STARTER BOARD PER REPEAT
    // ----------------------------------
    const starterByRepeatId = useMemo(() => {
        const earliest = new Map<string, { boardId: string; createdAtMs: number }>();

        for (const r of records) {
            if (!r.repeatId || !r.createdAt) continue;

            const t = new Date(r.createdAt).getTime();
            const existing = earliest.get(r.repeatId);

            if (!existing || t < existing.createdAtMs) {
                earliest.set(r.repeatId, { boardId: r.id, createdAtMs: t });
            }
        }

        const map = new Map<string, string>();
        earliest.forEach((v, k) => map.set(k, v.boardId));
        return map;
    }, [records]);

    // ----------------------------------
    // TOGGLE REPEAT
    // ----------------------------------
    async function handleRepeatClick(
        boardId: string,
        currentAutoRepeat: boolean,
        repeatOptOut: boolean
    ) {
        if (repeatOptOut) return;

        const nextValue = !currentAutoRepeat;
        const ok = window.confirm(
            nextValue
                ? "Start repeat for this ticket?\n\nThe system will auto-buy next draw."
                : "Stop repeat for this ticket?\n\nThis cannot be undone."
        );

        if (!ok) return;

        try {
            await boardClient.setAutoRepeat(boardId, { autoRepeat: nextValue });
            await loadHistory(CURRENT_PLAYER_ID);
        } catch (err) {
            console.error("Failed to toggle auto-repeat", err);
            alert("Could not update repeat setting.");
        }
    }

    // ----------------------------------
    // RENDER
    // ----------------------------------
    return (
        <div className="history-page">

            <div className="history-inner">
                <h1 className="history-title">History</h1>
                <p className="history-subtitle">Active & Recent Boards</p>

                {loading && <p className="history-status">Loading…</p>}
                {loadError && (
                    <p className="history-status history-status-error">
                        {loadError}
                    </p>
                )}

                {!loading && !loadError && records.length === 0 && (
                    <p className="history-status">No history yet.</p>
                )}

                {!loading && !loadError && records.length > 0 && (
                    <div className="history-table-wrapper">
                        <table className="history-table">
                            <thead>
                            <tr>
                                <th>Week</th>
                                <th>Numbers</th>
                                <th>Fields</th>
                                <th>Times</th>
                                <th>Total</th>
                                <th className="history-col-repeat">Repeat</th>
                            </tr>
                            </thead>

                            <tbody>
                            {records.map(r => {
                                const starterId = r.repeatId
                                    ? starterByRepeatId.get(r.repeatId)
                                    : undefined;

                                const isRepeatInstance =
                                    r.repeatId && starterId && starterId !== r.id;

                                return (
                                    <tr key={r.id}>
                                        <td>{r.weekLabel}</td>
                                        <td>
                                            <div className="history-numbers-inline">
                                                {r.numbers.map(n => (
                                                    <span
                                                        key={n}
                                                        className="history-number-chip"
                                                    >
                                                            {n}
                                                        </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td>{r.numbers.length}</td>
                                        <td>{r.times}</td>
                                        <td>{r.totalAmountDkk} DKK</td>
                                        <td className="history-col-repeat">
                                            {isRepeatInstance ? (
                                                <span className="history-repeat-badge">
                                                        Repeat
                                                    </span>
                                            ) : r.repeatOptOut ? (
                                                <span className="history-stop-badge">
                                                        Stopped
                                                    </span>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className={
                                                        r.autoRepeat
                                                            ? "history-toggle history-toggle--on"
                                                            : "history-toggle"
                                                    }
                                                    onClick={() =>
                                                        handleRepeatClick(
                                                            r.id,
                                                            r.autoRepeat,
                                                            r.repeatOptOut
                                                        )
                                                    }
                                                    aria-pressed={r.autoRepeat}
                                                >
                                                    <span className="history-toggle-knob" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
