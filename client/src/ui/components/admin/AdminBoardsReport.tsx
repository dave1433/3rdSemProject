import { useState } from "react";
import { apiGet } from "../../../api/connection.ts";

interface AdminBoard {
    boardId: string;
    userName: string;
    numbers: number[];
    times: number;
    week: number;
    year: number;
}

interface DrawHistory {
    id: string;
    year: number;
    weekNumber: number;
    winningNumbers: number[];
}

export const AdminBoardsReport = () => {
    const [boards, setBoards] = useState<AdminBoard[]>([]);
    const [drawHistory, setDrawHistory] = useState<DrawHistory[]>([]);
    const [open, setOpen] = useState(false);
    const [loaded, setLoaded] = useState(false);

    /* ---------------------------------
       Load boards + draw history once
    --------------------------------- */
    async function loadData() {
        const [boardsRes, drawsRes] = await Promise.all([
            apiGet("/api/board/admin/all"),
            apiGet("/api/admin/games/draw/history"),
        ]);

        const boardsData = await boardsRes.json();
        const drawsData = await drawsRes.json();

        setBoards(boardsData);
        setDrawHistory(drawsData);
        setLoaded(true);
    }

    /* ---------------------------------
       Build draw lookup map (year-week)
    --------------------------------- */
    const drawMap = new Map<string, number[]>(
        drawHistory.map(d => [
            `${d.year}-${d.weekNumber}`,
            d.winningNumbers,
        ])
    );

    return (
        <div>
            <button
                onClick={() => {
                    setOpen(o => !o);
                    if (!loaded) {
                        void loadData();
                    }
                }}
            >
                {open ? "Hide Boards" : "Show Purchased Boards"}
            </button>

            {open && (
                <table>
                    <thead>
                    <tr>
                        <th>User</th>
                        <th>Week</th>
                        <th>Year</th>
                        <th>Numbers</th>
                        <th>Times</th>
                    </tr>
                    </thead>

                    <tbody>
                    {boards.map(b => {
                        const winningNumbers =
                            drawMap.get(`${b.year}-${b.week}`) ?? [];

                        return (
                            <tr key={b.boardId}>
                                <td>{b.userName}</td>
                                <td>{b.week}</td>
                                <td>{b.year}</td>

                                <td>
                                    {b.numbers.map(n => {
                                        const isHit =
                                            winningNumbers.includes(n);

                                        return (
                                            <span
                                                key={n}
                                                style={{
                                                    display: "inline-block",
                                                    width: 28,
                                                    height: 28,
                                                    lineHeight: "28px",
                                                    marginRight: 6,
                                                    textAlign: "center",
                                                    borderRadius: 4,
                                                    backgroundColor: isHit
                                                        ? "#16a34a" // green
                                                        : "#b91c1c", // red
                                                    color: "white",
                                                    fontSize: 12,
                                                    fontWeight: 600,
                                                }}
                                            >
                                                    {n}
                                                </span>
                                        );
                                    })}
                                </td>

                                <td>{b.times}</td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            )}
        </div>
    );
};
