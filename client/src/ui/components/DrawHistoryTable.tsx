import { useEffect, useState } from "react";

type DrawHistory = {
    id: string;
    year: number;
    weekNumber: number;
    winningNumbers: number[];
    createdAt: string;
};

export const DrawHistoryTable = () => {
    const [history, setHistory] = useState<DrawHistory[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("http://localhost:5237/api/admin/games/draw/history")
            .then(res => res.json())
            .then(setHistory)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <div className="text-sm text-gray-500">Loading history…</div>;
    }

    return (
        <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="font-semibold text-lg mb-4">
                Draw History
            </h2>

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
                {history.map(row => (
                    <tr key={row.id} className="border-b last:border-b-0">
                        <td className="py-2">{row.year}</td>
                        <td className="py-2">{row.weekNumber}</td>
                        <td className="py-2">
                            <div className="flex gap-2">
                                {row.winningNumbers.map(n => (
                                    <span
                                        key={n}
                                        className="w-8 h-8 flex items-center justify-center
                                 rounded bg-jerneRed text-white text-xs"
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

            {history.length === 0 && (
                <div className="text-sm text-gray-500">
                    No draws yet
                </div>
            )}
        </div>
    );
};
