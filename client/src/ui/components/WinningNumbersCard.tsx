import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../../api/connection";

export const WinningNumbersCard = () => {
    const [selected, setSelected] = useState<number[]>([]);
    const [locked, setLocked] = useState(false);
    const [loading, setLoading] = useState(false);

    const now = new Date();
    const year = now.getFullYear();
    const week = getWeekNumber(now);

    useEffect(() => {
        async function loadStatus() {
            const res = await apiGet(`/api/admin/games/draw/status?year=${year}&weekNumber=${week}`);
            if (res.ok) setLocked(await res.json());
        }
        loadStatus();
    }, [year, week]);

    function toggle(n: number) {
        if (locked) return;
        setSelected(prev =>
            prev.includes(n) ? prev.filter(x => x !== n) : prev.length < 3 ? [...prev, n] : prev
        );
    }

    async function submit() {
        if (selected.length !== 3) {
            alert("Select exactly 3 numbers");
            return;
        }

        setLoading(true);

        const res = await apiPost("/api/admin/games/draw", {
            year,
            weekNumber: week,
            winningNumbers: selected,
        });

        setLoading(false);

        if (!res.ok) {
            alert("Failed to save draw");
            return;
        }

        setLocked(true);
        setSelected([]);
        alert("Winning numbers saved!");
    }

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6 w-full">
            <div className="flex justify-between mb-4">
                <span className="font-semibold">Winning Numbers – Week {week}</span>
                {locked && <span className="text-red-600">LOCKED</span>}
            </div>

            <div className="grid grid-cols-4 gap-3">
                {Array.from({ length: 16 }, (_, i) => i + 1).map(n => (
                    <button
                        key={n}
                        disabled={locked || loading}
                        onClick={() => toggle(n)}
                        className={`h-12 rounded-md ${
                            selected.includes(n) ? "bg-jerneRed text-white" : "bg-gray-100"
                        }`}
                    >
                        {n}
                    </button>
                ))}
            </div>

            <div className="mt-6 flex justify-end">
                <button
                    onClick={submit}
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
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((+d - +yearStart) / 86400000 + 1) / 7);
}
