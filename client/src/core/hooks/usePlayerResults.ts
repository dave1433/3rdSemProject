import { useEffect, useMemo, useState } from "react";
import { fetchPlayerResults } from "../results/resultService";
import type { ResultRow } from "../results/types";

export function usePlayerResults() {
    const [results, setResults] = useState<ResultRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                setError(null);
                setResults(await fetchPlayerResults());
            } catch {
                setError("Failed to load results.");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const hasRows = useMemo(
        () => results.length > 0,
        [results]
    );

    return {
        results,
        loading,
        error,
        hasRows,
    };
}
