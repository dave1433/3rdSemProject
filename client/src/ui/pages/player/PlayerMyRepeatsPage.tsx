import React, { useEffect, useMemo, useState } from "react";
import "../../css/PlayerMyRepeatsPage.css";

interface Props {
    initialNumbers?: number[];
}

export const PlayerMyRepeatsPage: React.FC<Props> = ({ initialNumbers }) => {
    const [numbers, setNumbers] = useState<number[]>(initialNumbers ?? []);
    const [times, setTimes] = useState(1);

    // When user selects a board from history
    useEffect(() => {
        if (initialNumbers && initialNumbers.length > 0) {
            setNumbers(initialNumbers);
            setTimes(1);
        }
    }, [initialNumbers]);

    const fields = numbers.length;

    const todayLabel = useMemo(() => {
        return new Date().toLocaleDateString(undefined, {
            weekday: "short",
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    }, []);

    const pricePerGame = fields * 20; // matches your board pricing
    const totalAmount = pricePerGame * times;

    const canConfirm = fields > 0 && times > 0;

    // --------------------------------------------
    //   FUTURE BACKEND ENDPOINT HERE
    // --------------------------------------------
    async function handleConfirmRepeat() {
        if (!canConfirm) return;

        console.log("TODO: Send repeat order to backend", {
            numbers,
            times,
            pricePerGame,
            totalAmount,
        });

        // Example when backend exists:
        //
        // await boardClient.repeat({
        //     userId: CURRENT_USER_ID,
        //     numbers,
        //     times,
        // });
    }

    return (
        <div className="myrepeats-card">
            <h2 className="myrepeats-title">My repeats</h2>

            {/* Numbers */}
            <div className="myrepeats-row">
                <div className="myrepeats-label">Numbers</div>
                <div className="myrepeats-numbers">
                    {numbers.length === 0 ? (
                        <span className="myrepeats-empty-text">
                            Select a board from history to start.
                        </span>
                    ) : (
                        numbers.map((n) => (
                            <span key={n} className="myrepeats-number-pill">
                                {n}
                            </span>
                        ))
                    )}
                </div>
            </div>

            {/* Fields */}
            <div className="myrepeats-row">
                <div className="myrepeats-label">Fields</div>
                <div className="myrepeats-value">{fields}</div>
            </div>

            {/* Date */}
            <div className="myrepeats-row">
                <div className="myrepeats-label">Date</div>
                <div className="myrepeats-value">{todayLabel}</div>
            </div>

            {/* Times Input */}
            <div className="myrepeats-row">
                <div className="myrepeats-label">Times</div>
                <div className="myrepeats-times-control">
                    <button onClick={() => setTimes((t) => Math.max(1, t - 1))}>
                        −
                    </button>

                    <input
                        type="number"
                        min={1}
                        value={times}
                        onChange={(e) =>
                            setTimes(Math.max(1, Number(e.target.value)))
                        }
                    />

                    <button onClick={() => setTimes((t) => t + 1)}>+</button>
                </div>
            </div>

            {/* Price Preview */}
            <div className="myrepeats-preview">
                <div>
                    <div className="myrepeats-preview-label">Price per game</div>
                    <div className="myrepeats-preview-value">
                        {pricePerGame} DKK
                    </div>
                </div>

                <div>
                    <div className="myrepeats-preview-label">Total amount</div>
                    <div className="myrepeats-preview-value">
                        {totalAmount} DKK
                    </div>
                </div>
            </div>

            {/* Buttons */}
            <div className="myrepeats-actions">
                <button
                    className="myrepeats-btn myrepeats-btn-cancel"
                    onClick={() => setTimes(1)}
                >
                    Cancel
                </button>

                <button
                    className="myrepeats-btn myrepeats-btn-confirm"
                    disabled={!canConfirm}
                    onClick={handleConfirmRepeat}
                >
                    Confirm
                </button>
            </div>
        </div>
    );
};
