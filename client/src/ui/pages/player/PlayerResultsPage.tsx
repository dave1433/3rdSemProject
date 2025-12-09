import React, { useEffect, useState } from "react";
import "../../css/PlayerResultsPage.css";

import { PlayerPageHeader } from "../../components/PlayerPageHeader";
import { useNavigate } from "react-router";

import { openapiAdapter } from "../../../api/connection";
import { UserClient } from "../../../generated-ts-client";
import type { UserResponse } from "../../../generated-ts-client.ts";

interface ResultRow {
    id: number;
    week: string;
    winningNumbers: number[];
    myNumbers: number[];
    winningAmountDkk: number;
}

// Temporary fake data (until backend endpoint exists)
const fakeResults: ResultRow[] = [
    {
        id: 1,
        week: "Week 46, 2025",
        winningNumbers: [2, 5, 9],
        myNumbers: [2, 5, 9, 11, 14],
        winningAmountDkk: 400,
    },
    {
        id: 2,
        week: "Week 45, 2025",
        winningNumbers: [1, 4, 7],
        myNumbers: [1, 4, 7, 12, 15],
        winningAmountDkk: 0,
    },
    {
        id: 3,
        week: "Week 44, 2025",
        winningNumbers: [3, 8, 11],
        myNumbers: [3, 8, 11, 13, 16],
        winningAmountDkk: 200,
    },
];

const userClient = openapiAdapter(UserClient);

export const PlayerResultsPage: React.FC = () => {
    const navigate = useNavigate();
    const [playerName, setPlayerName] = useState<string>("Player");

    const CURRENT_USER_ID = localStorage.getItem("userId") ?? "";

    // -----------------------------
    // LOAD PLAYER NAME
    // -----------------------------
    useEffect(() => {
        if (!CURRENT_USER_ID) return;

        void (async () => {
            try {
                const users: UserResponse[] = await userClient.getUser();
                const current = users.find((u) => u.id === CURRENT_USER_ID);

                if (current) {
                    setPlayerName(current.fullName);
                }
            } catch (err) {
                console.error("Failed to load user", err);
            }
        })();
    }, [CURRENT_USER_ID]);

    function handleTryAgain() {
        navigate("/player/board");
    }

    return (
        <div className="results-page">
            <PlayerPageHeader userName={playerName} />

            <div className="results-inner">
                <div className="results-header-row">
                    <div>
                        <h1 className="results-title">Results</h1>
                        <p className="results-subtitle">
                            Overview of winning numbers and my winnings for each week.
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

                <div className="results-table-wrapper">
                    <table className="results-table">
                        <thead>
                        <tr>
                            <th>Week</th>
                            <th>Winning numbers</th>
                            <th>My numbers</th>
                            <th>Winning amount</th>
                        </tr>
                        </thead>

                        <tbody>
                        {fakeResults.map((row) => (
                            <tr key={row.id}>
                                <td>{row.week}</td>

                                {/* Winning numbers */}
                                <td>
                                    <div className="results-number-row">
                                        {row.winningNumbers.map((n) => (
                                            <span
                                                key={`win-${row.id}-${n}`}
                                                className="results-number-pill"
                                            >
                                                    {n}
                                                </span>
                                        ))}
                                    </div>
                                </td>

                                {/* My numbers */}
                                <td>
                                    <div className="results-number-row">
                                        {row.myNumbers.map((n) => (
                                            <span
                                                key={`my-${row.id}-${n}`}
                                                className="results-number-pill"
                                            >
                                                    {n}
                                                </span>
                                        ))}
                                    </div>
                                </td>

                                {/* Winning amount */}
                                <td>
                                    {row.winningAmountDkk > 0 ? (
                                        <span className="results-amount-badge results-amount-badge--win">
                                                {row.winningAmountDkk} DKK
                                            </span>
                                    ) : (
                                        <span className="results-amount-badge results-amount-badge--zero">
                                                0 DKK
                                            </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
