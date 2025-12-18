import "../../css/PlayerHistoryPage.css";

import { useCurrentUser } from "../../../core/hooks/useCurrentUser";
import { usePlayerHistory } from "../../../core/hooks/usePlayerHistory";
import { PlayerHistoryTable } from "../../components/history/PlayerHistoryTable";

export const PlayerHistoryPage: React.FC = () => {
    const { user } = useCurrentUser();
    const {
        records,
        loading,
        error,
        starterByRepeatId,
        onToggleRepeat,
    } = usePlayerHistory(user?.id);

    return (
        <div className="history-page">
            <div className="history-inner">
                <h1 className="history-title">History</h1>
                <p className="history-subtitle">Active & Recent Boards</p>

                {loading && <p className="history-status">Loading…</p>}
                {error && (
                    <p className="history-status history-status-error">
                        {error}
                    </p>
                )}

                {!loading && !error && records.length === 0 && (
                    <p className="history-status">No history yet.</p>
                )}

                {!loading && !error && records.length > 0 && (
                    <PlayerHistoryTable
                        records={records}
                        starterByRepeatId={starterByRepeatId}
                        onToggleRepeat={onToggleRepeat}
                    />
                )}
            </div>
        </div>
    );
};
