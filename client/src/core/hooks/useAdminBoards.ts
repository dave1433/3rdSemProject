import { useEffect, useState } from "react";
import { apiGet } from "../../api/connection";

export interface AdminBoard {
    boardId: string;
    userName: string;
    year: number;
    week: number;
    numbers: number[];
    times: number;
    createdAt: string;
    isWinner: boolean;

    // ⭐ REQUIRED FOR GREEN NUMBER HIGHLIGHT
    winningNumbers: number[];
}

export function useAdminBoards() {
    const [boards, setBoards] = useState<AdminBoard[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    async function load() {
        try {
            setLoading(true);
            setError(null);

            const res = await apiGet("/api/board/admin/all");
            if (!res.ok) {
                throw new Error("Failed to load purchased boards");
            }

            const data = await res.json();
            setBoards(data);
        } catch (e: any) {
            setError(e.message ?? "Unknown error");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void load();
    }, []);

    return { boards, loading, error, reload: load };
}
