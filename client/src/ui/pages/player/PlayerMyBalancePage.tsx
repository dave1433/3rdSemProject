import React, { useEffect, useMemo, useState } from "react";
import "../../css/PlayerMyBalancePage.css";
import { PlayerPageHeader } from "../../components/PlayerPageHeader";

// 👉 match your generated-ts-client exactly
import {
    UserClient,
    TransactionClient,
} from "../../../generated-ts-client";

import type {
    UserResponse,
    TransactionDtoResponse,
    CreateTransactionRequest,
} from "../../../generated-ts-client";

type TransactionStatus = "Pending" | "Approved" | "Rejected";
type TransactionType = "Deposit" | "BoardPurchase";

interface BalanceTransaction {
    id: string;
    date: string;
    type: TransactionType;
    amountDkk: number;
    mobilePayRef?: string;
    status: TransactionStatus;
    description?: string;
}

function mapTransaction(t: TransactionDtoResponse): BalanceTransaction {
    const rawType = (t.type ?? "").toLowerCase();
    const rawStatus = (t.status ?? "").toLowerCase();

    const type: TransactionType =
        rawType === "deposit" ? "Deposit" : "BoardPurchase";

    const status: TransactionStatus =
        rawStatus === "approved"
            ? "Approved"
            : rawStatus === "rejected"
                ? "Rejected"
                : "Pending";

    return {
        id: t.id,
        date: t.createdAt ?? new Date().toISOString(),
        type,
        amountDkk: t.amount,
        mobilePayRef: t.mobilePayRef ?? undefined,
        status,
        description:
            type === "Deposit"
                ? "Deposit via MobilePay"
                : t.boardId
                    ? `Board purchase (${t.boardId})`
                    : "Board purchase",
    };
}

const userClient = new UserClient();
const transactionClient = new TransactionClient();

export const PlayerMyBalancePage: React.FC = () => {
    const [transactions, setTransactions] = useState<BalanceTransaction[]>([]);
    const [playerName, setPlayerName] = useState<string>("");

    const [amountInput, setAmountInput] = useState("");
    const [mobilePayInput, setMobilePayInput] = useState("");
    const [formError, setFormError] = useState<string | null>(null);
    const [formSuccess, setFormSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);

    const CURRENT_USER_ID = localStorage.getItem("userId") ?? "";

    useEffect(() => {
        if (!CURRENT_USER_ID) {
            setLoadError("No user is logged in. Please log in again.");
            return;
        }

        void (async () => {
            try {
                setLoading(true);
                setLoadError(null);

                // Load transactions
                const backendTx: TransactionDtoResponse[] =
                    await transactionClient.getByUser(CURRENT_USER_ID);
                setTransactions(backendTx.map(mapTransaction));

                // Load user profile
                const users: UserResponse[] = await userClient.getUser();
                const current = users.find((u) => u.id === CURRENT_USER_ID);
                if (current) {
                    setPlayerName(current.fullName);
                }
            } catch (err) {
                console.error("Failed to load balance data", err);
                setLoadError("Failed to load balance data.");
            } finally {
                setLoading(false);
            }
        })();
    }, [CURRENT_USER_ID]);

    const approvedTransactions = useMemo(
        () => transactions.filter((t) => t.status === "Approved"),
        [transactions]
    );

    const pendingDeposits = useMemo(
        () =>
            transactions.filter(
                (t) => t.type === "Deposit" && t.status === "Pending"
            ),
        [transactions]
    );

    const balance = useMemo(() => {
        const total = approvedTransactions.reduce(
            (sum, t) => sum + t.amountDkk,
            0
        );
        return Math.max(0, total);
    }, [approvedTransactions]);

    async function handleSubmitDeposit(e: React.FormEvent) {
        e.preventDefault();
        setFormError(null);
        setFormSuccess(null);

        if (!CURRENT_USER_ID) {
            setFormError("No user id found. Please log in again.");
            return;
        }

        const amount = Number(amountInput.replace(",", "."));
        if (Number.isNaN(amount) || amount <= 0) {
            setFormError("Please enter a valid positive amount.");
            return;
        }

        if (!mobilePayInput.trim()) {
            setFormError("Please enter the MobilePay transaction number.");
            return;
        }

        try {
            const payload: CreateTransactionRequest = {
                userId: CURRENT_USER_ID,
                amount: Math.round(amount),
                mobilePayRef: mobilePayInput.trim(),
            };

            const created = await transactionClient.createDeposit(payload);

            setTransactions((prev) => [mapTransaction(created), ...prev]);

            setAmountInput("");
            setMobilePayInput("");
            setFormSuccess(
                "Deposit registered as pending. An admin will approve it soon."
            );
        } catch (err) {
            console.error("Failed to submit deposit", err);
            setFormError("Failed to submit deposit. Please try again.");
        }
    }

    return (
        <div className="balance-page">
            <PlayerPageHeader userName={playerName} />

            <div className="balance-inner">
                <h1 className="balance-title">My balance</h1>
                <p className="balance-subtitle">
                    Overview of your transactions and current balance.
                </p>

                {loadError && (
                    <p className="balance-form-message balance-form-error">
                        {loadError}
                    </p>
                )}

                <div className="balance-layout">
                    <div className="balance-left">
                        <section className="balance-card balance-summary-card">
                            <div className="balance-summary-label">Current balance</div>
                            <div className="balance-summary-amount">
                                {loading ? "…" : balance} <span>DKK</span>
                            </div>
                        </section>

                        <section className="balance-card balance-deposit-card">
                            <h2 className="balance-section-title">Deposit with MobilePay</h2>

                            <form
                                className="balance-deposit-form"
                                onSubmit={handleSubmitDeposit}
                            >
                                <div className="balance-form-row">
                                    <label className="balance-form-label" htmlFor="amount">
                                        Amount (DKK)
                                    </label>
                                    <input
                                        id="amount"
                                        type="number"
                                        min={1}
                                        className="balance-input"
                                        value={amountInput}
                                        onChange={(e) => setAmountInput(e.target.value)}
                                        placeholder="e.g. 200"
                                    />
                                </div>

                                <div className="balance-form-row">
                                    <label className="balance-form-label" htmlFor="mobilepay">
                                        MobilePay transaction #
                                    </label>
                                    <input
                                        id="mobilepay"
                                        type="text"
                                        className="balance-input"
                                        value={mobilePayInput}
                                        onChange={(e) => setMobilePayInput(e.target.value)}
                                        placeholder="e.g. MP-123456"
                                    />
                                </div>

                                {formError && (
                                    <p className="balance-form-message balance-form-error">
                                        {formError}
                                    </p>
                                )}
                                {formSuccess && (
                                    <p className="balance-form-message balance-form-success">
                                        {formSuccess}
                                    </p>
                                )}

                                <button type="submit" className="balance-submit-btn">
                                    Submit deposit
                                </button>
                            </form>
                        </section>

                        {pendingDeposits.length > 0 && (
                            <section className="balance-card balance-pending-card">
                                <h3 className="balance-section-title">Pending deposits</h3>
                                <ul className="balance-pending-list">
                                    {pendingDeposits.map((tx) => (
                                        <li key={tx.id} className="balance-pending-item">
                                            <div>
                                                <div className="balance-pending-main">
                                                    {tx.amountDkk} DKK ·{" "}
                                                    <span className="balance-pending-ref">
                                                        {tx.mobilePayRef}
                                                    </span>
                                                </div>
                                                <div className="balance-pending-meta">
                                                    {new Date(tx.date).toLocaleString()}
                                                </div>
                                            </div>
                                            <span className="balance-status-badge balance-status-badge--pending">
                                                Pending
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}
                    </div>

                    <div className="balance-right">
                        <section className="balance-card">
                            <h2 className="balance-section-title">Balance history</h2>

                            <div className="balance-table-wrapper">
                                <table className="balance-table">
                                    <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Type</th>
                                        <th>Description</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {transactions.map((tx) => {
                                        const amountLabel =
                                            (tx.amountDkk > 0 ? "+" : "") +
                                            tx.amountDkk +
                                            " DKK";

                                        return (
                                            <tr key={tx.id}>
                                                <td>
                                                    {new Date(tx.date).toLocaleDateString()}
                                                </td>
                                                <td>{tx.type}</td>
                                                <td>{tx.description ?? "—"}</td>
                                                <td
                                                    className={
                                                        tx.amountDkk < 0
                                                            ? "balance-amount-negative"
                                                            : "balance-amount-positive"
                                                    }
                                                >
                                                    {amountLabel}
                                                </td>
                                                <td>
                                                        <span
                                                            className={
                                                                "balance-status-badge " +
                                                                (tx.status === "Approved"
                                                                    ? "balance-status-badge--approved"
                                                                    : tx.status === "Pending"
                                                                        ? "balance-status-badge--pending"
                                                                        : "balance-status-badge--rejected")
                                                            }
                                                        >
                                                            {tx.status}
                                                        </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};
