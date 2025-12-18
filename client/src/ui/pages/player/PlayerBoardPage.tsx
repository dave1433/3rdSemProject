import "../../css/PlayerBoardPage.css";

import { useCurrentUser } from "../../../core/hooks/useCurrentUser";
import { usePlayerBoard } from "../../../core/hooks/usePlayerBoard";
import { getIsoWeekLabel } from "../../../utils/date/getIsoWeekLabel";
import type { FieldsCount } from "../../../core/board/types";
import type {FC} from "react";

export const PlayerBoardPage: FC = () => {
    const { user, updateBalance } = useCurrentUser();
    const FIELD_OPTIONS: FieldsCount[] = [5, 6, 7, 8];


    const {
        // state
        selectedNumbers,
        bets,
        fieldsCount,
        times,
        loading,
        error,
        warningMsg,
        submitStatus,

        // derived
        numbers,
        price,
        totalAmount,
        addLockMessage,
        submitLockMessage,
        submitBtnDisabled,

        // actions
        toggleNumber,
        setFieldsCount,
        setTimes,
        clearSelection,
        addBet,
        removeBet,
        submit,
    } = usePlayerBoard(
        user?.id ?? "",
        user?.balance ?? 0,
        updateBalance
    );

    const weekLabel = getIsoWeekLabel(new Date().toISOString());

    return (
        <div className="player-board-page">
            <main className="player-board-main">
                <h1 className="player-board-week">{weekLabel}</h1>

                {warningMsg && (
                    <p className="player-board-status player-board-status--error">
                        {warningMsg}
                    </p>
                )}

                {loading && <p className="player-board-status">Loading…</p>}
                {error && (
                    <p className="player-board-status player-board-status--error">
                        {error}
                    </p>
                )}

                {!loading && !error && (
                    <div className="player-board-layout">
                        {/* LEFT */}
                        <section className="player-board-left">
                            <div className="player-board-card">
                                <div className="player-board-grid">
                                    {numbers.map(n => {
                                        const selected = selectedNumbers.includes(n);
                                        const disabled =
                                            !selected &&
                                            selectedNumbers.length >= fieldsCount;

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

                                <div className="player-board-fields-tabs">
                                    {FIELD_OPTIONS.map(f => (
                                        <button
                                            key={f}
                                            type="button"
                                            className={
                                                "player-board-fields-tab" +
                                                (fieldsCount === f
                                                    ? " player-board-fields-tab--active"
                                                    : "")
                                            }
                                            onClick={() => setFieldsCount(f)}
                                        >
                                            <span className="player-board-fields-text">
                                                 {f} numbers
                                            </span>
                                        </button>
                                    ))}

                                </div>

                                <div className="player-board-meta">
                                    <div>
                                        <span className="player-board-meta-label">Times</span>
                                        <div className="player-board-times-control">
                                            <button
                                                type="button"
                                                onClick={() => setTimes(Math.max(1, times - 1))}
                                            >
                                                −
                                            </button>

                                            <input
                                                type="number"
                                                min={1}
                                                value={times}
                                                onChange={e =>
                                                    setTimes(Math.max(1, Number(e.target.value) || 1))
                                                }
                                            />

                                            <button
                                                type="button"
                                                onClick={() => setTimes(times + 1)}
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <span className="player-board-meta-label">Value</span>
                                        <div className="player-board-value-box">
                                            {price} DKK
                                        </div>
                                    </div>
                                </div>

                                {addLockMessage && (
                                    <p className="player-board-status player-board-status--error">
                                        {addLockMessage}
                                    </p>
                                )}

                                <div className="player-board-actions">
                                    <button
                                        type="button"
                                        className="player-board-btn player-board-btn--secondary"
                                        onClick={clearSelection}
                                    >
                                        Clear
                                    </button>

                                    <button
                                        type="button"
                                        className="player-board-btn player-board-btn--primary"
                                        onClick={addBet}
                                        disabled={!!addLockMessage}
                                    >
                                        Purchase
                                    </button>
                                </div>
                            </div>
                        </section>

                        {/* RIGHT */}
                        <section className="player-board-right">
                            <div className="player-board-card player-board-bets-card">
                                <h2>My Board Numbers</h2>

                                {bets.length === 0 ? (
                                    <p className="player-board-bets-empty">
                                        No purchase yet.
                                    </p>
                                ) : (
                                    <table className="player-board-bets-table">
                                        <tbody>
                                        {bets.map(b => (
                                            <tr key={b.id}>
                                                <td>{b.numbers.join(", ")}</td>
                                                <td>{b.times}</td>
                                                <td>{b.amountDkk} DKK</td>
                                                <td>
                                                    <button
                                                        type="button"
                                                        disabled={submitStatus.type === "loading"}
                                                        onClick={() => removeBet(b.id)}
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
                                    <strong>{totalAmount} DKK</strong>

                                    {submitLockMessage && (
                                        <p className="player-board-status player-board-status--error">
                                            {submitLockMessage}
                                        </p>
                                    )}

                                    <button
                                        type="button"
                                        disabled={submitBtnDisabled}
                                        onClick={submit}
                                    >
                                        {submitStatus.type === "loading"
                                            ? "Purchasing…"
                                            : "Submit"}
                                    </button>
                                </div>
                            </div>
                        </section>
                    </div>
                )}
            </main>
        </div>
    );
};
