// src/ui/components/AdminBoardsView.tsx
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
    return (
        <div className="bg-white rounded-2xl shadow p-6 mt-6">
            {/* ✅ HEADER WITH BUTTON (THIS IS WHERE YOUR RED CIRCLE WAS) */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-lg">Purchased Boards</h2>

                <button
                    onClick={onToggle}
                    className={`
    px-4 py-2
    rounded-md
    text-sm font-medium
    text-white
    transition
    ${visible ? "bg-gray-500 hover:bg-gray-600" : "bg-jerneRed hover:bg-red-700"}
  `}
                >
                    {visible ? "Hide" : "Show"}
                </button>

            </div>

            {/* ✅ BODY */}
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
            ) : boards.length === 0 ? (
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
                    {boards.map((b) => (
                        <tr key={b.boardId} className="border-b last:border-0">
                            <td className="py-2 font-medium">
                                {b.userName}
                            </td>

                            <td className="py-2">
                                {b.week} / {b.year}
                            </td>

                            <td className="py-2">
                                <div className="flex gap-2 flex-wrap">
                                    {b.numbers.map((n) => (
                                        <span
                                            key={n}
                                            className="w-8 h-8 flex items-center justify-center rounded bg-jerneRed text-white text-xs"
                                        >
                                                {n}
                                            </span>
                                    ))}
                                </div>
                            </td>

                            <td className="py-2 text-right">{b.times}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};
