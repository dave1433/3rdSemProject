
interface Props {
    year: number;
    weekNumber: number;
    selected: number[];
    locked: boolean;
    loading: boolean;
    toggleNumber: (n: number) => void;
    clearSelection: () => void;
    submitDraw: () => void;
}

export const WinningNumbersCardView = ({year, weekNumber, selected, locked, loading, toggleNumber, clearSelection, submitDraw,}: Props) => {
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
