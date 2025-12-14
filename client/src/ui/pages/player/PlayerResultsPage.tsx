import React, { useEffect, useMemo, useState } from "react";
import "../../css/PlayerResultsPage.css";

import { useNavigate } from "react-router";

import { openapiAdapter } from "../../../api/connection";
import { GameResultClient } from "../../../generated-ts-client";
import { useCurrentUser } from "../../../core/hooks/useCurrentUser";

import type { GameHistoryResponse } from "../../../generated-ts-client";

// ----------------------
// CLIENT
// ----------------------
const gameResultClient = openapiAdapter(GameResultClient);

// ----------------------
// TYPES
// ----------------------
interface ResultRow {
    id: string;
    weekLabel: string;
    winningNumbers: number[];
    createdAt?: string;
}

// ----------------------
// HELPERS
// ----------------------
function weekLabel(year: number, weekNumber: number) {
    return `Week ${weekNumber}, ${year}`;
}

// ----------------------
// COMPONENT
// ----------------------
export const PlayerResultsPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useCurrentUser();

    const [results, setResults] = useState<ResultRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);

    // ----------------------
    // LOAD RESULTS
    // ----------------------
    useEffect(() => {
        void (async () => {
            try {
                setLoading(true);
                setLoadError(null);

                const history: GameHistoryResponse[] =
                    (await gameResultClient.getDrawHistoryForPlayers()) ?? [];

                const sorted = [...history].sort((a, b) => {
                    if (a.year !== b.year) return b.year - a.year;
                    if (a.weekNumber !== b.weekNumber)
                        return b.weekNumber - a.weekNumber;

                    return (
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime()
                    );
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

    // ----------------------
    // RENDER
    // ----------------------
    return (
        <div className="results-page">

            <div className="results-inner">
                <div className="results-header-row">
                    <div>
                        <h1 className="results-title">Results</h1>
                        <p className="results-subtitle">
                            Winning numbers by week.
                        </p>
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
                    <p className="results-status results-status--error">
                        {loadError}
                    </p>
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
