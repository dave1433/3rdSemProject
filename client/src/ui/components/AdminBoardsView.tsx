import React from "react";
import type { AdminBoard } from "../../core/hooks/useAdminBoards";

type Props = {
    boards: AdminBoard[];
    loading: boolean;
    error?: string | null;
    reload?: () => void;
    visible: boolean;
    onToggle: () => void;
};

export const AdminBoardsView: React.FC<Props> = ({
                                                     boards,
                                                     loading,
                                                     error,
                                                     reload,
                                                     visible,
                                                     onToggle,
                                                 }) => {
    const [selectedWeek, setSelectedWeek] = React.useState<string>("all");

    const weekOptions = React.useMemo(() => {
        const map = new Map<string, { week: number; year: number }>();

        boards.forEach((b) => {
            const key = `${b.year}-${b.week}`;
            if (!map.has(key)) {
                map.set(key, { year: b.year, week: b.week });
            }
        });

        return Array.from(map.values()).sort((a, b) =>
            b.year !== a.year ? b.year - a.year : b.week - a.week
        );
    }, [boards]);

    const filteredBoards =
        selectedWeek === "all"
            ? boards
            : boards.filter(
                (b) => `${b.year}-${b.week}` === selectedWeek
            );

    const winningCount = filteredBoards.filter(b => b.isWinner).length;

    return (
        <div className="bg-white rounded-2xl shadow p-6 mt-6">
            {/* HEADER */}
            <div className="flex items-center justify-between mb-4 gap-4">
                <h2 className="font-semibold text-lg">Purchased Boards</h2>

                <div className="flex items-center gap-3">
                    <select
                        value={selectedWeek}
                        onChange={(e) => setSelectedWeek(e.target.value)}
                        className="
                            border rounded-md px-3 py-2 text-sm bg-white
                            focus:outline-none focus:ring-2 focus:ring-jerneRed
                        "
                    >
                        <option value="all">All weeks</option>
                        {weekOptions.map((w) => (
                            <option
                                key={`${w.year}-${w.week}`}
                                value={`${w.year}-${w.week}`}
                            >
                                Week {w.week} / {w.year}
                            </option>
                        ))}
                    </select>

                    <button
                        onClick={onToggle}
                        className={`
                            px-4 py-2 rounded-md text-sm font-medium text-white transition
                            ${
                            visible
                                ? "bg-gray-500 hover:bg-gray-600"
                                : "bg-jerneRed hover:bg-red-700"
                        }
                        `}
                    >
                        {visible ? "Hide" : "Show"}
                    </button>
                </div>
            </div>

            {/* ✅ WINNING SUMMARY */}
            {visible && selectedWeek !== "all" && (
                <div className="mb-4 text-sm font-semibold text-green-700">
                    Winning boards this week: {winningCount}
                </div>
            )}

            {/* BODY */}
            {!visible ? null : loading ? (
                <div className="text-sm text-gray-500">
                    Loading purchased boards…
                </div>
            ) : error ? (
                <div className="text-sm text-red-600">
                    {error}
                    {reload && (
                        <div className="mt-2">
                            <button
                                onClick={reload}
                                className="text-sm underline"
                            >
                                Retry
                            </button>
                        </div>
                    )}
                </div>
            ) : filteredBoards.length === 0 ? (
                <div className="text-sm text-gray-500">
                    No purchased boards
                </div>
            ) : (
                <table className="w-full text-sm border-collapse">
                    <thead>
                    <tr className="border-b">
                        <th className="text-left py-2">User</th>
                        <th className="text-left py-2">Week / Year</th>
                        <th className="text-left py-2">Numbers</th>
                        <th className="text-right py-2">Times</th>
                    </tr>
                    </thead>

                    <tbody>
                    {filteredBoards.map((b) => (
                        <tr
                            key={b.boardId}
                            className="border-b last:border-0"
                        >
                            <td className="py-2 font-medium">
                                {b.userName}
                                {b.isWinner && (
                                    <span className="ml-2 px-2 py-0.5 text-xs rounded bg-green-100 text-green-700">
                                            WINNER
                                        </span>
                                )}
                            </td>

                            <td className="py-2">
                                {b.week} / {b.year}
                            </td>

                            <td className="py-2">
                                <div className="flex gap-2 flex-wrap">
                                    {b.numbers.map((n) => (
                                        <span
                                            key={n}
                                            className={`
                                                    w-8 h-8 flex items-center justify-center
                                                    rounded text-xs font-semibold text-white
                                                    ${
                                                b.isWinner
                                                    ? "bg-green-600"
                                                    : "bg-jerneRed"
                                            }
                                                `}
                                        >
                                                {n}
                                            </span>
                                    ))}
                                </div>
                            </td>

                            <td className="py-2 text-right">
                                {b.times}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};
