import { useEffect, useMemo, useState } from "react";
import { fetchPlayerHistory, toggleAutoRepeat } from "../history/historyService";
import type { PlayerRecord } from "../history/types";

export function usePlayerHistory(userId?: string) {
    const [records, setRecords] = useState<PlayerRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function load() {
        if (!userId) return;

        try {
            setLoading(true);
            setError(null);
            setRecords(await fetchPlayerHistory(userId));
        } catch {
            setError("Failed to load history.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void load();
    }, [userId]);

    const starterByRepeatId = useMemo(() => {
        const earliest = new Map<string, { id: string; time: number }>();

        for (const r of records) {
            if (!r.repeatId || !r.createdAt) continue;
            const t = new Date(r.createdAt).getTime();

            const existing = earliest.get(r.repeatId);
            if (!existing || t < existing.time) {
                earliest.set(r.repeatId, { id: r.id, time: t });
            }
        }

        return new Map(
            Array.from(earliest.entries()).map(([k, v]) => [k, v.id])
        );
    }, [records]);

    async function onToggleRepeat(
        record: PlayerRecord
    ) {
        if (record.repeatOptOut) return;

        const next = !record.autoRepeat;
        const ok = window.confirm(
            next
                ? "Start repeat for this ticket?\n\nThe system will auto-buy next draw."
                : "Stop repeat for this ticket?\n\nThis cannot be undone."
        );

        if (!ok) return;

        await toggleAutoRepeat(record.id, next);
        await load();
    }

    return {
        records,
        loading,
        error,
        starterByRepeatId,
        onToggleRepeat,
    };
}
