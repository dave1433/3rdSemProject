import React, { useEffect, useState } from "react";
import "../css/PendingTransactions.css";
import { openapiAdapter } from "../../api/connection";
import type { TransactionDtoResponse } from "../../generated-ts-client";
import { TransactionClient } from "../../generated-ts-client";

const transactionClient = openapiAdapter(TransactionClient);

interface PendingRow {
    id: string;
    createdAt: string;
    playerName: string;
    mobilePayId: string;
    amountDkk: number;
}

interface Props {
    onStatusChange?: () => void;
}

export const PendingTransactions: React.FC<Props> = ({ onStatusChange }) => {
    const [rows, setRows] = useState<PendingRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        void loadPending();
    }, []);

    async function loadPending(): Promise<void> {
        try {
            setLoading(true);
            setError(null);

            const backend = (await transactionClient.getPending()) as TransactionDtoResponse[];

            const mapped: PendingRow[] = backend.map((t: TransactionDtoResponse) => ({
                id: t.id,
                createdAt: t.createdAt ?? new Date().toISOString(),
                playerName: t.fullName ?? "Unknown user",
                mobilePayId: t.mobilePayRef ?? "",
                amountDkk: t.amount ?? 0
            }));

            setRows(mapped);
        } catch (err) {
            console.error("Failed to load pending transactions", err);
            setError("Failed to load pending transactions.");
        } finally {
            setLoading(false);
        }
    }

    async function handleApprove(id: string): Promise<void> {
        try {
            await transactionClient.updateStatus(id, { status: "approved" });
            await loadPending();
            onStatusChange?.(); // 🔔 refresh header badge
        } catch (err) {
            console.error("Approval failed", err);
            alert("Failed to approve transaction");
        }
    }

    async function handleReject(id: string): Promise<void> {
        try {
            await transactionClient.updateStatus(id, { status: "rejected" });
            await loadPending();
            onStatusChange?.(); // 🔔 refresh header badge
        } catch (err) {
            console.error("Rejection failed", err);
            alert("Failed to reject transaction");
        }
    }

    return (
        <div className="pending-transactions-page">
            <div className="pending-transactions-card">
                <h2 className="pending-transactions-title">
                    Pending Transactions
                </h2>

                <table className="pending-transactions-table">
                    <thead>
                    <tr>
                        <th>Date</th>
                        <th>User</th>
                        <th>MobilePay ID</th>
                        <th>Amount</th>
                        <th>Actions</th>
                    </tr>
                    </thead>

                    <tbody>
                    {loading && (
                        <tr>
                            <td
                                colSpan={5}
                                className="pending-transactions-status"
                            >
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
                            <td
                                colSpan={5}
                                className="pending-transactions-status"
                            >
                                No pending transactions.
                            </td>
                        </tr>
                    )}

                    {!loading &&
                        !error &&
                        rows.map((r) => (
                            <tr key={r.id}>
                                <td>
                                    {new Date(r.createdAt).toLocaleDateString()}
                                </td>
                                <td>{r.playerName}</td>
                                <td>{r.mobilePayId || "—"}</td>
                                <td>
                                    <strong>{r.amountDkk} DKK</strong>
                                </td>
                                <td>
                                    <div className="pending-transactions-actions-cell">
                                        <button
                                            className="pending-transactions-btn pending-transactions-btn--approve"
                                            onClick={() => void handleApprove(r.id)}
                                        >
                                            ✓
                                        </button>
                                        <button
                                            className="pending-transactions-btn pending-transactions-btn--reject"
                                            onClick={() => void handleReject(r.id)}
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
    );
};
