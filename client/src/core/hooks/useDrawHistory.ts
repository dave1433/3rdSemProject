// File: useDrawHistory.ts
import { useEffect, useState } from "react";
import { apiGet } from "../../api/connection";

export type DrawHistory = {
    id: string;
    year: number;
    weekNumber: number;
    winningNumbers: number[];
    createdAt: string;
};

export const useDrawHistory = (authorized: boolean) => {
    const [history, setHistory] = useState<DrawHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadHistory = async () => {
        if (!authorized) return; // ⛔ DO NOT FETCH YET

        try {
            setLoading(true);
            setError(null);

            const res = await apiGet("/api/admin/games/draw/history");

            if (!res.ok) {
                throw new Error("Failed to load draw history");
            }

            const data = await res.json();
            setHistory(data);
        } catch (err) {
            console.error(err);
            setError("Unable to load draw history");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadHistory();
    }, [authorized]);

    return { history, loading, error, reload: loadHistory };
};
