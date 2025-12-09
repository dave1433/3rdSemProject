import React, { useEffect, useMemo, useState } from "react";
import "../../css/PlayerMyBalancePage.css";
import { PlayerPageHeader } from "../../components/PlayerPageHeader";

import { openapiAdapter } from "../../../api/connection";

// ✅ Type-only imports (required because verbatimModuleSyntax = true)
import type {
    UserResponse,
    TransactionDtoResponse,
    CreateTransactionRequest
} from "../../../generated-ts-client";

// ✅ Value imports
import {
    UserClient,
    TransactionClient
} from "../../../generated-ts-client";

const userClient = openapiAdapter(UserClient);
const transactionClient = openapiAdapter(TransactionClient);

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

// -------------------------
// MAP RAW TRANSACTION → UI DTO
// -------------------------
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

// =======================================================
//               COMPONENT START
// =======================================================

export const PlayerMyTransactionPage: React.FC = () => {
    const [transactions, setTransactions] = useState<BalanceTransaction[]>([]);
    const [playerName, setPlayerName] = useState("");

    const [amountInput, setAmountInput] = useState("");
    const [mobilePayInput, setMobilePayInput] = useState("");

    const [formError, setFormError] = useState<string | null>(null);
    const [formSuccess, setFormSuccess] = useState<string | null>(null);

    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);

    const CURRENT_USER_ID = localStorage.getItem("userId") ?? "";

    // -------------------------
    // LOAD USER + TRANSACTIONS
    // -------------------------
    useEffect(() => {
        if (!CURRENT_USER_ID) {
            setLoadError("No user is logged in.");
            return;
        }

        void (async () => {
            try {
                setLoading(true);
                setLoadError(null);

                const backendTx = await transactionClient.getByUser(CURRENT_USER_ID);
                setTransactions((backendTx ?? []).map(mapTransaction));

                const users = await userClient.getUser();
                const u = users.find((x: UserResponse) => x.id === CURRENT_USER_ID);
                if (u) setPlayerName(u.fullName);
            } catch (err) {
                console.error(err);
                setLoadError("Failed to load balance data.");
            } finally {
                setLoading(false);
            }
        })();
    }, [CURRENT_USER_ID]);

    // -------------------------
    // FILTERS + COMPUTED VALUES
    // -------------------------
    const approvedTransactions = useMemo(
        () => transactions.filter(t => t.status === "Approved"),
        [transactions]
    );

    const pendingDeposits = useMemo(
        () =>
            transactions.filter(
                t => t.type === "Deposit" && t.status === "Pending"
            ),
        [transactions]
    );

    const balance = useMemo(
        () => approvedTransactions.reduce((sum, t) => sum + t.amountDkk, 0),
        [approvedTransactions]
    );

    // -------------------------
    //      SUBMIT DEPOSIT
    // -------------------------
    async function handleSubmitDeposit(e: React.FormEvent) {
        e.preventDefault();
        setFormError(null);
        setFormSuccess(null);

        if (!CURRENT_USER_ID) {
            setFormError("No user ID found.");
            return;
        }

        const amount = Number(amountInput.replace(",", "."));
        if (Number.isNaN(amount) || amount <= 0) {
            setFormError("Please enter a valid positive amount.");
            return;
        }

        if (!mobilePayInput.trim()) {
            setFormError("Please enter the MobilePay reference.");
            return;
        }

        try {
            const payload: CreateTransactionRequest = {
                userId: CURRENT_USER_ID,
                amount: Math.round(amount),
                mobilePayRef: mobilePayInput.trim(),
            };

            const created = await transactionClient.createDeposit(payload);

            setTransactions(prev => [mapTransaction(created), ...prev]);

            setAmountInput("");
            setMobilePayInput("");

            setFormSuccess("Deposit submitted and is now pending approval.");
        } catch (err) {
            console.error(err);
            setFormError("Unable to submit deposit. Try again.");
        }
    }

    // =======================================================
    //                      RENDER
    // =======================================================

    return (
        <div className="balance-page">
            <PlayerPageHeader userName={playerName} />

            <div className="balance-inner">
                <h1 className="balance-title">My balance</h1>
                <p className="balance-subtitle">Overview of your transactions.</p>

                {loadError && (
                    <p className="balance-form-message balance-form-error">
                        {loadError}
                    </p>
                )}

                <div className="balance-layout">
                    {/* LEFT SIDE */}
                    <div className="balance-left">
                        {/* BALANCE SUMMARY */}
                        <section className="balance-card balance-summary-card">
                            <div className="balance-summary-label">Current balance</div>
                            <div className="balance-summary-amount">
                                {loading ? "…" : balance} <span>DKK</span>
                            </div>
                        </section>

                        {/* DEPOSIT FORM */}
                        <section className="balance-card balance-deposit-card">
                            <h2 className="balance-section-title">
                                Deposit with MobilePay
                            </h2>

                            <form className="balance-deposit-form" onSubmit={handleSubmitDeposit}>
                                <div className="balance-form-row">
                                    <label className="balance-form-label">Amount (DKK)</label>
                                    <input
                                        type="number"
                                        min={1}
                                        className="balance-input"
                                        value={amountInput}
                                        onChange={(e) => setAmountInput(e.target.value)}
                                        placeholder="e.g. 200"
                                    />
                                </div>

                                <div className="balance-form-row">
                                    <label className="balance-form-label">
                                        MobilePay transaction #
                                    </label>
                                    <input
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

                        {/* PENDING DEPOSITS */}
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

                    {/* RIGHT SIDE */}
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
                                                <td>{new Date(tx.date).toLocaleDateString()}</td>
                                                <td>{tx.type}</td>
                                                <td>{tx.description}</td>

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
