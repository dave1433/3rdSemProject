import { useEffect, useState } from "react";
import { apiGet } from "../../api/connection";

interface AdminBoard {
    boardId: string;
    userName: string;
    numbers: number[];
    times: number;
    week: number;
    year: number;
}

export const AdminBoardsReport = () => {
    const [boards, setBoards] = useState<AdminBoard[]>([]);
    const [open, setOpen] = useState(false);

    async function loadBoards() {
        const res = await apiGet("/api/board/admin/all");
        const data = await res.json();
        setBoards(data);
    }

    return (
        <div>
            <button onClick={() => {
                setOpen(o => !o);
                if (!open) loadBoards();
            }}>
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
                    {boards.map(b => (
                        <tr key={b.boardId}>
                            <td>{b.userName}</td>
                            <td>{b.week}</td>
                            <td>{b.year}</td>
                            <td>{b.numbers.join(", ")}</td>
                            <td>{b.times}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};
