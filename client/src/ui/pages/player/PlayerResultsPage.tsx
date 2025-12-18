import "../../css/PlayerResultsPage.css";
import type { FC } from "react";
import { useNavigate } from "react-router";

import { usePlayerResults } from "../../../core/hooks/usePlayerResults";

export const PlayerResultsPage: FC = () => {
    const navigate = useNavigate();
    const { results, loading, error, hasRows } = usePlayerResults();

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
                        onClick={() => navigate("/player/board")}
                    >
                        Try again
                    </button>
                </div>

                {loading && (
                    <p className="results-status">Loading…</p>
                )}

                {error && (
                    <p className="results-status results-status--error">
                        {error}
                    </p>
                )}

                {!loading && !error && !hasRows && (
                    <p className="results-status">No results yet.</p>
                )}

                {!loading && !error && hasRows && (
                    <div className="results-table-wrapper">
                        <table className="results-table">
                            <thead>
                            <tr>
                                <th>Week</th>
                                <th>Winning numbers</th>
                            </tr>
                            </thead>

                            <tbody>
                            {results.map(row => (
                                <tr key={row.id}>
                                    <td>{row.weekLabel}</td>
                                    <td>
                                        <div className="results-number-row">
                                            {row.winningNumbers.map(n => (
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
