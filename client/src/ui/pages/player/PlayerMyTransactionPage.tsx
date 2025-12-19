import "../../css/PlayerMyTransactionPage.css";
import type { FC } from "react";

import { useCurrentUser } from "../../../core/hooks/useCurrentUser";
import { usePlayerTransactions } from "../../../core/hooks/usePlayerTransactions";
import {
    TYPE_OPTIONS,
    STATUS_OPTIONS,
    SORT_OPTIONS,
    type TypeFilter,
    type StatusFilter,
    type SortOption,
} from "../../../core/transactions/types";

export const PlayerMyTransactionPage: FC = () => {
    const { user } = useCurrentUser();
    const tx = usePlayerTransactions(user?.id);

    return (
        <div className="balance-page">
            <div className="balance-inner">
                <h1 className="balance-title">My balance</h1>

                {tx.error && (
                    <p className="balance-status balance-status-error">
                        {tx.error}
                    </p>
                )}

                <div className="balance-layout">
                    {/* LEFT SIDE */}
                    <div className="balance-left">
                        <section className="balance-card balance-summary-card">
                            <div className="balance-summary-label">
                                Current balance
                            </div>
                            <div className="balance-summary-amount">
                                {tx.loading ? "…" : user?.balance ?? 0}{" "}
                                <span>DKK</span>
                            </div>

                            {tx.pendingDeposits.length > 0 && (
                                <p className="balance-hint">
                                    Pending deposits are not included yet.
                                </p>
                            )}
                        </section>

                        <section className="balance-card balance-deposit-card">
                            <h2 className="balance-section-title">
                                Deposit with MobilePay
                            </h2>

                            <form
                                className="balance-deposit-form"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    tx.submitDeposit();
                                }}
                            >
                                <div className="balance-form-row">
                                    <label className="balance-form-label">
                                        Amount (DKK) <span className="req">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min={1}
                                        className="balance-input"
                                        value={tx.amountInput}
                                        onChange={(e) =>
                                            tx.setAmountInput(e.target.value)
                                        }
                                        disabled={tx.loading}
                                    />
                                </div>

                                <div className="balance-form-row">
                                    <label className="balance-form-label">
                                        MobilePay reference{" "}
                                        <span className="req">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="balance-input"
                                        value={tx.mobilePayInput}
                                        onChange={(e) =>
                                            tx.setMobilePayInput(e.target.value)
                                        }
                                        disabled={tx.loading}
                                    />
                                </div>

                                {tx.formError && (
                                    <p className="balance-form-error">
                                        {tx.formError}
                                    </p>
                                )}
                                {tx.formSuccess && (
                                    <p className="balance-form-success">
                                        {tx.formSuccess}
                                    </p>
                                )}

                                <button
                                    type="button"
                                    className="balance-submit-btn"
                                    disabled={tx.loading}
                                    onClick={tx.submitDeposit}
                                >
                                    Submit deposit
                                </button>
                            </form>
                        </section>

                        {tx.pendingDeposits.length > 0 && (
                            <section className="balance-card balance-pending-card">
                                <h3 className="balance-section-title">
                                    Pending deposits
                                </h3>

                                <ul className="balance-pending-list">
                                    {tx.pendingDeposits.map((p) => (
                                        <li
                                            key={p.id}
                                            className="balance-pending-item"
                                        >
                                            <div>
                                                <div>
                                                    {p.amountDkk} DKK ·{" "}
                                                    {p.mobilePayRef}
                                                </div>
                                                <div className="balance-pending-meta">
                                                    {new Date(
                                                        p.date
                                                    ).toLocaleString()}
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
                            <h2 className="balance-section-title">
                                Transaction history
                            </h2>

                            <div className="tx-toolbar">
                                <div className="tx-row tx-row--top">
                                    <div className="tx-control">
                                        <label className="tx-label">Type</label>
                                        <select
                                            className="tx-select"
                                            value={tx.typeFilter}
                                            onChange={(e) => {
                                                tx.setPage(1);
                                                tx.setTypeFilter(
                                                    e.target.value as TypeFilter
                                                );
                                            }}
                                            disabled={tx.loading}
                                        >
                                            {TYPE_OPTIONS.map((o) => (
                                                <option key={o} value={o}>
                                                    {o === "all"
                                                        ? "All"
                                                        : o.charAt(0).toUpperCase() +
                                                        o.slice(1)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="tx-control">
                                        <label className="tx-label">Status</label>
                                        <select
                                            className="tx-select"
                                            value={tx.statusFilter}
                                            onChange={(e) => {
                                                tx.setPage(1);
                                                tx.setStatusFilter(
                                                    e.target.value as StatusFilter
                                                );
                                            }}
                                            disabled={tx.loading}
                                        >
                                            {STATUS_OPTIONS.map((o) => (
                                                <option key={o} value={o}>
                                                    {o === "all"
                                                        ? "All"
                                                        : o.charAt(0).toUpperCase() +
                                                        o.slice(1)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="tx-control">
                                        <label className="tx-label">Sort</label>
                                        <select
                                            className="tx-select"
                                            value={tx.sort}
                                            onChange={(e) => {
                                                tx.setPage(1);
                                                tx.setSort(
                                                    e.target.value as SortOption
                                                );
                                            }}
                                            disabled={tx.loading}
                                        >
                                            {SORT_OPTIONS.map((o) => (
                                                <option
                                                    key={o.value}
                                                    value={o.value}
                                                >
                                                    {o.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="tx-row tx-row--bottom">
                                    <div className="tx-control">
                                        <label className="tx-label">
                                            Page size
                                        </label>
                                        <select
                                            className="tx-select"
                                            value={tx.pageSize}
                                            onChange={(e) => {
                                                tx.setPage(1);
                                                tx.setPageSize(
                                                    Number(e.target.value)
                                                );
                                            }}
                                            disabled={tx.loading}
                                        >
                                            <option value={25}>25</option>
                                            <option value={50}>50</option>
                                            <option value={100}>100</option>
                                        </select>
                                    </div>

                                    <div className="tx-pager">
                                        <button
                                            type="button"
                                            className="tx-page-btn"
                                            disabled={
                                                tx.page <= 1 || tx.loading
                                            }
                                            onClick={() =>
                                                tx.setPage(
                                                    Math.max(1, tx.page - 1)
                                                )
                                            }
                                        >
                                            Prev
                                        </button>

                                        <span className="tx-page-indicator">
                                            Page {tx.page}
                                        </span>

                                        <button
                                            type="button"
                                            className="tx-page-btn"
                                            disabled={
                                                !tx.hasNextPage || tx.loading
                                            }
                                            onClick={() =>
                                                tx.setPage(tx.page + 1)
                                            }
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="balance-table-scrollable-wrapper">
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
                                    {tx.transactions.map((t) => (
                                        <tr key={t.id}>
                                            <td>
                                                {new Date(
                                                    t.date
                                                ).toLocaleString()}
                                            </td>
                                            <td>{t.type}</td>
                                            <td>{t.description}</td>
                                            <td
                                                className={
                                                    t.amountDkk < 0
                                                        ? "balance-amount-negative"
                                                        : "balance-amount-positive"
                                                }
                                            >
                                                {t.amountDkk > 0 ? "+" : ""}
                                                {t.amountDkk} DKK
                                            </td>
                                            <td>
                                                    <span
                                                        className={`balance-status-badge balance-status-badge--${t.status.toLowerCase()}`}
                                                    >
                                                        {t.status}
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
