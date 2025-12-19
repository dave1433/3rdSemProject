import { useCallback, useEffect, useState } from "react";
import { openapiAdapter } from "../../api/connection";
import { TransactionClient } from "../../generated-ts-client";

const transactionClient = openapiAdapter(TransactionClient);

export const usePendingTransactionsCount = () => {
    const [pendingCount, setPendingCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const reload = useCallback(async () => {
        try {
            setLoading(true);
            const pending = await transactionClient.getPending();
            setPendingCount(pending.length);
        } catch (e) {
            console.error("Failed to load pending transactions count", e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void reload();
    }, [reload]);

    return {
        pendingCount,
        hasPending: pendingCount > 0,
        reload,
        loading
    };
};
