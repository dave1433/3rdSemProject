import React, { useEffect, useState } from "react";
import "../css/PendingTransactions.css";
import { TransactionClient } from "../../../src/generated-ts-client";
import type { TransactionDtoResponse } from "../../../src/generated-ts-client";

interface PendingRow {
    id: string;
    createdAt: string;
    playerName: string;
    mobilePayId: string;
    amountDkk: number;
}

const transactionClient = new TransactionClient();

// allow us to read optional name fields without TS errors
type TransactionWithName = TransactionDtoResponse & {
    playerFullName?: string;
    playerName?: string;
    player?: { fullName?: string };
};

export const PendingTransactions: React.FC = () => {
    const [rows, setRows] = useState<PendingRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        void loadPending();
    }, []);

    async function loadPending() {
        try {
            setLoading(true);
            setError(null);

            const backend = (await transactionClient.getPending()) as TransactionWithName[];

            const mapped: PendingRow[] = backend.map((t) => ({
                id: t.id,
                createdAt: t.createdAt ?? new Date().toISOString(),
                playerName: t.fullName ?? t.playerId ?? "Unknown player",
                mobilePayId: t.mobilePayRef ?? "",
                amountDkk: t.amount,
            }));
            setRows(mapped);
        } catch (err) {
            console.error("Failed to load pending transactions", err);
            setError("Failed to load pending transactions.");
        } finally {
            setLoading(false);
        }
    }

    async function handleApprove(id: string) {
        try {
            await transactionClient.updateStatus(id, { status: "approved" });
            await loadPending();
        } catch (err) {
            console.error("Failed to approve transaction", err);
            alert("Failed to approve transaction.");
        }
    }

    async function handleReject(id: string) {
        try {
            await transactionClient.updateStatus(id, { status: "rejected" });
            await loadPending();
        } catch (err) {
            console.error("Failed to reject transaction", err);
            alert("Failed to reject transaction.");
        }
    }


    return (
        <div className="pending-transactions-page">
            <div className="pending-transactions-card">
                <div style={{ width: "100%" }}>
                    <h2 className="pending-transactions-title">Pending Transactions</h2>

                    <table className="pending-transactions-table">
                        <thead>
                        <tr>
                            <th>Date</th>
                            <th>Player</th>
                            <th>MobilePay ID</th>
                            <th>Amount</th>
                            <th>Actions</th>
                        </tr>
                        </thead>

                        <tbody>
                        {loading && (
                            <tr>
                                <td colSpan={5} className="pending-transactions-status">
                                    Loading…
                                </td>
                            </tr>
                        )}

                        {error && !loading && (
                            <tr>
                                <td
                                    colSpan={5}
                                    className="pending-transactions-status pending-transactions-status--error"
                                >
                                    {error}
                                </td>
                            </tr>
                        )}

                        {!loading && !error && rows.length === 0 && (
                            <tr>
                                <td colSpan={5} className="pending-transactions-status">
                                    No pending transactions.
                                </td>
                            </tr>
                        )}

                        {!loading &&
                            !error &&
                            rows.map((r) => (
                                <tr key={r.id}>
                                    <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                                    <td>{r.playerName}</td>
                                    <td>{r.mobilePayId || "—"}</td>
                                    <td>
                                        <strong>{r.amountDkk} DKK</strong>
                                    </td>
                                    <td>
                                        <div className="pending-transactions-actions-cell">
                                            <button
                                                type="button"
                                                className="pending-transactions-btn pending-transactions-btn--approve"
                                                onClick={() => handleApprove(r.id)}
                                                aria-label="Approve"
                                            >
                                                ✓
                                            </button>
                                            <button
                                                type="button"
                                                className="pending-transactions-btn pending-transactions-btn--reject"
                                                onClick={() => handleReject(r.id)}
                                                aria-label="Reject"
                                            >
                                                ✕
                                            </button>
                                        </div>
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
