import React, { useEffect, useMemo, useState } from "react";
import "../../css/PlayerHistoryPage.css";

import { PlayerPageHeader } from "../../components/PlayerPageHeader";
import { openapiAdapter } from "../../../api/connection";

import {
    AuthClient,
    BoardClient,
    RepeatClient,
    UserClient,
} from "../../../generated-ts-client";

import type {
    BoardDtoResponse,
    AuthUserInfo,
    RepeatDtoResponse,
    UserResponse,
} from "../../../generated-ts-client";

interface PlayerRecord {
    id: string;

    //  add createdAt so we can detect which row is the "starter" board
    createdAt?: string | null;

    weekLabel: string;
    numbers: number[];
    times: number;
    totalAmountDkk: number;

    autoRepeat: boolean;
    repeatId?: string;

    repeatOptOut: boolean;
}

const authClient = openapiAdapter(AuthClient);
const boardClient = openapiAdapter(BoardClient);
const repeatClient = openapiAdapter(RepeatClient);
const userClient = openapiAdapter(UserClient);

// ISO week label
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
    const [records, setRecords] = useState<PlayerRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);

    const [playerName, setPlayerName] = useState("");
    const [balance, setBalance] = useState<number | null>(null);

    const CURRENT_PLAYER_ID = localStorage.getItem("userId") ?? "";

    async function loadHistory(userId: string) {
        try {
            setLoading(true);
            setLoadError(null);

            // Load header info (name + balance) in parallel
            const [info, me, boards, repeats] = await Promise.all([
                authClient.userInfo().catch((): AuthUserInfo | null => null),
                userClient.getCurrentUser().catch((): UserResponse | null => null),
                boardClient.getByUser(userId),
                repeatClient.getMine(),
            ]);

            if (info?.fullName) setPlayerName(info.fullName);
            if (me?.fullName) setPlayerName(me.fullName);
            setBalance(me?.balance ?? null);

            const repMap = new Map<string, RepeatDtoResponse>();
            (repeats ?? []).forEach((r: RepeatDtoResponse) => repMap.set(r.id, r));

            const mapped: PlayerRecord[] = (boards ?? []).map((b: BoardDtoResponse) => {
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
            });

            setRecords(mapped);
        } catch (e) {
            console.error("Failed to load history:", e);
            setLoadError("Failed to load history. Check browser console.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (!CURRENT_PLAYER_ID) {
            setLoadError("No player logged in.");
            return;
        }
        void loadHistory(CURRENT_PLAYER_ID);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [CURRENT_PLAYER_ID]);

    //  Find, for each repeatId, which board row is the ORIGINAL (earliest createdAt).
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

    async function handleRepeatClick(
        boardId: string,
        currentAutoRepeat: boolean,
        repeatOptOut: boolean
    ) {
        if (repeatOptOut) return;

        const nextValue = !currentAutoRepeat;

        const ok = nextValue
            ? window.confirm(
                "Start repeat for this ticket?\n\nWhen the next draw starts, the system will automatically buy this ticket again and deduct money from your balance."
            )
            : window.confirm(
                "Stop repeat for this ticket?\n\nThis will quit repeat permanently. You cannot restart it (you must buy a new ticket to repeat again)."
            );

        if (!ok) return;

        try {
            await boardClient.setAutoRepeat(boardId, { autoRepeat: nextValue });
            await loadHistory(CURRENT_PLAYER_ID);
        } catch (err) {
            console.error("Failed to toggle auto-repeat", err);
            alert("Could not update repeat setting. Please try again.");
        }
    }

    return (
        <div className="history-page">
            <PlayerPageHeader userName={playerName} balance={balance} />

            <div className="history-inner">
                <h1 className="history-title">History</h1>
                <p className="history-subtitle">Active & Recent Boards</p>

                {loading && <p className="history-status">Loading…</p>}
                {loadError && (
                    <p className="history-status history-status-error">{loadError}</p>
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
                            {records.map((r) => {
                                const starterId = r.repeatId
                                    ? starterByRepeatId.get(r.repeatId)
                                    : undefined;

                                //  repeat instance row = same repeatId, but NOT the starter board
                                const isRepeatInstance = !!(
                                    r.repeatId &&
                                    starterId &&
                                    starterId !== r.id
                                );

                                return (
                                    <tr key={r.id}>
                                        <td>{r.weekLabel}</td>

                                        <td>
                                            <div className="history-numbers-inline">
                                                {r.numbers.map((n) => (
                                                    <span key={n} className="history-number-chip">
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
                                                // Always keep "Repeat" badge for auto-generated rows
                                                <span className="history-repeat-badge">Repeat</span>
                                            ) : r.repeatOptOut ? (
                                                // Only show "Stopped" on the starter row
                                                <span className="history-stop-badge">Stopped</span>
                                            ) : (
                                                // Only starter row gets the toggle
                                                <button
                                                    type="button"
                                                    className={
                                                        r.autoRepeat
                                                            ? "history-toggle history-toggle--on"
                                                            : "history-toggle"
                                                    }
                                                    onClick={() =>
                                                        handleRepeatClick(r.id, r.autoRepeat, r.repeatOptOut)
                                                    }
                                                    aria-pressed={r.autoRepeat}
                                                    aria-label={
                                                        r.autoRepeat
                                                            ? "Auto repeat on"
                                                            : "Auto repeat off"
                                                    }
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
