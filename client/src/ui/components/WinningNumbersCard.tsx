import { useEffect, useState } from "react";

export const WinningNumbersCard = () => {
    const [selected, setSelected] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);
    const [locked, setLocked] = useState(false);

    const now = new Date();
    const year = now.getFullYear();
    const weekNumber = getWeekNumber(now);

    // ----------------------------------
    // Check if current week is locked
    // ----------------------------------
    useEffect(() => {
        fetch(
            `http://localhost:5237/api/admin/games/draw/status?year=${year}&weekNumber=${weekNumber}`
        )
            .then(res => res.json())
            .then(setLocked)
            .catch(() => {});
    }, [year, weekNumber]);

    // ----------------------------------
    // Toggle number selection
    // ----------------------------------
    const toggleNumber = (n: number) => {
        if (locked) return;

        setSelected(prev => {
            if (prev.includes(n)) return prev.filter(x => x !== n);
            if (prev.length === 3) return prev;
            return [...prev, n];
        });
    };

    const clearSelection = () => {
        if (!locked) setSelected([]);
    };

    // ----------------------------------
    // Submit draw
    // ----------------------------------
    const submitDraw = async () => {
        if (selected.length !== 3) {
            alert("Select exactly 3 numbers");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(
                "http://localhost:5237/api/admin/games/draw",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        year,
                        weekNumber,
                        winningNumbers: selected
                    })
                }
            );

            if (!res.ok) {
                if (res.status === 409) {
                    alert("Winning numbers are already locked for this week");
                    setLocked(true);
                    return;
                }

                const text = await res.text();
                alert(text || "Failed to save winning numbers");
                return;
            }

            alert("Winning numbers saved");
            setLocked(true);
            setSelected([]);

        } catch {
            alert("Network error while saving winning numbers");
        } finally {
            setLoading(false);
        }
    };

    // ----------------------------------
    // Render
    // ----------------------------------
    return (
        <div className="bg-white rounded-2xl shadow-lg p-6 w-full">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
          <span className="text-jerneNavy font-semibold">
            Winning Numbers
          </span>
                    <span className="text-sm text-gray-500">
            Week {weekNumber} / {year}
          </span>
                </div>

                {locked && (
                    <span className="text-sm text-red-600 font-semibold">
            LOCKED
          </span>
                )}
            </div>

            {/* Number grid */}
            <div className="grid grid-cols-4 gap-3 mt-4">
                {Array.from({ length: 16 }, (_, i) => i + 1).map(n => {
                    const active = selected.includes(n);

                    return (
                        <button
                            key={n}
                            onClick={() => toggleNumber(n)}
                            disabled={locked || loading}
                            className={`h-12 rounded-md border text-sm font-medium
                ${
                                active
                                    ? "bg-jerneRed text-white border-jerneRed"
                                    : "bg-gray-100 border-gray-200 hover:bg-gray-200"
                            }
                ${locked ? "opacity-50 cursor-not-allowed" : ""}
              `}
                        >
                            {n}
                        </button>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                    {locked
                        ? "Draw is locked"
                        : `${selected.length}/3 selected`}
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={clearSelection}
                        disabled={loading || locked}
                        className="px-4 py-2 rounded-lg bg-white border border-gray-200 disabled:opacity-50"
                    >
                        Clear
                    </button>

                    <button
                        onClick={submitDraw}
                        disabled={loading || locked || selected.length !== 3}
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
    const d = new Date(Date.UTC(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
    ));

    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));

    return Math.ceil(
        (((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7
    );
}
