import React, { useEffect, useMemo, useState } from "react";
import "../../css/PlayerBoardPage.css";
import { PlayerPageHeader } from "../../components/PlayerPageHeader";

import { openapiAdapter } from "../../../api/connection";
import {
    AuthClient,
    BoardClient,
    BoardPriceClient,
    UserClient,
} from "../../../generated-ts-client";

import type {
    AuthUserInfo,
    BoardPriceDtoResponse,
    CreateBoardRequest,
    UserResponse,
} from "../../../generated-ts-client";

// ----------------------
// TYPES
// ----------------------
type FieldsCount = 5 | 6 | 7 | 8;

interface BetPlacement {
    id: string;
    numbers: number[];
    fields: number;
    times: number;
    unitPriceDkk: number;
    amountDkk: number;
}

type PriceMap = Partial<Record<FieldsCount, number>>;

type SubmitStatus =
    | { type: "idle" }
    | { type: "loading"; text: string }
    | { type: "success"; text: string }
    | { type: "error"; text: string };

// ----------------------
// CLIENTS
// ----------------------
const authClient = openapiAdapter(AuthClient);
const boardClient = openapiAdapter(BoardClient);
const boardPriceClient = openapiAdapter(BoardPriceClient);
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

// Try extract a readable message from unknown errors
function getErrorMessage(err: unknown): string {
    if (err instanceof Error && err.message) return err.message;
    return "Failed to submit. Please try again.";
}

export const PlayerBoardPage: React.FC = () => {
    const [fieldsCount, setFieldsCount] = useState<FieldsCount>(5);
    const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
    const [times, setTimes] = useState(1);
    const [bets, setBets] = useState<BetPlacement[]>([]);

    const [playerName, setPlayerName] = useState("");
    const [balance, setBalance] = useState<number | null>(null);

    const [priceByFields, setPriceByFields] = useState<PriceMap>({});
    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);

    // submit status (will be shown under Submit button)
    const [submitStatus, setSubmitStatus] = useState<SubmitStatus>({ type: "idle" });

    // warning under the week title (only when server says draw not open)
    const [warningMsg, setWarningMsg] = useState<string | null>(null);

    const playerId = localStorage.getItem("userId") ?? "";
    const balanceValue = balance ?? 0;

    const numbers = useMemo(
        () => Array.from({ length: 16 }, (_, i) => i + 1),
        []
    );
    const fields = selectedNumbers.length;

    const unitPrice = useMemo(
        () => priceByFields[fieldsCount] ?? 0,
        [priceByFields, fieldsCount]
    );

    const price = useMemo(() => {
        if (fields !== fieldsCount) return 0;
        return unitPrice * times;
    }, [fields, fieldsCount, unitPrice, times]);

    const totalAmount = useMemo(
        () => bets.reduce((sum, b) => sum + b.amountDkk, 0),
        [bets]
    );

    const weekLabel = useMemo(() => getIsoWeekLabel(new Date().toISOString()), []);

    // ----------------------
    // BALANCE LOCK
    // ----------------------
    const canAddToCart = useMemo(() => {
        if (unitPrice <= 0) return false;
        if (fields !== fieldsCount) return false;

        const nextAmount = unitPrice * times;
        return balanceValue >= totalAmount + nextAmount;
    }, [unitPrice, fields, fieldsCount, times, balanceValue, totalAmount]);

    const canSubmitCart = useMemo(() => {
        if (bets.length === 0) return false;
        return balanceValue >= totalAmount;
    }, [bets.length, balanceValue, totalAmount]);

    const addLockMessage = useMemo(() => {
        if (unitPrice <= 0) return null;
        if (fields !== fieldsCount) return null;

        const nextAmount = unitPrice * times;
        const remaining = balanceValue - totalAmount;
        if (remaining >= nextAmount) return null;

        return `Insufficient balance. You have ${remaining} DKK left for this cart, but this ticket costs ${nextAmount} DKK.`;
    }, [unitPrice, fields, fieldsCount, times, balanceValue, totalAmount]);

    const submitLockMessage = useMemo(() => {
        if (bets.length === 0) return null;
        if (balanceValue >= totalAmount) return null;
        return `Insufficient balance to submit. Total is ${totalAmount} DKK but your balance is ${balanceValue} DKK.`;
    }, [bets.length, totalAmount, balanceValue]);

    // ----------------------
    // LOAD USER + PRICES
    // ----------------------
    async function loadBoardPageData() {
        try {
            setLoading(true);
            setLoadError(null);

            // name (Auth)
            try {
                const info: AuthUserInfo = await authClient.userInfo();
                setPlayerName(info.fullName);
            } catch (err) {
                console.warn("Failed to load auth user info", err);
            }

            // balance (User/me)
            try {
                const me: UserResponse = await userClient.getCurrentUser();
                setBalance(me.balance ?? null);
                if (me.fullName) setPlayerName(me.fullName);
            } catch (err) {
                console.warn("Failed to load current user balance", err);
            }

            // prices from DB
            const rows: BoardPriceDtoResponse[] = (await boardPriceClient.getAll()) ?? [];
            const map: PriceMap = {};
            for (const r of rows) {
                const f = r.fieldsCount;
                const p = r.price;
                if ((f === 5 || f === 6 || f === 7 || f === 8) && typeof p === "number") {
                    map[f as FieldsCount] = p;
                }
            }
            setPriceByFields(map);
        } catch (e) {
            console.error("Failed to load board page data:", e);
            setLoadError("Failed to load board page. Check browser console.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (!playerId) {
            setLoadError("No player logged in.");
            return;
        }
        void loadBoardPageData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
        if (!canAddToCart) return;

        // clear old submit status when user changes cart again
        setSubmitStatus({ type: "idle" });

        const amount = unitPrice * times;

        setBets((old) => [
            ...old,
            {
                id: Date.now().toString(),
                numbers: selectedNumbers,
                fields,
                times,
                unitPriceDkk: unitPrice,
                amountDkk: amount,
            },
        ]);

        setSelectedNumbers([]);
        setTimes(1);
    }

    // ----------------------
    // SUBMIT PURCHASE
    // ----------------------
    async function handleSubmit() {
        if (!canSubmitCart) return;

        const payload: CreateBoardRequest[] = bets.map((b) => ({
            userId: playerId,
            numbers: b.numbers,
            times: b.times,
        }));

        try {
            setWarningMsg(null);
            setSubmitStatus({ type: "loading", text: "Purchasing…" });

            await boardClient.purchase(payload);

            setBets([]);
            setSelectedNumbers([]);
            setTimes(1);

            setSubmitStatus({ type: "success", text: "Purchase succeeded ✅" });
            await loadBoardPageData();

            window.setTimeout(() => setSubmitStatus({ type: "idle" }), 3000);
        } catch (err: unknown) {
            console.error("Failed to submit purchase:", err);

            const msg = getErrorMessage(err);

            if (
                msg.includes("This week's game has not been created yet") ||
                msg.includes("winning numbers are set") ||
                msg.includes("Please wait for the draw")
            ) {
                setWarningMsg(
                    "This week's game has not been created yet. Please wait for the draw to open."
                );
            } else {
                setWarningMsg(null);
            }

            setSubmitStatus({ type: "error", text: msg });
            window.setTimeout(() => setSubmitStatus({ type: "idle" }), 5000);

            await loadBoardPageData();
        }
    }

    const submitBtnDisabled = !canSubmitCart || submitStatus.type === "loading";

    // ----------------------
    // RENDER
    // ----------------------
    return (
        <div className="player-board-page">
            <PlayerPageHeader userName={playerName} balance={balance} />

            <main className="player-board-main">
                <h1 className="player-board-week">{weekLabel}</h1>

                {/*  warning under week */}
                {warningMsg && (
                    <p className="player-board-status player-board-status--error">
                        {warningMsg}
                    </p>
                )}

                {loading && <p className="player-board-status">Loading…</p>}
                {loadError && (
                    <p className="player-board-status player-board-status--error">
                        {loadError}
                    </p>
                )}

                {!loading && !loadError && (
                    <div className="player-board-layout">
                        {/* LEFT SIDE */}
                        <section className="player-board-left">
                            <div className="player-board-card">
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

                                <div className="player-board-meta">
                                    <div>
                                        <span className="player-board-meta-label">Times</span>
                                        <div className="player-board-times-control">
                                            <button
                                                type="button"
                                                onClick={() => setTimes((t) => Math.max(1, t - 1))}
                                            >
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

                                            <button type="button" onClick={() => setTimes((t) => t + 1)}>
                                                +
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <span className="player-board-meta-label">Value</span>
                                        <div className="player-board-value-box">{price} DKK</div>
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
                                        onClick={() => {
                                            setSelectedNumbers([]);
                                            setTimes(1);
                                            setSubmitStatus({ type: "idle" });
                                        }}
                                    >
                                        Clear
                                    </button>

                                    <button
                                        type="button"
                                        className="player-board-btn player-board-btn--primary"
                                        disabled={!canAddToCart}
                                        onClick={handleMakeBet}
                                    >
                                        Purchase
                                    </button>
                                </div>
                            </div>
                        </section>

                        {/* RIGHT SIDE */}
                        <section className="player-board-right">
                            <div className="player-board-card player-board-bets-card">
                                <h2>My Board Numbers</h2>

                                {bets.length === 0 ? (
                                    <p className="player-board-bets-empty">No purchase yet.</p>
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
                                                        type="button"
                                                        className="player-board-bets-remove-btn"
                                                        disabled={submitStatus.type === "loading"}
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

                                    {submitLockMessage && (
                                        <p className="player-board-status player-board-status--error">
                                            {submitLockMessage}
                                        </p>
                                    )}

                                    <div className="player-board-bets-buttons">
                                        <button
                                            type="button"
                                            className="player-board-bets-btn player-board-bets-btn--submit"
                                            disabled={submitBtnDisabled}
                                            onClick={handleSubmit}
                                        >
                                            {submitStatus.type === "loading" ? "Purchasing…" : "Submit"}
                                        </button>

                                        {/* ✅ message directly under the submit button */}
                                        {submitStatus.type !== "idle" && (
                                            <p
                                                className={
                                                    "player-board-submit-msg " +
                                                    (submitStatus.type === "error"
                                                        ? "player-board-submit-msg--error"
                                                        : submitStatus.type === "success"
                                                            ? "player-board-submit-msg--success"
                                                            : "player-board-submit-msg--loading")
                                                }
                                            >
                                                {submitStatus.text}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                )}
            </main>
        </div>
    );
};
