import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../../api/connection";

export const WinningNumbersCard = () => {
    const [selected, setSelected] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);
    const [locked, setLocked] = useState(false);

    const now = new Date();
    const year = now.getFullYear();
    const weekNumber = getWeekNumber(now);

    // 🔒 check lock status
    useEffect(() => {
        apiGet(`/admin/games/draw/status?year=${year}&weekNumber=${weekNumber}`)
            .then(res => res.json())
            .then(setLocked)
            .catch(() => {});
    }, [year, weekNumber]);

    const toggleNumber = (n: number) => {
        if (locked) return;

        setSelected(prev => {
            if (prev.includes(n)) return prev.filter(x => x !== n);
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
            const res = await apiPost("/admin/games/draw", {
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

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6 w-full">
            <div className="flex justify-between mb-4">
                <span className="font-semibold">
                    Winning Numbers – Week {weekNumber}
                </span>
                {locked && <span className="text-red-600">LOCKED</span>}
            </div>

            <div className="grid grid-cols-4 gap-3">
                {Array.from({ length: 16 }, (_, i) => i + 1).map(n => (
                    <button
                        key={n}
                        disabled={locked || loading}
                        onClick={() => toggleNumber(n)}
                        className={`h-12 rounded-md border ${
                            selected.includes(n)
                                ? "bg-jerneRed text-white"
                                : "bg-gray-100"
                        }`}
                    >
                        {n}
                    </button>
                ))}
            </div>

            <div className="mt-6 flex justify-end">
                <button
                    onClick={submitDraw}
                    disabled={locked || loading || selected.length !== 3}
                    className="px-4 py-2 bg-jerneRed text-white rounded-lg"
                >
                    {loading ? "Saving…" : "Enter draw"}
                </button>
            </div>
        </div>
    );
};

function getWeekNumber(date: Date) {
    const d = new Date(Date.UTC(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
    ));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((+d - +yearStart) / 86400000 + 1) / 7);
}
