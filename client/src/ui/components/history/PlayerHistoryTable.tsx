import type { PlayerRecord } from "../../../core/history/types";

interface Props {
    records: PlayerRecord[];
    starterByRepeatId: Map<string, string>;
    onToggleRepeat: (r: PlayerRecord) => void;
}

export const PlayerHistoryTable: React.FC<Props> = ({
                                                        records,
                                                        starterByRepeatId,
                                                        onToggleRepeat,
                                                    }) => (
    <div className="history-table-wrapper">
        <table className="history-table">
            <thead>
            <tr>
                <th>Week</th>
                <th>Numbers</th>
                <th>Fields</th>
                <th>Times</th>
                <th>Total</th>
                <th className="history-col-repeat">Repeat</th>
            </tr>
            </thead>
            <tbody>
            {records.map(r => {
                const starterId = r.repeatId
                    ? starterByRepeatId.get(r.repeatId)
                    : undefined;

                const isRepeatInstance =
                    r.repeatId && starterId && starterId !== r.id;

                return (
                    <tr key={r.id}>
                        <td>{r.weekLabel}</td>

                        <td>
                            <div className="history-numbers-inline">
                                {r.numbers.map(n => (
                                    <span
                                        key={n}
                                        className="history-number-chip"
                                    >
                                            {n}
                                        </span>
                                ))}
                            </div>
                        </td>

                        <td>{r.numbers.length}</td>
                        <td>{r.times}</td>
                        <td>{r.totalAmountDkk} DKK</td>

                        <td className="history-col-repeat">
                            {isRepeatInstance ? (
                                <span className="history-repeat-badge">
                                        Repeated
                                    </span>
                            ) : r.repeatOptOut ? (
                                <span className="history-stop-badge">
                                        Stopped
                                    </span>
                            ) : (
                                <button
                                    type="button"
                                    className={
                                        r.autoRepeat
                                            ? "history-toggle history-toggle--on"
                                            : "history-toggle"
                                    }
                                    onClick={() => onToggleRepeat(r)}
                                    aria-pressed={r.autoRepeat}
                                >
                                    <span className="history-toggle-knob" />
                                </button>
                            )}
                        </td>
                    </tr>
                );
            })}
            </tbody>
        </table>
    </div>
);
