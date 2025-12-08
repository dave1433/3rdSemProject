import { useEffect, useState } from "react";
import { apiGet } from "../../api/connection";

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
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            try {
                setLoading(true);
                setError(null);

                // FIXED: correct backend path
                const res = await apiGet("/api/admin/games/draw/history");

                if (!res.ok) throw new Error("Failed to load draw history");

                setHistory(await res.json());
            } catch (err) {
                console.error(err);
                setError("Unable to load draw history");
            } finally {
                setLoading(false);
            }
        }

        load();
    }, []);

    if (loading) return <div className="text-sm text-gray-500">Loading history…</div>;
    if (error) return <div className="text-sm text-red-600">{error}</div>;

    return (
        <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="font-semibold text-lg mb-4">Draw History</h2>

            {history.length === 0 ? (
                <div className="text-sm text-gray-500">No draws yet</div>
            ) : (
                <table className="w-full text-sm border-collapse">
                    <thead>
                    <tr className="border-b">
                        <th>Year</th>
                        <th>Week</th>
                        <th>Winning Numbers</th>
                        <th>Drawn At</th>
                    </tr>
                    </thead>

                    <tbody>
                    {history.map(row => (
                        <tr key={row.id} className="border-b">
                            <td>{row.year}</td>
                            <td>{row.weekNumber}</td>
                            <td>
                                <div className="flex gap-2">
                                    {row.winningNumbers.map(n => (
                                        <span key={n} className="w-8 h-8 flex items-center justify-center rounded bg-jerneRed text-white text-xs">
                                                {n}
                                            </span>
                                    ))}
                                </div>
                            </td>
                            <td className="text-gray-500">
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
