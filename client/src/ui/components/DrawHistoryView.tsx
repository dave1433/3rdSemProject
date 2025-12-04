import React from "react";
import type { DrawHistory } from "../../core/hooks/useDrawHistory";

type Props = {
    history: DrawHistory[];
    loading: boolean;
    error?: string | null;
    reload?: () => Promise<void> | void;
};

export const DrawHistoryView: React.FC<Props> = ({ history, loading, error, reload }) => {
    if (loading) {
        return <div className="text-sm text-gray-500">Loading history…</div>;
    }

    if (error) {
        return (
            <div className="text-sm text-red-600">
                {error}
                {reload && (
                    <div className="mt-2">
                        <button
                            onClick={() => void reload()}
                            className="text-sm text-blue-600 underline"
                        >
                            Retry
                        </button>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="font-semibold text-lg mb-4">Draw History</h2>

            {history.length === 0 ? (
                <div className="text-sm text-gray-500">No draws yet</div>
            ) : (
                <table className="w-full text-sm border-collapse">
                    <thead>
                    <tr className="border-b">
                        <th className="text-left py-2">Year</th>
                        <th className="text-left py-2">Week</th>
                        <th className="text-left py-2">Winning Numbers</th>
                        <th className="text-left py-2">Drawn At</th>
                    </tr>
                    </thead>

                    <tbody>
                    {history.map((row) => (
                        <tr key={row.id} className="border-b last:border-b-0">
                            <td className="py-2">{row.year}</td>
                            <td className="py-2">{row.weekNumber}</td>
                            <td className="py-2">
                                <div className="flex gap-2">
                                    {row.winningNumbers.map((n) => (
                                        <span
                                            key={n}
                                            className="w-8 h-8 flex items-center justify-center rounded bg-jerneRed text-white text-xs"
                                        >
                        {n}
                      </span>
                                    ))}
                                </div>
                            </td>
                            <td className="py-2 text-gray-500">
                                {new Date(row.createdAt).toLocaleString()}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};
