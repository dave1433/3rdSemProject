import { useState } from "react";

export const WinningNumbersCard = () => {
    const [selected, setSelected] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);

    const toggleNumber = (n: number) => {
        setSelected(prev => {
            if (prev.includes(n)) return prev.filter(x => x !== n);
            if (prev.length === 3) return prev;
            return [...prev, n];
        });
    };

    const clearSelection = () => setSelected([]);

    const submitDraw = async () => {
        if (selected.length !== 3) {
            alert("Select exactly 3 numbers");
            return;
        }

        setLoading(true);

        const now = new Date();

        try {
            await fetch("http://localhost:5237/api/admin/games/draw", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    year: now.getFullYear(),
                    weekNumber: getWeekNumber(now),
                    winningNumbers: selected
                })
            });

            clearSelection();
            alert("Winning numbers saved");
        } catch (err) {
            alert("Failed to save winning numbers");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6 w-full">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="text-jerneNavy font-semibold">Winning Numbers</span>
                    <span className="text-sm text-gray-500">
                        Select for current week
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    <button className="text-sm text-gray-600 hover:underline">
                        Collapse
                    </button>
                    <button className="px-3 py-1 rounded bg-jerneRed text-white text-sm">
                        Lock
                    </button>
                </div>
            </div>

            {/* Number grid */}
            <div className="grid grid-cols-4 gap-3 mt-4">
                {Array.from({ length: 16 }, (_, i) => i + 1).map(n => {
                    const active = selected.includes(n);

                    return (
                        <button
                            key={n}
                            onClick={() => toggleNumber(n)}
                            className={`h-12 rounded-md border text-sm font-medium
                                ${active
                                ? "bg-jerneRed text-white border-jerneRed"
                                : "bg-gray-100 border-gray-200 hover:bg-gray-200"
                            }`}
                        >
                            {n}
                        </button>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                    {selected.length}/3 selected (order not important)
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={clearSelection}
                        disabled={loading}
                        className="px-4 py-2 rounded-lg bg-white border border-gray-200"
                    >
                        Clear
                    </button>

                    <button
                        onClick={submitDraw}
                        disabled={loading || selected.length !== 3}
                        className="px-4 py-2 rounded-lg bg-jerneRed text-white disabled:opacity-50"
                    >
                        {loading ? "Saving…" : "Enter draw"}
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ISO week number */
function getWeekNumber(date: Date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}
