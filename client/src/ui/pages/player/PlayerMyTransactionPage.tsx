import React, { useEffect, useMemo, useState } from "react";
import "../../css/PlayerMyTransactionPage.css";
import { PlayerPageHeader } from "../../components/PlayerPageHeader";

import { openapiAdapter, apiGet } from "../../../api/connection";

// Type-only imports
import type {
    UserResponse,
    TransactionDtoResponse,
    CreateTransactionRequest
} from "../../../generated-ts-client";

// Value imports
import { TransactionClient } from "../../../generated-ts-client";

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

// --------------------------------------
// MAP RAW TRANSACTION → UI DTO
// --------------------------------------
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

    // --------------------------------------
    // LOAD USER + TRANSACTIONS
    // --------------------------------------
    useEffect(() => {
        if (!CURRENT_USER_ID) {
            setLoadError("No user is logged in.");
            return;
        }

        void (async () => {
            try {
                setLoading(true);
                setLoadError(null);

                // Load transactions
                const backendTx = await transactionClient.getByUser(CURRENT_USER_ID);
                setTransactions((backendTx ?? []).map(mapTransaction));

                // Load user name
                const res = await apiGet("/api/user");
                const users: UserResponse[] = await res.json();

                const u = users.find((x) => x.id === CURRENT_USER_ID);
                if (u) setPlayerName(u.fullName);

            } catch (err) {
                console.error(err);
                setLoadError("Failed to load balance data.");
            } finally {
                setLoading(false);
            }
        })();
    }, [CURRENT_USER_ID]);

    // --------------------------------------
    // COMPUTED VALUES
    // --------------------------------------
    const approvedTransactions = useMemo(
        () => transactions.filter(t => t.status === "Approved"),
        [transactions]
    );

    const pendingDeposits = useMemo(
        () => transactions.filter(t =>
            t.type === "Deposit" && t.status === "Pending"
        ),
        [transactions]
    );

    const balance = useMemo(
        () => approvedTransactions.reduce((sum, t) => sum + t.amountDkk, 0),
        [approvedTransactions]
    );

    // --------------------------------------
    // SUBMIT DEPOSIT
    // --------------------------------------
    async function handleSubmitDeposit(e: React.FormEvent) {
        e.preventDefault();
        setFormError(null);
        setFormSuccess(null);

        const amount = Number(amountInput);
        if (!amount || amount <= 0) {
            setFormError("Enter a valid amount.");
            return;
        }

        if (!mobilePayInput.trim()) {
            setFormError("Enter MobilePay reference.");
            return;
        }

        try {
            const req: CreateTransactionRequest = {
                userId: CURRENT_USER_ID,
                amount: Math.round(amount),
                mobilePayRef: mobilePayInput.trim(),
            };

            const created = await transactionClient.createDeposit(req);
            setTransactions(prev => [mapTransaction(created), ...prev]);

            setAmountInput("");
            setMobilePayInput("");
            setFormSuccess("Deposit submitted!");

        } catch (err) {
            console.error(err);
            setFormError("Failed to submit deposit.");
        }
    }

    // --------------------------------------
    // RENDER
    // --------------------------------------
    return (
        <div className="balance-page">
            <PlayerPageHeader userName={playerName} balance={balance}/>

            <div className="balance-inner">
                <h1 className="balance-title">My balance</h1>

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
                            <h2 className="balance-section-title">Deposit with MobilePay</h2>

                            <form className="balance-deposit-form" onSubmit={handleSubmitDeposit}>
                                <div className="balance-form-row">
                                    <label className="balance-form-label">Amount (DKK)</label>
                                    <input
                                        type="number"
                                        min={1}
                                        className="balance-input"
                                        value={amountInput}
                                        onChange={e => setAmountInput(e.target.value)}
                                    />
                                </div>

                                <div className="balance-form-row">
                                    <label className="balance-form-label">MobilePay reference</label>
                                    <input
                                        type="text"
                                        className="balance-input"
                                        value={mobilePayInput}
                                        onChange={e => setMobilePayInput(e.target.value)}
                                    />
                                </div>

                                {formError && <p className="balance-form-error">{formError}</p>}
                                {formSuccess && <p className="balance-form-success">{formSuccess}</p>}

                                <button type="submit" className="balance-submit-btn">
                                    Submit deposit
                                </button>
                            </form>
                        </section>

                        {/* PENDING */}
                        {pendingDeposits.length > 0 && (
                            <section className="balance-card balance-pending-card">
                                <h3 className="balance-section-title">Pending deposits</h3>

                                <ul className="balance-pending-list">
                                    {pendingDeposits.map(tx => (
                                        <li key={tx.id} className="balance-pending-item">
                                            <div>
                                                <div className="balance-pending-main">
                                                    {tx.amountDkk} DKK · {tx.mobilePayRef}
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
                                    {transactions.map(tx => (
                                        <tr key={tx.id}>
                                            <td>{new Date(tx.date).toLocaleString()}</td>
                                            <td>{tx.type}</td>
                                            <td>{tx.description}</td>
                                            <td className={tx.amountDkk < 0 ? "neg" : "pos"}>
                                                {tx.amountDkk} DKK
                                            </td>
                                            <td>
                                                    <span className={`balance-status-badge balance-status-badge--${tx.status.toLowerCase()}`}>
                                                        {tx.status}
                                                    </span>
                                            </td>
                                        </tr>
                                    ))}
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
