import React, { useMemo, useState } from "react";
import "../../css/PlayerBoardPage.css";
import { PlayerPageHeader } from "../../../ui/components/PlayerPageHeader.tsx";

type FieldsCount = 5 | 6 | 7 | 8;

interface BetPlacement {
    id: string;
    numbers: number[];
    fields: number;
    times: number;
    amountDkk: number;
}

export const PlayerBoardPage: React.FC = () => {
    const [fieldsCount, setFieldsCount] = useState<FieldsCount>(5);
    const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
    const [times, setTimes] = useState<number>(1);
    const [bets, setBets] = useState<BetPlacement[]>([]);

    const fields = selectedNumbers.length;
    const valueDkk = fields * times * 20;
    const canMakeBet =
        fields === fieldsCount && fields > 0 && times > 0;

    const totalAmount = useMemo(
        () => bets.reduce((sum, b) => sum + b.amountDkk, 0),
        [bets]
    );

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

    // ---- actions ----
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

        // reset left panel for next bet
        setSelectedNumbers([]);
        setTimes(1);
    }

    function handleRemoveBet(id: string) {
        setBets((prev) => prev.filter((b) => b.id !== id));
    }

    function handleResetBets() {
        setBets([]);
    }

    function handleSubmitBets() {
        if (bets.length === 0) return;

        // TODO: call backend to submit all bets
        console.log("Submitting bets:", bets);
    }

    const numbers = useMemo(
        () => Array.from({ length: 16 }, (_, i) => i + 1),
        []
    );

    return (
        <div className="player-board-page">
            <PlayerPageHeader userName="Mads Andersen" />

            <main className="player-board-main">
                {/* LEFT PANEL */}
                <section className="player-board-left">
                    <div className="player-board-week">
                        Week 47, 2025 {/* later: get this from API */}
                    </div>

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
                                        // trim selection if too many when lowering
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
                                    <button
                                        type="button"
                                        onClick={() => changeTimes(-1)}
                                    >
                                        −
                                    </button>
                                    <input
                                        type="number"
                                        min={1}
                                        value={times}
                                        onChange={handleTimesInput}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => changeTimes(1)}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            <div className="player-board-value">
                                <span className="player-board-meta-label">Value</span>
                                <div className="player-board-value-box">
                                    {valueDkk} DKK
                                </div>
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
                                No bets yet. Choose your numbers and click
                                &nbsp;<strong>Make a bet</strong>.
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
                                  Balance: <strong>200 DKK</strong>
                                {/* TODO: replace with real balance */}
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
                                    disabled={bets.length === 0}
                                >
                                    Submit
                                </button>
                            </div>
                        </div>
                        </div>
                </section>
            </main>
        </div>
    );
};
