import { useEffect, useState } from "react";
import {
    approveTransaction,
    fetchPendingTransactions,
    rejectTransaction,
} from "../transactions/transactionService";
import type { PendingTransactionRow } from "../transactions/types";

export function usePendingTransactions(
    onStatusChange?: () => void
) {
    const [rows, setRows] = useState<PendingTransactionRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function load(): Promise<void> {
        try {
            setLoading(true);
            setError(null);
            setRows(await fetchPendingTransactions());
        } catch {
            setError("Failed to load pending transactions.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void load();
    }, []);

    async function approve(id: string): Promise<void> {
        await approveTransaction(id);
        await load();
        onStatusChange?.();
    }

    async function reject(id: string): Promise<void> {
        await rejectTransaction(id);
        await load();
        onStatusChange?.();
    }

    return {
        rows,
        loading,
        error,
        approve,
        reject,
    };
}