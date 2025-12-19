import { useEffect, useMemo, useState } from "react";
import {
    fetchUserTransactions,
    buildSieveFilters,
    createDeposit,
} from "../transactions/transactionService";
import type {
    BalanceTransaction,
    TypeFilter,
    StatusFilter,
    SortOption,
} from "../transactions/types";

export function usePlayerTransactions(userId?: string) {
    const [transactions, setTransactions] =
        useState<BalanceTransaction[]>([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
    const [sort, setSort] = useState<SortOption>("-createdat");

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(50);

    const [amountInput, setAmountInput] = useState("");
    const [mobilePayInput, setMobilePayInput] = useState("");
    const [formError, setFormError] = useState<string | null>(null);
    const [formSuccess, setFormSuccess] = useState<string | null>(null);

    useEffect(() => {
        if (!userId) return;

        (async () => {
            try {
                setLoading(true);
                setError(null);

                const filters = buildSieveFilters(
                    typeFilter,
                    statusFilter
                );

                setTransactions(
                    await fetchUserTransactions(
                        userId,
                        filters,
                        sort,
                        page,
                        pageSize
                    )
                );
            } catch {
                setError("Failed to load transactions.");
            } finally {
                setLoading(false);
            }
        })();
    }, [userId, typeFilter, statusFilter, sort, page, pageSize]);
    async function loadTransactions() {
        if (!userId) return;

        try {
            setLoading(true);
            setError(null);

            const filters = buildSieveFilters(
                typeFilter,
                statusFilter
            );

            const data = await fetchUserTransactions(
                userId,
                filters,
                sort,
                page,
                pageSize
            );

            setTransactions(data);
        } catch {
            setError("Failed to load transactions.");
        } finally {
            setLoading(false);
        }
    }

    const pendingDeposits = useMemo(
        () =>
            transactions.filter(
                t => t.type === "Deposit" && t.status === "Pending"
            ),
        [transactions]
    );

    const hasNextPage = transactions.length === pageSize;

    async function submitDeposit() {
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
            await createDeposit({
                userId: userId!,
                amount,
                mobilePayRef: mobilePayInput.trim(),
            });

            setPage(1);
            await loadTransactions();
            setAmountInput("");
            setMobilePayInput("");
            setFormSuccess("Deposit submitted!");
        } catch {
            setFormError("Failed to submit deposit.");
        }
    }

    return {
        transactions,
        pendingDeposits,

        loading,
        error,
        formError,
        formSuccess,

        typeFilter,
        statusFilter,
        sort,
        page,
        pageSize,
        hasNextPage,

        amountInput,
        mobilePayInput,

        setTypeFilter,
        setStatusFilter,
        setSort,
        setPage,
        setPageSize,
        setAmountInput,
        setMobilePayInput,

        submitDeposit,
    };
}
