import React, { useEffect, useMemo, useState } from "react";
import "../../css/PlayerMyTransactionPage.css";

import { openapiAdapter } from "../../../api/connection";
import { TransactionClient } from "../../../generated-ts-client";
import { useCurrentUser } from "../../../core/hooks/useCurrentUser";

import type {
    TransactionDtoResponse,
    CreateTransactionRequest,
} from "../../../generated-ts-client";

// ----------------------
// CLIENT
// ----------------------
const transactionClient = openapiAdapter(TransactionClient);

// ----------------------
// FILTER/SORT TYPES (NO ANY)
// ----------------------
const TYPE_OPTIONS = ["all", "deposit", "purchase", "refund"] as const;
type TypeFilter = (typeof TYPE_OPTIONS)[number];

const STATUS_OPTIONS = ["all", "pending", "approved", "rejected"] as const;
type StatusFilter = (typeof STATUS_OPTIONS)[number];

const SORT_OPTIONS = [
    { value: "-createdat", label: "Newest" },
    { value: "createdat", label: "Oldest" },
    { value: "-amount", label: "Amount (high → low)" },
    { value: "amount", label: "Amount (low → high)" },
] as const;

type SortOption = (typeof SORT_OPTIONS)[number]["value"];


// ----------------------
// TYPES
// ----------------------
type TransactionStatus = "Pending" | "Approved" | "Rejected";
type TransactionType = "Deposit" | "Purchase" | "Refund";

interface BalanceTransaction {
    id: string;
    date: string;
    type: TransactionType;
    amountDkk: number;
    mobilePayRef?: string;
    status: TransactionStatus;
    description: string;
}

// ----------------------
// HELPERS
// ----------------------
function mapTransaction(t: TransactionDtoResponse): BalanceTransaction {
    const rawType = (t.type ?? "").toLowerCase();
    const rawStatus = (t.status ?? "").toLowerCase();

    const type: TransactionType =
        rawType === "deposit"
            ? "Deposit"
            : rawType === "refund"
                ? "Refund"
                : "Purchase";

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
                : type === "Refund"
                    ? "Refund"
                    : "Board purchase", // removed boardId from description
    };
}

function buildSieveFilters(type: TypeFilter, status: StatusFilter): string | null {
    const parts: string[] = [];
    if (type !== "all") parts.push(`type==${type}`);
    if (status !== "all") parts.push(`status==${status}`);
    return parts.length ? parts.join(",") : null;
}

function labelize(opt: string) {
    return opt.charAt(0).toUpperCase() + opt.slice(1);
}

// ----------------------
// COMPONENT
// ----------------------
export const PlayerMyTransactionPage: React.FC = () => {
    const { user } = useCurrentUser();
    const CURRENT_USER_ID = user?.id ?? "";

    const [transactions, setTransactions] = useState<BalanceTransaction[]>([]);
    const [amountInput, setAmountInput] = useState("");
    const [mobilePayInput, setMobilePayInput] = useState("");

    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);
    const [formSuccess, setFormSuccess] = useState<string | null>(null);

    // ----------------------
    // SIEVE UI STATE
    // ----------------------
    const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
    const [sort, setSort] = useState<SortOption>("-createdat");

    const [page, setPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(50);

    // ----------------------
    // LOAD DATA (WITH SIEVE)
    // ----------------------
    useEffect(() => {
        if (!CURRENT_USER_ID) return;

        void (async () => {
            try {
                setLoading(true);
                setLoadError(null);

                const filters = buildSieveFilters(typeFilter, statusFilter);

                const backendTx = await transactionClient.getByUser(
                    CURRENT_USER_ID,
                    filters,  // Filters
                    sort,     // Sorts
                    page,     // Page (1-based)
                    pageSize  // PageSize
                );

                setTransactions((backendTx ?? []).map(mapTransaction));
            } catch (err) {
                console.error(err);
                setLoadError("Failed to load transactions.");
            } finally {
                setLoading(false);
            }
        })();
    }, [CURRENT_USER_ID, typeFilter, statusFilter, sort, page, pageSize]);

    // ----------------------
    // COMPUTED
    // ----------------------
    const pendingDeposits = useMemo(
        () => transactions.filter(t => t.type === "Deposit" && t.status === "Pending"),
        [transactions]
    );

    // Without total count from backend, this is a simple heuristic:
    const hasNextPage = useMemo(
        () => transactions.length === pageSize,
        [transactions.length, pageSize]
    );

    // ----------------------
    // SUBMIT DEPOSIT
    // ----------------------
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
                amount,
                mobilePayRef: mobilePayInput.trim(),
            };

            await transactionClient.createDeposit(req);

            // refresh list (page 1)
            setPage(1);

            setAmountInput("");
            setMobilePayInput("");
            setFormSuccess("Deposit submitted!");
        } catch {
            setFormError("Failed to submit deposit.");
        }
    }

    // --------------------------------------
    // RENDER
    // --------------------------------------
    return (
        <div className="balance-page">
            <div className="balance-inner">
                <h1 className="balance-title">My balance</h1>

                {loadError && (
                    <p className="balance-status balance-status-error">{loadError}</p>
                )}

                <div className="balance-layout">
                    {/* LEFT SIDE */}
                    <div className="balance-left">
                        <section className="balance-card balance-summary-card">
                            <div className="balance-summary-label">Current balance</div>
                            <div className="balance-summary-amount">
                                {loading ? "…" : user?.balance ?? 0} <span>DKK</span>
                            </div>
                        </section>

                        <section className="balance-card balance-deposit-card">
                            <h2 className="balance-section-title">Deposit with MobilePay</h2>

                            <form className="balance-deposit-form" onSubmit={handleSubmitDeposit}>
                                <div className="balance-form-row">
                                    <label className="balance-form-label">
                                        Amount (DKK) <span className="req">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min={1}
                                        className="balance-input"
                                        value={amountInput}
                                        onChange={e => setAmountInput(e.target.value)}
                                        disabled={loading}
                                    />
                                </div>

                                <div className="balance-form-row">
                                    <label className="balance-form-label">
                                        MobilePay reference <span className="req">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="balance-input"
                                        value={mobilePayInput}
                                        onChange={e => setMobilePayInput(e.target.value)}
                                        disabled={loading}
                                    />
                                </div>

                                {formError && <p className="balance-form-error">{formError}</p>}
                                {formSuccess && <p className="balance-form-success">{formSuccess}</p>}

                                <button type="submit" className="balance-submit-btn" disabled={loading}>
                                    Submit deposit
                                </button>
                            </form>
                        </section>

                        {pendingDeposits.length > 0 && (
                            <section className="balance-card balance-pending-card">
                                <h3 className="balance-section-title">Pending deposits</h3>

                                <ul className="balance-pending-list">
                                    {pendingDeposits.map(tx => (
                                        <li key={tx.id} className="balance-pending-item">
                                            <div>
                                                <div>
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
                            <h2 className="balance-section-title">Transaction history</h2>

                            {/* FILTER/SORT CONTROLS */}
                            <div className="tx-toolbar">
                                {/* Row 1 */}
                                <div className="tx-row tx-row--top">
                                    <div className="tx-control">
                                        <label className="tx-label" htmlFor="tx-type">Type</label>
                                        <select
                                            id="tx-type"
                                            className="tx-select"
                                            value={typeFilter}
                                            onChange={(e) => {
                                                setPage(1);
                                                setTypeFilter(e.target.value as TypeFilter);
                                            }}
                                            disabled={loading}
                                        >
                                            {TYPE_OPTIONS.map((o) => (
                                                <option key={o} value={o}>
                                                    {o === "all" ? "All" : labelize(o)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="tx-control">
                                        <label className="tx-label" htmlFor="tx-status">Status</label>
                                        <select
                                            id="tx-status"
                                            className="tx-select"
                                            value={statusFilter}
                                            onChange={(e) => {
                                                setPage(1);
                                                setStatusFilter(e.target.value as StatusFilter);
                                            }}
                                            disabled={loading}
                                        >
                                            {STATUS_OPTIONS.map((o) => (
                                                <option key={o} value={o}>
                                                    {o === "all" ? "All" : labelize(o)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="tx-control">
                                        <label className="tx-label" htmlFor="tx-sort">Sort</label>
                                        <select
                                            id="tx-sort"
                                            className="tx-select"
                                            value={sort}
                                            onChange={(e) => {
                                                setPage(1);
                                                setSort(e.target.value as SortOption);
                                            }}
                                            disabled={loading}
                                        >
                                            {SORT_OPTIONS.map(o => (
                                                <option key={o.value} value={o.value}>
                                                    {o.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Row 2 */}
                                <div className="tx-row tx-row--bottom">
                                    <div className="tx-control">
                                        <label className="tx-label" htmlFor="tx-pagesize">Page size</label>
                                        <select
                                            id="tx-pagesize"
                                            className="tx-select"
                                            value={pageSize}
                                            onChange={(e) => {
                                                setPage(1);
                                                setPageSize(Number(e.target.value));
                                            }}
                                            disabled={loading}
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
                                            disabled={page <= 1 || loading}
                                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                                        >
                                            Prev
                                        </button>

                                        <span className="tx-page-indicator">Page {page}</span>

                                        <button
                                            type="button"
                                            className="tx-page-btn"
                                            disabled={!hasNextPage || loading}
                                            onClick={() => setPage((p) => p + 1)}
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            </div>

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
                                    {transactions.map((tx) => (
                                        <tr key={tx.id}>
                                            <td>{new Date(tx.date).toLocaleString()}</td>
                                            <td>{tx.type}</td>
                                            <td>{tx.description}</td>
                                            <td
                                                className={
                                                    tx.amountDkk < 0
                                                        ? "balance-amount-negative"
                                                        : "balance-amount-positive"
                                                }
                                            >
                                                {tx.amountDkk} DKK
                                            </td>
                                            <td>
                                            <span
                                                className={`balance-status-badge balance-status-badge--${tx.status.toLowerCase()}`}
                                            >
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
