import React, { useEffect, useMemo, useState } from "react";
import "../../css/PlayerMyRepeatsPage.css";

interface PlayerMyRepeatsPageProps {
    initialNumbers?: number[];
}

export const PlayerMyRepeatsPage: React.FC<PlayerMyRepeatsPageProps> = ({
                                                                            initialNumbers,
                                                                        }) => {
    const [numbers, setNumbers] = useState<number[]>(initialNumbers ?? []);

    // update numbers when History "Reorder" changes the selection
    useEffect(() => {
        if (initialNumbers && initialNumbers.length > 0) {
            setNumbers(initialNumbers);
        }
    }, [initialNumbers]);

    const fields = numbers.length;

    const [times, setTimes] = useState<number>(1); // default 1

    // current real date (fixed when component mounts)
    const todayLabel = useMemo(() => formatFullDate(new Date()), []);

    const pricePerGame = useMemo(() => fields * 20, [fields]);

    // now total is just fields * times * 20 (no weeks anymore)
    const totalAmount = useMemo(
        () => (fields > 0 && times > 0 ? pricePerGame * times : 0),
        [pricePerGame, fields, times]
    );

    function handleTimesInput(e: React.ChangeEvent<HTMLInputElement>) {
        const value = Number(e.target.value);
        if (Number.isNaN(value) || value < 1) {
            setTimes(1);
        } else {
            setTimes(value);
        }
    }

    function changeTimes(delta: number) {
        setTimes((prev) => {
            const next = prev + delta;
            return next < 1 ? 1 : next;
        });
    }

    function handleCancel() {
        setTimes(1);
    }

    function handleConfirm() {
        if (!canConfirm) return;

        // TODO: call backend to create repeat with current date + times
        console.log("Confirm repeat", {
            numbers,
            fields,
            times,
            date: todayLabel,
            totalAmount,
        });
    }

    const canConfirm = fields > 0 && times > 0;

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

            {/* Date – current real date */}
            <div className="myrepeats-row">
                <div className="myrepeats-label">Date</div>
                <div className="myrepeats-date-display">
                    <span className="myrepeats-week-text-main">{todayLabel}</span>
                </div>
            </div>

            {/* Times – same style as PlayerBoardPage */}
            <div className="myrepeats-row">
                <div className="myrepeats-label">Times</div>
                <div className="myrepeats-input-wrapper">
                    <div className="myrepeats-times-control">
                        <button
                            type="button"
                            onClick={() => changeTimes(-1)}
                        >
                            −
                        </button>
                        <input
                            type="number"
                            min={1}
                            value={times}
                            onChange={handleTimesInput}
                        />
                        <button
                            type="button"
                            onClick={() => changeTimes(1)}
                        >
                            +
                        </button>
                    </div>
                </div>
            </div>

            {/* Preview */}
            <div className="myrepeats-preview">
                <div>
                    <div className="myrepeats-preview-label">Price per game</div>
                    <div className="myrepeats-preview-value">{pricePerGame} DKK</div>
                </div>
                <div>
                    <div className="myrepeats-preview-label">Total amount</div>
                    <div className="myrepeats-preview-value">{totalAmount} DKK</div>
                </div>
            </div>

            {/* Actions – right aligned, red + green */}
            <div className="myrepeats-actions">
                <button
                    type="button"
                    className="myrepeats-btn myrepeats-btn-cancel"
                    onClick={handleCancel}
                >
                    Cancel
                </button>
                <button
                    type="button"
                    className="myrepeats-btn myrepeats-btn-confirm"
                    onClick={handleConfirm}
                    disabled={!canConfirm}
                >
                    Confirm
                </button>
            </div>
        </div>
    );
};

/* ---------- helpers ---------- */
function formatFullDate(date: Date): string {
    // show "Mon, 19-Jun-2023"
    return date.toLocaleDateString(undefined, {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}