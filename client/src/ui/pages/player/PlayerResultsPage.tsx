import React, { useEffect, useMemo, useState } from "react";
import "../../css/PlayerResultsPage.css";

import { PlayerPageHeader } from "../../components/PlayerPageHeader";
import { useNavigate } from "react-router";

import { openapiAdapter, apiGet } from "../../../api/connection";

import type { UserResponse, GameHistoryResponse } from "../../../generated-ts-client";
import { GameResultClient, UserClient } from "../../../generated-ts-client";

const gameResultClient = openapiAdapter(GameResultClient);
const userClient = openapiAdapter(UserClient);

type ResultRow = {
    id: string;
    weekLabel: string;
    winningNumbers: number[];
    createdAt?: string;
};

function weekLabel(year: number, weekNumber: number) {
    return `Week ${weekNumber}, ${year}`;
}

export const PlayerResultsPage: React.FC = () => {
    const navigate = useNavigate();

    const [playerName, setPlayerName] = useState<string>("Player");
    const [balance, setBalance] = useState<number | null>(null);

    const [results, setResults] = useState<ResultRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);

    const CURRENT_USER_ID = localStorage.getItem("userId") ?? "";

    // -----------------------------
    // LOAD HEADER INFO (NAME + BALANCE)
    // -----------------------------
    useEffect(() => {
        void (async () => {
            try {
                // ✅ best: get current user (includes balance)
                const me = await userClient.getCurrentUser();
                if (me?.fullName) setPlayerName(me.fullName);
                setBalance(me?.balance ?? null);
                return;
            } catch (err) {
                console.warn("getCurrentUser failed, fallback to /api/user list", err);
            }

            // fallback: your old way (name only; balance may not be available here)
            try {
                if (!CURRENT_USER_ID) return;

                const res = await apiGet("/api/user");
                const users: UserResponse[] = await res.json();
                const current = users.find((u) => u.id === CURRENT_USER_ID);

                if (current) {
                    setPlayerName(current.fullName);
                    // if your /api/user returns balance, this will work too
                    setBalance(current.balance ?? null);
                }
            } catch (err) {
                console.error("Failed to load user fallback", err);
            }
        })();
    }, [CURRENT_USER_ID]);

    // -----------------------------
    // LOAD DRAW HISTORY (WINNING NUMBERS)
    // -----------------------------
    useEffect(() => {
        void (async () => {
            try {
                setLoading(true);
                setLoadError(null);

                const history: GameHistoryResponse[] =
                    (await gameResultClient.getDrawHistoryForPlayers()) ?? [];

                const sorted = [...history].sort((a, b) => {
                    if (a.year !== b.year) return b.year - a.year;
                    if (a.weekNumber !== b.weekNumber) return b.weekNumber - a.weekNumber;
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                });

                setResults(
                    sorted.map((g) => ({
                        id: g.id,
                        weekLabel: weekLabel(g.year, g.weekNumber),
                        winningNumbers: g.winningNumbers ?? [],
                        createdAt: g.createdAt,
                    }))
                );
            } catch (err) {
                console.error("Failed to load results", err);
                setLoadError("Failed to load results.");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const hasRows = useMemo(() => results.length > 0, [results]);

    function handleTryAgain() {
        navigate("/player/board");
    }

    return (
        <div className="results-page">
            <PlayerPageHeader userName={playerName} balance={balance} />

            <div className="results-inner">
                <div className="results-header-row">
                    <div>
                        <h1 className="results-title">Results</h1>
                        <p className="results-subtitle">Winning numbers by week.</p>
                    </div>

                    <button
                        type="button"
                        className="results-tryagain-btn"
                        onClick={handleTryAgain}
                    >
                        Try again
                    </button>
                </div>

                {loading && <p className="results-status">Loading…</p>}
                {loadError && (
                    <p className="results-status results-status--error">{loadError}</p>
                )}

                {!loading && !loadError && !hasRows && (
                    <p className="results-status">No results yet.</p>
                )}

                {!loading && !loadError && hasRows && (
                    <div className="results-table-wrapper">
                        <table className="results-table">
                            <thead>
                            <tr>
                                <th>Week</th>
                                <th>Winning numbers</th>
                            </tr>
                            </thead>

                            <tbody>
                            {results.map((row) => (
                                <tr key={row.id}>
                                    <td>{row.weekLabel}</td>

                                    <td>
                                        <div className="results-number-row">
                                            {row.winningNumbers.map((n) => (
                                                <span
                                                    key={`${row.id}-${n}`}
                                                    className="results-winning-square"
                                                    aria-label={`Winning number ${n}`}
                                                >
                            {n}
                          </span>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
