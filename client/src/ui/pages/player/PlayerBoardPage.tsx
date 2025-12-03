import React, { useEffect, useMemo, useState } from "react";
import "../../css/PlayerBoardPage.css";
import { PlayerPageHeader } from "../../../ui/components/PlayerPageHeader";
import { BoardClient, PlayerClient } from "../../../generated-ts-client";
import type {
    PlayerResponse,
    CreateBoardRequest,
} from "../../../generated-ts-client";

type FieldsCount = 5 | 6 | 7 | 8;

interface BetPlacement {
    id: string;
    numbers: number[];
    fields: number;
    times: number;
    amountDkk: number;
}

// Simple UI helper: price per board for each fieldsCount
const PRICE_PER_FIELDS: Record<FieldsCount, number> = {
    5: 20,
    6: 40,
    7: 80,
    8: 160,
};

const playerClient = new PlayerClient();
const boardClient = new BoardClient();

export const PlayerBoardPage: React.FC = () => {
    const [fieldsCount, setFieldsCount] = useState<FieldsCount>(5);
    const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
    const [times, setTimes] = useState<number>(1);
    const [bets, setBets] = useState<BetPlacement[]>([]);

    const [playerName, setPlayerName] = useState<string>("Player");
    const [balance, setBalance] = useState<number | null>(null);
    const [loadingPlayer, setLoadingPlayer] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);

    const CURRENT_PLAYER_ID = localStorage.getItem("userId") ?? "";

    const fields = selectedNumbers.length;
    const numbers = useMemo(
        () => Array.from({ length: 16 }, (_, i) => i + 1),
        []
    );

    const basePrice =
        (PRICE_PER_FIELDS[fields as FieldsCount] as number | undefined) ?? 0;
    const valueDkk = basePrice * times;

    const canMakeBet =
        fields === fieldsCount && fields > 0 && times > 0 && basePrice > 0;

    const totalAmount = useMemo(
        () => bets.reduce((sum, b) => sum + b.amountDkk, 0),
        [bets]
    );

    // Load player info
    useEffect(() => {
        if (!CURRENT_PLAYER_ID) {
            setAuthError("No player is logged in. Please log in again.");
            return;
        }

        async function loadPlayer() {
            try {
                setLoadingPlayer(true);
                setAuthError(null);

                const players: PlayerResponse[] = await playerClient.getPlayers();
                const current = players.find((p) => p.id === CURRENT_PLAYER_ID);

                if (current) {
                    setPlayerName(current.fullName);
                    setBalance(current.balance);
                } else {
                    setAuthError("Player not found. Please log in again.");
                }
            } catch (err) {
                console.error("Failed to load player", err);
                setAuthError("Failed to load player data.");
            } finally {
                setLoadingPlayer(false);
            }
        }

        void loadPlayer();
    }, [CURRENT_PLAYER_ID]);

    // ---- number selection ----
    function toggleNumber(n: number) {
        const isSelected = selectedNumbers.includes(n);

        if (isSelected) {
            setSelectedNumbers((prev) => prev.filter((x) => x !== n));
            return;
        }

        if (selectedNumbers.length >= fieldsCount) {
               return;
        }
        setSelectedNumbers((prev) => [...prev, n].sort((a, b) => a - b));
    }

    // ---- times controls ----
    function changeTimes(delta: number) {
        setTimes((prev) => {
            const next = prev + delta;
            return next < 1 ? 1 : next;
        });
    }

    function handleTimesInput(e: React.ChangeEvent<HTMLInputElement>) {
        const v = Number(e.target.value);
        if (Number.isNaN(v) || v < 1) {
            setTimes(1);
        } else {
            setTimes(v);
        }
    }

    // ---- actions (left panel) ----
    function handleClearSelection() {
        setSelectedNumbers([]);
        setTimes(1);
    }

    function handleMakeBet() {
        if (!canMakeBet) return;

        const bet: BetPlacement = {
            id: `${Date.now()}-${Math.random()}`,
            numbers: selectedNumbers,
            fields,
            times,
            amountDkk: valueDkk,
        };

        setBets((prev) => [...prev, bet]);
        setSelectedNumbers([]);
        setTimes(1);
    }

    function handleRemoveBet(id: string) {
        setBets((prev) => prev.filter((b) => b.id !== id));
    }

    function handleResetBets() {
        setBets([]);
    }

    // Submit bets to backend
    async function handleSubmitBets() {
        if (!CURRENT_PLAYER_ID) {
            alert("No player id found. Please log in again.");
            return;
        }
        if (bets.length === 0 || submitting) return;

        try {
            setSubmitting(true);

            const payload: CreateBoardRequest[] = bets.map((b) => ({
                playerId: CURRENT_PLAYER_ID,
                numbers: b.numbers,
                times: b.times,
            }));

            await boardClient.purchase(payload);

            setBets([]);

            const players: PlayerResponse[] = await playerClient.getPlayers();
            const current = players.find((p) => p.id === CURRENT_PLAYER_ID);
            if (current) {
                setBalance(current.balance);
            }
        } catch (err) {
            console.error("Failed to submit bets", err);
            alert("Failed to submit bets. Please try again.");
        } finally {
            setSubmitting(false);
        }
    }


    return (
        <div className="player-board-page">
            <PlayerPageHeader userName={playerName} />

            <main className="player-board-main">
                {/* LEFT PANEL */}
                <section className="player-board-left">
                    <div className="player-board-week">
                        Week 47, 2025 {/* later: get this from API */}
                    </div>

                    {authError && (
                        <p className="history-status history-status-error">{authError}</p>
                    )}

                    {/* Board grid */}
                    <div className="player-board-card">
                        <div className="player-board-grid">
                            {numbers.map((n) => {
                                const isSelected = selectedNumbers.includes(n);
                                const disabled =
                                    !isSelected && selectedNumbers.length >= fieldsCount;

                                return (
                                    <button
                                        key={n}
                                        type="button"
                                        className={
                                            "player-board-tile" +
                                            (isSelected ? " player-board-tile--selected" : "") +
                                            (disabled ? " player-board-tile--disabled" : "")
                                        }
                                        onClick={() => toggleNumber(n)}
                                        disabled={disabled && !isSelected}
                                    >
                                        {n}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Fields tabs */}
                        <div className="player-board-fields-tabs">
                            {[5, 6, 7, 8].map((f) => (
                                <button
                                    key={f}
                                    type="button"
                                    className={
                                        "player-board-fields-tab" +
                                        (fieldsCount === f
                                            ? " player-board-fields-tab--active"
                                            : "")
                                    }
                                    onClick={() => {
                                        setFieldsCount(f as FieldsCount);
                                        setSelectedNumbers((prev) => prev.slice(0, f));
                                    }}
                                >
                                    {f} numbers
                                </button>
                            ))}
                        </div>

                        {/* Times + value row */}
                        <div className="player-board-meta">
                            <div className="player-board-times">
                                <span className="player-board-meta-label">Times</span>
                                <div className="player-board-times-control">
                                    <button type="button" onClick={() => changeTimes(-1)}>
                                        −
                                    </button>
                                    <input
                                        type="number"
                                        min={1}
                                        value={times}
                                        onChange={handleTimesInput}
                                    />
                                    <button type="button" onClick={() => changeTimes(1)}>
                                        +
                                    </button>
                                </div>
                            </div>

                            <div className="player-board-value">
                                <span className="player-board-meta-label">Value</span>
                                <div className="player-board-value-box">{valueDkk} DKK</div>
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="player-board-actions">
                            <button
                                type="button"
                                className="player-board-btn player-board-btn--secondary"
                                onClick={handleClearSelection}
                            >
                                Clear
                            </button>
                            <button
                                type="button"
                                className="player-board-btn player-board-btn--primary"
                                onClick={handleMakeBet}
                                disabled={!canMakeBet}
                            >
                                Make a bet
                            </button>
                        </div>
                    </div>
                </section>

                {/* RIGHT PANEL - My bets */}
                <section className="player-board-right">
                    <div className="player-board-card player-board-bets-card">
                        <div className="player-board-bets-header">
                            <h2>My Bets</h2>
                        </div>

                        {bets.length === 0 ? (
                            <p className="player-board-bets-empty">
                                No bets yet. Choose your numbers and click{" "}
                                <strong>Make a bet</strong>.
                            </p>
                        ) : (
                            <table className="player-board-bets-table">
                                <thead>
                                <tr>
                                    <th>Numbers</th>
                                    <th>Fields</th>
                                    <th>Times</th>
                                    <th>Amount</th>
                                    <th />
                                </tr>
                                </thead>
                                <tbody>
                                {bets.map((b) => (
                                    <tr key={b.id}>
                                        <td>{b.numbers.join(", ")}</td>
                                        <td>{b.fields}</td>
                                        <td>{b.times}</td>
                                        <td>{b.amountDkk} DKK</td>
                                        <td className="player-board-bets-remove">
                                            <button
                                                type="button"
                                                className="player-board-bets-remove-btn"
                                                onClick={() => handleRemoveBet(b.id)}
                                            >
                                                ✕
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        )}

                        {/* footer: total + reset/submit */}
                        <div className="player-board-bets-footer">
                            <div className="player-board-bets-total-label">Total</div>

                            <div className="player-board-bets-summary-row">
                <span>
                  Amount: <strong>{totalAmount} DKK</strong>
                </span>
                                <span>
                  Balance:{" "}
                                    <strong>
                    {loadingPlayer
                        ? "…"
                        : balance != null
                            ? `${balance} DKK`
                            : "N/A"}
                  </strong>
                </span>
                            </div>

                            <div className="player-board-bets-buttons">
                                <button
                                    type="button"
                                    className="player-board-bets-btn player-board-bets-btn--reset"
                                    onClick={handleResetBets}
                                    disabled={bets.length === 0}
                                >
                                    Reset
                                </button>
                                <button
                                    type="button"
                                    className="player-board-bets-btn player-board-bets-btn--submit"
                                    onClick={handleSubmitBets}
                                    disabled={bets.length === 0 || submitting}
                                >
                                    {submitting ? "Submitting…" : "Submit"}
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};
