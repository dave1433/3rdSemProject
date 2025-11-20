import "./PlayerBoardPage.css"; // your CSS file
import { useState } from "react";

export default function PlayerBoardPage() {
    const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);

    const toggleNumber = (num: number) => {
        setSelectedNumbers(prev =>
            prev.includes(num)
                ? prev.filter(n => n !== num)
                : [...prev, num]
        );
    };

    return (
        <div className="board-page">
            <div className="board-page_logo-header">
                <div className="board-page_logo">Dead Pigeons</div>
            </div>

            <div className="board-page_header">
                <div></div>

                <div className="board-page_tabs-wrapper">
                    <div className="tabs">
                        <button className="tabs_item tabs_item-active">Board</button>
                        <button className="tabs_item">Repeats</button>
                    </div>
                </div>

                <div className="board-page_user">
                    <div className="board-page_username">User</div>
                </div>
            </div>

            {/* Number grid */}
            <div className="board-page_content">
                <div className="number-grid">
                    {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
                        <button
                            key={num}
                            className={`number-tile ${
                                selectedNumbers.includes(num) ? "number-tile-selected" : ""
                            }`}
                            onClick={() => toggleNumber(num)}
                        >
                            {num}
                        </button>
                    ))}
                </div>

                <button className="board-page_next" disabled={selectedNumbers.length === 0}>
                    Continue
                </button>
            </div>
        </div>
    );
}
