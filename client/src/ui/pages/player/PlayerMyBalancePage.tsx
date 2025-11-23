import React, { useMemo, useState } from "react";
import "../../css/PlayerMyBalancePage.css";
import { PlayerPageHeader } from "../../components/PlayerPageHeader";

type TransactionStatus = "Pending" | "Approved" | "Rejected";
type TransactionType = "Deposit" | "BoardPurchase";

interface BalanceTransaction {
    id: number;
    date: string;
    type: TransactionType;
    amountDkk: number;
    mobilePayRef?: string;
    status: TransactionStatus;
    description?: string;
}

// some fake data(should be deleted later: 2 approved deposits, 1 approved purchase, 1 pending deposit
const initialTransactions: BalanceTransaction[] = [
    {
        id: 1,
        date: "2025-11-15T10:22:00Z",
        type: "Deposit",
        amountDkk: 500,
        mobilePayRef: "MP-123456",
        status: "Approved",
        description: "Initial deposit",
    },
    {
        id: 2,
        date: "2025-11-18T09:05:00Z",
        type: "BoardPurchase",
        amountDkk: 160,
        status: "Approved",
        description: "Board with 8 fields (x1)",
    },
    {
        id: 3,
        date: "2025-11-20T14:10:00Z",
        type: "Deposit",
        amountDkk: 200,
        mobilePayRef: "MP-789012",
        status: "Approved",
        description: "Top up",
    },
    {
        id: 4,
        date: "2025-11-22T16:40:00Z",
        type: "Deposit",
        amountDkk: 300,
        mobilePayRef: "MP-987654",
        status: "Pending",
        description: "Waiting for admin approval",
    },
];

export const PlayerMyBalancePage: React.FC = () => {
    const [transactions, setTransactions] =
        useState<BalanceTransaction[]>(initialTransactions);

    const [amountInput, setAmountInput] = useState("");
    const [mobilePayInput, setMobilePayInput] = useState("");
    const [formError, setFormError] = useState<string | null>(null);
    const [formSuccess, setFormSuccess] = useState<string | null>(null);

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

    // Balance = sum(approved deposits) - sum(approved purchases), clamped at 0
    const balance = useMemo(() => {
        const total = approvedTransactions.reduce((sum, t) => {
            if (t.type === "Deposit") return sum + t.amountDkk;
            return sum - t.amountDkk; // BoardPurchase
        }, 0);

        return Math.max(0, total);
    }, [approvedTransactions]);

    function handleSubmitDeposit(e: React.FormEvent) {
        e.preventDefault();
        setFormError(null);
        setFormSuccess(null);

        const amount = Number(amountInput.replace(",", "."));
        if (Number.isNaN(amount) || amount <= 0) {
            setFormError("Please enter a valid positive amount.");
            return;
        }

        if (!mobilePayInput.trim()) {
            setFormError("Please enter the MobilePay transaction number.");
            return;
        }

        const now = new Date();
        const newTx: BalanceTransaction = {
            id: Date.now(),
            date: now.toISOString(),
            type: "Deposit",
            amountDkk: Math.round(amount),
            mobilePayRef: mobilePayInput.trim(),
            status: "Pending",
            description: "Awaiting admin approval",
        };

        setTransactions((prev) => [newTx, ...prev]);
        setAmountInput("");
        setMobilePayInput("");
        setFormSuccess(
            "Deposit registered as pending. An admin will review and approve it."
        );
    }

    return (
        <div className="balance-page">
            <PlayerPageHeader userName="Mads Andersen" />

            <div className="balance-inner">
                <h1 className="balance-title">My balance</h1>
                <p className="balance-subtitle">
                    Overview of my transactions and current balance.
                </p>

                <div className="balance-layout">
                    {/* Left side: current balance + deposit form */}
                    <div className="balance-left">
                        <section className="balance-card balance-summary-card">
                            <div className="balance-summary-label">Current balance</div>
                            <div className="balance-summary-amount">
                                {balance} <span>DKK</span>
                            </div>
                        </section>

                        <section className="balance-card balance-deposit-card">
                            <h2 className="balance-section-title">Deposit with MobilePay</h2>
                            <p className="balance-section-subtitle">
                                Submit your payment and attach the MobilePay transaction
                                number. Your deposit will be pending until an admin approves it.
                            </p>

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

                    {/* Right side: transaction history */}
                    <div className="balance-right">
                        <section className="balance-card">
                            <h2 className="balance-section-title">Balance history</h2>
                            <p className="balance-section-subtitle">
                                Approved deposits increase your balance. Approved board
                                purchases decrease it.
                            </p>

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
                                        const dateLabel = new Date(
                                            tx.date
                                        ).toLocaleDateString();
                                        const amountLabel =
                                            (tx.type === "BoardPurchase" ? "-" : "+") +
                                            tx.amountDkk +
                                            " DKK";

                                        return (
                                            <tr key={tx.id}>
                                                <td>{dateLabel}</td>
                                                <td>
                                                    {tx.type === "Deposit"
                                                        ? "Deposit"
                                                        : "Board purchase"}
                                                </td>
                                                <td>{tx.description ?? "\u2014"}</td>
                                                <td
                                                    className={
                                                        tx.type === "BoardPurchase"
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
