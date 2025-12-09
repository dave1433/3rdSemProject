// File: useWinningNumbers.ts
import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../../api/connection";

export const useWinningNumbers = (year: number, weekNumber: number) => {
    const [selected, setSelected] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);
    const [locked, setLocked] = useState(false);

    useEffect(() => {
        const loadStatus = async () => {
            try {
                const res = await apiGet(`/api/admin/games/draw/status?year=${year}&weekNumber=${weekNumber}`);
                if (!res.ok) {
                    setLocked(false);
                    return;
                }
                const body = await res.json();
                if (typeof body === "boolean") {
                    setLocked(body);
                } else if (body && typeof body.locked === "boolean") {
                    setLocked(body.locked);
                } else {
                    setLocked(Boolean(body));
                }
            } catch {
                setLocked(false);
            }
        };
        void loadStatus();
    }, [year, weekNumber]);

    const toggleNumber = (n: number) => {
        if (locked) return;

        setSelected((prev) => {
            if (prev.includes(n)) return prev.filter((x) => x !== n);
            if (prev.length === 3) return prev;
            return [...prev, n];
        });
    };

    const submitDraw = async () => {
        if (selected.length !== 3) {
            alert("Select exactly 3 numbers");
            return;
        }
        

        setLoading(true);

        try {
            const res = await apiPost("/api/admin/games/draw", {
                year,
                weekNumber,
                winningNumbers: selected,
            });

            if (!res.ok) {
                const msg = await res.text();
                alert(msg || "Failed to save draw");
                return;
            }

            alert("Winning numbers saved");
            setLocked(true);
            setSelected([]);
        } finally {
            setLoading(false);
        }
    };

    const clearSelection = () => setSelected([]);

    const onToggle = toggleNumber;

    return {
        selected,
        loading,
        locked,
        toggleNumber,
        onToggle,
        submitDraw,
        clearSelection,
    };
};
