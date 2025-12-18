import { useEffect, useMemo, useState } from "react";
import { fetchPlayerHistory, toggleAutoRepeat } from "../history/historyService";
import type { PlayerRecord } from "../history/types";

export function usePlayerHistory(userId?: string) {
    const [records, setRecords] = useState<PlayerRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // --------------------------------------------------
    // LOAD HISTORY
    // --------------------------------------------------
    async function load() {
        if (!userId) return;

        try {
            setLoading(true);
            setError(null);

            const raw = await fetchPlayerHistory(userId);

            // IMPORTANT:
            // We reset autoRepeat here and derive it ourselves
            setRecords(
                (raw ?? []).map(r => ({
                    ...r,
                    autoRepeat: false,
                }))
            );
        } catch (e) {
            console.error(e);
            setError("Failed to load history.");
            setRecords([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void load();
    }, [userId]);

    // --------------------------------------------------
    // FIND STARTER PER REPEAT GROUP
    // --------------------------------------------------
    const starterByRepeatId = useMemo(() => {
        const earliest = new Map<string, { id: string; time: number }>();

        for (const r of records) {
            if (!r.repeatId || !r.createdAt) continue;

            const time = new Date(r.createdAt).getTime();
            const existing = earliest.get(r.repeatId);

            if (!existing || time < existing.time) {
                earliest.set(r.repeatId, { id: r.id, time });
            }
        }

        return new Map(
            Array.from(earliest.entries()).map(([k, v]) => [k, v.id])
        );
    }, [records]);

    // --------------------------------------------------
    // DERIVE autoRepeat (ONLY FOR STARTER)
    // --------------------------------------------------
    const recordsWithDerivedRepeat = useMemo(() => {
        return records.map(r => {
            if (!r.repeatId) return r;

            const starterId = starterByRepeatId.get(r.repeatId);

            return {
                ...r,
                autoRepeat: starterId === r.id && !r.repeatOptOut,
            };
        });
    }, [records, starterByRepeatId]);

    // --------------------------------------------------
    // TOGGLE HANDLER
    // --------------------------------------------------
    async function onToggleRepeat(record: PlayerRecord) {
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
        records: recordsWithDerivedRepeat,
        loading,
        error,
        starterByRepeatId,
        onToggleRepeat,
    };
}
