import "../../../css/PendingTransactions.css";
import type { FC } from "react";
import { usePendingTransactions } from "../../../../core/hooks/usePendingTransactions.ts";

interface Props {
    onStatusChange?: () => void;
}

export const PendingTransactions: FC<Props> = ({ onStatusChange }) => {
    const { rows, loading, error, approve, reject } =
        usePendingTransactions(onStatusChange);

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
                        rows.map(r => (
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
                                            onClick={() => void approve(r.id)}
                                            aria-label="Approve"
                                        >
                                            ✓
                                        </button>
                                        <button
                                            className="pending-transactions-btn pending-transactions-btn--reject"
                                            onClick={() => void reject(r.id)}
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
    );
};
