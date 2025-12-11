import React, { useEffect, useMemo, useState } from "react";
import "../../css/PlayerBoardPage.css";
import { PlayerPageHeader } from "../../components/PlayerPageHeader";

import { apiGet, apiPost } from "../../../api/connection";

// ----------------------
// TYPES
// ----------------------
type FieldsCount = 5 | 6 | 7 | 8;

interface BetPlacement {
    id: string;
    numbers: number[];
    fields: number;
    times: number;
    amountDkk: number;
}

interface UserDto {
    id: string;
    fullName: string;
    balance: number;
}

// ----------------------
// LOCAL PRICE TABLE
// ----------------------
const PRICE_PER_FIELDS: Record<FieldsCount, number> = {
    5: 20,
    6: 40,
    7: 80,
    8: 160,
};

export const PlayerBoardPage: React.FC = () => {
    const [fieldsCount, setFieldsCount] = useState<FieldsCount>(5);
    const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
    const [times, setTimes] = useState(1);
    const [bets, setBets] = useState<BetPlacement[]>([]);

    const [playerName, setPlayerName] = useState("");
    const [balance, setBalance] = useState<number | null>(null);

    const playerId = localStorage.getItem("userId") ?? "";

    // All selectable numbers (1–16)
    const numbers = useMemo(
        () => Array.from({ length: 16 }, (_, i) => i + 1),
        []
    );

    const fields = selectedNumbers.length;
    const price =
        fields > 0 ? (PRICE_PER_FIELDS[fields as FieldsCount] ?? 0) * times : 0;

    const totalAmount = useMemo(
        () => bets.reduce((sum, b) => sum + b.amountDkk, 0),
        [bets]
    );

    // ----------------------
    // LOAD PLAYER DATA
    // ----------------------
    async function reloadPlayer() {
        const res = await apiGet("/api/user");      // ✔ Correct path
        const users: UserDto[] = await res.json();

        const me = users.find((u) => u.id === playerId);
        if (me) {
            setPlayerName(me.fullName);
            setBalance(me.balance);
        }
    }

    useEffect(() => {
        if (!playerId) return;
        void reloadPlayer();
    }, [playerId]);

    // ----------------------
    // SELECT NUMBER
    // ----------------------
    function toggleNumber(n: number) {
        setSelectedNumbers((prev) => {
            if (prev.includes(n)) return prev.filter((x) => x !== n);
            if (prev.length >= fieldsCount) return prev;
            return [...prev, n].sort((a, b) => a - b);
        });
    }

    // ----------------------
    // ADD BET
    // ----------------------
    function handleMakeBet() {
        if (fields !== fieldsCount) return;
        if (price <= 0) return;

        setBets((old) => [
            ...old,
            {
                id: Date.now().toString(),
                numbers: selectedNumbers,
                fields,
                times,
                amountDkk: price,
            },
        ]);

        setSelectedNumbers([]);
        setTimes(1);
    }

    // ----------------------
    // SUBMIT PURCHASE
    // ----------------------
    async function handleSubmit() {
        if (bets.length === 0) return;

        await apiPost(
            "/api/board/user/purchase",   // ✔ Correct path
            bets.map((b) => ({
                userId: playerId,
                numbers: b.numbers,
                times: b.times,
            }))
        );

        setBets([]);
        await reloadPlayer();
    }

    // ----------------------
    // RENDER
    // ----------------------
    return (
        <div className="player-board-page">
            <PlayerPageHeader userName={playerName} balance={balance} />

            <main className="player-board-main">
                <h1 className="player-board-week">Week 47, 2025</h1>

                <div className="player-board-layout">
                {/* LEFT SIDE */}
                <section className="player-board-left">
                    <div className="player-board-card">
                        {/* NUMBER GRID */}
                        <div className="player-board-grid">
                            {numbers.map((n) => {
                                const selected = selectedNumbers.includes(n);
                                const disabled =
                                    !selected && selectedNumbers.length >= fieldsCount;

                                return (
                                    <button
                                        key={n}
                                        type="button"
                                        disabled={disabled}
                                        onClick={() => toggleNumber(n)}
                                        className={
                                            "player-board-tile" +
                                            (selected ? " player-board-tile--selected" : "") +
                                            (disabled ? " player-board-tile--disabled" : "")
                                        }
                                    >
                                        {n}
                                    </button>
                                );
                            })}
                        </div>

                        {/* FIELDS SELECTOR */}
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
                                    <span className="player-board-fields-text">
                                        {f} numbers
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* TIMES + PRICE */}
                        <div className="player-board-meta">
                            <div>
                                <span className="player-board-meta-label">Times</span>
                                <div className="player-board-times-control">
                                    <button onClick={() => setTimes((t) => Math.max(1, t - 1))}>
                                        −
                                    </button>

                                    <input
                                        type="number"
                                        value={times}
                                        min={1}
                                        onChange={(e) =>
                                            setTimes(Math.max(1, Number(e.target.value) || 1))
                                        }
                                    />

                                    <button onClick={() => setTimes((t) => t + 1)}>+</button>
                                </div>
                            </div>

                            <div>
                                <span className="player-board-meta-label">Value</span>
                                <div className="player-board-value-box">{price} DKK</div>
                            </div>
                        </div>


                        {/* ACTION BUTTONS */}
                        <div className="player-board-actions">
                            <button
                                className="player-board-btn player-board-btn--secondary"
                                onClick={() => {
                                    setSelectedNumbers([]);
                                    setTimes(1);
                                }}
                            >
                                Clear
                            </button>

                            <button
                                className="player-board-btn player-board-btn--primary"
                                disabled={fields !== fieldsCount}
                                onClick={handleMakeBet}
                            >
                                Make a bet
                            </button>
                        </div>
                    </div>
                </section>

                {/* RIGHT SIDE */}
                <section className="player-board-right">
                    <div className="player-board-card player-board-bets-card">
                        <h2>My Bets</h2>

                        {bets.length === 0 ? (
                            <p className="player-board-bets-empty">No bets yet.</p>
                        ) : (
                            <table className="player-board-bets-table">
                                <thead>
                                <tr>
                                    <th>Numbers</th>
                                    <th>Times</th>
                                    <th>Amount</th>
                                    <th />
                                </tr>
                                </thead>

                                <tbody>
                                {bets.map((b) => (
                                    <tr key={b.id}>
                                        <td>{b.numbers.join(", ")}</td>
                                        <td>{b.times}</td>
                                        <td>{b.amountDkk} DKK</td>

                                        <td className="player-board-bets-remove">
                                            <button
                                                className="player-board-bets-remove-btn"
                                                onClick={() =>
                                                    setBets((bs) => bs.filter((x) => x.id !== b.id))
                                                }
                                            >
                                                ✕
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        )}

                        <div className="player-board-bets-footer">
                            <div className="player-board-bets-summary-row">
                                <span>
                                    Amount: <strong>{totalAmount} DKK</strong>
                                </span>
                            </div>

                            <div className="player-board-bets-buttons">
                                <button
                                    className="player-board-bets-btn player-board-bets-btn--submit"
                                    disabled={bets.length === 0}
                                    onClick={handleSubmit}
                                >
                                    Submit
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
                </div>
            </main>
        </div>
    );
};
