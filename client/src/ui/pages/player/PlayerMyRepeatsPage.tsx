import React, { useEffect, useMemo, useState } from "react";
import "../../css/PlayerMyRepeatsPage.css";
import { apiPost } from "../../../api/connection";

interface PlayerMyRepeatsPageProps {
    initialNumbers?: number[];
}

export const PlayerMyRepeatsPage: React.FC<PlayerMyRepeatsPageProps> = ({
                                                                            initialNumbers,
                                                                        }) => {

    const playerId = localStorage.getItem("userId") ?? "";

    const [numbers, setNumbers] = useState<number[]>(initialNumbers ?? []);

    useEffect(() => {
        if (initialNumbers && initialNumbers.length > 0) {
            setNumbers(initialNumbers);
        }
    }, [initialNumbers]);

    const fields = numbers.length;
    const [times, setTimes] = useState<number>(1);

    const todayLabel = useMemo(() => formatFullDate(new Date()), []);
    const pricePerGame = useMemo(() => fields * 20, [fields]);

    const totalAmount = useMemo(
        () => (fields > 0 ? pricePerGame * times : 0),
        [pricePerGame, fields, times]
    );

    function handleTimesInput(e: React.ChangeEvent<HTMLInputElement>) {
        const value = Number(e.target.value);
        setTimes(value > 0 ? value : 1);
    }

    function changeTimes(delta: number) {
        setTimes((prev) => Math.max(1, prev + delta));
    }

    function handleCancel() {
        setTimes(1);
    }

    async function handleConfirm() {
        if (!canConfirm) return;

        try {
            const body = [
                {
                    playerId,
                    numbers,
                    times,
                }
            ];

            const res = await apiPost("/board/purchase", body);

            if (!res.ok) {
                const msg = await res.text();
                alert(msg || "Failed to repeat board");
                return;
            }

            alert("Repeat added successfully!");

            // reset only times (user may repeat again)
            setTimes(1);

            // optional event if other pages need to refresh
            window.dispatchEvent(new Event("player-updated"));
        } catch (err) {
            console.error("Repeat failed:", err);
            alert("Error repeating game");
        }
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

            {/* Date */}
            <div className="myrepeats-row">
                <div className="myrepeats-label">Date</div>
                <div className="myrepeats-date-display">
                    <span className="myrepeats-week-text-main">{todayLabel}</span>
                </div>
            </div>

            {/* Times */}
            <div className="myrepeats-row">
                <div className="myrepeats-label">Times</div>
                <div className="myrepeats-input-wrapper">
                    <div className="myrepeats-times-control">
                        <button type="button" onClick={() => changeTimes(-1)}>
                            −
                        </button>
                        <input
                            type="number"
                            min={1}
                            value={times}
                            onChange={handleTimesInput}
                        />
                        <button type="button" onClick={() => changeTimes(1)}>
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

            {/* Actions */}
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
    return date.toLocaleDateString(undefined, {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}
