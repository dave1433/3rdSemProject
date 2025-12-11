import React, { useEffect, useMemo, useState } from "react";
import "../../css/PlayerMyRepeatsPage.css";
import { openapiAdapter } from "../../../api/connection";

// Types from NSwag client
import type {
    BoardPriceDtoResponse,
    RepeatDtoResponse,
    CreateRepeatRequest,
} from "../../../generated-ts-client";

import {
    BoardPriceClient,
    RepeatClient,
} from "../../../generated-ts-client";

const boardPriceClient = openapiAdapter(BoardPriceClient);
const repeatClient = openapiAdapter(RepeatClient);

interface Props {
    numbers: number[];
    onClose: () => void;
    // let parent refresh history / repeats
    onCreated?: (repeat: RepeatDtoResponse) => void;
}

export const CreateRepeatForm: React.FC<Props> = ({
                                                      numbers,
                                                      onClose,
                                                      onCreated,
                                                  }) => {
    const [times, setTimes] = useState<number>(1);
    const [weeks, setWeeks] = useState<number>(1);

    const [priceTable, setPriceTable] = useState<
        Record<number, number> | undefined
    >(undefined);

    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load price table from backend (BoardPrice)
    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                setLoading(true);
                const prices: BoardPriceDtoResponse[] =
                    await boardPriceClient.getAll();

                if (cancelled) return;

                const map: Record<number, number> = {};
                (prices ?? []).forEach((p) => {
                    map[p.fieldsCount] = p.price;
                });
                setPriceTable(map);
            } catch (e) {
                console.error("Failed to load board prices", e);
                if (!cancelled) {
                    setError("Failed to load prices.");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    const fields = numbers.length;

    const pricePerGame = useMemo(() => {
        if (!priceTable) return 0;
        const base = priceTable[fields] ?? 0;
        if (base <= 0) return 0;
        return base * times;
    }, [priceTable, fields, times]);

    const totalAmount = useMemo(
        () => pricePerGame * weeks,
        [pricePerGame, weeks]
    );

    const canConfirm =
        !loading &&
        numbers.length > 0 &&
        times > 0 &&
        weeks > 0 &&
        pricePerGame > 0 &&
        !submitting;

    async function handleConfirm() {
        if (!canConfirm) return;
        setSubmitting(true);
        setError(null);

        try {
            const payload: CreateRepeatRequest = {
                numbers,
                times,
                weeks,
            };

            // ✳️ Adjust method name if your generated client differs
            const created = await repeatClient.create(payload);

            if (onCreated && created) {
                onCreated(created);
            }

            onClose();
        } catch (e) {
            console.error("Failed to create repeat", e);
            setError("Unable to create repeat. Please try again.");
        } finally {
            setSubmitting(false);
        }
    }

    function handleCancel() {
        onClose();
    }

    return (
        <div className="myrepeats-card">
            <h2 className="myrepeats-title">Create repeat</h2>

            {/* Numbers */}
            <div className="myrepeats-row">
                <div className="myrepeats-label">Numbers</div>
                <div className="myrepeats-numbers">
                    {numbers.map((n) => (
                        <span key={n} className="myrepeats-number-pill">
                            {n}
                        </span>
                    ))}
                </div>
            </div>

            {/* Fields */}
            <div className="myrepeats-row">
                <div className="myrepeats-label">Fields</div>
                <div className="myrepeats-value">{fields}</div>
            </div>

            {/* Times */}
            <div className="myrepeats-row">
                <div className="myrepeats-label">Times</div>
                <div className="myrepeats-times-control">
                    <button
                        type="button"
                        onClick={() => setTimes((t) => Math.max(1, t - 1))}
                    >
                        −
                    </button>

                    <input
                        type="number"
                        min={1}
                        value={times}
                        onChange={(e) =>
                            setTimes(
                                Math.max(1, Number(e.target.value) || 1)
                            )
                        }
                    />

                    <button
                        type="button"
                        onClick={() => setTimes((t) => t + 1)}
                    >
                        +
                    </button>
                </div>
            </div>

            {/* Weeks */}
            <div className="myrepeats-row">
                <div className="myrepeats-label">Weeks</div>
                <div className="myrepeats-times-control">
                    <button
                        type="button"
                        onClick={() => setWeeks((w) => Math.max(1, w - 1))}
                    >
                        −
                    </button>

                    <input
                        type="number"
                        min={1}
                        value={weeks}
                        onChange={(e) =>
                            setWeeks(
                                Math.max(1, Number(e.target.value) || 1)
                            )
                        }
                    />

                    <button
                        type="button"
                        onClick={() => setWeeks((w) => w + 1)}
                    >
                        +
                    </button>
                </div>
            </div>

            {/* Price preview */}
            <div className="myrepeats-preview">
                <div>
                    <div className="myrepeats-preview-label">
                        Price per week
                    </div>
                    <div className="myrepeats-preview-value">
                        {loading ? "…" : `${pricePerGame} DKK`}
                    </div>
                </div>

                <div>
                    <div className="myrepeats-preview-label">
                        Total amount
                    </div>
                    <div className="myrepeats-preview-value">
                        {loading ? "…" : `${totalAmount} DKK`}
                    </div>
                </div>
            </div>

            {error && (
                <p className="myrepeats-error">
                    {error}
                </p>
            )}

            {/* Buttons */}
            <div className="myrepeats-actions">
                <button
                    type="button"
                    className="myrepeats-btn myrepeats-btn-cancel"
                    onClick={handleCancel}
                    disabled={submitting}
                >
                    Cancel
                </button>

                <button
                    type="button"
                    className="myrepeats-btn myrepeats-btn-confirm"
                    disabled={!canConfirm}
                    onClick={handleConfirm}
                >
                    {submitting ? "Saving…" : "Confirm"}
                </button>
            </div>
        </div>
    );
};
