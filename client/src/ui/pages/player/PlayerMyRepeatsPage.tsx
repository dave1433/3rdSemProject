// PlayerMyRepeatsPage.tsx
import React, { useMemo } from "react";
import "../../css/PlayerHistoryPage.css";

interface RepeatRecordVm {
    id: string;
    numbers: number[];
    pricePerWeek: number;
    remainingWeeks: number;
    optOut: boolean;
    createdAt: string;
}

interface Props {
    repeats: RepeatRecordVm[];
    priceMap: Record<number, number>;
    onStopAutoRenew: (id: string) => void;
}

interface RepeatCardVm {
    cardId: string;
    repeatId: string;
    weekLabel: string;
    numbers: number[];
    pricePerWeek: number;
    times: number;
    isCancelled: boolean;
}

function getIsoWeekLabelFromOffset(startDate: string, offsetWeeks: number): string {
    const base = new Date(startDate);
    if (Number.isNaN(base.getTime())) return "";
    // add offset weeks
    const date = new Date(base.getTime() + offsetWeeks * 7 * 86400000);

    // ISO week calc
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const day = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - day);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
    const year = d.getUTCFullYear();
    return `Week ${weekNo}, ${year}`;
}

export const PlayerMyRepeatsPage: React.FC<Props> = ({
                                                         repeats,
                                                         priceMap,
                                                         onStopAutoRenew,
                                                     }) => {
    const pendingCards = useMemo<RepeatCardVm[]>(() => {
        const cards: RepeatCardVm[] = [];

        repeats.forEach((r) => {
            if (r.optOut) return; // cancelled repeats: no future weeks
            if (r.remainingWeeks <= 0) return;

            const fields = r.numbers.length;
            const basePrice = priceMap[fields] ?? 0;
            const times =
                basePrice > 0
                    ? Math.max(1, Math.round(r.pricePerWeek / basePrice))
                    : 1;

            // create 1 card per remaining week
            for (let i = 0; i < r.remainingWeeks; i++) {
                cards.push({
                    cardId: `${r.id}-${i}`,
                    repeatId: r.id,
                    weekLabel: getIsoWeekLabelFromOffset(r.createdAt, i + 1),
                    numbers: r.numbers,
                    pricePerWeek: r.pricePerWeek,
                    times,
                    isCancelled: false,
                });
            }
        });

        return cards;
    }, [repeats, priceMap]);

    if (pendingCards.length === 0) {
        return (
            <p className="history-status">
                You don’t have any upcoming repeat games yet.
            </p>
        );
    }

    return (
        <div className="history-cards">
            {pendingCards.map((card) => (
                <div key={card.cardId} className="history-card">
                    {/* header */}
                    <div className="history-card-header">
                        <span className="history-status-pill history-status-pill--inactive">
                            PENDING
                        </span>

                        <span className="history-card-date">
                            {card.weekLabel}
                        </span>

                        <span className="history-card-remaining">
                            Repeat game
                        </span>
                    </div>

                    {/* numbers */}
                    <div className="history-card-numbers">
                        {card.numbers.map((n) => (
                            <span
                                key={n}
                                className="history-number-square"
                            >
                                {n}
                            </span>
                        ))}
                    </div>

                    {/* meta + Stop button */}
                    <div className="history-card-meta-row">
                        <div className="history-card-meta">
                            <span>Fields: {card.numbers.length}</span>
                            <span>Times: {card.times}</span>
                            <span>Total: {card.pricePerWeek} DKK</span>
                        </div>

                        <div className="history-card-actions-right">
                            <button
                                type="button"
                                className="history-link-button"
                                onClick={() =>
                                    onStopAutoRenew(card.repeatId)
                                }
                            >
                                Stop Auto-renew
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
